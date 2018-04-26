import { Disposable, StatusBarItem } from 'vscode';
import AppCenterAuth from './appcenter/auth/appCenterAuth';
import VstsAuth from './appcenter/auth/vstsAuth';
import * as CommandHandlers from './commandHandlers';
import { AuthProvider, CommandNames } from './constants';
import { Profile } from './helpers/interfaces';
import { Utils } from './helpers/utils';
import { VsCodeUtils } from './helpers/vsCodeUtils';
import { ConsoleLogger } from './log/consoleLogger';
import { ILogger } from './log/logHelper';
import { Strings } from './strings';

class CommandHandlersContainer {
    private _appCenterCommandHandler: CommandHandlers.AppCenter;
    private _settingsCommandHandler: CommandHandlers.Settings;
    private _codePushCommandHandler: CommandHandlers.CodePush;
    private _testCommandHandler: CommandHandlers.Test;
    private _toolsCommandHandler: CommandHandlers.Tools;

    constructor(private manager: ExtensionManager, private logger: ILogger, private appCenterAuth: AppCenterAuth, private vstsAuth: VstsAuth) {
        this._appCenterCommandHandler = new CommandHandlers.AppCenter(this.manager, this.logger, this.appCenterAuth, this.vstsAuth);
        this._settingsCommandHandler = new CommandHandlers.Settings(this.manager, this.logger, this.appCenterAuth, this.vstsAuth);
        this._codePushCommandHandler = new CommandHandlers.CodePush(this.manager, this.logger, this.appCenterAuth, this.vstsAuth);
        this._testCommandHandler = new CommandHandlers.Test(this.manager, this.logger, this.appCenterAuth, this.vstsAuth);
        this._toolsCommandHandler = new CommandHandlers.Tools(this.manager, this.logger, this.appCenterAuth, this.vstsAuth);
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

    public get toolsCommandHandler(): CommandHandlers.Tools {
        return this._toolsCommandHandler;
    }
}

export class ExtensionManager implements Disposable {
    private _commandHandlersContainer: CommandHandlersContainer;
    private _appCenterStatusBarItem: StatusBarItem;
    private _projectRootPath: string | undefined;
    private _logger: ILogger;

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

        this._commandHandlersContainer = new CommandHandlersContainer(this, this._logger, appCenterAuth, vstsAuth);
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
                profile.currentApp && profile.currentApp.appName && Utils.isReactNativeProject(this._logger, this.projectRootPath, false)
                ? `App Center: ${Utils.FormatAppName(profile.currentApp.appName)}`
                : `App Center: ${profile.userName}`,
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
        this._appCenterStatusBarItem = VsCodeUtils.getStatusBarItem();
    }

    private cleanup(): void {
        this._logger.info("Extension Manager: Called cleanup");
        if (this._appCenterStatusBarItem) {
            this._appCenterStatusBarItem.dispose();
        }
    }
}
