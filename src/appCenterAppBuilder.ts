import * as vscode from "vscode";
import { AppCenterClient, models } from "./appcenter/api";
import AppCenterAppCreator, { AndroidAppCenterAppCreator, IOSAppCenterAppCreator, NullAppCenterAppCreator } from "./appCenterAppCreator";
import { Constants } from "./helpers/constants";
import { SettingsHelper } from "./helpers/settingsHelper";
import { Strings } from "./helpers/strings";
import { Utils } from "./helpers/utils";
import { VsCodeUtils } from "./helpers/vsCodeUtils";
import { ILogger } from "./log/logHelper";

export default class AppCenterAppBuilder {
    private _createIOSApp: boolean = false;
    private _createAndroidApp: boolean = false;
    private _createBetaTestersDistributionGroup: boolean = false;
    private _connectRepositoryToBuildService: boolean = false;
    private _withBranchConfigurationCreatedAndBuildKickOff: boolean = false;

    private appsCreated: boolean = false;
    private createdApps: models.AppResponse[];

    constructor(
        private ideaName: string,
        private userOrOrg: models.ListOKResponseItem,
        private repoUrl: string,
        private client: AppCenterClient,
        private logger: ILogger,
        private defaultBranchName = SettingsHelper.defaultBranchName()) {

        if (this.userOrOrg.name === undefined || this.userOrOrg.displayName === undefined || this.ideaName === undefined) {
            this.logger.error(`Sorry, IdeaName or User/Organization is not set`);
            throw new Error(`Sorry, IdeaName or User/Organization is not set`);
        }
        this.withIOSApp();
        this.withAndroidApp();
        this.withBetaTestersDistributionGroup();
        this.withConnectedRepositoryToBuildService();
        this.withBranchConfigurationCreatedAndBuildKickOff();
    }

    public get iOSAppName(): string {
        return `${this.ideaName}${Constants.iOSAppSuffix}`;
    }

    public get androidAppName(): string {
        return `${this.ideaName}${Constants.AndroidAppSuffix}`;
    }

    public get androidDisplayName(): string {
        return `${this.ideaName}${Constants.AndroidAppSuffix}`;
    }

    public get iOSDisplayName(): string {
        return `${this.ideaName}${Constants.iOSAppSuffix}`;
    }

    public get ownerName(): string {
        return <string>this.userOrOrg.name;
    }

    public get iOSAppCreator(): AppCenterAppCreator {
        const iosApp: AppCenterAppCreator = this._createIOSApp ?
            new IOSAppCenterAppCreator(this.client, this.logger)
            : new NullAppCenterAppCreator(this.client, this.logger);
        return iosApp;
    }

    public get androidAppCreator(): AppCenterAppCreator {
        const androidAppCreator: AppCenterAppCreator = this._createAndroidApp ?
            new AndroidAppCenterAppCreator(this.client, this.logger)
            : new NullAppCenterAppCreator(this.client, this.logger);
        return androidAppCreator;
    }

    public getCreatedApps() {
        return this.createdApps;
    }

    public withIOSApp(ok: boolean = SettingsHelper.createIOSAppInAppCenter()): AppCenterAppBuilder {
        this._createIOSApp = ok;
        return this;
    }

    public withAndroidApp(ok: boolean = SettingsHelper.createAndroidAppInAppCenter()): AppCenterAppBuilder {
        this._createAndroidApp = ok;
        return this;
    }

    public withBetaTestersDistributionGroup(ok: boolean = SettingsHelper.createTestersDistributionGroupInAppCenter()): AppCenterAppBuilder {
        this._createBetaTestersDistributionGroup = ok;
        return this;
    }

    public withConnectedRepositoryToBuildService(ok: boolean = SettingsHelper.connectRepoToBuildService()): AppCenterAppBuilder {
        this._connectRepositoryToBuildService = ok;
        return this;
    }

    public withBranchConfigurationCreatedAndBuildKickOff(ok: boolean = SettingsHelper.configureBranchAndStartNewBuild()): AppCenterAppBuilder {
        this._withBranchConfigurationCreatedAndBuildKickOff = ok;
        return this;
    }

