'use strict';

import * as vscode from 'vscode';
import { ExtensionManager } from './extensionManager';
import { CommandNames } from './helpers/constants';

let _extensionManager: ExtensionManager;

export async function activate(context: vscode.ExtensionContext) {
    // Construct the extension manager that handles AppCenter commands
    _extensionManager = new ExtensionManager();
    await _extensionManager.Initialize();

    // Register the ext manager for disposal
    context.subscriptions.push(_extensionManager);
    registerAppCenterCommands(context);
}

export function deactivate() {
}

function registerAppCenterCommands(context: vscode.ExtensionContext): void {
    context.subscriptions.push(vscode.commands.registerCommand(CommandNames.WhoAmI,
        () => _extensionManager.RunCommand(() => _extensionManager.AppCenterCommandHandler.WhoAmI())));
}
