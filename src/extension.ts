import * as vscode from 'vscode';
import { CliViewProvider } from './cliViewProvider';
import { createCodexTerminal } from './terminal';

/**
 * Activates the Codex CLI Live extension.
 * - Registers the sidebar webview.
 * - Registers commands for launching Codex CLI in editor tabs and the bottom panel.
 */
export function activate(context: vscode.ExtensionContext) {
    const provider = new CliViewProvider(context.extensionUri, context);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            'codex-cli-live.sidebarView',
            provider
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('codex-cli-live.launchCLIEditor', () => {
            createCodexTerminal('editor');
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('codex-cli-live.launchCLIBottom', () => {
            createCodexTerminal('bottom');
        })
    );
}

export function deactivate() {}
