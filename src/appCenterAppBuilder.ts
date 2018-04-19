import * as vscode from "vscode";
import { AppCenterClient } from "./appcenter/apis";
import { CreateNewAppOption } from "./appcenter/commands/createNewApp";
import AppCenterAppCreator, { AndroidAppCenterAppCreator, IOSAppCenterAppCreator, NullAppCenterAppCreator } from "./appCenterAppCreator";
import { Constants } from "./constants";
import { CreatedAppFromAppCenter, UserOrOrganizationItem } from "./helpers/interfaces";
import { SettingsHelper } from "./helpers/settingsHelper";
import { Utils } from "./helpers/utils";
import { VsCodeUtils } from "./helpers/vsCodeUtils";
import { ILogger } from "./log/logHelper";
import { Strings } from "./strings";

export default class AppCenterAppBuilder {
    private _createIOSApp: boolean = false;
    private _createAndroidApp: boolean = false;
    private _createBetaTestersDistributionGroup: boolean = false;
    private _connectRepositoryToBuildService: boolean = false;
    private _withBranchConfigurationCreatedAndBuildKickOff: boolean = false;

    private appsCreated: boolean = false;
    private createdApps: CreatedAppFromAppCenter[];

    constructor(
        private ideaName: string,
        private userOrOrg: UserOrOrganizationItem,
        private repoUrl: string,
        private client: AppCenterClient,
        private logger: ILogger,
        private defaultBranchName = SettingsHelper.defaultBranchName()) {

        if (this.userOrOrg.name === undefined || this.userOrOrg.displayName === undefined || this.ideaName === undefined) {
            const errMsg: string = `Sorry, IdeaName or User/Organization is not set`;
            this.logger.error(errMsg);
            throw new Error(errMsg);
        }
        this.withIOSApp();
        this.withAndroidApp();
        this.withBetaTestersDistributionGroup();
        this.withConnectedRepositoryToBuildService();
        this.withBranchConfigurationCreatedAndBuildKickOff();
    }

    public static getiOSAppName(ideaName: string): string {
        return `${ideaName}${Constants.iOSAppSuffix}`;
    }

    public static getAndroidAppName(ideaName: string): string {
        return `${ideaName}${Constants.AndroidAppSuffix}`;
    }

    public static getAndroidDisplayName(ideaName: string): string {
        return `${ideaName}${Constants.AndroidAppSuffix}`;
    }

    public static getiOSDisplayName(ideaName: string): string {
        return `${ideaName}${Constants.iOSAppSuffix}`;
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

    public getCreatedApps(): CreatedAppFromAppCenter[] {
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

    public async createApps(option: CreateNewAppOption = CreateNewAppOption.Both): Promise<void> {
        let created: any;
        if (!this.appsCreated) {
            await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.VSCodeProgressLoadingTitle }, async p => {
                p.report({ message: Strings.CreatingAppStatusBarMessage });
                const promises: Promise<false | CreatedAppFromAppCenter>[] = [];
                if (option === CreateNewAppOption.IOS || option === CreateNewAppOption.Both) {
                    if (this.isCreatedForOrganization()) {
                        promises.push(this.iOSAppCreator.createAppForOrg(AppCenterAppBuilder.getiOSAppName(this.ideaName), AppCenterAppBuilder.getiOSDisplayName(this.ideaName), <string>this.userOrOrg.name));
                    } else {
                        promises.push(this.iOSAppCreator.createApp(AppCenterAppBuilder.getiOSAppName(this.ideaName), AppCenterAppBuilder.getiOSDisplayName(this.ideaName)));
                    }
                }

                if (option === CreateNewAppOption.Android || option === CreateNewAppOption.Both) {
                    if (this.isCreatedForOrganization()) {
                        promises.push(this.androidAppCreator.createAppForOrg(AppCenterAppBuilder.getAndroidAppName(this.ideaName), AppCenterAppBuilder.getAndroidDisplayName(this.ideaName), <string>this.userOrOrg.name));
                    } else {
                        promises.push(this.androidAppCreator.createApp(AppCenterAppBuilder.getAndroidAppName(this.ideaName), AppCenterAppBuilder.getAndroidDisplayName(this.ideaName)));
                    }
                }

                created = await Promise.all(promises);

                if (!created.every((val) => {
                    if (val) {
                        return val !== null && val !== false;
                    }
                    return false;
                })) {
                    VsCodeUtils.ShowErrorMessage(Strings.FailedToCreateAppInAppCenter);
                }

                this.createdApps = created;
                this.appsCreated = true;
                this.logger.debug(`Apps for your project "${this.ideaName}" were created`);
            });
        }
    }

