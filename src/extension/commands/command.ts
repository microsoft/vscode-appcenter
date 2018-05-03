import { AppCenterClient, AppCenterClientFactory, createAppCenterClient } from "../../api/appcenter";
import AppCenterAuth from "../../auth/appCenterAuth";
import VstsAuth from "../../auth/vstsAuth";
import { AppCenterProfile, CommandParams, CurrentApp, CurrentAppDeployments } from "../../helpers/interfaces";
import { SettingsHelper } from "../../helpers/settingsHelper";
import { Utils } from "../../helpers/utils/utils";
import { VsCodeUtils } from "../../helpers/utils/vsCodeUtils";
import { ExtensionManager } from "../extensionManager";
import { ILogger } from "../log/logHelper";
import { AppCenterOS } from "../resources/constants";
import { Strings } from "../resources/strings";

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
        const profile = this.appCenterAuth.activeProfile;
        if (!profile) {
            this.logger.info(`No profile file found`);
            return Promise.resolve(null);
        }
        return Promise.resolve(profile);
    }

    public runNoClient(): Promise<boolean | void> {
        const rootPath: string | undefined = this.manager.projectRootPath;
        if (!rootPath) {
            this.logger.error('No project root folder found');
            VsCodeUtils.ShowInfoMessage(Strings.NoProjectRootFolderFound);
            return Promise.resolve(false);
        }

        return Promise.resolve(true);
    }

    public async run(): Promise<boolean | void> {
        const rootPath: string | undefined = this.manager.projectRootPath;
        if (!rootPath) {
            this.logger.error('No project root folder found');
            VsCodeUtils.ShowInfoMessage(Strings.NoProjectRootFolderFound);
            return Promise.resolve(false);
        }

        const profile: AppCenterProfile | null = await this.appCenterProfile;
        if (!profile) {
            VsCodeUtils.ShowWarningMessage(Strings.UserIsNotLoggedInMsg);
            return Promise.resolve(false);
        } else {
            const clientOrNull: AppCenterClient | null = this.resolveAppCenterClient(profile);
            if (clientOrNull) {
                this.client = clientOrNull;
            } else {
                this.logger.error("Failed to get App Center client");
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
                this.logger.error('No App Center user specified!');
                return null;
            }
        }
        return this.client;
    }

    protected saveCurrentApp(
        currentAppName: string,
        appOS: AppCenterOS,
        currentAppDeployments: CurrentAppDeployments | null,
        targetBinaryVersion: string,
        type: string,
        isMandatory: boolean,
        appSecret: string): Promise<CurrentApp | null> {
        const currentApp = Utils.toCurrentApp(currentAppName, appOS, currentAppDeployments, targetBinaryVersion, type, isMandatory, appSecret);
        if (!currentApp) {
            VsCodeUtils.ShowWarningMessage(Strings.InvalidCurrentAppNameMsg);
            return Promise.resolve(null);
        }

        return this.appCenterProfile.then((profile: AppCenterProfile | null) => {
            if (profile) {
                profile.currentApp = currentApp;
                return this.appCenterAuth.updateProfile(profile).then(() => {
                    return currentApp;
                }).then((app) => {
                    this.manager.setupAppCenterStatusBar(profile);
                    return app;
                });
            } else {
                // No profile - not logged in?
                VsCodeUtils.ShowWarningMessage(Strings.UserIsNotLoggedInMsg);
                return Promise.resolve(null);
            }
        });
    }
}
