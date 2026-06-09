import * as vscode from 'vscode';

export type TerminalTarget = 'editor' | 'bottom';

/**
 * Creates or reuses a Codex CLI terminal.
 * @param target - Where the terminal should appear: in an editor tab or the bottom panel.
 */
export function createCodexTerminal(target: TerminalTarget): void {
    const config = vscode.workspace.getConfiguration('codex-cli-live');
    const cliCommand: string = config.get('cliCommand', 'codex');

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage(
            'No active project folder found. Please open a project folder first.'
        );
        return;
    }

    const cwd = workspaceFolders[0].uri.fsPath;

    // Dispose any existing Codex CLI terminal to avoid duplicates
    const existing = vscode.window.terminals.find((t) => t.name === 'Codex CLI');
    if (existing) {
        existing.dispose();
    }

    const location =
        target === 'editor'
            ? vscode.TerminalLocation.Editor
            : vscode.TerminalLocation.Panel;

    const terminal = vscode.window.createTerminal({
        name: 'Codex CLI',
        cwd,
        location,
    });

    terminal.show();
    terminal.sendText(cliCommand);
}
