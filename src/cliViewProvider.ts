import * as vscode from 'vscode';
import { createCodexTerminal } from './terminal';

export class CliViewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;
    private _extensionUri: vscode.Uri;
    private _context: vscode.ExtensionContext;

    constructor(extensionUri: vscode.Uri, context: vscode.ExtensionContext) {
        this._extensionUri = extensionUri;
        this._context = context;

        // Watch for configuration changes so the webview stays in sync
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('codex-cli-live.cliCommand')) {
                this._updateWebview();
            }
        });
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage((data) => {
            switch (data.type) {
                case 'runCommand': {
                    const target = data.target as 'editor' | 'bottom';
                    createCodexTerminal(target);
                    break;
                }
                case 'sendToTerminal': {
                    const terminal = vscode.window.terminals.find(
                        (t) => t.name === 'Codex CLI'
                    );
                    if (terminal) {
                        terminal.sendText(data.text);
                    } else {
                        vscode.window.showWarningMessage(
                            'No Codex CLI terminal is currently running. Launch it first from the sidebar.'
                        );
                    }
                    break;
                }
                case 'requestUpdate': {
                    this._updateWebview();
                    break;
                }
            }
        });
    }

    private _updateWebview(): void {
        if (this._view) {
            const config = vscode.workspace.getConfiguration('codex-cli-live');
            const cliCommand = config.get('cliCommand', 'codex');
            this._view.webview.postMessage({
                type: 'update',
                cliCommand,
            });
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        const config = vscode.workspace.getConfiguration('codex-cli-live');
        const cliCommand = config.get('cliCommand', 'codex');

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Codex CLI</title>
    <style>
        :root {
            --codex-gradient-start: #B1A7FF;
            --codex-gradient-mid: #7A9DFF;
            --codex-gradient-end: #3941FF;
            --codex-purple: #7A7FFF;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            padding: 16px;
            font-family: var(--vscode-font-family, -apple-system, sans-serif);
            color: var(--vscode-foreground);
            background: var(--vscode-sideBar-background);
            line-height: 1.4;
        }

        .container {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        /* --- Header / Logo area --- */
        .header {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            padding: 8px 0 4px 0;
        }

        .logo-icon {
            width: 48px;
            height: 48px;
            flex: none;
        }

        .title {
            font-size: 16px;
            font-weight: 600;
            background: linear-gradient(135deg, var(--codex-gradient-start), var(--codex-gradient-mid), var(--codex-gradient-end));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .subtitle {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            text-align: center;
        }

        /* --- Buttons --- */
        .button-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 10px 14px;
            border: none;
            border-radius: 6px;
            font-size: 13px;
            font-family: inherit;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.15s ease;
            text-align: center;
        }

        .btn:focus-visible {
            outline: 2px solid var(--vscode-focusBorder);
            outline-offset: 1px;
        }

        .btn-primary {
            background: linear-gradient(135deg, #7A9DFF, #3941FF);
            color: #ffffff;
        }

        .btn-primary:hover {
            background: linear-gradient(135deg, #8EACFF, #4A52FF);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(57, 65, 255, 0.35);
        }

        .btn-primary:active {
            transform: translateY(0);
            box-shadow: none;
        }

        .btn-secondary {
            background: transparent;
            color: var(--vscode-foreground);
            border: 1px solid var(--vscode-panel-border, rgba(128, 128, 128, 0.4));
        }

        .btn-secondary:hover {
            background: var(--vscode-toolbar-hoverBackground);
            border-color: var(--codex-purple);
        }

        /* --- Separator --- */
        .separator {
            border: none;
            border-top: 1px solid var(--vscode-sideBarSectionHeader-border, rgba(128, 128, 128, 0.15));
            margin: 4px 0;
        }

        /* --- Info --- */
        .info-section {
            background: var(--vscode-editor-background, rgba(255,255,255,0.04));
            border-radius: 6px;
            padding: 12px;
        }

        .info-label {
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 6px;
        }

        .info-command {
            font-family: var(--vscode-editor-font-family, monospace);
            font-size: 12px;
            color: var(--codex-gradient-mid);
            background: var(--vscode-textCodeBlock-background, rgba(0,0,0,0.12));
            padding: 4px 8px;
            border-radius: 4px;
            word-break: break-all;
        }

        /* --- SVG icon helpers --- */
        .btn-icon {
            width: 16px;
            height: 16px;
            flex: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <svg class="logo-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.503 0H4.496A4.496 4.496 0 000 4.496v15.007A4.496 4.496 0 004.496 24h15.007A4.496 4.496 0 0024 19.503V4.496A4.496 4.496 0 0019.503 0z" fill="transparent"/>
                <path d="M9.064 3.344a4.578 4.578 0 012.285-.312c1 .115 1.891.54 2.673 1.275.01.01.024.017.037.021a.09.09 0 00.043 0 4.55 4.55 0 013.046.275l.047.022.116.057a4.581 4.581 0 012.188 2.399c.209.51.313 1.041.315 1.595a4.24 4.24 0 01-.134 1.223.123.123 0 00.03.115c.594.607.988 1.33 1.183 2.17.289 1.425-.007 2.71-.887 3.854l-.136.166a4.548 4.548 0 01-2.201 1.388.123.123 0 00-.081.076c-.191.551-.383 1.023-.74 1.494-.9 1.187-2.222 1.846-3.711 1.838-1.187-.006-2.239-.44-3.157-1.302a.107.107 0 00-.105-.024c-.388.125-.78.143-1.204.138a4.441 4.441 0 01-1.945-.466 4.544 4.544 0 01-1.61-1.335c-.152-.202-.303-.392-.414-.617a5.81 5.81 0 01-.37-.961 4.582 4.582 0 01-.014-2.298.124.124 0 00.006-.056.085.085 0 00-.027-.048 4.467 4.467 0 01-1.034-1.651 3.896 3.896 0 01-.251-1.192 5.189 5.189 0 01.141-1.6c.337-1.112.982-1.985 1.933-2.618.212-.141.413-.251.601-.33.215-.089.43-.164.646-.227a.098.098 0 00.065-.066 4.51 4.51 0 01.829-1.615 4.535 4.535 0 011.837-1.388zm3.482 10.565a.637.637 0 000 1.272h3.636a.637.637 0 100-1.272h-3.636zM8.462 9.23a.637.637 0 00-1.106.631l1.272 2.224-1.266 2.136a.636.636 0 101.095.649l1.454-2.455a.636.636 0 00.005-.64L8.462 9.23z" fill="url(#codex-webview-grad)"/>
                <defs>
                    <linearGradient gradientUnits="userSpaceOnUse" id="codex-webview-grad" x1="12" x2="12" y1="3" y2="21">
                        <stop stop-color="#B1A7FF"/>
                        <stop offset=".5" stop-color="#7A9DFF"/>
                        <stop offset="1" stop-color="#3941FF"/>
                    </linearGradient>
                </defs>
            </svg>
            <div class="title">Codex CLI</div>
            <div class="subtitle">Quickly launch CLI in your project environment.</div>
        </div>

        <!-- Action Buttons -->
        <div class="button-group">
            <button class="btn btn-primary" id="btn-editor">
                <svg class="btn-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="2" width="14" height="11" rx="2" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M4 4.5h8M4 7h6M4 9.5h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
                </svg>
                Open Terminal in Editor Tab
            </button>
            <button class="btn btn-secondary" id="btn-bottom">
                <svg class="btn-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="1" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M2 4h12" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M5 6.5l3 2.5-3 2.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Open Terminal in Bottom Panel
            </button>
        </div>

        <hr class="separator" />

        <!-- Current configuration -->
        <div class="info-section">
            <div class="info-label">CLI Command</div>
            <div class="info-command" id="info-command">${this._escapeHtml(cliCommand)}</div>
        </div>
    </div>

    <script>
        (function () {
            const vscode = acquireVsCodeApi();

            document.getElementById('btn-editor').addEventListener('click', () => {
                vscode.postMessage({ type: 'runCommand', target: 'editor' });
            });

            document.getElementById('btn-bottom').addEventListener('click', () => {
                vscode.postMessage({ type: 'runCommand', target: 'bottom' });
            });

            // Listen for config updates from the extension host
            window.addEventListener('message', (event) => {
                const message = event.data;
                if (message.type === 'update') {
                    document.getElementById('info-command').textContent =
                        message.cliCommand;
                }
            });
        })();
    </script>
</body>
</html>`;
    }

    private _escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}
