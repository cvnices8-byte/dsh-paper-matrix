import React, { useState, useEffect, useRef } from 'react';
import css from './style.css';
import { FIELDS, effectiveField } from './core/schema.mjs';

const READING = { not_recorded: '未记录', unread: '待读', reading: '在读', read: '已读', archived: '归档' };
const STATUS = { not_started: '待拆解', running: '分析中', queued: '排队中', done: '待核验', error: '分析失败', interrupted: '已中断', cancelled: '已取消' };
function download(filename, content, mime) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function readBase64(file) {
  return new Promise((resolve, reject) => { const r = new FileReader(); r.onerror = () => reject(new Error('文件读取失败')); r.onload = () => resolve(String(r.result).split(',')[1]); r.readAsDataURL(file); });
}
function Evidence({ items, onPage }) {
  if (!items?.length) return <p className="pm-muted">暂无原文引用；需要人工确认。</p>;
  return <div className="pm-evidence">{items.map((e, i) => <div key={i}><div className="pm-quote-head"><button onClick={() => onPage(e.pdf_page)}>PDF 第 {e.pdf_page} 页 ↗</button><span className={e.verification === 'text_matched' ? 'pm-good' : 'pm-warn'}>{e.verification === 'text_matched' ? '原文匹配' : '引用未匹配'}</span></div><blockquote lang="en">{e.quote}</blockquote>{e.locator && <small>{e.locator}</small>}</div>)}</div>;
}
function FieldCard({ paper, field, bilingual, onSave, onPage }) {
  const [key, zh, en] = field, baseline = paper.fields[key], effective = effectiveField(paper, key);
  const [editing, setEditing] = useState(false), [a, setA] = useState(''), [b, setB] = useState(''), [saving, setSaving] = useState(false);
  const verified = paper.review[key]?.status === 'verified';
  async function save(changes) { setSaving(true); try { await onSave(changes); setEditing(false); } catch { /* Detail displays the error and keeps the editor open. */ } finally { setSaving(false); } }
  return <section className="pm-field"><div className="pm-field-top"><h3>{zh}<small>{en}</small></h3><div className="pm-tags">{paper.overrides[key] && <span className="pm-tag">人工修改</span>}<span className={verified ? 'pm-good' : 'pm-warn'}>{verified ? '已人工核验' : '待人工核验'}</span></div></div>
    {editing ? <div className="pm-edit"><label>中文拆解<textarea value={a} onChange={e => setA(e.target.value)} maxLength={12000}/></label><label>English summary<textarea lang="en" value={b} onChange={e => setB(e.target.value)} maxLength={12000}/></label><div className="pm-actions"><button className="pm-primary" disabled={saving} onClick={() => save({ field: key, value_zh: a, value_en: b })}>保存修改</button><button onClick={() => setEditing(false)}>取消</button></div></div> : <><p className="pm-value">{effective.value_zh || '尚未拆解'}</p>{bilingual && <p className="pm-en" lang="en">{effective.value_en || '暂无英文拆解；可双语分析或手动补充。'}</p>}<div className="pm-field-actions"><button onClick={() => { setA(effective.value_zh || ''); setB(effective.value_en || ''); setEditing(true); }}>编辑此格</button>{baseline && <button disabled={saving} onClick={() => save({ review_field: key, verified: !verified })}>{verified ? '撤销核验' : '标记已核验'}</button>}{paper.overrides[key] && <button disabled={saving} onClick={() => save({ field: key, reset: true })}>采用机器原值</button>}</div></>}
    {paper.overrides[key] && <details><summary>机器原始拆解</summary><p>{baseline?.value_zh || '无机器版本'}</p></details>}
    <Evidence items={baseline?.evidence} onPage={onPage}/>
  </section>;
}
function Detail({ paper, api, refresh, close, bilingual, model, busy, run }) {
  const [page, setPage] = useState(null), [pageNumber, setPageNumber] = useState(1), [note, setNote] = useState(''), [error, setError] = useState('');
  const generation = useRef(0);
  const revision = useRef(paper.revision), saves = useRef(Promise.resolve());
  useEffect(() => { revision.current = Math.max(revision.current, paper.revision); }, [paper.revision]);
  useEffect(() => { setNote(''); }, [paper.id]);
  function save(changes) {
    const operation = saves.current.then(async () => {
      setError('');
      try { const updated = await api('update', { id: paper.id, revision: revision.current, changes }); revision.current = updated.revision; await refresh(); }
      catch(e) { setError(e.message); await refresh(); throw e; }
    });
    saves.current = operation.catch(() => {});
    return operation;
  }
  async function showPage(n) { const token = ++generation.current; try { const p = await api('page', { id: paper.id, page: n }); if (token === generation.current) { setPage(p); setPageNumber(p.page); } } catch(e) { setError(e.message); } }
  async function pdf() { try { const p = await api('pdf', { id: paper.id }); download(p.filename, Uint8Array.from(atob(p.base64), c => c.charCodeAt(0)), 'application/pdf'); } catch(e) { setError(e.message); } }
  return <div className="pm-detail"><div className="pm-detail-sticky"><button className="pm-back" onClick={close}>← 返回文献总表</button><div className="pm-detail-title"><span className="pm-eyebrow">PAPER RECORD · {paper.page_count} PAGES</span><h2>{paper.title}</h2>{paper.title_zh && <p>{paper.title_zh}<small>〔译题〕</small></p>}</div><div className="pm-actions"><select aria-label="阅读状态" value={paper.reading_status} onChange={e => save({ reading_status: e.target.value }).catch(() => {})}>{Object.entries(READING).map(([k,v]) => <option key={k} value={k}>{v}</option>)}</select><button onClick={() => showPage(1)}>逐页原文</button><button onClick={pdf}>下载原 PDF</button><button className="pm-primary" disabled={!model || busy || paper.text_quality === 'ocr_required'} onClick={() => run(paper)}>{busy ? '分析中…' : Object.keys(paper.fields).length ? '重新分析' : '开始拆解'}</button>{busy && <button onClick={async () => { try { await api('cancel', { id: paper.id }); await refresh(); } catch(e) { setError(e.message); } }}>取消分析</button>}</div><div className="pm-meta"><span>论文语言：{paper.paper_language}</span><span>数据语言：{paper.data_language}</span><span>{paper.authors || '作者待提取'}</span><span>{paper.year || '年份待提取'}</span></div></div>
    {error && <p role="alert" className="pm-alert">{error}</p>}
    {paper.analysis.error && <p role="alert" className="pm-alert">{paper.analysis.error}</p>}
    {paper.text_quality === 'ocr_required' && <p className="pm-alert">文本层不足，需要先 OCR 为可搜索 PDF。首版未提供 OCR。</p>}
    {paper.source_error && <p className="pm-alert">{paper.source_error}</p>}
    {paper.analysis.source === 'research_pilot' && <p className="pm-notice">当前是调研试读记录，并非此插件的模型抽取结果。引用已重新匹配，内容仍待人工核验。</p>}
    {paper.analysis.source === 'harness_model' && <p className="pm-notice">模型初读草稿：请核对数值、结论和引用。原文匹配仅检查文字与页码，不代表结论已被证实。</p>}
    {paper.analysis.status === 'running' && <p className="pm-notice" role="status">正在调用 {paper.analysis.model} 阅读全文。原有结果与人工修改保持可见；可离开此页或取消。</p>}
    <div className={'pm-detail-grid' + (page ? ' pm-with-page' : '')}><div className="pm-fields">{FIELDS.map(f => <FieldCard key={paper.id + f[0]} paper={paper} field={f} bilingual={bilingual} onSave={save} onPage={showPage}/>)}
      <section className="pm-field"><h3>我的笔记</h3>{paper.notes && <p className="pm-value">{paper.notes}</p>}<textarea aria-label="新增笔记" placeholder="添加一条个人笔记，不混入作者结论…" value={note} onChange={e => setNote(e.target.value)} maxLength={20000}/><button disabled={!note.trim()} onClick={() => save({ notes: note }).then(()=>setNote('')).catch(() => {})}>追加笔记</button></section>
      {paper.analysis.issues?.length > 0 && <section className="pm-field"><h3>调研中保留的原文争议</h3>{paper.analysis.issues.map((issue,i) => <p key={i}>{issue.statement}</p>)}</section>}
    </div>{page && <aside className="pm-page"><div className="pm-actions"><strong>原文 · PDF 第 {page.page} 页</strong><button onClick={() => setPage(null)} aria-label="关闭原文">×</button></div><div className="pm-actions"><button disabled={page.page <= 1} onClick={() => showPage(page.page - 1)}>上一页</button><input aria-label="PDF 页码" type="number" min="1" max={page.count} value={pageNumber} onChange={e => setPageNumber(e.target.value)}/><button onClick={() => showPage(Number(pageNumber))}>跳转</button><button disabled={page.page >= page.count} onClick={() => showPage(page.page + 1)}>下一页</button></div><p className="pm-muted">提取文本，排版与原 PDF 不同。页码从 1 开始。</p><pre>{page.text || '本页未提取到文字。'}</pre></aside>}</div>
  </div>;
}
function Matrix({ api }) {
  const [papers, setPapers] = useState([]), [selected, setSelected] = useState(null), [search, setSearch] = useState(''), [filter, setFilter] = useState('all'), [reading, setReading] = useState('all'), [bilingual, setBilingual] = useState(false), [models, setModels] = useState([]), [model, setModel] = useState(''), [message, setMessage] = useState(''), [error, setError] = useState(''), [importing, setImporting] = useState(false), [loading, setLoading] = useState(true), [sort, setSort] = useState('newest');
  const fileInput = useRef();
  const refresh = async () => { const data = await api('library'); setPapers(data.papers); setLoading(false); };
  async function reload() { setError(''); try { await refresh(); } catch(e) { setError(e.message); setLoading(false); } }
  useEffect(() => { reload(); api('models').then(data => { setModels(data.routes); if (data.routes.length) setModel(JSON.stringify(data.routes[0])); if (data.errors.length) setError('部分模型列表不可用：' + data.errors.join('；')); }).catch(e => setError(e.message)); }, []);
  const running = papers.some(p => ['running', 'queued'].includes(p.analysis.status));
  useEffect(() => { if (!running) return; const timer = setInterval(() => refresh().catch(e => setError(e.message)), 2000); return () => clearInterval(timer); }, [running]);
  const active = papers.find(p => p.id === selected), route = model ? JSON.parse(model) : null;
  async function importFiles(e) {
    const files = [...e.target.files]; e.target.value = ''; setImporting(true); setError('');
    let added = 0, duplicates = 0;
    try { for (const file of files) { if (file.size > 25 * 1024 * 1024) throw new Error(`${file.name} 超过 25 MB`); setMessage(`正在导入 ${file.name}…`); const result = await api('import', { filename: file.name, base64: await readBase64(file) }); result.duplicate ? duplicates++ : added++; await refresh(); } setMessage(`导入 ${added} 篇${duplicates ? `，跳过 ${duplicates} 篇相同 PDF` : ''}。可选择文献开始拆解。`); } catch(e) { setError(e.message); setMessage(`已导入 ${added} 篇，其余文件可重新选择导入。`); } finally { setImporting(false); }
  }
  async function run(p) { setError(''); try { await api('analyze', { id: p.id, ...route, bilingual }); setMessage('已开始全文拆解。'); await refresh(); } catch(e) { setError(e.message); } }
  async function exportAs(format) { try { const r = await api('export', { format }); download(r.filename, r.text, r.mime); setMessage('已导出全部文献与证据。'); } catch(e) { setError(e.message); } }
  const counts = { total: papers.length, analyzed: papers.filter(p => Object.keys(p.fields).length).length, verified: papers.filter(p => FIELDS.every(([key]) => p.review[key]?.status === 'verified')).length };
  const visible = papers.filter(p => [p.title, p.title_zh, p.authors, ...FIELDS.flatMap(([key]) => [effectiveField(p,key).value_zh || '', effectiveField(p,key).value_en || ''])].join(' ').toLowerCase().includes(search.toLowerCase())).filter(p => filter === 'all' || (filter === 'pending' ? !Object.keys(p.fields).length : filter === 'review' ? Object.keys(p.fields).length && !FIELDS.every(([key]) => p.review[key]?.status === 'verified') : ['error','interrupted','cancelled'].includes(p.analysis.status))).filter(p => reading === 'all' || p.reading_status === reading).sort((a,b) => sort === 'title' ? a.title.localeCompare(b.title) : sort === 'year' ? String(b.year).localeCompare(String(a.year)) : b.created_at.localeCompare(a.created_at));
  return <div className="pm-root"><header className="pm-header"><div><div className="pm-eyebrow">PAPER MATRIX <span>初读工作台</span></div><h1>文献拆解</h1><p>把问题、方法与证据放在同一张表里。</p></div><button className="pm-primary" disabled={importing} onClick={() => fileInput.current.click()}>{importing ? '导入中…' : '＋ 导入 PDF'}</button></header>
    <input ref={fileInput} aria-label="导入 PDF 文件" type="file" accept="application/pdf,.pdf" multiple hidden onChange={importFiles}/>
    <div className="pm-model-bar"><label>分析模型<select value={model} onChange={e => setModel(e.target.value)} aria-label="分析模型">{!models.length && <option value="">未获取到已配置模型</option>}{models.map(m => <option key={m.provider + m.model} value={JSON.stringify(m)}>{m.name} · {m.provider}</option>)}</select></label><label className="pm-check"><input type="checkbox" checked={bilingual} onChange={e => setBilingual(e.target.checked)}/>双语拆解 / 显示英文</label><span className="pm-muted">分析会将全文发送至所选模型，使用 Harness 配额。</span></div>
    {error && <div className="pm-alert" role="alert">{error}<button aria-label="关闭错误提示" onClick={() => setError('')}>×</button></div>}{message && <div className="pm-message" role="status">{message}</div>}
    {active ? <Detail key={active.id} paper={active} api={api} refresh={refresh} close={() => setSelected(null)} bilingual={bilingual} model={model} busy={['running','queued'].includes(active.analysis.status)} run={run}/> : <>
    <div className="pm-stats"><span><b>{counts.total}</b> 篇文献</span><span><b>{counts.analyzed}</b> 已拆解</span><span><b>{counts.verified}</b> 全字段已核验</span><span className="pm-muted">阅读状态由你手动记录</span></div>
    <div className="pm-toolbar"><input className="pm-search" aria-label="搜索文献" placeholder="搜索标题、作者或拆解内容…" value={search} onChange={e => setSearch(e.target.value)}/><select aria-label="拆解状态筛选" value={filter} onChange={e => setFilter(e.target.value)}><option value="all">全部拆解状态</option><option value="pending">待拆解</option><option value="review">待人工核验</option><option value="error">分析失败或中断</option></select><select aria-label="阅读状态筛选" value={reading} onChange={e => setReading(e.target.value)}><option value="all">全部阅读状态</option>{Object.entries(READING).map(([k,v]) => <option key={k} value={k}>{v}</option>)}</select><select aria-label="排序" value={sort} onChange={e => setSort(e.target.value)}><option value="newest">最近导入</option><option value="title">标题排序</option><option value="year">年份降序</option></select><button onClick={reload}>刷新</button><details className="pm-export"><summary>导出</summary><div><button onClick={() => exportAs('csv')}>导出 CSV</button><button onClick={() => exportAs('json')}>导出 JSON</button></div></details></div>
    <div className="pm-table-wrap" tabIndex={0} aria-label="文献拆解表，可横向滚动"><table><thead><tr><th className="pm-title-col">文献 / Paper</th><th>阅读与核验</th><th>语言</th>{FIELDS.map(([key,zh,en]) => <th key={key}>{zh}<small>{en}</small></th>)}</tr></thead><tbody>{visible.map(p => <tr key={p.id}><td className="pm-title-col"><button className="pm-paper-link" onClick={() => setSelected(p.id)}>{p.title}</button>{p.title_zh && <p>{p.title_zh}</p>}<small>{p.year || '年份待提取'} · {p.page_count} 页 · {p.filename}</small>{p.analysis.source === 'research_pilot' && <span className="pm-pilot">调研试读样本</span>}{p.analysis.source === 'harness_model' && <span className="pm-pilot">模型初读草稿</span>}</td><td><span className={'pm-state ' + (p.analysis.status === 'error' ? 'pm-warn' : '')}>{STATUS[p.analysis.status]}</span><p>{READING[p.reading_status]}</p><small>{FIELDS.filter(([key]) => p.review[key]?.status === 'verified').length} / {FIELDS.length} 字段已核验</small></td><td><div>论文 {p.paper_language}</div><div>数据 {p.data_language}</div></td>{FIELDS.map(([key]) => { const f = effectiveField(p,key); return <td key={key}><button className="pm-cell" onClick={() => setSelected(p.id)}><span>{f.value_zh || '—'}</span>{bilingual && f.value_en && <span className="pm-en" lang="en">{f.value_en}</span>}</button>{p.overrides[key] && <small className="pm-good">人工修改</small>}{p.fields[key]?.status === 'needs_review' && <small className="pm-warn">证据待补核</small>}</td>; })}</tr>)}</tbody></table>{!visible.length && <div className="pm-empty">{loading ? '正在读取文献库…' : papers.length ? '没有符合条件的文献，调整搜索或筛选。' : <><strong>从第一篇论文开始</strong><p>导入中英文 PDF，选择文献后开始拆解。</p><p>原文引用会按 PDF 页码匹配；结果可编辑、核验和导出。</p><button className="pm-primary" disabled={importing} onClick={() => fileInput.current.click()}>选择 PDF</button></>}</div>}</div>
    <footer className="pm-footer"><span>{visible.length} / {papers.length} 篇 · 向右滚动查看全部字段，点击单元格查看原文证据</span><span>Paper Matrix 0.1 · 本地保存</span></footer></>}
  </div>;
}
export const inject = ['connection', 'slots', 'sidebarRight', 'sidebarRightTabs'];
export function apply(ctx) {
  ctx.effect(() => { const style = document.createElement('style'); style.dataset.plugin = 'dsh-paper-matrix'; style.textContent = css; document.head.appendChild(style); return () => style.remove(); }, 'paper-matrix styles');
  const api = async (method, args = {}) => { const r = await ctx.connection.rpc.call('/api', 'paper-matrix', { method, args }); if (!r.ok) throw new Error(r.error?.message || '请求失败'); return r.value; };
  ctx.effect(() => ctx.sidebarRightTabs.register({ id: 'dsh-paper-matrix', kind: 'paper-matrix', title: () => '文献拆解', guide: [{ id: 'library', order: 12, title: () => '文献拆解', description: () => '双语论文 · 表格初读 · 原文证据' }] }), 'paper-matrix tab');
  ctx.effect(() => ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register({ name: 'sidebar.right.pane.tab', key: 'dsh-paper-matrix' }, () => <Matrix api={api}/>)), 'paper-matrix body');
  ctx.effect(() => ctx.slots.inject('conversation.session.header.actions', () => ctx.slots.register({ name: 'conversation.session.header.actions', id: 'paper-matrix-open', order: 80 }, () => <button title="打开文献拆解表" aria-label="打开文献拆解表" className="pm-launch" onClick={() => ctx.sidebarRight.openTab('paper-matrix')}>文献表</button>)), 'paper-matrix launch');
}
