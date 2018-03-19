'use strict';

import * as vscode from 'vscode';
import { ExtensionManager } from './extensionManager';
import { CommandNames } from './helpers/constants';

let _extensionManager: ExtensionManager;

export async function activate(context: vscode.ExtensionContext) {
    // Construct the extension manager that handles AppCenter commands
    _extensionManager = new ExtensionManager();
    const rootPath = vscode.workspace.rootPath;
    await _extensionManager.Initialize(rootPath);

    // Register the ext manager for disposal
    context.subscriptions.push(_extensionManager);
    registerAppCenterCommands(context);
}

export function deactivate() {}

function registerAppCenterCommands(context: vscode.ExtensionContext): void {
    context.subscriptions.push(vscode.commands.registerCommand(CommandNames.WhoAmI,
        () => _extensionManager.RunCommand(() => _extensionManager.AppCenterCommandHandler.WhoAmI())));
    context.subscriptions.push(vscode.commands.registerCommand(CommandNames.Login,
        () => _extensionManager.RunCommand(() => _extensionManager.AppCenterCommandHandler.Login())));
    context.subscriptions.push(vscode.commands.registerCommand(CommandNames.Logout,
        () => _extensionManager.RunCommand(() => _extensionManager.AppCenterCommandHandler.Logout())));
    context.subscriptions.push(vscode.commands.registerCommand(CommandNames.ShowMenu,
        () => _extensionManager.RunCommand(() => _extensionManager.AppCenterCommandHandler.ShowMenu())));
    context.subscriptions.push(vscode.commands.registerCommand(CommandNames.Start,
        () => _extensionManager.RunCommand(() => _extensionManager.AppCenterCommandHandler.Start())));
}
