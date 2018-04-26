import * as vscode from "vscode";

export class TerminalHelper {
    private terminal: vscode.Terminal;

    constructor() {
        this.terminal = vscode.window.createTerminal();
    }

    public show() {
        this.terminal.show(false);
    }

    public run(command: string): void {
        this.terminal.sendText(command);
    }
}
