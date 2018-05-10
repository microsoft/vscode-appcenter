import { AppCenterClient, AppCenterClientFactory, createAppCenterClient } from "../../api/appcenter";
import AppCenterAuth from "../../auth/appCenterAuth";
import VstsAuth from "../../auth/vstsAuth";
import { AppCenterProfile, CommandParams, CurrentApp, CurrentAppDeployments } from "../../helpers/interfaces";
import { SettingsHelper } from "../../helpers/settingsHelper";
import { Utils } from "../../helpers/utils/utils";
import { ExtensionManager } from "../extensionManager";
import { ILogger } from "../log/logHelper";
import { AppCenterOS } from "../resources/constants";
import { VsCodeUI } from "../ui/vscodeUI";
import { Messages } from "../resources/messages";
import { LogStrings } from "../resources/logStrings";

export class Command {

    protected clientFactory: AppCenterClientFactory;
    protected client: AppCenterClient;

    protected appCenterAuth: AppCenterAuth;
    protected manager: ExtensionManager;
    protected logger: ILogger;
    protected vstsAuth: VstsAuth;

    constructor(commandParams: CommandParams) {
        this.manager = commandParams.manager;
        this.logger = commandParams.manager._logger;
        this.appCenterAuth = commandParams.appCenterAuth;
        this.vstsAuth = commandParams.vstsAuth;
        this.clientFactory = createAppCenterClient();
    }

    public get rootPath(): string {
        return <string>this.manager.projectRootPath;
    }

    public get appCenterProfile(): Promise<AppCenterProfile | null> {
        return this.appCenterAuth.activeProfile;
    }

    public runNoClient(): Promise<boolean | void> {
        const rootPath: string | undefined = this.manager.projectRootPath;
        if (!rootPath) {
            this.logger.error(LogStrings.RootNotFound);
            VsCodeUI.ShowWarningMessage(Messages.NoProjectRootFolderFoundWarning);
            return Promise.resolve(false);
        }

        return Promise.resolve(true);
    }

    public async run(): Promise<boolean | void> {
        const rootPath: string | undefined = this.manager.projectRootPath;
        if (!rootPath) {
            this.logger.error(LogStrings.RootNotFound);
            VsCodeUI.ShowWarningMessage(Messages.NoProjectRootFolderFoundWarning);
            return Promise.resolve(false);
        }
        const profile: AppCenterProfile | null = await this.appCenterProfile;
        if (!profile) {
            VsCodeUI.ShowWarningMessage(Messages.UserIsNotLoggedInWarning);
            return Promise.resolve(false);
        } else {
            const clientOrNull: AppCenterClient | null = this.resolveAppCenterClient(profile);
            if (clientOrNull) {
                this.client = clientOrNull;
            } else {
                this.logger.error(LogStrings.FailedToGetClient);
                return Promise.resolve(false);
            }
            return Promise.resolve(true);
        }
    }

    private resolveAppCenterClient(profile: AppCenterProfile): AppCenterClient | null {
        if (!this.client) {
            if (profile) {
                return this.clientFactory.fromProfile(profile, SettingsHelper.getAppCenterAPIEndpoint());
            } else {
                this.logger.error(LogStrings.NoUserSpecified);
                return null;
            }
        }
        return this.client;
    }

    protected async saveCurrentApp(
        currentAppName: string,
        appOS: AppCenterOS,
        currentAppDeployments: CurrentAppDeployments | null,
        targetBinaryVersion: string,
        type: string,
        isMandatory: boolean,
        appSecret: string): Promise<CurrentApp | null> {
        const currentApp = Utils.toCurrentApp(currentAppName, appOS, currentAppDeployments, targetBinaryVersion, type, isMandatory, appSecret);
        if (!currentApp) {
            VsCodeUI.ShowWarningMessage(Messages.InvalidCurrentAppNameWarning);
            return null;
        }

        const profile: AppCenterProfile | null = await this.appCenterProfile;
        if (profile) {
            profile.currentApp = currentApp;
            await this.appCenterAuth.updateProfile(profile);
            this.manager.setupAppCenterStatusBar(profile);
            return currentApp;
        } else {
            // No profile - not logged in?
            VsCodeUI.ShowWarningMessage(Messages.UserIsNotLoggedInWarning);
            return null;
        }

    }
}
