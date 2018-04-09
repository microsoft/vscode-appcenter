import { Disposable, StatusBarItem } from 'vscode';
import Auth from './appcenter/auth/auth';
import AppCenterProfileStorage from './appcenter/auth/profile/appCenterProfileStorage';
import * as CommandHandlers from './commandHandlers';
import { CommandNames } from './constants';
import { AppCenterProfile, Profile, ProfileStorage } from './helpers/interfaces';
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
    private _auth: Auth;

    public get commandHandlers(): CommandHandlersContainer {
        return this._commandHandlersContainer;
    }

    public get projectRootPath(): string | undefined {
        return this._projectRootPath;
    }

    public get auth(): Auth {
        return this._auth;
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
                Strings.YouAreLoggedInMsg(profile.userName),
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

        // Initialize Auth
        const profileStorage: ProfileStorage<AppCenterProfile> = new AppCenterProfileStorage(Utils.getProfileFileName());
        this._auth = new Auth(profileStorage, this._logger);
        await this._auth.initialize();
        const activeProfile = this._auth.activeProfile;
        return this.setupAppCenterStatusBar(activeProfile);
    }

    private cleanup(): void {
        this._logger.info("Extension Manager: Called cleanup");
        if (this._appCenterStatusBarItem) {
            this._appCenterStatusBarItem.dispose();
        }
    }
}
