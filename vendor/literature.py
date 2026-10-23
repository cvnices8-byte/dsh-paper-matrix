#!/usr/bin/env python3
"""Local, transactional literature records. Python 3.9+, standard library only."""
import argparse
import copy
import csv
import hashlib
import io
import json
import os
from pathlib import Path
import re
import sqlite3
import sys
import tempfile
from datetime import datetime, timezone

FORMAT = 'ai-literature-v1'
READING = ('unrecorded', 'to_read', 'reading', 'read', 'archived')
REVIEW = ('pending', 'verified', 'rejected')
STATUSES = ('extracted', 'not_reported', 'not_applicable', 'unavailable', 'conflicting')
META = {'title', 'title_zh', 'authors', 'year', 'version', 'doi', 'paper_language',
        'data_language', 'page_count', 'metadata_source'}
COLUMNS = [('research_type', '研究类型'), ('research_question', '研究问题'),
           ('data', '数据'), ('method', '方法'), ('findings', '主要结果')]


def require(condition, message):
    if not condition:
        raise ValueError(message)


def dumps(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, allow_nan=False)


def read_json(path):
    return json.loads(Path(path).read_text(encoding='utf-8'))


def now():
    return datetime.now(timezone.utc).isoformat()


def positive(value):
    return type(value) is int and value > 0


def metadata(value):
    require(isinstance(value, dict) and not (set(value) - META), 'Invalid metadata keys')
    for key, val in value.items():
        if key == 'year':
            require(val is None or (type(val) is int and 1000 <= val <= 9999), 'Invalid year')
        elif key == 'page_count':
            require(positive(val), 'page_count must be a positive integer')
        elif key == 'authors':
            require(isinstance(val, list) and all(isinstance(a, str) for a in val), 'authors must be strings')
        else:
            require(isinstance(val, str), key + ' must be a string')
    return value


def evidence(items, pages):
    require(isinstance(items, list), 'evidence must be a list')
    for item in items:
        require(isinstance(item, dict), 'Evidence must be an object')
        require(positive(item.get('pdf_page')), 'Evidence requires a positive pdf_page')
        require(not pages or item['pdf_page'] <= pages, 'Evidence exceeds page_count')
        require(isinstance(item.get('quote'), str) and item['quote'].strip(), 'Evidence requires an original quote')
        require(item.get('check', 'unverified') in ('unverified', 'located', 'text_matched', 'visual_checked'), 'Invalid evidence check')


def field(value, pages, human=False):
    require(isinstance(value, dict) and 'value' in value, 'Field requires value')
    allowed = {'value', 'origin', 'status', 'evidence', 'label'}
    require(not (set(value) - allowed), 'Unknown field properties')
    require(value.get('origin') in (('user',) if human else ('author', 'ai_inference')), 'Invalid field origin')
    require(value.get('status') in STATUSES, 'Invalid content status')
    evidence(value.get('evidence', []), pages)
    if value['origin'] == 'author':
        if value['status'] == 'extracted':
            require(len(value.get('evidence', [])) > 0, 'Author facts require evidence')
        if value['status'] == 'conflicting':
            require(len(value.get('evidence', [])) >= 2, 'Conflicting author facts require at least two evidence entries')
    dumps(value)


def effective(slot):
    return slot.get('human') or slot.get('generated') or {}


def validate_record(record):
    pages = record['metadata'].get('page_count')
    for slot in record['fields'].values():
        if slot.get('generated'):
            field(slot['generated'], pages)
        if slot.get('human'):
            field(slot['human'], pages, human=True)
    seen = set()
    for exp in record['experiments']:
        require(isinstance(exp, dict), 'Experiment must be an object')
        require(all(k in exp for k in ('experiment_id', 'study', 'model', 'setting', 'subset', 'n', 'metric', 'value', 'unit', 'evidence')), 'Incomplete experiment')
        for k in ('experiment_id', 'study', 'model', 'setting', 'subset', 'metric', 'unit'):
            require(isinstance(exp[k], str) and exp[k].strip(), 'Experiment ' + k + ' must be nonempty text')
        require(exp['experiment_id'] not in seen, 'Duplicate experiment_id')
        seen.add(exp['experiment_id'])
        require(exp['n'] is None or positive(exp['n']), 'Experiment n must be positive or null')
        evidence(exp['evidence'], pages)
        require(exp['evidence'], 'Experiment requires evidence')
    cov = record['coverage']
    require(isinstance(cov, dict) and cov.get('mode') in ('metadata_only', 'abstract_only', 'selected_pages', 'full_text'), 'Invalid coverage mode')
    require(isinstance(cov.get('pages_read'), list), 'coverage.pages_read must be a list')
    for page in cov['pages_read']:
        require(positive(page) and (not pages or page <= pages), 'Invalid coverage page')
    require(isinstance(record['issues'], list), 'issues must be a list')
    for issue in record['issues']:
        if isinstance(issue, dict) and 'evidence' in issue:
            evidence(issue['evidence'], pages)
    dumps(record)