    public async startProcess(): Promise<boolean> {
        return await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.VSCodeProgressLoadingTitle }, async p => {
            // The was an issue for me and without Delay spinner was not shown when app was creating!
            await Utils.Delay(100);

            this.createApps();

            if (this._createBetaTestersDistributionGroup) {
                p.report({ message: Strings.CreatingDistributionStatusBarMessage });
                const createdBetaTestersGroup: boolean[] = await Promise.all(
                    [
                        this.iOSAppCreator.createBetaTestersDistributionGroup(AppCenterAppBuilder.getiOSAppName(this.ideaName), this.ownerName),
                        this.androidAppCreator.createBetaTestersDistributionGroup(AppCenterAppBuilder.getAndroidAppName(this.ideaName), this.ownerName)
                    ]
                );

                if (!createdBetaTestersGroup.every((val: boolean) => {
                    return val === true;
                })) {
                    VsCodeUtils.ShowErrorMessage(Strings.FailedToCreateDistributionGroup);
                } else {
                    this.logger.debug(`"${SettingsHelper.distribitionGroupTestersName()}" distribution group was created for your project "${this.ideaName}"`);
                }
            }

            if (this._connectRepositoryToBuildService) {
                p.report({ message: Strings.ConnectingRepoToBuildServiceStatusBarMessage });
                const conected: boolean[] = await Promise.all(
                    [
                        this.iOSAppCreator.connectRepositoryToBuildService(AppCenterAppBuilder.getiOSAppName(this.ideaName), this.ownerName, this.repoUrl),
                        this.androidAppCreator.connectRepositoryToBuildService(AppCenterAppBuilder.getAndroidAppName(this.ideaName), this.ownerName, this.repoUrl)
                    ]
                );
                if (!conected.every((val: boolean) => {
                    return val === true;
                })) {
                    VsCodeUtils.ShowErrorMessage(Strings.FailedToConnectRepoToBuildService);
                } else {
                    this.logger.debug(`Project "${this.ideaName}" was connected to repositry "${this.repoUrl}"`);
                    if (this._withBranchConfigurationCreatedAndBuildKickOff) {
                        p.report({ message: Strings.CreateBranchConfigAndKickOffBuildStatusBarMessage });
                        const branchConfiguredAndBuildStarted: boolean[] = await Promise.all(
                            [
                                this.iOSAppCreator.withBranchConfigurationCreatedAndBuildKickOff(AppCenterAppBuilder.getiOSAppName(this.ideaName), this.defaultBranchName, this.ownerName),
                                this.androidAppCreator.withBranchConfigurationCreatedAndBuildKickOff(AppCenterAppBuilder.getAndroidAppName(this.ideaName), this.defaultBranchName, this.ownerName)
                            ]
                        );
                        if (!branchConfiguredAndBuildStarted.every((val: boolean) => {
                            return val === true;
                        })) {
                            VsCodeUtils.ShowErrorMessage(Strings.FailedToConfigureBranchAndStartNewBuild);
                        }
                    }
                }
            }
            return true;
        });
    }

    private isCreatedForOrganization(): boolean {
        return this.userOrOrg.isOrganization;
    }
}
