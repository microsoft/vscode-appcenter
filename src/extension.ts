import * as vscode from 'vscode';
import { CommandNames } from './constants';
import { ExtensionManager } from './extensionManager';
import { OutputChannelLogger } from './log/outputChannelLogger';

let _extensionManager: ExtensionManager;
const outputChannelLogger = OutputChannelLogger.getMainChannel();

export async function activate(context: vscode.ExtensionContext) {
    // Construct the extension manager that handles AppCenter commands
    _extensionManager = new ExtensionManager();
    const rootPath = vscode.workspace.rootPath;
    await _extensionManager.Initialize(rootPath, outputChannelLogger);

    // Register the ext manager for disposal
    context.subscriptions.push(_extensionManager);
    registerAppCenterCommands(context);
}

export function deactivate() { }

function registerAppCenterCommands(context: vscode.ExtensionContext): void {

    // General AppCenter commands
    const appCenterCommandHandler = _extensionManager.commandHandlers.appCenterCommandHandler;
    context.subscriptions.push(vscode.commands.registerCommand(CommandNames.AppCenterPortal,
        () => _extensionManager.RunCommand(() => appCenterCommandHandler.AppCenterPortalMenu())));
    context.subscriptions.push(vscode.commands.registerCommand(CommandNames.WhoAmI,
        () => _extensionManager.RunCommand(() => appCenterCommandHandler.WhoAmI())));
    context.subscriptions.push(vscode.commands.registerCommand(CommandNames.Login,
        () => _extensionManager.RunCommand(() => appCenterCommandHandler.Login())));
    context.subscriptions.push(vscode.commands.registerCommand(CommandNames.ShowMenu,
        () => _extensionManager.RunCommand(() => appCenterCommandHandler.ShowMenu())));
    context.subscriptions.push(vscode.commands.registerCommand(CommandNames.Start,
        () => _extensionManager.RunCommand(() => appCenterCommandHandler.Start())));
    context.subscriptions.push(vscode.commands.registerCommand(CommandNames.GetCurrentApp,
        () => _extensionManager.RunCommand(() => appCenterCommandHandler.GetCurrentApp())));
    context.subscriptions.push(vscode.commands.registerCommand(CommandNames.SetCurrentApp,
        () => _extensionManager.RunCommand(() => appCenterCommandHandler.SetCurrentApp())));

    // Settings commands
    const settingsCommandHandler = _extensionManager.commandHandlers.settingsCommandHandler;
    context.subscriptions.push(vscode.commands.registerCommand(CommandNames.Settings.LoginToAnotherAccount,
        () => _extensionManager.RunCommand(() => settingsCommandHandler.LoginToAnotherAccount())));
    context.subscriptions.push(vscode.commands.registerCommand(CommandNames.Settings.SwitchAccount,
        () => _extensionManager.RunCommand(() => settingsCommandHandler.SwitchAccount())));
    context.subscriptions.push(vscode.commands.registerCommand(CommandNames.Settings.Logout,
        () => _extensionManager.RunCommand(() => settingsCommandHandler.Logout())));
    context.subscriptions.push(vscode.commands.registerCommand(CommandNames.Settings.LoginVsts,
        () => _extensionManager.RunCommand(() => settingsCommandHandler.LoginToVsts())));
    context.subscriptions.push(vscode.commands.registerCommand(CommandNames.Settings.SwitchAccountVsts,
        () => _extensionManager.RunCommand(() => settingsCommandHandler.SwitchVstsAcc())));
    context.subscriptions.push(vscode.commands.registerCommand(CommandNames.Settings.LogoutVsts,
        () => _extensionManager.RunCommand(() => settingsCommandHandler.LogoutVsts())));

    // CodePush commands
    const codepushCommandHandler = _extensionManager.commandHandlers.codePushCommandHandler;
    context.subscriptions.push(vscode.commands.registerCommand(CommandNames.CodePush.SetCurrentDeployment,
        () => _extensionManager.RunCommand(() => codepushCommandHandler.SetCurrentDeployment())));
    context.subscriptions.push(vscode.commands.registerCommand(CommandNames.CodePush.ReleaseReact,
        () => _extensionManager.RunCommand(() => codepushCommandHandler.ReleaseReact())));
    context.subscriptions.push(vscode.commands.registerCommand(CommandNames.CodePush.SwitchMandatoryPropForRelease,
        () => _extensionManager.RunCommand(() => codepushCommandHandler.SwitchMandatoryPropForRelease())));
    context.subscriptions.push(vscode.commands.registerCommand(CommandNames.CodePush.SetTargetBinaryVersion,
        () => _extensionManager.RunCommand(() => codepushCommandHandler.SetTargetBinaryVersion())));
}
