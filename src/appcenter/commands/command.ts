import { ExtensionManager } from "../../extensionManager";
import { AppCenterProfile } from "../../helpers/interfaces";
import { SettingsHelper } from "../../helpers/settingsHelper";
import { VsCodeUtils } from "../../helpers/vsCodeUtils";
import { ILogger } from "../../log/logHelper";
import { Strings } from "../../strings";
import { AppCenterClient, AppCenterClientFactory, createAppCenterClient } from "../api";

export class Command {

    protected clientFactory: AppCenterClientFactory;
    protected client: AppCenterClient;
    protected profile: AppCenterProfile;

    constructor(protected manager: ExtensionManager, protected logger: ILogger) {
        this.clientFactory = createAppCenterClient();
    }

    public get appCenterProfile(): Promise<AppCenterProfile | null> {
        const profile = this.manager.auth.activeProfile;
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
            this.profile = profile;
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
}