def connect(folder, create=False):
    root = Path(folder).expanduser().resolve()
    db = root / 'library.sqlite3'
    if create:
        root.mkdir(parents=True, exist_ok=True)
    require(create or db.is_file(), 'Library not initialized: ' + str(root))
    conn = sqlite3.connect(str(db), timeout=15, isolation_level=None)
    try:
        if create:
            conn.executescript('''BEGIN IMMEDIATE;
            CREATE TABLE IF NOT EXISTS config (key TEXT PRIMARY KEY, value TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS papers (id TEXT PRIMARY KEY, sha TEXT UNIQUE NOT NULL, data TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS history (id TEXT NOT NULL, revision INTEGER NOT NULL, data TEXT NOT NULL, PRIMARY KEY(id,revision));
            COMMIT;''')
            conn.execute('INSERT OR IGNORE INTO config VALUES (?,?)', ('format', FORMAT))
        version = conn.execute('SELECT value FROM config WHERE key=?', ('format',)).fetchone()
        require(version and version[0] == FORMAT, 'Unsupported library format')
        return conn
    except Exception:
        conn.close()
        raise


def get(conn, pid):
    row = conn.execute('SELECT data FROM papers WHERE id=?', (pid,)).fetchone()
    require(row is not None, 'Unknown paper_id: ' + pid)
    return json.loads(row[0])


def save(conn, record, previous=None):
    if previous == record:
        return False
    validate_record(record)
    record['revision'] = previous['revision'] + 1 if previous else 1
    record['updated_at'] = now()
    blob = dumps(record)
    conn.execute('INSERT INTO papers VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data',
                 (record['paper_id'], record['sha256'], blob))
    conn.execute('INSERT INTO history VALUES (?,?,?)', (record['paper_id'], record['revision'], blob))
    return True


def file_info(pdf):
    path = Path(pdf).expanduser().resolve()
    require(path.is_file(), 'Missing PDF: ' + str(path))
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        require(b'%PDF-' in stream.read(1024), 'File has no PDF header: ' + str(path))
        stream.seek(0)
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(chunk)
    return path, digest.hexdigest()


def add(conn, pdf, meta, pid=None):
    metadata(meta)
    path, sha = file_info(pdf)
    row = conn.execute('SELECT data FROM papers WHERE sha=?', (sha,)).fetchone()
    if row:
        record = json.loads(row[0])
        previous = copy.deepcopy(record)
        if str(path) not in record['sources']:
            record['sources'].append(str(path))
        save(conn, record, previous)
        return {'paper_id': record['paper_id'], 'duplicate': True, 'revision': record['revision']}
    pid = pid or 'p_' + sha[:16]
    require(re.fullmatch(r'[a-zA-Z0-9_.-]+', pid) is not None, 'Invalid paper_id')
    require(conn.execute('SELECT 1 FROM papers WHERE id=?', (pid,)).fetchone() is None, 'paper_id already belongs to another file')
    if not meta:
        meta = {'title': path.stem, 'metadata_source': 'filename_only; unverified'}
    candidates = []
    for (blob,) in conn.execute('SELECT data FROM papers ORDER BY id'):
        other = json.loads(blob)
        old = other['metadata']
        if ((meta.get('title') and meta['title'].casefold() == old.get('title', '').casefold())
                or (meta.get('doi') and meta['doi'].casefold() == old.get('doi', '').casefold())):
            candidates.append(other['paper_id'])
    record = {'paper_id': pid, 'sha256': sha, 'sources': [str(path)], 'metadata': meta,
              'reading_status': 'unrecorded', 'notes': [], 'tags': [], 'fields': {},
              'experiments': [], 'issues': [], 'coverage': {'mode': 'metadata_only', 'pages_read': []},
              'created_at': now()}
    save(conn, record)
    return {'paper_id': pid, 'duplicate': False, 'revision': 1, 'identity_candidates': candidates}