    public async createApps(): Promise<void> {
        let created: any;
        if (!this.appsCreated) {
            await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.VSCodeProgressLoadingTitle}, async p => {
                p.report({message: Strings.CreatingAppStatusBarMessage });
                if (await this.alreadyExistInAppCenter()) {
                    VsCodeUtils.ShowErrorMessage(Strings.FailedToCreateApAlreadyExistInAppCenter);
                } else {
                    if (this.isCreatedForOrganization()) {
                        created = await Promise.all(
                            [
                                this.iOSAppCreator.createAppForOrg(this.iOSAppName, this.iOSDisplayName, <string>this.userOrOrg.name),
                                this.androidAppCreator.createAppForOrg(this.androidAppName, this.androidDisplayName, <string>this.userOrOrg.name)
                            ]
                        );
                    } else {
                        created = await Promise.all(
                            [
                                this.iOSAppCreator.createApp(this.iOSAppName, this.iOSDisplayName),
                                this.androidAppCreator.createApp(this.androidAppName, this.androidDisplayName)
                            ]
                        );
                    }

                    if (!created.every( (val) => {
                        if (val) {
                            return val !== null && val !== false;
                        }
                        return false;
                    })) {
                        VsCodeUtils.ShowErrorMessage(Strings.FailedToCreateAppInAppCenter);
                    }
                }

                this.createdApps = created;
                this.appsCreated = true;
            });
        }
    }

    public async startProcess(): Promise<boolean> {
        await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.VSCodeProgressLoadingTitle}, async p => {
            // The was an issue for me and without Delay spinner was not shown when app was creating!
            await Utils.Delay(100);

            this.createApps();

            if (this._createBetaTestersDistributionGroup) {
                p.report({message: Strings.CreatingDistributionStatusBarMessage });
                const createdBetaTestersGroup: boolean[] = await Promise.all(
                    [
                        this.iOSAppCreator.createBetaTestersDistributionGroup(this.iOSAppName, this.ownerName),
                        this.androidAppCreator.createBetaTestersDistributionGroup(this.androidAppName, this.ownerName)
                    ]
                );

                if (!createdBetaTestersGroup.every( (val: boolean) => {
                    return val === true;
                })) {
                    VsCodeUtils.ShowErrorMessage(Strings.FailedToCreateDistributionGroup);
                }
            }

            if (this._connectRepositoryToBuildService) {
                p.report({message: Strings.ConnectingRepoToBuildServiceStatusBarMessage });
                const conected: boolean[] =  await Promise.all(
                    [
                        this.iOSAppCreator.connectRepositoryToBuildService(this.iOSAppName, this.ownerName, this.repoUrl),
                        this.androidAppCreator.connectRepositoryToBuildService(this.androidAppName, this.ownerName, this.repoUrl)
                    ]
                );
                if (!conected.every( (val: boolean) => {
                    return val === true;
                })) {
                    VsCodeUtils.ShowErrorMessage(Strings.FailedToConnectRepoToBuildService);
                } else {
                    if (this._withBranchConfigurationCreatedAndBuildKickOff) {
                        p.report({message: Strings.CreateBranchConfigAndKickOffBuildStatusBarMessage });
                        const branchConfiguredAndBuildStarted: boolean[] = await Promise.all(
                            [
                                this.iOSAppCreator.withBranchConfigurationCreatedAndBuildKickOff(this.iOSAppName, this.defaultBranchName, this.ownerName),
                                this.androidAppCreator.withBranchConfigurationCreatedAndBuildKickOff(this.androidAppName, this.defaultBranchName, this.ownerName)
                            ]
                        );
                        if (!branchConfiguredAndBuildStarted.every( (val: boolean) => {
                            return val === true;
                        })) {
                            VsCodeUtils.ShowErrorMessage(Strings.FailedToConfigureBranchAndStartNewBuild);
                        }
                    }
                }
            }
            VsCodeUtils.ShowInfoMessage(Strings.FinishedConfigMsg);
            return true;
        });
        return true;
    }

    private isCreatedForOrganization(): boolean {
        // Ok, probably there is a better way to determine it ;)
        return this.userOrOrg.origin !== undefined;
    }

    private async alreadyExistInAppCenter(): Promise<boolean> {
        let apps: models.AppResponse[];
        if (this.isCreatedForOrganization()) {
            apps = await this.client.account.apps.listForOrg(this.ownerName);
        } else {
            apps = await this.client.account.apps.list();
        }
        return apps.some(item => {
            return (item.name === this.iOSAppName || item.name === this.androidAppName);
        });
    }
}
