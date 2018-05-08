import * as vscode from "vscode";

export class VsCodeTerminal {
    private terminal: vscode.Terminal;

    constructor() {
        this.terminal = vscode.window.createTerminal();
    }

    public show() {
        this.terminal.show(false); // Should gain focus.
    }

    public run(command: string): void {
        this.terminal.sendText(command); //Should run automatically.
    }
}
