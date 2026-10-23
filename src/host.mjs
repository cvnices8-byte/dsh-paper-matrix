import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { CanonicalStore } from './core/canonical-store.mjs';
import { MAX_PDF_BYTES } from './core/pdf.mjs';
import { extractionPrompt, runExtraction } from './core/analysis.mjs';

export const name = 'dsh-paper-matrix';
export const inject = ['connection', 'llm'];
export function apply(ctx, config = {}) {
  const libraryDir = path.resolve(config.libraryDir ?? process.env.DSH_PAPER_MATRIX_LIBRARY_DIR ?? path.join(process.cwd(),'文献库'));
  const dataDir = path.resolve(config.dataDir ?? process.env.DSH_PAPER_MATRIX_DATA_DIR ?? path.join(libraryDir,'.harness-cache'));
  const store = new CanonicalStore(dataDir,{libraryDir,script:config.libraryScript ?? fileURLToPath(new URL('./literature.py',import.meta.url)),python:config.python ?? process.env.DSH_PAPER_MATRIX_PYTHON ?? 'python3'});
  const jobs = new Map();
  let disposed = false;
  const ready = (async () => {
    await mkdir(dataDir, { recursive: true, mode: 0o700 });
    const lock = path.join(dataDir, '.writer-lock');
    const acquire = async () => { await mkdir(lock); await writeFile(path.join(lock, 'pid'), String(process.pid)); };
    try { await acquire(); } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      let active = true;
      try { const pid = Number(await readFile(path.join(lock, 'pid'), 'utf8')); if (!Number.isSafeInteger(pid) || pid <= 0) throw new Error('invalid lock'); process.kill(pid, 0); }
      catch (e) { if (e.code === 'ESRCH') active = false; }
      if (active) throw new Error('另一个宿主正在使用同一文献库，请关闭旧实例或设置独立 dataDir。');
      await rm(lock, { recursive: true }); await acquire();
    }
    ctx.effect(() => async () => { disposed = true; for (const job of jobs.values()) job.abort(); await Promise.allSettled([...jobs.values()].map(job => job.done)); await store.queue; await rm(lock, { recursive: true, force: true }); }, 'paper-matrix writer');
    return store.init();
  })();
  ready.catch(error => ctx.logger.warn(`Paper Matrix: ${error.message}`));
  async function dispatch(method, args = {}) {
    await ready;
    if (disposed) throw new Error('插件正在退出。');
    switch (method) {
      case 'library': await store.sync(); return { papers: store.list(), dataDir, libraryDir, version: '0.1.1', canonical:true };
      case 'models': {
        const providers = ctx.llm.listProviders();
        const lists = await Promise.allSettled(providers.map(async provider => ({ provider: provider.id, models: await ctx.llm.listModels(provider.id) })));
        return { routes: lists.flatMap(r => r.status === 'fulfilled' ? r.value.models.map(m => ({ provider: r.value.provider, model: m.id, name: m.name })) : []), errors: lists.filter(r => r.status === 'rejected').map(r => String(r.reason?.message ?? '模型列表读取失败')) };
      }
      case 'import': {
        if (typeof args.base64 !== 'string' || args.base64.length > Math.ceil(MAX_PDF_BYTES * 4 / 3) + 8 || typeof args.filename !== 'string') throw new Error('PDF 超过 25 MB 或请求格式无效。');
        return store.importPdf(Buffer.from(args.base64, 'base64'), args.filename);
      }
      case 'pilot': return store.importPilot(args);
      case 'page': {
        const paper = store.get(args.id), page = Number(args.page);
        if (!Number.isSafeInteger(page) || page < 1 || page > paper.page_count) throw new Error('页码超出范围。');
        return { page, count: paper.page_count, text: paper.pages[page - 1] };
      }
      case 'pdf': return { filename: store.get(args.id).filename, base64: (await store.pdfBytes(args.id)).toString('base64') };
      case 'update': return store.update(args.id, args.revision, args.changes ?? {});
      case 'prompt': return { text: extractionPrompt(store.get(args.id), args.bilingual !== false) };
      case 'cancel': { const job = jobs.get(args.id); if (job) job.abort(); return { cancelled: !!job }; }
      case 'analyze': {
        if (jobs.has(args.id)) throw new Error('此文献正在分析，请等待或取消。');
        const paper = store.get(args.id);
        await store.verifySource(paper.id);
        extractionPrompt(paper, args.bilingual !== false); // Validate before any paid request.
        if (typeof args.provider !== 'string' || typeof args.model !== 'string') throw new Error('请先选择已在 Harness 配置的模型。');
        const models = await ctx.llm.listModels(args.provider);
        if (!models.some(m => m.id === args.model)) throw new Error('模型不在当前宿主列表中，请刷新。');
        const controller = new AbortController();
        const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(600000)]);
        const route = { provider: args.provider, model: args.model };
        await store.analysisState(paper.id, { ...route, status: 'running', started_at: new Date().toISOString() });
        const job = { abort: () => controller.abort(), done: undefined };
        jobs.set(paper.id, job);
        job.done = (async () => {
          try { const extraction = await runExtraction(ctx.llm, paper, route, signal, args.bilingual !== false); signal.throwIfAborted(); await store.saveExtraction(paper.id, extraction, { ...route, source: 'harness_model' }); }
          catch (error) { await store.analysisState(paper.id, { ...route, status: controller.signal.aborted ? 'cancelled' : 'error', error: String(error.message ?? error).slice(0, 1500) }); }
          finally { jobs.delete(paper.id); }
        })();
        job.done.catch(error => ctx.logger.warn(`Paper Matrix save failed: ${error.message}`));
        return { started: true };
      }
      case 'export': {
        return store.canonicalExport(args.format === 'csv' ? 'csv':'json');
      }
      default: throw new Error('未知操作。');
    }
  }
  ctx.connection.fetch.register({
    path: '/api/paper-matrix', methods: ['POST'], requestBody: 'buffered',
    async fetch(request) {
      let message;
      try { message = await request.json(); } catch { return new Response('Invalid JSON', { status: 400 }); }
      if (message?.type !== 'client-request' || typeof message.rpcId !== 'string' || message.method !== 'paper-matrix' || typeof message.payload?.method !== 'string') return new Response('Invalid envelope', { status: 400 });
      let result;
      try { result = { ok: true, value: await dispatch(message.payload.method, message.payload.args) }; }
      catch (error) { result = { ok: false, error: { code: 'paper-matrix/error', message: String(error.message ?? error), details: {} } }; }
      return Response.json({ type: 'server-response', rpcId: message.rpcId, result });
    }
  });
}
