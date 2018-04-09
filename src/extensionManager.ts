import { Disposable, StatusBarItem } from "vscode";
import { createAppCenterClient, models } from "./appcenter/api/";
import Auth from "./appcenter/auth/auth";
import { AppCenterAppsCache } from "./cache/appsCache";
import { AppCenterCache } from "./cache/baseCache"
import * as CommandHandlers from './commandHandlers';
import { CommandNames } from "./constants";
import { AppCenterController } from "./controller/appCenterController";
import { AppCenterAppsLoader } from "./helpers/appsLoader";
import { Profile } from "./helpers/interfaces";
import { SettingsHelper } from "./helpers/settingsHelper";
import { VsCodeUtils } from "./helpers/vsCodeUtils";
import { ConsoleLogger } from "./log/consoleLogger";
import { ILogger } from "./log/logHelper";
import { Strings } from "./strings";

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
    private _profile: Profile | null;

    public get commandHandlers(): CommandHandlersContainer {
        return this._commandHandlersContainer;
    }

    public get projectRootPath(): string | undefined {
        return this._projectRootPath;
    }

    public async Initialize(projectRootPath: string | undefined, logger: ILogger = new ConsoleLogger()): Promise<void> {
        this._logger = logger;
        this._projectRootPath = projectRootPath;
        this._logger.info("Init Extension Manager");
        await this.initializeExtension();
        if (this._profile) {
            const client = createAppCenterClient().fromProfile(this._profile, SettingsHelper.getAppCenterAPIEndpoint());
            if (client) {
                const appsLoader = new AppCenterAppsLoader(client);
                const appsCache: AppCenterCache<models.AppResponse[]> = AppCenterAppsCache.getInstance();
                const controller = new AppCenterController(this._profile, appsLoader, appsCache);
                controller.load(true);
            }
        }
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
                `$(icon octicon-person) ${profile.userName}`,
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
        Auth.getProfile().then((profile: Profile | null) => {
            this._profile = profile;
            return this.setupAppCenterStatusBar(profile);
        });
    }

    private cleanup(): void {
        this._logger.info("Extension Manager: Called cleanup");
        if (this._appCenterStatusBarItem) {
            this._appCenterStatusBarItem.dispose();
        }
    }
}
