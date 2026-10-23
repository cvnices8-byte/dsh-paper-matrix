# Paper Matrix for DeepSeek Harness

[中文](README.md) · [Releases](https://github.com/cvnices8-byte/dsh-paper-matrix/releases) · MIT

A native Harness sidebar plugin for a bilingual, evidence-linked paper reading matrix. Import PDFs, compare 11 research fields, inspect original-language quotes by PDF page, and keep AI drafts separate from your edits and reading status.

Independent community software, not an official DeepSeek product. Version 0.1.1 is a local, single-user preview.

## Requirements and installation

Tested Harness version: **0.2.1-rc.2**. Python **3.9+** must be available as `python3`. Source builds additionally require Node **22.13+** and npm. Model extraction requires an already configured Harness provider.

### Desktop

Open **Plugins → Add plugin**, paste `https://github.com/cvnices8-byte/dsh-paper-matrix` into the package/address field and install. Then open **文献拆解** in a conversation's right sidebar. Since 0.1.1, the Git repository includes prebuilt host/client modules and the Python bridge, so installation requires no lifecycle build or pnpm `allowBuilds` changes.

If an earlier Git install failed with `ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED`, return to the editor and reinstall the same repository URL. The 0.1.0 Git source omitted `lib/`, unlike its separately built tarball; 0.1.1 fixes this packaging mismatch.

The desktop app uses the `desktop` profile, independently of a standalone `paper-matrix` web profile. To share an existing library, configure its absolute `libraryDir` and stop any other host using it first.

### Standalone web / CLI

Use `dsh plugin --profile paper-matrix add https://github.com/cvnices8-byte/dsh-paper-matrix`, or download the versioned `.tgz` from [Releases](https://github.com/cvnices8-byte/dsh-paper-matrix/releases).

```sh
# Only initialize a profile that does not already exist: this flag resets it.
dsh --profile paper-matrix --from-default-profile web --dump-config
dsh plugin --profile paper-matrix add /absolute/path/dsh-paper-matrix-0.1.1.tgz
cd /absolute/path/your-research-project
dsh --profile paper-matrix --port 3147
```

Open the login URL printed by Harness, then choose **文献拆解** in the right sidebar. Keep the terminal running. On macOS the bundled CLI is `/Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh` if `dsh` is not on PATH.

Optionally set a fixed location in the profile's `cordis.patch.yml`:

```yaml
- id: paper-matrix
  config:
    libraryDir: /absolute/path/your-research-project/文献库
    # python: /absolute/path/python3
```

Alternatively use `DSH_PAPER_MATRIX_LIBRARY_DIR`; explicit profile configuration takes precedence. The interface is currently Chinese with bilingual field labels and summaries.

## Workflow

Import searchable PDFs, open a paper, select a configured model and optionally enable bilingual extraction. Review the draft against page-linked quotations, edit individual cells, record reading status and append notes. Search/filter the table and export a bilingual CSV or complete library JSON.

The 11 fields cover paper type, research question, data, methodology, benchmark evidence, evaluation scope, experimental/identification design, metrics, findings, limitations and resources. Paper language and dataset language are distinct.

Analysis sends full paper text to the provider you select and uses that provider's quota. The plugin uses Harness's model service; it does not request or store another API key. Importing, browsing and editing local records do not call a model.

## Storage and limits

`文献库/library.sqlite3` is the source of truth. Uploaded originals live in `文献库/pdf-assets/`; `.harness-cache/` stores rebuildable parsed text, preview copies and job state. Existing external PDFs remain at their registered paths. Back up the database and all original PDFs while no writes are running. JSON exports are current snapshots, not complete history backups.

AI regeneration preserves human edits. Reading status and human verification are independent. Optimistic revisions reject stale edits rather than overwrite another window.

Limits: 25 MB, 300 pages and 180,000 extracted characters per paper. No OCR, cloud sync, Zotero integration, multi-user access or automatic batch analysis. Complex tables, equations and columns require inspection of the original PDF. The page viewer displays extracted text, not original layout.

Quotation matching normalizes whitespace, compatibility characters and alphabetic line-break hyphens. It does **not** establish semantic support. Model drafts can contain wrong numbers, missing conditions and incorrect conflict claims. Review before citing.

## Build and tests

```sh
git clone https://github.com/cvnices8-byte/dsh-paper-matrix.git
cd dsh-paper-matrix
npm ci
npm run check
npm pack
```

Builds are self-contained. The vendored storage CLI uses Python's standard library only. Tests use generated PDFs and temporary databases; they do not use your papers or make paid model calls. Release archives contain precompiled host/client entries. Run `node examples/create-sample.mjs` to generate an original one-page synthetic import sample; it is not a real study or model-quality demonstration.

Uninstall with `dsh plugin --profile paper-matrix remove dsh-paper-matrix`. The library remains on disk. Report issues with Harness/OS versions, sanitized errors and a shareable minimal example; never attach credentials or papers you lack permission to share.

See [Third-party notices](THIRD_PARTY_NOTICES.md) and [MIT license](LICENSE).
