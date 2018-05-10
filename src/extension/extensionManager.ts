import { Disposable, StatusBarItem } from 'vscode';
import AppCenterAuth from '../auth/appCenterAuth';
import VstsAuth from '../auth/vstsAuth';
import { Profile, AppCenterProfile } from '../helpers/interfaces';
import { Utils } from '../helpers/utils/utils';
import * as CommandHandlers from './commandHandlers';
import { ConsoleLogger } from './log/consoleLogger';
import { ILogger } from './log/logHelper';
import { AuthProvider, CommandNames } from './resources/constants';
import { Strings } from './resources/strings';
import { VsCodeUI } from './ui/vscodeUI';
import { Messages } from './resources/messages';
import { AppCenterClient, createAppCenterClient } from '../api/appcenter';
import { SettingsHelper } from '../helpers/settingsHelper';

class CommandHandlersContainer {
    private _appCenterCommandHandler: CommandHandlers.AppCenter;
    private _settingsCommandHandler: CommandHandlers.Settings;
    private _codePushCommandHandler: CommandHandlers.CodePush;
    private _testCommandHandler: CommandHandlers.Test;

    constructor(private manager: ExtensionManager, private appCenterAuth: AppCenterAuth, private vstsAuth: VstsAuth) {
        this._appCenterCommandHandler = new CommandHandlers.AppCenter(this.manager, this.appCenterAuth, this.vstsAuth);
        this._settingsCommandHandler = new CommandHandlers.Settings(this.manager, this.appCenterAuth, this.vstsAuth);
        this._codePushCommandHandler = new CommandHandlers.CodePush(this.manager, this.appCenterAuth, this.vstsAuth);
        this._testCommandHandler = new CommandHandlers.Test(this.manager, this.appCenterAuth, this.vstsAuth);
    }

    public get appCenterCommandHandler(): CommandHandlers.AppCenter {
        return this._appCenterCommandHandler;
    }

    public get settingsCommandHandler(): CommandHandlers.Settings {
        return this._settingsCommandHandler;
    }

    public get codePushCommandHandler(): CommandHandlers.CodePush {
        return this._codePushCommandHandler;
    }

    public get testCommandHandler(): CommandHandlers.Test {
        return this._testCommandHandler;
    }
}

export class ExtensionManager implements Disposable {
    private _commandHandlersContainer: CommandHandlersContainer;
    private _appCenterStatusBarItem: StatusBarItem;
    private _projectRootPath: string | undefined;
    public _logger: ILogger;

    public get commandHandlers(): CommandHandlersContainer {
        return this._commandHandlersContainer;
    }

    public get projectRootPath(): string | undefined {
        return this._projectRootPath;
    }

    public async Initialize(projectRootPath: string | undefined,
        logger: ILogger = new ConsoleLogger(),
        appCenterAuth: AppCenterAuth,
        vstsAuth: VstsAuth
    ): Promise<void> {
        this._logger = logger;
        this._projectRootPath = projectRootPath;

        this._commandHandlersContainer = new CommandHandlersContainer(this, appCenterAuth, vstsAuth);
        await this.initializeExtension();
    }

    // tslint:disable-next-line:typedef
    public RunCommand(funcToTry: (args) => void, ...args: string[]): void {
        funcToTry(args);
    }

    public async checkCurrentApps(appCenterAuth: AppCenterAuth) {
        const profile: AppCenterProfile = await appCenterAuth.activeProfile;
        if (profile && profile.currentApp) {
            await this.checkAppExists(profile, appCenterAuth);
        }
    }

    private async checkAppExists(profile: AppCenterProfile, appCenterAuth: AppCenterAuth) {
        const clientForProfile: AppCenterClient = createAppCenterClient().fromProfile(profile, SettingsHelper.getAppCenterAPIEndpoint());
        try {
            await clientForProfile.apps.get(profile.currentApp.ownerName, profile.currentApp.appName);
        } catch (e) {
            if (e.statusCode === 404) {
                delete profile.currentApp;
                await appCenterAuth.updateProfile(profile);
            }
        }
    }

    public setupAppCenterStatusBar(profile: Profile | null): Promise<void> {
        if (profile && profile.userName) {
            const currentAppName = profile.currentApp && profile.currentApp.appName && Utils.isReactNativeProject(this._logger, this.projectRootPath, false) ?
                profile.currentApp.appName :
                null;

            const tooltip = currentAppName ?
                Messages.YouAreLoggedInCurrentAppIsMessage(AuthProvider.AppCenter, profile.userName, currentAppName) :
                Messages.YouAreLoggedInMessage(AuthProvider.AppCenter, profile.userName);

            return VsCodeUI.setStatusBar(this._appCenterStatusBarItem,
                currentAppName ? `App Center: ${Utils.FormatAppName(currentAppName)}` : `App Center: ${profile.userName}`,
                tooltip,
                `${CommandNames.ShowMenu}`
            );
        } else {
            VsCodeUI.setStatusBar(this._appCenterStatusBarItem,
                `$(icon octicon-sign-in) ${Strings.LoginToAppCenterStatusBarButton}`,
                Strings.UserMustSignInStatusBarMessage,
                `${CommandNames.Login}`
            );
        }
        return Promise.resolve(void 0);
    }

    public showStatusBar() {
        if (this._appCenterStatusBarItem) {
            this._appCenterStatusBarItem.show();
        }
    }
    public hideStatusBar() {
        if (this._appCenterStatusBarItem) {
            this._appCenterStatusBarItem.hide();
        }
    }

    public async dispose(): Promise<void> {
        this.cleanup();
    }

    private async initializeExtension(): Promise<void> {
        this._appCenterStatusBarItem = VsCodeUI.getStatusBarItem();
    }

    private cleanup(): void {
        this._logger.info("Extension Manager: Called cleanup");
        if (this._appCenterStatusBarItem) {
            this._appCenterStatusBarItem.dispose();
        }
    }
}
