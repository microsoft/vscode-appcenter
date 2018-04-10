import { Disposable, StatusBarItem } from 'vscode';
import AppCenterAuth from './appcenter/auth/appCenterAuth';
import Auth from './appcenter/auth/auth';
import { tokenStores } from './appcenter/auth/tokenStore';
import VstsAuth from './appcenter/auth/vstsAuth';
import * as CommandHandlers from './commandHandlers';
import { AuthProvider, CommandNames } from './constants';
import DiskProfileStorage from './helpers/diskProfileStorage';
import { AppCenterLoginCredentials, AppCenterProfile, Profile, VstsLoginCredentials, VstsProfile } from './helpers/interfaces';
import { Utils } from './helpers/utils';
import { VsCodeUtils } from './helpers/vsCodeUtils';
import { ConsoleLogger } from './log/consoleLogger';
import { ILogger } from './log/logHelper';
import { Strings } from './strings';

class CommandHandlersContainer {
    private _appCenterCommandHandler: CommandHandlers.AppCenter;
    private _settingsCommandHandler: CommandHandlers.Settings;
    private _codePushCommandHandler: CommandHandlers.CodePush;

    constructor(manager: ExtensionManager, logger: ILogger) {
        this._appCenterCommandHandler = new CommandHandlers.AppCenter(manager, logger);
        this._settingsCommandHandler = new CommandHandlers.Settings(manager, logger);
        this._codePushCommandHandler = new CommandHandlers.CodePush(manager, logger);
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
}

export class ExtensionManager implements Disposable {
    private _commandHandlersContainer: CommandHandlersContainer;
    private _appCenterStatusBarItem: StatusBarItem;
    private _projectRootPath: string | undefined;
    private _logger: ILogger;
    private _appCenterAuth: Auth<AppCenterProfile, AppCenterLoginCredentials>;
    private _vstsAuth: Auth<VstsProfile, VstsLoginCredentials>;

    public get commandHandlers(): CommandHandlersContainer {
        return this._commandHandlersContainer;
    }

    public get projectRootPath(): string | undefined {
        return this._projectRootPath;
    }

    public get appCenterAuth(): Auth<AppCenterProfile, AppCenterLoginCredentials> {
        return this._appCenterAuth;
    }

    public get vstsAuth(): Auth<VstsProfile, VstsLoginCredentials> {
        return this._vstsAuth;
    }

    public async Initialize(projectRootPath: string | undefined, logger: ILogger = new ConsoleLogger()): Promise<void> {
        this._logger = logger;
        this._projectRootPath = projectRootPath;
        this._logger.info("Init Extension Manager");
        await this.initializeExtension();
    }

    // tslint:disable-next-line:typedef
    public RunCommand(funcToTry: (args) => void, ...args: string[]): void {
        funcToTry(args);
    }

    public DisplayErrorMessage(message?: string): boolean {
        const msg: string = message ? message : "An error occured";
        if (msg) {
            VsCodeUtils.ShowErrorMessage(msg);
            return true;
        }
        return false;
    }

    public DisplayWarningMessage(message: string): void {
        VsCodeUtils.ShowWarningMessage(message);
    }

    public DisplayInfoMessage(message: string): void {
        VsCodeUtils.ShowInfoMessage(message);
    }

    public setupAppCenterStatusBar(profile: Profile | null): Promise<void> {
        if (profile && profile.userName) {
            return VsCodeUtils.setStatusBar(this._appCenterStatusBarItem,
                `AppCenter: ${profile.userName}`,
                Strings.YouAreLoggedInMsg(AuthProvider.AppCenter, profile.userName),
                `${CommandNames.ShowMenu}`
            );
        } else {
            VsCodeUtils.setStatusBar(this._appCenterStatusBarItem,
                `$(icon octicon-sign-in) ${Strings.LoginToAppCenterButton}`,
                Strings.UserMustSignIn,
                `${CommandNames.Login}`
            );
        }
        return Promise.resolve(void 0);
    }

    public async dispose(): Promise<void> {
        this.cleanup();
    }

    private async initializeExtension(): Promise<void> {
        this._commandHandlersContainer = new CommandHandlersContainer(this, this._logger);
        this._appCenterStatusBarItem = VsCodeUtils.getStatusBarItem();

        // Initialize VSTS Auth
        const vstsProfileStorage: DiskProfileStorage<AppCenterProfile> = new DiskProfileStorage(Utils.getVstsProfileFileName());
        this._vstsAuth = new VstsAuth(vstsProfileStorage, tokenStores.vsts, this._logger);
        await this._vstsAuth.initialize();

        // Initialize AppCenter Auth
        const appcenterProfileStorage: DiskProfileStorage<AppCenterProfile> = new DiskProfileStorage(Utils.getAppCenterProfileFileName());
        this._appCenterAuth = new AppCenterAuth(appcenterProfileStorage, tokenStores.appCenter, this._logger);
        await this._appCenterAuth.initialize();
        const activeProfile = this._appCenterAuth.activeProfile;
        return this.setupAppCenterStatusBar(activeProfile);
    }

    private cleanup(): void {
        this._logger.info("Extension Manager: Called cleanup");
        if (this._appCenterStatusBarItem) {
            this._appCenterStatusBarItem.dispose();
        }
    }
}