def plain(value):
    if isinstance(value, str):
        return value
    if isinstance(value, dict) and 'zh' in value:
        return value.get('zh') or value.get('en') or ''
    return json.dumps(value, ensure_ascii=False, allow_nan=False)


def review_status(record):
    values = [s['review'] for s in record['fields'].values()]
    if not values:
        return 'not_extracted'
    if 'rejected' in values:
        return 'rejected'
    return 'verified' if all(v == 'verified' for v in values) else 'pending'


def table_rows(records):
    header = ['文献ID', '题名', '中文译名', '论文语言', '数据语言', '年份'] + [label for _, label in COLUMNS] + ['阅读状态', '字段核验状态', '标签', 'PDF路径']
    rows = []
    for r in records:
        m = r['metadata']
        row = [r['paper_id'], m.get('title', ''), m.get('title_zh', ''), m.get('paper_language', ''), m.get('data_language', ''), m.get('year') or '']
        row += [plain(effective(r['fields'].get(k, {})).get('value', '')) for k, _ in COLUMNS]
        rows.append(row + [r['reading_status'], review_status(r), ', '.join(r['tags']), '\n'.join(r['sources'])])
    return header, rows


def md_text(value, limit=None):
    text = plain(value)
    if limit and len(text) > limit:
        text = text[:limit] + '…'
    return text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('|', '&#124;').replace('`', '&#96;').replace('\n', '<br>')


def render_citations(items):
    lines = []
    for item in items:
        label = 'PDF p.%s' % item['pdf_page']
        if item.get('locator'):
            label += ' · ' + item['locator']
        check = item.get('check', 'inherited_unverified')
        lines += ['- ' + md_text(label) + ' · 检查: ' + md_text(check), '', '> ' + md_text(item['quote']), '']
        if item.get('translation_zh'):
            lines += ['  辅助译文: ' + md_text(item['translation_zh']), '']
    return lines


def render_md(records):
    header, rows = table_rows(records)
    lines = ['# 文献总表', '', '阅读状态由用户维护；字段核验与证据定位分别记录。总表为预览，完整内容见逐篇详情。', '',
             '| ' + ' | '.join(header) + ' |', '| ' + ' | '.join(['---'] * len(header)) + ' |']
    lines += ['| ' + ' | '.join(md_text(v, 160) for v in row) + ' |' for row in rows]
    for r in records:
        lines += ['', '## ' + md_text(r['metadata'].get('title', r['paper_id'])), '',
                  '- ID: ' + r['paper_id'], '- SHA-256: ' + r['sha256'],
                  '- 阅读状态: ' + r['reading_status'], '- 字段核验: ' + review_status(r),
                  '- 阅读覆盖: ' + md_text(r['coverage']), '- 元数据: ' + md_text(r['metadata'])]
        lines += ['- 原件: ' + md_text(p) for p in r['sources']]
        lines += ['', '| 字段 | 有效内容 | 内容状态 | 用户核验 |', '| --- | --- | --- | --- |']
        for key, slot in r['fields'].items():
            val = effective(slot)
            lines.append('| ' + ' | '.join(md_text(v) for v in (val.get('label', key), val.get('value'), val.get('status'), slot['review'])) + ' |')
        for key, slot in r['fields'].items():
            lines += ['', '### ' + md_text(key), '', '- 有效来源: ' + ('user' if slot.get('human') else effective(slot).get('origin', ''))]
            for layer, label in (('generated', 'AI 草稿'), ('human', '用户修订')):
                if not slot.get(layer):
                    continue
                content = slot[layer]
                lines += ['', '**' + label + '**', '', md_text(content['value']), '']
                if isinstance(content['value'], dict) and content['value'].get('en'):
                    lines += ['英文表述: ' + md_text(content['value']['en']), '']
                lines += render_citations(content.get('evidence', []))
            if slot.get('review_note'):
                lines += ['- 核验备注: ' + md_text(slot['review_note'])]
        lines += ['', '### 实验子记录', '']
        for exp in r['experiments']:
            lines += ['- ' + md_text(exp['experiment_id']) + ': ' + md_text({k: v for k, v in exp.items() if k != 'evidence'}), '']
            lines += render_citations(exp['evidence'])
        if not r['experiments']:
            lines += ['无独立实验子记录；已有结果概括见 findings 字段。']
        lines += ['', '### 冲突与问题', '']
        for issue in r['issues']:
            if isinstance(issue, dict):
                lines += ['- ' + md_text({k: v for k, v in issue.items() if k != 'evidence'}), '']
                lines += render_citations(issue.get('evidence', []))
            else:
                lines += ['- ' + md_text(issue)]
        if not r['issues']:
            lines += ['无记录。']
        lines += ['', '### 用户笔记', '']
        lines += ['- ' + md_text(note) for note in r['notes']] or ['无记录。']
    return '\n'.join(lines) + '\n'


