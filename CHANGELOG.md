# Changelog — Codex CLI Live

All notable changes to this extension will be documented in this file.

---

## [1.0.0] — 2026-06-09

### 🚀 Initial Release

First release of **Codex CLI Live** — a VS Code extension for launching the Codex CLI directly from within the editor.

#### Features

- **Sidebar View** — Dedicated activity bar container with a webview panel for launching Codex.
- **Editor Tab Terminal** — Open Codex CLI as a full editor tab via sidebar button or command palette.
- **Bottom Panel Terminal** — Open Codex CLI in the bottom panel as a secondary placement option.
- **Editor Toolbar Button** — Theme-adaptive toolbar icon in every editor tab's title bar for instant access.
- **Configurable CLI Command** — The `codex-cli-live.cliCommand` setting lets you customize the launch command (default: `codex`).
- **Codex Purple Theme** — UI styled with the Codex brand gradient palette (`#B1A7FF` → `#7A9DFF` → `#3941FF`).

#### Design Decisions

- **No Quick Commands (yet)** — The sidebar intentionally omits quick-command buttons (like `/clear`, `/config`, etc.) in this release. Codex's slash-command surface is large and still evolving; adding a curated subset would create maintenance burden and a mismatch between the sidebar and the actual CLI. Users interact with slash commands directly in the terminal.
- **Theme-adaptive toolbar icons** — Separate dark/light SVG variants ensure the toolbar icon is always visible regardless of the active VS Code color theme.
- **Terminal reuse** — Opening Codex reuses an existing "Codex CLI" terminal rather than spawning duplicates, keeping the terminal list tidy.

#### Technical Notes

- Built with TypeScript 5.9 targeting ES2022 / Node16 modules.
- Targets VS Code `>= 1.120.0`.
- Webview UI uses CSS custom properties (`--vscode-*`) for native theme integration.
- Shared `terminal.ts` module encapsulates terminal creation/reuse logic.

---

<details>
<summary><strong>Versioning Convention</strong></summary>

This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR** — breaking changes to the extension API or configuration schema.
- **MINOR** — new features (commands, settings, UI additions).
- **PATCH** — bug fixes, dependency updates, documentation.

</details>
