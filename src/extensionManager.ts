import { Disposable, StatusBarItem } from "vscode";
import Auth from "./appcenter/auth/auth";
import { AppCenterCommandHandler } from "./appCenterCommandHandler";
import { CommandNames } from "./helpers/constants";
import { Profile } from "./helpers/interfaces";
import { Strings } from "./helpers/strings";
import { VsCodeUtils } from "./helpers/vsCodeUtils";
import { ConsoleLogger } from "./log/consoleLogger";
import { ILogger, LogLevel } from "./log/logHelper";

export class ExtensionManager implements Disposable {
    private _appCenterCommandHandler: AppCenterCommandHandler;
    private _appCenterStatusBarItem: StatusBarItem;
    private _projectRootPath: string | undefined;
    private _logger: ILogger;

    public get AppCenterCommandHandler(): AppCenterCommandHandler {
        return this._appCenterCommandHandler;
    }

    public get projectRootPath(): string | undefined {
        return this._projectRootPath;
    }

    public async Initialize(projectRootPath: string | undefined, logger: ILogger = new ConsoleLogger()): Promise<void> {
        this._logger = logger;
        this._projectRootPath = projectRootPath;
        this._logger.log("Init Extension Manager", LogLevel.Info);
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

    public async dispose(): Promise<void>  {
        this.cleanup();
    }

    private async initializeExtension(): Promise<void> {
        this._appCenterCommandHandler = new AppCenterCommandHandler(this);
        this._appCenterStatusBarItem = VsCodeUtils.getStatusBarItem();
        if (this._projectRootPath) {
            Auth.getProfile(this._projectRootPath).then((profile: Profile | null) => {
                return this.setupAppCenterStatusBar(profile);
            });
        } else {
            this._logger.log('No project root path defined', LogLevel.Error);
        }
    }

    private cleanup(): void {
        this._logger.log("Called cleanup", LogLevel.Info);
        if (this._appCenterStatusBarItem) {
            this._appCenterStatusBarItem.dispose();
        }
    }
}