def atomic_write(path, content):
    dest = Path(path).expanduser().resolve()
    require(dest.suffix.casefold() in ('.md', '.csv', '.json'), 'Export extension must be .md, .csv or .json')
    dest.parent.mkdir(parents=True, exist_ok=True)
    fd, temp = tempfile.mkstemp(dir=str(dest.parent), prefix='.' + dest.name + '.')
    try:
        with os.fdopen(fd, 'w', encoding='utf-8', newline='') as stream:
            stream.write(content)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temp, dest)
    finally:
        if os.path.exists(temp):
            os.unlink(temp)
    return str(dest)


def parser():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--library', required=True, help='Library directory, containing library.sqlite3')
    subs = p.add_subparsers(dest='command', required=True)
    subs.add_parser('init')
    subs.add_parser('check-sources')
    a = subs.add_parser('add'); a.add_argument('--pdf', required=True); a.add_argument('--metadata'); a.add_argument('--id')
    a = subs.add_parser('scan'); a.add_argument('--folder', required=True)
    a = subs.add_parser('list'); a.add_argument('--query', default=''); a.add_argument('--status', choices=READING); a.add_argument('--tag')
    for cmd in ('show', 'history', 'apply', 'edit', 'review', 'status', 'note', 'tags', 'metadata'):
        a = subs.add_parser(cmd); a.add_argument('--id', required=True)
        if cmd in ('apply', 'edit', 'metadata'):
            a.add_argument('--input', required=True)
        if cmd == 'apply':
            a.add_argument('--expected-revision', required=True, type=int)
        elif cmd not in ('show', 'history'):
            a.add_argument('--expected-revision', type=int)
        if cmd in ('edit', 'review'):
            a.add_argument('--field', required=True)
        if cmd == 'review':
            a.add_argument('--value', required=True, choices=REVIEW); a.add_argument('--text', default='')
        if cmd == 'status':
            a.add_argument('--value', required=True, choices=READING)
        if cmd == 'note':
            a.add_argument('--text', required=True)
        if cmd == 'tags':
            a.add_argument('--value', nargs='*', required=True)
    a = subs.add_parser('export'); a.add_argument('--format', choices=('md', 'csv', 'json'), required=True); a.add_argument('--output', required=True)
    return p


