window.__ModuleLoader__.load({id:'dsh-paper-matrix',factory:(require)=>{var module={exports:{}};var exports=module.exports;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client.jsx
var client_exports = {};
__export(client_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(client_exports);
var import_react = __toESM(require("react"), 1);

// src/style.css
var style_default = '.pm-root{--pm-bg:#f8fafc;--pm-card:#fff;--pm-text:#1e293b;--pm-muted:#64748b;--pm-border:#e2e8f0;--pm-blue:#1d4ed8;color-scheme:light;background:var(--pm-bg);color:var(--pm-text);font:13px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;height:100%;min-height:0;overflow:auto;container-type:inline-size}.pm-root *{box-sizing:border-box}.pm-root button,.pm-root input,.pm-root select,.pm-root textarea{font:inherit;color:inherit}.pm-root button,.pm-root select,.pm-root input{min-height:34px;border:1px solid var(--pm-border);border-radius:6px;background:var(--pm-card);padding:5px 10px}.pm-root button,.pm-root summary{cursor:pointer}.pm-root button:hover:not(:disabled){border-color:#94a3b8;background:#f1f5f9}.pm-root button:disabled{opacity:.5;cursor:default}.pm-root :focus-visible,.pm-launch:focus-visible{outline:2px solid #2563eb;outline-offset:3px}.pm-root .pm-primary{background:var(--pm-blue);border-color:var(--pm-blue);color:white;font-weight:600}.pm-root .pm-primary:hover:not(:disabled){background:#1e40af}.pm-header{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:26px 28px 20px;background:var(--pm-card);border-bottom:1px solid var(--pm-border)}.pm-eyebrow{color:var(--pm-blue);font-size:11px;font-weight:700;letter-spacing:1.7px}.pm-eyebrow span{color:var(--pm-muted);font-weight:400;margin-left:10px;letter-spacing:1px}.pm-root h1{font-size:27px;line-height:1.25;letter-spacing:-.7px;margin:8px 0}.pm-header p{margin:0;color:var(--pm-muted)}.pm-model-bar{padding:12px 28px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;border-bottom:1px solid var(--pm-border);background:#f1f5f9}.pm-model-bar label{display:flex;align-items:center;gap:8px}.pm-model-bar select{max-width:300px}.pm-check{white-space:nowrap}.pm-check input{accent-color:#1d4ed8;min-height:unset;width:16px;height:16px}.pm-muted,.pm-root small{color:var(--pm-muted);font-size:11px}.pm-stats{padding:20px 28px 10px;display:flex;gap:24px;align-items:baseline;flex-wrap:wrap}.pm-stats b{font-size:23px;font-weight:600;margin-right:5px;font-variant-numeric:tabular-nums}.pm-toolbar{display:flex;align-items:center;gap:8px;padding:12px 28px 16px;flex-wrap:wrap}.pm-search{flex:1;min-width:180px}.pm-export{position:relative;z-index:10}.pm-export summary{border:1px solid var(--pm-border);border-radius:6px;background:white;padding:6px 12px;min-height:34px}.pm-export>div{position:absolute;right:0;top:40px;min-width:190px;background:white;border:1px solid var(--pm-border);padding:6px;box-shadow:0 8px 25px #0f172a16;border-radius:8px;display:grid;gap:4px}.pm-export button{text-align:left;border:0}.pm-table-wrap{overflow:auto;margin:0 28px;background:var(--pm-card);border:1px solid var(--pm-border);border-radius:8px;max-height:calc(100vh - 310px);min-height:230px}.pm-root table{border-collapse:separate;border-spacing:0;table-layout:fixed;min-width:3380px;width:100%;text-align:left}.pm-root th{position:sticky;top:0;z-index:2;font-weight:600;font-size:12px;background:#f1f5f9;min-width:240px;width:240px;padding:11px 14px;border-bottom:1px solid var(--pm-border);border-right:1px solid var(--pm-border)}.pm-root th:nth-child(2){width:135px}.pm-root th:nth-child(3){width:110px}.pm-root th small{display:block;font-size:10px;font-weight:400;line-height:1.5}.pm-root td{vertical-align:top;padding:14px;border-bottom:1px solid var(--pm-border);border-right:1px solid var(--pm-border);font-size:12px}.pm-root tbody tr:last-child td{border-bottom:0}.pm-root tr:hover td{background:#f8fbff}.pm-root .pm-title-col{position:sticky;left:0;z-index:1;width:315px;min-width:315px;background:var(--pm-card);border-right:1px solid #cbd5e1}.pm-root th.pm-title-col{z-index:3;background:#f1f5f9}.pm-root .pm-paper-link{background:none;border:0;text-align:left;font-size:13px;line-height:1.55;font-weight:600;color:#1e40af;padding:0;overflow-wrap:anywhere;min-height:0}.pm-title-col p{margin:6px 0;color:#475569}.pm-title-col small{display:block;overflow-wrap:anywhere}.pm-pilot{display:inline-block;font-size:10px;padding:1px 6px;background:#fef3c7;color:#92400e;border-radius:3px;margin-top:7px}.pm-root .pm-cell{background:none;border:0;padding:0;display:block;text-align:left;width:100%;min-height:24px;line-height:1.65;white-space:pre-wrap}.pm-cell>span{display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;overflow:hidden}.pm-root .pm-cell:hover{background:transparent;border:0;color:var(--pm-blue)}.pm-state{background:#eff6ff;color:#1e40af;border:1px solid #dbeafe;padding:2px 7px;border-radius:4px;white-space:nowrap}.pm-root td p{margin:9px 0 4px}.pm-good{color:#166534;font-size:11px}.pm-warn{color:#92400e;font-size:11px}.pm-empty{text-align:center;padding:60px 20px;color:var(--pm-muted);position:sticky;left:0;width:100%;font-size:13px}.pm-empty strong{color:var(--pm-text);font-size:20px;font-weight:500}.pm-empty p{margin:9px 0}.pm-empty button{margin-top:12px}.pm-footer{padding:12px 28px 20px;display:flex;justify-content:space-between;gap:16px;color:var(--pm-muted);font-size:11px;flex-wrap:wrap}.pm-alert,.pm-message,.pm-notice{margin:12px 28px;padding:10px 13px;border-radius:6px;overflow-wrap:anywhere}.pm-alert{background:#fff1f2;color:#9f1239;border:1px solid #fecdd3;display:flex;gap:10px;justify-content:space-between}.pm-alert button{min-height:20px;padding:0 5px;background:transparent;border:0}.pm-message{background:#eff6ff;color:#1e40af}.pm-notice{background:#fffbeb;color:#92400e;border:1px solid #fde68a}.pm-detail{padding-bottom:30px}.pm-detail-sticky{padding:16px 28px;background:white;border-bottom:1px solid var(--pm-border)}.pm-root .pm-back{border:0;color:var(--pm-blue);background:transparent;padding-left:0}.pm-detail-title{max-width:1000px;padding:16px 0}.pm-detail-title h2{font-size:22px;font-weight:600;line-height:1.4;margin:8px 0;overflow-wrap:anywhere}.pm-detail-title p{color:#475569;font-size:15px;margin:5px 0}.pm-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.pm-meta{display:flex;gap:16px;flex-wrap:wrap;color:var(--pm-muted);font-size:11px;margin-top:12px}.pm-detail-grid{display:grid;grid-template-columns:minmax(0,1fr);gap:16px;padding:20px 28px}.pm-detail-grid.pm-with-page{grid-template-columns:minmax(310px,1fr) minmax(300px,.85fr)}.pm-fields{min-width:0;display:grid;gap:14px;align-content:start}.pm-field{background:white;border:1px solid var(--pm-border);border-radius:8px;padding:18px 20px;min-width:0}.pm-field h3{font-size:14px;font-weight:600;margin:0}.pm-field h3 small{display:block;font-size:11px;font-weight:400;margin-top:2px}.pm-field-top{display:flex;align-items:flex-start;gap:12px;justify-content:space-between}.pm-tags{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.pm-tag{color:#1e40af;background:#eff6ff;font-size:10px;padding:1px 5px;border-radius:3px}.pm-value{white-space:pre-wrap;line-height:1.8;font-size:13px;margin:14px 0}.pm-en{display:block;color:#64748b;font-size:12px;line-height:1.7;margin:10px 0;white-space:pre-wrap}.pm-field-actions{display:flex;gap:8px;margin:10px 0;flex-wrap:wrap}.pm-field-actions button{font-size:11px;min-height:28px;padding:3px 8px}.pm-evidence{border-top:1px solid var(--pm-border);margin-top:14px;padding-top:10px;display:grid;gap:12px}.pm-quote-head{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}.pm-quote-head button{font-size:11px;min-height:24px;background:none;border:0;color:var(--pm-blue);padding:0}.pm-evidence blockquote{margin:7px 0 3px;padding:4px 0 4px 10px;border-left:2px solid #cbd5e1;font:12px/1.7 -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC",sans-serif;color:#475569;white-space:pre-wrap;overflow-wrap:anywhere}.pm-root textarea{width:100%;min-height:100px;resize:vertical;border:1px solid #cbd5e1;border-radius:6px;padding:9px;line-height:1.7;background:white}.pm-edit{display:grid;gap:10px;margin-top:12px}.pm-edit label{display:grid;gap:4px}.pm-field details{font-size:11px;color:var(--pm-muted);padding-top:5px}.pm-page{position:sticky;top:10px;align-self:start;max-height:calc(100vh - 100px);overflow:auto;background:#fff;border:1px solid var(--pm-border);border-radius:8px;padding:16px;min-width:0}.pm-page input{width:60px}.pm-page pre{white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.8 -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC",sans-serif;color:#334155}.pm-launch{font:12px -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;color:var(--dsw-alias-label-primary,#475569);border:1px solid var(--dsw-alias-border-l2,#cbd5e1);background:transparent;border-radius:6px;padding:5px 10px;cursor:pointer}@container(max-width:760px){.pm-header{padding:20px}.pm-model-bar,.pm-toolbar{padding:12px 20px}.pm-stats{padding:16px 20px 6px;gap:16px}.pm-table-wrap{margin:0 20px}.pm-detail-grid.pm-with-page{grid-template-columns:minmax(0,1fr)}.pm-page{position:static;max-height:550px;grid-row:1}.pm-detail-grid,.pm-detail-sticky{padding:16px 20px}.pm-footer{padding:12px 20px}.pm-root .pm-title-col{width:250px;min-width:250px}.pm-field{padding:15px}.pm-model-bar select{max-width:230px}}@media(prefers-color-scheme:dark){.pm-root{color-scheme:light}}@media(prefers-reduced-motion:reduce){.pm-root *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}\n';

// src/core/schema.mjs
var FIELDS = [
  ["type", "\u6587\u732E\u7C7B\u578B", "Paper type"],
  ["problem", "\u7814\u7A76\u95EE\u9898", "Research question"],
  ["data", "\u6570\u636E\u4E0E\u6837\u672C", "Data & sample"],
  ["construction", "\u65B9\u6CD5\u4E0E\u6784\u5EFA", "Method & construction"],
  ["evidence", "\u5E95\u5C42\u8BC1\u636E\u8BBE\u8BA1", "Evidence design"],
  ["evaluation_sample", "\u8BC4\u6D4B\u8303\u56F4", "Evaluation scope"],
  ["settings", "\u5B9E\u9A8C\u6216\u8BC6\u522B\u8BBE\u8BA1", "Experiment / identification"],
  ["metrics", "\u8BC4\u4EF7\u6307\u6807", "Metrics"],
  ["results", "\u6838\u5FC3\u53D1\u73B0", "Findings"],
  ["limits", "\u5C40\u9650\u4E0E\u8FB9\u754C", "Limitations"],
  ["resources", "\u4EE3\u7801\u4E0E\u6570\u636E", "Code & data"]
];
var FIELD_KEYS = new Set(FIELDS.map(([key]) => key));
function effectiveField(paper, key) {
  return { ...paper.fields?.[key], ...paper.overrides?.[key] };
}

// src/client.jsx
var READING = { not_recorded: "\u672A\u8BB0\u5F55", unread: "\u5F85\u8BFB", reading: "\u5728\u8BFB", read: "\u5DF2\u8BFB", archived: "\u5F52\u6863" };
var STATUS = { not_started: "\u5F85\u62C6\u89E3", running: "\u5206\u6790\u4E2D", queued: "\u6392\u961F\u4E2D", done: "\u5F85\u6838\u9A8C", error: "\u5206\u6790\u5931\u8D25", interrupted: "\u5DF2\u4E2D\u65AD", cancelled: "\u5DF2\u53D6\u6D88" };
function download(filename, content, mime) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1e3);
}
function readBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error("\u6587\u4EF6\u8BFB\u53D6\u5931\u8D25"));
    r.onload = () => resolve(String(r.result).split(",")[1]);
    r.readAsDataURL(file);
  });
}
function Evidence({ items, onPage }) {
  if (!items?.length) return /* @__PURE__ */ import_react.default.createElement("p", { className: "pm-muted" }, "\u6682\u65E0\u539F\u6587\u5F15\u7528\uFF1B\u9700\u8981\u4EBA\u5DE5\u786E\u8BA4\u3002");
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-evidence" }, items.map((e, i) => /* @__PURE__ */ import_react.default.createElement("div", { key: i }, /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-quote-head" }, /* @__PURE__ */ import_react.default.createElement("button", { onClick: () => onPage(e.pdf_page) }, "PDF \u7B2C ", e.pdf_page, " \u9875 \u2197"), /* @__PURE__ */ import_react.default.createElement("span", { className: e.verification === "text_matched" ? "pm-good" : "pm-warn" }, e.verification === "text_matched" ? "\u539F\u6587\u5339\u914D" : "\u5F15\u7528\u672A\u5339\u914D")), /* @__PURE__ */ import_react.default.createElement("blockquote", { lang: "en" }, e.quote), e.locator && /* @__PURE__ */ import_react.default.createElement("small", null, e.locator))));
}
function FieldCard({ paper, field, bilingual, onSave, onPage }) {
  const [key, zh, en] = field, baseline = paper.fields[key], effective = effectiveField(paper, key);
  const [editing, setEditing] = (0, import_react.useState)(false), [a, setA] = (0, import_react.useState)(""), [b, setB] = (0, import_react.useState)(""), [saving, setSaving] = (0, import_react.useState)(false);
  const verified = paper.review[key]?.status === "verified";
  async function save(changes) {
    setSaving(true);
    try {
      await onSave(changes);
      setEditing(false);
    } catch {
    } finally {
      setSaving(false);
    }
  }
  return /* @__PURE__ */ import_react.default.createElement("section", { className: "pm-field" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-field-top" }, /* @__PURE__ */ import_react.default.createElement("h3", null, zh, /* @__PURE__ */ import_react.default.createElement("small", null, en)), /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-tags" }, paper.overrides[key] && /* @__PURE__ */ import_react.default.createElement("span", { className: "pm-tag" }, "\u4EBA\u5DE5\u4FEE\u6539"), /* @__PURE__ */ import_react.default.createElement("span", { className: verified ? "pm-good" : "pm-warn" }, verified ? "\u5DF2\u4EBA\u5DE5\u6838\u9A8C" : "\u5F85\u4EBA\u5DE5\u6838\u9A8C"))), editing ? /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-edit" }, /* @__PURE__ */ import_react.default.createElement("label", null, "\u4E2D\u6587\u62C6\u89E3", /* @__PURE__ */ import_react.default.createElement("textarea", { value: a, onChange: (e) => setA(e.target.value), maxLength: 12e3 })), /* @__PURE__ */ import_react.default.createElement("label", null, "English summary", /* @__PURE__ */ import_react.default.createElement("textarea", { lang: "en", value: b, onChange: (e) => setB(e.target.value), maxLength: 12e3 })), /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-actions" }, /* @__PURE__ */ import_react.default.createElement("button", { className: "pm-primary", disabled: saving, onClick: () => save({ field: key, value_zh: a, value_en: b }) }, "\u4FDD\u5B58\u4FEE\u6539"), /* @__PURE__ */ import_react.default.createElement("button", { onClick: () => setEditing(false) }, "\u53D6\u6D88"))) : /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("p", { className: "pm-value" }, effective.value_zh || "\u5C1A\u672A\u62C6\u89E3"), bilingual && /* @__PURE__ */ import_react.default.createElement("p", { className: "pm-en", lang: "en" }, effective.value_en || "\u6682\u65E0\u82F1\u6587\u62C6\u89E3\uFF1B\u53EF\u53CC\u8BED\u5206\u6790\u6216\u624B\u52A8\u8865\u5145\u3002"), /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-field-actions" }, /* @__PURE__ */ import_react.default.createElement("button", { onClick: () => {
    setA(effective.value_zh || "");
    setB(effective.value_en || "");
    setEditing(true);
  } }, "\u7F16\u8F91\u6B64\u683C"), baseline && /* @__PURE__ */ import_react.default.createElement("button", { disabled: saving, onClick: () => save({ review_field: key, verified: !verified }) }, verified ? "\u64A4\u9500\u6838\u9A8C" : "\u6807\u8BB0\u5DF2\u6838\u9A8C"), paper.overrides[key] && /* @__PURE__ */ import_react.default.createElement("button", { disabled: saving, onClick: () => save({ field: key, reset: true }) }, "\u91C7\u7528\u673A\u5668\u539F\u503C"))), paper.overrides[key] && /* @__PURE__ */ import_react.default.createElement("details", null, /* @__PURE__ */ import_react.default.createElement("summary", null, "\u673A\u5668\u539F\u59CB\u62C6\u89E3"), /* @__PURE__ */ import_react.default.createElement("p", null, baseline?.value_zh || "\u65E0\u673A\u5668\u7248\u672C")), /* @__PURE__ */ import_react.default.createElement(Evidence, { items: baseline?.evidence, onPage }));
}
function Detail({ paper, api, refresh, close, bilingual, model, busy, run }) {
  const [page, setPage] = (0, import_react.useState)(null), [pageNumber, setPageNumber] = (0, import_react.useState)(1), [note, setNote] = (0, import_react.useState)(""), [error, setError] = (0, import_react.useState)("");
  const generation = (0, import_react.useRef)(0);
  const revision = (0, import_react.useRef)(paper.revision), saves = (0, import_react.useRef)(Promise.resolve());
  (0, import_react.useEffect)(() => {
    revision.current = Math.max(revision.current, paper.revision);
  }, [paper.revision]);
  (0, import_react.useEffect)(() => {
    setNote("");
  }, [paper.id]);
  function save(changes) {
    const operation = saves.current.then(async () => {
      setError("");
      try {
        const updated = await api("update", { id: paper.id, revision: revision.current, changes });
        revision.current = updated.revision;
        await refresh();
      } catch (e) {
        setError(e.message);
        await refresh();
        throw e;
      }
    });
    saves.current = operation.catch(() => {
    });
    return operation;
  }
  async function showPage(n) {
    const token = ++generation.current;
    try {
      const p = await api("page", { id: paper.id, page: n });
      if (token === generation.current) {
        setPage(p);
        setPageNumber(p.page);
      }
    } catch (e) {
      setError(e.message);
    }
  }
  async function pdf() {
    try {
      const p = await api("pdf", { id: paper.id });
      download(p.filename, Uint8Array.from(atob(p.base64), (c) => c.charCodeAt(0)), "application/pdf");
    } catch (e) {
      setError(e.message);
    }
  }
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-detail" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-detail-sticky" }, /* @__PURE__ */ import_react.default.createElement("button", { className: "pm-back", onClick: close }, "\u2190 \u8FD4\u56DE\u6587\u732E\u603B\u8868"), /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-detail-title" }, /* @__PURE__ */ import_react.default.createElement("span", { className: "pm-eyebrow" }, "PAPER RECORD \xB7 ", paper.page_count, " PAGES"), /* @__PURE__ */ import_react.default.createElement("h2", null, paper.title), paper.title_zh && /* @__PURE__ */ import_react.default.createElement("p", null, paper.title_zh, /* @__PURE__ */ import_react.default.createElement("small", null, "\u3014\u8BD1\u9898\u3015"))), /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-actions" }, /* @__PURE__ */ import_react.default.createElement("select", { "aria-label": "\u9605\u8BFB\u72B6\u6001", value: paper.reading_status, onChange: (e) => save({ reading_status: e.target.value }).catch(() => {
  }) }, Object.entries(READING).map(([k, v]) => /* @__PURE__ */ import_react.default.createElement("option", { key: k, value: k }, v))), /* @__PURE__ */ import_react.default.createElement("button", { onClick: () => showPage(1) }, "\u9010\u9875\u539F\u6587"), /* @__PURE__ */ import_react.default.createElement("button", { onClick: pdf }, "\u4E0B\u8F7D\u539F PDF"), /* @__PURE__ */ import_react.default.createElement("button", { className: "pm-primary", disabled: !model || busy || paper.text_quality === "ocr_required", onClick: () => run(paper) }, busy ? "\u5206\u6790\u4E2D\u2026" : Object.keys(paper.fields).length ? "\u91CD\u65B0\u5206\u6790" : "\u5F00\u59CB\u62C6\u89E3"), busy && /* @__PURE__ */ import_react.default.createElement("button", { onClick: async () => {
    try {
      await api("cancel", { id: paper.id });
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  } }, "\u53D6\u6D88\u5206\u6790")), /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-meta" }, /* @__PURE__ */ import_react.default.createElement("span", null, "\u8BBA\u6587\u8BED\u8A00\uFF1A", paper.paper_language), /* @__PURE__ */ import_react.default.createElement("span", null, "\u6570\u636E\u8BED\u8A00\uFF1A", paper.data_language), /* @__PURE__ */ import_react.default.createElement("span", null, paper.authors || "\u4F5C\u8005\u5F85\u63D0\u53D6"), /* @__PURE__ */ import_react.default.createElement("span", null, paper.year || "\u5E74\u4EFD\u5F85\u63D0\u53D6"))), error && /* @__PURE__ */ import_react.default.createElement("p", { role: "alert", className: "pm-alert" }, error), paper.analysis.error && /* @__PURE__ */ import_react.default.createElement("p", { role: "alert", className: "pm-alert" }, paper.analysis.error), paper.text_quality === "ocr_required" && /* @__PURE__ */ import_react.default.createElement("p", { className: "pm-alert" }, "\u6587\u672C\u5C42\u4E0D\u8DB3\uFF0C\u9700\u8981\u5148 OCR \u4E3A\u53EF\u641C\u7D22 PDF\u3002\u9996\u7248\u672A\u63D0\u4F9B OCR\u3002"), paper.source_error && /* @__PURE__ */ import_react.default.createElement("p", { className: "pm-alert" }, paper.source_error), paper.analysis.source === "research_pilot" && /* @__PURE__ */ import_react.default.createElement("p", { className: "pm-notice" }, "\u5F53\u524D\u662F\u8C03\u7814\u8BD5\u8BFB\u8BB0\u5F55\uFF0C\u5E76\u975E\u6B64\u63D2\u4EF6\u7684\u6A21\u578B\u62BD\u53D6\u7ED3\u679C\u3002\u5F15\u7528\u5DF2\u91CD\u65B0\u5339\u914D\uFF0C\u5185\u5BB9\u4ECD\u5F85\u4EBA\u5DE5\u6838\u9A8C\u3002"), paper.analysis.source === "harness_model" && /* @__PURE__ */ import_react.default.createElement("p", { className: "pm-notice" }, "\u6A21\u578B\u521D\u8BFB\u8349\u7A3F\uFF1A\u8BF7\u6838\u5BF9\u6570\u503C\u3001\u7ED3\u8BBA\u548C\u5F15\u7528\u3002\u539F\u6587\u5339\u914D\u4EC5\u68C0\u67E5\u6587\u5B57\u4E0E\u9875\u7801\uFF0C\u4E0D\u4EE3\u8868\u7ED3\u8BBA\u5DF2\u88AB\u8BC1\u5B9E\u3002"), paper.analysis.status === "running" && /* @__PURE__ */ import_react.default.createElement("p", { className: "pm-notice", role: "status" }, "\u6B63\u5728\u8C03\u7528 ", paper.analysis.model, " \u9605\u8BFB\u5168\u6587\u3002\u539F\u6709\u7ED3\u679C\u4E0E\u4EBA\u5DE5\u4FEE\u6539\u4FDD\u6301\u53EF\u89C1\uFF1B\u53EF\u79BB\u5F00\u6B64\u9875\u6216\u53D6\u6D88\u3002"), /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-detail-grid" + (page ? " pm-with-page" : "") }, /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-fields" }, FIELDS.map((f) => /* @__PURE__ */ import_react.default.createElement(FieldCard, { key: paper.id + f[0], paper, field: f, bilingual, onSave: save, onPage: showPage })), /* @__PURE__ */ import_react.default.createElement("section", { className: "pm-field" }, /* @__PURE__ */ import_react.default.createElement("h3", null, "\u6211\u7684\u7B14\u8BB0"), paper.notes && /* @__PURE__ */ import_react.default.createElement("p", { className: "pm-value" }, paper.notes), /* @__PURE__ */ import_react.default.createElement("textarea", { "aria-label": "\u65B0\u589E\u7B14\u8BB0", placeholder: "\u6DFB\u52A0\u4E00\u6761\u4E2A\u4EBA\u7B14\u8BB0\uFF0C\u4E0D\u6DF7\u5165\u4F5C\u8005\u7ED3\u8BBA\u2026", value: note, onChange: (e) => setNote(e.target.value), maxLength: 2e4 }), /* @__PURE__ */ import_react.default.createElement("button", { disabled: !note.trim(), onClick: () => save({ notes: note }).then(() => setNote("")).catch(() => {
  }) }, "\u8FFD\u52A0\u7B14\u8BB0")), paper.analysis.issues?.length > 0 && /* @__PURE__ */ import_react.default.createElement("section", { className: "pm-field" }, /* @__PURE__ */ import_react.default.createElement("h3", null, "\u8C03\u7814\u4E2D\u4FDD\u7559\u7684\u539F\u6587\u4E89\u8BAE"), paper.analysis.issues.map((issue, i) => /* @__PURE__ */ import_react.default.createElement("p", { key: i }, issue.statement)))), page && /* @__PURE__ */ import_react.default.createElement("aside", { className: "pm-page" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-actions" }, /* @__PURE__ */ import_react.default.createElement("strong", null, "\u539F\u6587 \xB7 PDF \u7B2C ", page.page, " \u9875"), /* @__PURE__ */ import_react.default.createElement("button", { onClick: () => setPage(null), "aria-label": "\u5173\u95ED\u539F\u6587" }, "\xD7")), /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-actions" }, /* @__PURE__ */ import_react.default.createElement("button", { disabled: page.page <= 1, onClick: () => showPage(page.page - 1) }, "\u4E0A\u4E00\u9875"), /* @__PURE__ */ import_react.default.createElement("input", { "aria-label": "PDF \u9875\u7801", type: "number", min: "1", max: page.count, value: pageNumber, onChange: (e) => setPageNumber(e.target.value) }), /* @__PURE__ */ import_react.default.createElement("button", { onClick: () => showPage(Number(pageNumber)) }, "\u8DF3\u8F6C"), /* @__PURE__ */ import_react.default.createElement("button", { disabled: page.page >= page.count, onClick: () => showPage(page.page + 1) }, "\u4E0B\u4E00\u9875")), /* @__PURE__ */ import_react.default.createElement("p", { className: "pm-muted" }, "\u63D0\u53D6\u6587\u672C\uFF0C\u6392\u7248\u4E0E\u539F PDF \u4E0D\u540C\u3002\u9875\u7801\u4ECE 1 \u5F00\u59CB\u3002"), /* @__PURE__ */ import_react.default.createElement("pre", null, page.text || "\u672C\u9875\u672A\u63D0\u53D6\u5230\u6587\u5B57\u3002"))));
}
function Matrix({ api }) {
  const [papers, setPapers] = (0, import_react.useState)([]), [selected, setSelected] = (0, import_react.useState)(null), [search, setSearch] = (0, import_react.useState)(""), [filter, setFilter] = (0, import_react.useState)("all"), [reading, setReading] = (0, import_react.useState)("all"), [bilingual, setBilingual] = (0, import_react.useState)(false), [models, setModels] = (0, import_react.useState)([]), [model, setModel] = (0, import_react.useState)(""), [message, setMessage] = (0, import_react.useState)(""), [error, setError] = (0, import_react.useState)(""), [importing, setImporting] = (0, import_react.useState)(false), [loading, setLoading] = (0, import_react.useState)(true), [sort, setSort] = (0, import_react.useState)("newest");
  const fileInput = (0, import_react.useRef)();
  const refresh = async () => {
    const data = await api("library");
    setPapers(data.papers);
    setLoading(false);
  };
  async function reload() {
    setError("");
    try {
      await refresh();
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  }
  (0, import_react.useEffect)(() => {
    reload();
    api("models").then((data) => {
      setModels(data.routes);
      if (data.routes.length) setModel(JSON.stringify(data.routes[0]));
      if (data.errors.length) setError("\u90E8\u5206\u6A21\u578B\u5217\u8868\u4E0D\u53EF\u7528\uFF1A" + data.errors.join("\uFF1B"));
    }).catch((e) => setError(e.message));
  }, []);
  const running = papers.some((p) => ["running", "queued"].includes(p.analysis.status));
  (0, import_react.useEffect)(() => {
    if (!running) return;
    const timer = setInterval(() => refresh().catch((e) => setError(e.message)), 2e3);
    return () => clearInterval(timer);
  }, [running]);
  const active = papers.find((p) => p.id === selected), route = model ? JSON.parse(model) : null;
  async function importFiles(e) {
    const files = [...e.target.files];
    e.target.value = "";
    setImporting(true);
    setError("");
    let added = 0, duplicates = 0;
    try {
      for (const file of files) {
        if (file.size > 25 * 1024 * 1024) throw new Error(`${file.name} \u8D85\u8FC7 25 MB`);
        setMessage(`\u6B63\u5728\u5BFC\u5165 ${file.name}\u2026`);
        const result = await api("import", { filename: file.name, base64: await readBase64(file) });
        result.duplicate ? duplicates++ : added++;
        await refresh();
      }
      setMessage(`\u5BFC\u5165 ${added} \u7BC7${duplicates ? `\uFF0C\u8DF3\u8FC7 ${duplicates} \u7BC7\u76F8\u540C PDF` : ""}\u3002\u53EF\u9009\u62E9\u6587\u732E\u5F00\u59CB\u62C6\u89E3\u3002`);
    } catch (e2) {
      setError(e2.message);
      setMessage(`\u5DF2\u5BFC\u5165 ${added} \u7BC7\uFF0C\u5176\u4F59\u6587\u4EF6\u53EF\u91CD\u65B0\u9009\u62E9\u5BFC\u5165\u3002`);
    } finally {
      setImporting(false);
    }
  }
  async function run(p) {
    setError("");
    try {
      await api("analyze", { id: p.id, ...route, bilingual });
      setMessage("\u5DF2\u5F00\u59CB\u5168\u6587\u62C6\u89E3\u3002");
      await refresh();
    } catch (e) {
      setError(e.message);
    }
  }
  async function exportAs(format) {
    try {
      const r = await api("export", { format });
      download(r.filename, r.text, r.mime);
      setMessage("\u5DF2\u5BFC\u51FA\u5168\u90E8\u6587\u732E\u4E0E\u8BC1\u636E\u3002");
    } catch (e) {
      setError(e.message);
    }
  }
  const counts = { total: papers.length, analyzed: papers.filter((p) => Object.keys(p.fields).length).length, verified: papers.filter((p) => FIELDS.every(([key]) => p.review[key]?.status === "verified")).length };
  const visible = papers.filter((p) => [p.title, p.title_zh, p.authors, ...FIELDS.flatMap(([key]) => [effectiveField(p, key).value_zh || "", effectiveField(p, key).value_en || ""])].join(" ").toLowerCase().includes(search.toLowerCase())).filter((p) => filter === "all" || (filter === "pending" ? !Object.keys(p.fields).length : filter === "review" ? Object.keys(p.fields).length && !FIELDS.every(([key]) => p.review[key]?.status === "verified") : ["error", "interrupted", "cancelled"].includes(p.analysis.status))).filter((p) => reading === "all" || p.reading_status === reading).sort((a, b) => sort === "title" ? a.title.localeCompare(b.title) : sort === "year" ? String(b.year).localeCompare(String(a.year)) : b.created_at.localeCompare(a.created_at));
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-root" }, /* @__PURE__ */ import_react.default.createElement("header", { className: "pm-header" }, /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-eyebrow" }, "PAPER MATRIX ", /* @__PURE__ */ import_react.default.createElement("span", null, "\u521D\u8BFB\u5DE5\u4F5C\u53F0")), /* @__PURE__ */ import_react.default.createElement("h1", null, "\u6587\u732E\u62C6\u89E3"), /* @__PURE__ */ import_react.default.createElement("p", null, "\u628A\u95EE\u9898\u3001\u65B9\u6CD5\u4E0E\u8BC1\u636E\u653E\u5728\u540C\u4E00\u5F20\u8868\u91CC\u3002")), /* @__PURE__ */ import_react.default.createElement("button", { className: "pm-primary", disabled: importing, onClick: () => fileInput.current.click() }, importing ? "\u5BFC\u5165\u4E2D\u2026" : "\uFF0B \u5BFC\u5165 PDF")), /* @__PURE__ */ import_react.default.createElement("input", { ref: fileInput, "aria-label": "\u5BFC\u5165 PDF \u6587\u4EF6", type: "file", accept: "application/pdf,.pdf", multiple: true, hidden: true, onChange: importFiles }), /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-model-bar" }, /* @__PURE__ */ import_react.default.createElement("label", null, "\u5206\u6790\u6A21\u578B", /* @__PURE__ */ import_react.default.createElement("select", { value: model, onChange: (e) => setModel(e.target.value), "aria-label": "\u5206\u6790\u6A21\u578B" }, !models.length && /* @__PURE__ */ import_react.default.createElement("option", { value: "" }, "\u672A\u83B7\u53D6\u5230\u5DF2\u914D\u7F6E\u6A21\u578B"), models.map((m) => /* @__PURE__ */ import_react.default.createElement("option", { key: m.provider + m.model, value: JSON.stringify(m) }, m.name, " \xB7 ", m.provider)))), /* @__PURE__ */ import_react.default.createElement("label", { className: "pm-check" }, /* @__PURE__ */ import_react.default.createElement("input", { type: "checkbox", checked: bilingual, onChange: (e) => setBilingual(e.target.checked) }), "\u53CC\u8BED\u62C6\u89E3 / \u663E\u793A\u82F1\u6587"), /* @__PURE__ */ import_react.default.createElement("span", { className: "pm-muted" }, "\u5206\u6790\u4F1A\u5C06\u5168\u6587\u53D1\u9001\u81F3\u6240\u9009\u6A21\u578B\uFF0C\u4F7F\u7528 Harness \u914D\u989D\u3002")), error && /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-alert", role: "alert" }, error, /* @__PURE__ */ import_react.default.createElement("button", { "aria-label": "\u5173\u95ED\u9519\u8BEF\u63D0\u793A", onClick: () => setError("") }, "\xD7")), message && /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-message", role: "status" }, message), active ? /* @__PURE__ */ import_react.default.createElement(Detail, { key: active.id, paper: active, api, refresh, close: () => setSelected(null), bilingual, model, busy: ["running", "queued"].includes(active.analysis.status), run }) : /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-stats" }, /* @__PURE__ */ import_react.default.createElement("span", null, /* @__PURE__ */ import_react.default.createElement("b", null, counts.total), " \u7BC7\u6587\u732E"), /* @__PURE__ */ import_react.default.createElement("span", null, /* @__PURE__ */ import_react.default.createElement("b", null, counts.analyzed), " \u5DF2\u62C6\u89E3"), /* @__PURE__ */ import_react.default.createElement("span", null, /* @__PURE__ */ import_react.default.createElement("b", null, counts.verified), " \u5168\u5B57\u6BB5\u5DF2\u6838\u9A8C"), /* @__PURE__ */ import_react.default.createElement("span", { className: "pm-muted" }, "\u9605\u8BFB\u72B6\u6001\u7531\u4F60\u624B\u52A8\u8BB0\u5F55")), /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-toolbar" }, /* @__PURE__ */ import_react.default.createElement("input", { className: "pm-search", "aria-label": "\u641C\u7D22\u6587\u732E", placeholder: "\u641C\u7D22\u6807\u9898\u3001\u4F5C\u8005\u6216\u62C6\u89E3\u5185\u5BB9\u2026", value: search, onChange: (e) => setSearch(e.target.value) }), /* @__PURE__ */ import_react.default.createElement("select", { "aria-label": "\u62C6\u89E3\u72B6\u6001\u7B5B\u9009", value: filter, onChange: (e) => setFilter(e.target.value) }, /* @__PURE__ */ import_react.default.createElement("option", { value: "all" }, "\u5168\u90E8\u62C6\u89E3\u72B6\u6001"), /* @__PURE__ */ import_react.default.createElement("option", { value: "pending" }, "\u5F85\u62C6\u89E3"), /* @__PURE__ */ import_react.default.createElement("option", { value: "review" }, "\u5F85\u4EBA\u5DE5\u6838\u9A8C"), /* @__PURE__ */ import_react.default.createElement("option", { value: "error" }, "\u5206\u6790\u5931\u8D25\u6216\u4E2D\u65AD")), /* @__PURE__ */ import_react.default.createElement("select", { "aria-label": "\u9605\u8BFB\u72B6\u6001\u7B5B\u9009", value: reading, onChange: (e) => setReading(e.target.value) }, /* @__PURE__ */ import_react.default.createElement("option", { value: "all" }, "\u5168\u90E8\u9605\u8BFB\u72B6\u6001"), Object.entries(READING).map(([k, v]) => /* @__PURE__ */ import_react.default.createElement("option", { key: k, value: k }, v))), /* @__PURE__ */ import_react.default.createElement("select", { "aria-label": "\u6392\u5E8F", value: sort, onChange: (e) => setSort(e.target.value) }, /* @__PURE__ */ import_react.default.createElement("option", { value: "newest" }, "\u6700\u8FD1\u5BFC\u5165"), /* @__PURE__ */ import_react.default.createElement("option", { value: "title" }, "\u6807\u9898\u6392\u5E8F"), /* @__PURE__ */ import_react.default.createElement("option", { value: "year" }, "\u5E74\u4EFD\u964D\u5E8F")), /* @__PURE__ */ import_react.default.createElement("button", { onClick: reload }, "\u5237\u65B0"), /* @__PURE__ */ import_react.default.createElement("details", { className: "pm-export" }, /* @__PURE__ */ import_react.default.createElement("summary", null, "\u5BFC\u51FA"), /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement("button", { onClick: () => exportAs("csv") }, "\u5BFC\u51FA CSV"), /* @__PURE__ */ import_react.default.createElement("button", { onClick: () => exportAs("json") }, "\u5BFC\u51FA JSON")))), /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-table-wrap", tabIndex: 0, "aria-label": "\u6587\u732E\u62C6\u89E3\u8868\uFF0C\u53EF\u6A2A\u5411\u6EDA\u52A8" }, /* @__PURE__ */ import_react.default.createElement("table", null, /* @__PURE__ */ import_react.default.createElement("thead", null, /* @__PURE__ */ import_react.default.createElement("tr", null, /* @__PURE__ */ import_react.default.createElement("th", { className: "pm-title-col" }, "\u6587\u732E / Paper"), /* @__PURE__ */ import_react.default.createElement("th", null, "\u9605\u8BFB\u4E0E\u6838\u9A8C"), /* @__PURE__ */ import_react.default.createElement("th", null, "\u8BED\u8A00"), FIELDS.map(([key, zh, en]) => /* @__PURE__ */ import_react.default.createElement("th", { key }, zh, /* @__PURE__ */ import_react.default.createElement("small", null, en))))), /* @__PURE__ */ import_react.default.createElement("tbody", null, visible.map((p) => /* @__PURE__ */ import_react.default.createElement("tr", { key: p.id }, /* @__PURE__ */ import_react.default.createElement("td", { className: "pm-title-col" }, /* @__PURE__ */ import_react.default.createElement("button", { className: "pm-paper-link", onClick: () => setSelected(p.id) }, p.title), p.title_zh && /* @__PURE__ */ import_react.default.createElement("p", null, p.title_zh), /* @__PURE__ */ import_react.default.createElement("small", null, p.year || "\u5E74\u4EFD\u5F85\u63D0\u53D6", " \xB7 ", p.page_count, " \u9875 \xB7 ", p.filename), p.analysis.source === "research_pilot" && /* @__PURE__ */ import_react.default.createElement("span", { className: "pm-pilot" }, "\u8C03\u7814\u8BD5\u8BFB\u6837\u672C"), p.analysis.source === "harness_model" && /* @__PURE__ */ import_react.default.createElement("span", { className: "pm-pilot" }, "\u6A21\u578B\u521D\u8BFB\u8349\u7A3F")), /* @__PURE__ */ import_react.default.createElement("td", null, /* @__PURE__ */ import_react.default.createElement("span", { className: "pm-state " + (p.analysis.status === "error" ? "pm-warn" : "") }, STATUS[p.analysis.status]), /* @__PURE__ */ import_react.default.createElement("p", null, READING[p.reading_status]), /* @__PURE__ */ import_react.default.createElement("small", null, FIELDS.filter(([key]) => p.review[key]?.status === "verified").length, " / ", FIELDS.length, " \u5B57\u6BB5\u5DF2\u6838\u9A8C")), /* @__PURE__ */ import_react.default.createElement("td", null, /* @__PURE__ */ import_react.default.createElement("div", null, "\u8BBA\u6587 ", p.paper_language), /* @__PURE__ */ import_react.default.createElement("div", null, "\u6570\u636E ", p.data_language)), FIELDS.map(([key]) => {
    const f = effectiveField(p, key);
    return /* @__PURE__ */ import_react.default.createElement("td", { key }, /* @__PURE__ */ import_react.default.createElement("button", { className: "pm-cell", onClick: () => setSelected(p.id) }, /* @__PURE__ */ import_react.default.createElement("span", null, f.value_zh || "\u2014"), bilingual && f.value_en && /* @__PURE__ */ import_react.default.createElement("span", { className: "pm-en", lang: "en" }, f.value_en)), p.overrides[key] && /* @__PURE__ */ import_react.default.createElement("small", { className: "pm-good" }, "\u4EBA\u5DE5\u4FEE\u6539"), p.fields[key]?.status === "needs_review" && /* @__PURE__ */ import_react.default.createElement("small", { className: "pm-warn" }, "\u8BC1\u636E\u5F85\u8865\u6838"));
  }))))), !visible.length && /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-empty" }, loading ? "\u6B63\u5728\u8BFB\u53D6\u6587\u732E\u5E93\u2026" : papers.length ? "\u6CA1\u6709\u7B26\u5408\u6761\u4EF6\u7684\u6587\u732E\uFF0C\u8C03\u6574\u641C\u7D22\u6216\u7B5B\u9009\u3002" : /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement("strong", null, "\u4ECE\u7B2C\u4E00\u7BC7\u8BBA\u6587\u5F00\u59CB"), /* @__PURE__ */ import_react.default.createElement("p", null, "\u5BFC\u5165\u4E2D\u82F1\u6587 PDF\uFF0C\u9009\u62E9\u6587\u732E\u540E\u5F00\u59CB\u62C6\u89E3\u3002"), /* @__PURE__ */ import_react.default.createElement("p", null, "\u539F\u6587\u5F15\u7528\u4F1A\u6309 PDF \u9875\u7801\u5339\u914D\uFF1B\u7ED3\u679C\u53EF\u7F16\u8F91\u3001\u6838\u9A8C\u548C\u5BFC\u51FA\u3002"), /* @__PURE__ */ import_react.default.createElement("button", { className: "pm-primary", disabled: importing, onClick: () => fileInput.current.click() }, "\u9009\u62E9 PDF")))), /* @__PURE__ */ import_react.default.createElement("footer", { className: "pm-footer" }, /* @__PURE__ */ import_react.default.createElement("span", null, visible.length, " / ", papers.length, " \u7BC7 \xB7 \u5411\u53F3\u6EDA\u52A8\u67E5\u770B\u5168\u90E8\u5B57\u6BB5\uFF0C\u70B9\u51FB\u5355\u5143\u683C\u67E5\u770B\u539F\u6587\u8BC1\u636E"), /* @__PURE__ */ import_react.default.createElement("span", null, "Paper Matrix 0.1 \xB7 \u672C\u5730\u4FDD\u5B58"))));
}
var inject = ["connection", "slots", "sidebarRight", "sidebarRightTabs"];
function apply(ctx) {
  ctx.effect(() => {
    const style = document.createElement("style");
    style.dataset.plugin = "dsh-paper-matrix";
    style.textContent = style_default;
    document.head.appendChild(style);
    return () => style.remove();
  }, "paper-matrix styles");
  const api = async (method, args = {}) => {
    const r = await ctx.connection.rpc.call("/api", "paper-matrix", { method, args });
    if (!r.ok) throw new Error(r.error?.message || "\u8BF7\u6C42\u5931\u8D25");
    return r.value;
  };
  ctx.effect(() => ctx.sidebarRightTabs.register({ id: "dsh-paper-matrix", kind: "paper-matrix", title: () => "\u6587\u732E\u62C6\u89E3", guide: [{ id: "library", order: 12, title: () => "\u6587\u732E\u62C6\u89E3", description: () => "\u53CC\u8BED\u8BBA\u6587 \xB7 \u8868\u683C\u521D\u8BFB \xB7 \u539F\u6587\u8BC1\u636E" }] }), "paper-matrix tab");
  ctx.effect(() => ctx.slots.inject("sidebar.right.pane.tab", () => ctx.slots.register({ name: "sidebar.right.pane.tab", key: "dsh-paper-matrix" }, () => /* @__PURE__ */ import_react.default.createElement(Matrix, { api }))), "paper-matrix body");
  ctx.effect(() => ctx.slots.inject("conversation.session.header.actions", () => ctx.slots.register({ name: "conversation.session.header.actions", id: "paper-matrix-open", order: 80 }, () => /* @__PURE__ */ import_react.default.createElement("button", { title: "\u6253\u5F00\u6587\u732E\u62C6\u89E3\u8868", "aria-label": "\u6253\u5F00\u6587\u732E\u62C6\u89E3\u8868", className: "pm-launch", onClick: () => ctx.sidebarRight.openTab("paper-matrix") }, "\u6587\u732E\u8868"))), "paper-matrix launch");
}

return module.exports;}});
