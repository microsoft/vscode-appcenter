import * as vscode from "vscode";
import { ExtensionManager } from "../../extensionManager";
import { AppCenterProfile, CommandParams, Profile } from "../../helpers/interfaces";
import { MenuHelper } from "../../helpers/menuHelper";
import { SettingsHelper } from "../../helpers/settingsHelper";
import { Utils } from "../../helpers/utils";
import { CustomQuickPickItem, VsCodeUtils } from "../../helpers/vsCodeUtils";
import { ILogger } from "../../log/logHelper";
import { Strings } from "../../strings";
import { AppCenterClient, AppCenterClientFactory, createAppCenterClient, models } from "../apis";
import AppCenterAuth from "../auth/appCenterAuth";
import VstsAuth from "../auth/vstsAuth";

export class Command {

    protected clientFactory: AppCenterClientFactory;
    protected client: AppCenterClient;

    protected appCenterAuth: AppCenterAuth;
    protected manager: ExtensionManager;
    protected logger: ILogger;
    protected vstsAuth: VstsAuth;

    constructor(commandParams: CommandParams) {
        this.manager = commandParams.manager;
        this.logger = commandParams.logger;
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

    protected async getUserOrOrganizationItems(): Promise<CustomQuickPickItem[]> {
        let items: CustomQuickPickItem[] = [];
        this.logger.debug("Getting user/organization items...");
        await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.VSCodeProgressLoadingTitle }, p => {
            p.report({ message: Strings.LoadingStatusBarMessage });
            return this.client.organizations.list().then((orgList: models.ListOKResponseItem[]) => {
                const organizations: models.ListOKResponseItem[] = orgList;
                return organizations.sort(Utils.sortOrganizations);
            });
        }).then(async (orgList: models.ListOKResponseItem[]) => {
            const myself: Profile | null = await this.appCenterProfile;
            items = MenuHelper.getQuickPickItemsForOrgList(orgList, myself);
        });
        return items;
    }
}