def run(args):
    conn = connect(args.library, args.command == 'init')
    try:
        # A transaction also makes exports a consistent read snapshot.
        mutate = args.command not in ('init', 'show', 'history', 'list', 'export', 'check-sources')
        conn.execute('BEGIN IMMEDIATE' if mutate else 'BEGIN')
        result = dispatch(conn, args)
        conn.commit()
        return result
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def dispatch(conn, a):
    cmd = a.command
    if cmd == 'init':
        return {'library': str(Path(a.library).expanduser().resolve()), 'format': FORMAT}
    if cmd == 'add':
        return add(conn, a.pdf, read_json(a.metadata) if a.metadata else {}, a.id)
    if cmd == 'check-sources':
        checks = []
        for (blob,) in conn.execute('SELECT data FROM papers ORDER BY id'):
            r = json.loads(blob)
            for source in r['sources']:
                item = {'paper_id': r['paper_id'], 'path': source}
                try:
                    _, actual = file_info(source)
                    item['status'] = 'matched' if actual == r['sha256'] else 'changed'
                except (OSError, ValueError) as exc:
                    item.update(status='unavailable', error=str(exc))
                checks.append(item)
        return {'checks': checks, 'problems': sum(c['status'] != 'matched' for c in checks)}
    if cmd == 'scan':
        folder = Path(a.folder).expanduser().resolve()
        require(folder.is_dir(), 'Missing folder')
        added, failed = [], []
        for path in sorted(folder.rglob('*')):
            if path.is_file() and path.suffix.casefold() == '.pdf':
                conn.execute('SAVEPOINT one_file')
                try:
                    added.append(add(conn, path, {}))
                    conn.execute('RELEASE one_file')
                except (ValueError, OSError, sqlite3.Error) as exc:
                    conn.execute('ROLLBACK TO one_file'); conn.execute('RELEASE one_file')
                    failed.append({'path': str(path), 'error': str(exc)})
        return {'processed': len(added), 'new': sum(not r['duplicate'] for r in added), 'duplicates': sum(r['duplicate'] for r in added), 'results': added, 'failures': failed}
    if cmd in ('list', 'export'):
        records = [json.loads(row[0]) for row in conn.execute('SELECT data FROM papers ORDER BY id')]
        if cmd == 'list':
            records = [r for r in records if (not a.status or r['reading_status'] == a.status)
                       and (not a.tag or a.tag in r['tags']) and a.query.casefold() in dumps(r).casefold()]
            return {'count': len(records), 'papers': [{'paper_id': r['paper_id'], 'title': r['metadata'].get('title'), 'reading_status': r['reading_status'], 'review': review_status(r), 'revision': r['revision'], 'tags': r['tags']} for r in records]}
        require(Path(a.output).suffix.casefold() == '.' + a.format, 'Output extension does not match format')
        if a.format == 'json':
            content = json.dumps({'format': FORMAT, 'exported_at': now(), 'papers': records}, ensure_ascii=False, indent=2, allow_nan=False) + '\n'
        elif a.format == 'md':
            content = render_md(records)
        else:
            header, rows = table_rows(records)
            stream = io.StringIO(newline=''); writer = csv.writer(stream); writer.writerow(header)
            for row in rows:
                cells = [str(v) for v in row]
                writer.writerow(["'" + v if v.lstrip().startswith(('=', '+', '-', '@')) else v for v in cells])
            content = '\ufeff' + stream.getvalue()
        return {'output': atomic_write(a.output, content), 'count': len(records)}
    if cmd == 'history':
        return {'history': [json.loads(row[0]) for row in conn.execute('SELECT data FROM history WHERE id=? ORDER BY revision', (a.id,))]}
    r = get(conn, a.id)
    if cmd == 'show':
        return {'paper': r}
    previous = copy.deepcopy(r)
    expected = getattr(a, 'expected_revision', None)
    require(expected is None or expected == r['revision'], 'Revision conflict: expected %s, current %s; reread before retry' % (expected, r['revision']))
    protected = []
    if cmd == 'apply':
        payload = read_json(a.input)
        require(isinstance(payload, dict) and not (set(payload) - {'fields', 'experiments', 'issues', 'coverage'}), 'Invalid apply keys')
        require(isinstance(payload.get('fields', {}), dict), 'fields must be an object')
        for key, val in payload.get('fields', {}).items():
            require(re.fullmatch(r'[a-z][a-z0-9_]*', key) is not None, 'Invalid field ID')
            field(val, r['metadata'].get('page_count'))
            slot = r['fields'].setdefault(key, {'review': 'pending', 'review_note': ''})
            if slot.get('human'):
                protected.append(key)
            elif slot.get('generated') != val:
                slot['review'] = 'pending'; slot['review_note'] = ''
            slot['generated'] = val
        for key in ('experiments', 'issues', 'coverage'):
            if key in payload:
                r[key] = payload[key]
    elif cmd == 'edit':
        val = read_json(a.input)
        require(isinstance(val, dict), 'User edit must be an object')
        val['origin'] = 'user'
        field(val, r['metadata'].get('page_count'), human=True)
        slot = r['fields'].setdefault(a.field, {'review': 'pending', 'review_note': ''})
        if slot.get('human') != val:
            slot['review'] = 'pending'; slot['review_note'] = ''
        slot['human'] = val
    elif cmd == 'review':
        require(a.field in r['fields'], 'Unknown field')
        r['fields'][a.field]['review'] = a.value
        r['fields'][a.field]['review_note'] = a.text
    elif cmd == 'status':
        r['reading_status'] = a.value
    elif cmd == 'note':
        r['notes'].append({'text': a.text, 'created_at': now(), 'origin': 'user'})
    elif cmd == 'tags':
        r['tags'] = sorted(set(a.value))
    elif cmd == 'metadata':
        r['metadata'].update(metadata(read_json(a.input)))
    changed = save(conn, r, previous)
    return {'paper_id': a.id, 'revision': r['revision'], 'changed': changed, 'protected_fields': protected}


def main():
    try:
        args = parser().parse_args()
        result = run(args)
        print(json.dumps(dict(ok=True, **result), ensure_ascii=False, allow_nan=False))
    except (ValueError, TypeError, KeyError, OSError, sqlite3.Error) as exc:
        print(json.dumps({'ok': False, 'error': str(exc)}, ensure_ascii=False))
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
