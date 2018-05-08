import * as vscode from 'vscode';
import AppCenterAuth from '../auth/appCenterAuth';
import { AuthFactory } from '../auth/authFactory';
import VstsAuth from '../auth/vstsAuth';
import { ExtensionManager } from './extensionManager';
import { OutputChannelLogger } from './log/outputChannelLogger';
import { AuthProvider, CommandNames } from './resources/constants';

let _extensionManager: ExtensionManager;
const outputChannelLogger = OutputChannelLogger.getMainChannel();

export async function activate(context: vscode.ExtensionContext) {
    // Construct the extension manager that handles App Center commands
    _extensionManager = new ExtensionManager();
    const rootPath = vscode.workspace.rootPath;

    const appCenterAuth: AppCenterAuth = <AppCenterAuth>await AuthFactory.getAuth(AuthProvider.AppCenter, outputChannelLogger);
    const vstsAuth: VstsAuth = <VstsAuth>await AuthFactory.getAuth(AuthProvider.Vsts, outputChannelLogger);

    await _extensionManager.Initialize(rootPath, outputChannelLogger, appCenterAuth, vstsAuth);
    await _extensionManager.checkCurrentApps(appCenterAuth);
    _extensionManager.setupAppCenterStatusBar(await appCenterAuth.activeProfile);

    // Register the ext manager for disposal
    context.subscriptions.push(_extensionManager);
    registerAppCenterCommands(context);
}

export function deactivate() { }

function registerAppCenterCommands(context: vscode.ExtensionContext): void {

    // General App Center commands
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
    context.subscriptions.push(vscode.commands.registerCommand(CommandNames.SimulateCrashes,
        () => _extensionManager.RunCommand(() => appCenterCommandHandler.SimulateCrashes())));
    context.subscriptions.push(vscode.commands.registerCommand(CommandNames.InstallSDK,
        () => _extensionManager.RunCommand(() => appCenterCommandHandler.InstallSDK())));
    context.subscriptions.push(vscode.commands.registerCommand(CommandNames.CreateNewApp,
        () => _extensionManager.RunCommand(() => appCenterCommandHandler.CreateNewApp())));

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
    context.subscriptions.push(vscode.commands.registerCommand(CommandNames.Settings.ShowStatusBar,
        () => _extensionManager.RunCommand(() => settingsCommandHandler.ShowStatusBar())));
    context.subscriptions.push(vscode.commands.registerCommand(CommandNames.Settings.HideStatusBar,
        () => _extensionManager.RunCommand(() => settingsCommandHandler.HideStatusBar())));

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
    context.subscriptions.push(vscode.commands.registerCommand(CommandNames.CodePush.LinkCodePush,
        () => _extensionManager.RunCommand(() => codepushCommandHandler.LinkCodePush())));

    // Test commands
    const testCommandHandler = _extensionManager.commandHandlers.testCommandHandler;
    context.subscriptions.push(vscode.commands.registerCommand(CommandNames.Test.ShowMenu,
        () => _extensionManager.RunCommand(() => testCommandHandler.showMenu())));
    context.subscriptions.push(vscode.commands.registerCommand(CommandNames.Test.RunUITests,
        () => _extensionManager.RunCommand(() => testCommandHandler.runUITests())));
    context.subscriptions.push(vscode.commands.registerCommand(CommandNames.Test.RunUITestsAsync,
        () => _extensionManager.RunCommand(() => testCommandHandler.runUITestsAsync())));
    context.subscriptions.push(vscode.commands.registerCommand(CommandNames.Test.ViewResults,
        () => _extensionManager.RunCommand(() => testCommandHandler.viewResults())));
}
