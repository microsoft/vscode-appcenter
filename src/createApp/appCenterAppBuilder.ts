import { AppCenterClient } from "../api/appcenter";
import { CreateNewAppOption } from "../extension/commands/general/createNewApp";
import { ILogger } from "../extension/log/logHelper";
import { Constants } from "../extension/resources/constants";
import { CreatedAppFromAppCenter, UserOrOrganizationItem } from "../helpers/interfaces";
import { SettingsHelper } from "../helpers/settingsHelper";
import { Utils } from "../helpers/utils/utils";
import { VsCodeUI } from "../extension/ui/vscodeUI";

import AppCenterAppCreator, { AndroidAppCenterAppCreator, IOSAppCenterAppCreator, NullAppCenterAppCreator } from "./appCenterAppCreator";
import { LogStrings } from "../extension/resources/logStrings";
import { Messages } from "../extension/resources/messages";

export default class AppCenterAppBuilder {
    private _createIOSApp: boolean = false;
    private _createAndroidApp: boolean = false;
    private _createBetaTestersDistributionGroup: boolean = false;
    private _connectRepositoryToBuildService: boolean = false;
    private _withBranchConfigurationCreatedAndBuildKickOff: boolean = false;

    private appsCreated: boolean = false;
    private createdApps: CreatedAppFromAppCenter[];

    constructor(
        private projectName: string,
        private userOrOrg: UserOrOrganizationItem,
        private repoUrl: string,
        private client: AppCenterClient,
        private logger: ILogger,
        private defaultBranchName = SettingsHelper.defaultBranchName()) {

        if (this.userOrOrg.name === undefined || this.userOrOrg.displayName === undefined || this.projectName === undefined) {
            const errMsg: string = LogStrings.ProjectOrOrgNotSet;
            this.logger.error(errMsg);
            throw new Error(errMsg);
        }
        this.withIOSApp();
        this.withAndroidApp();
        this.withBetaTestersDistributionGroup();
        this.withConnectedRepositoryToBuildService();
        this.withBranchConfigurationCreatedAndBuildKickOff();
    }

    public static getiOSAppName(projectName: string): string {
        return `${projectName}${Constants.iOSAppSuffix}`;
    }

    public static getAndroidAppName(projectName: string): string {
        return `${projectName}${Constants.AndroidAppSuffix}`;
    }

    public static getAndroidDisplayName(projectName: string): string {
        return `${projectName}${Constants.AndroidAppSuffix}`;
    }

    public static getiOSDisplayName(projectName: string): string {
        return `${projectName}${Constants.iOSAppSuffix}`;
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
            await VsCodeUI.showProgress(async progress => {
                progress.report({ message: Messages.CreatingAppStatusBarProgressMessage });
                const promises: Promise<false | CreatedAppFromAppCenter>[] = [];
                if (option === CreateNewAppOption.IOS || option === CreateNewAppOption.Both) {
                    if (this.isCreatedForOrganization()) {
                        promises.push(this.iOSAppCreator.createAppForOrg(AppCenterAppBuilder.getiOSAppName(this.projectName), AppCenterAppBuilder.getiOSDisplayName(this.projectName), this.ownerName));
                    } else {
                        promises.push(this.iOSAppCreator.createApp(AppCenterAppBuilder.getiOSAppName(this.projectName), AppCenterAppBuilder.getiOSDisplayName(this.projectName)));
                    }
                }

                if (option === CreateNewAppOption.Android || option === CreateNewAppOption.Both) {
                    if (this.isCreatedForOrganization()) {
                        promises.push(this.androidAppCreator.createAppForOrg(AppCenterAppBuilder.getAndroidAppName(this.projectName), AppCenterAppBuilder.getAndroidDisplayName(this.projectName), this.ownerName));
                    } else {
                        promises.push(this.androidAppCreator.createApp(AppCenterAppBuilder.getAndroidAppName(this.projectName), AppCenterAppBuilder.getAndroidDisplayName(this.projectName)));
                    }
                }

                created = await Promise.all(promises);

                if (!created.every((val) => {
                    if (val) {
                        return val !== null && val !== false;
                    }
                    return false;
                })) {
                    VsCodeUI.ShowErrorMessage(Messages.FailedToCreateAppInAppCenter);
                }

                this.createdApps = created;
                this.appsCreated = true;
                this.logger.debug(LogStrings.AppsCreated(this.projectName));
            });
        }
    }

    public async startProcess(): Promise<boolean> {
        return await VsCodeUI.showProgress(async progress => {
            // The was an issue for me and without Delay spinner was not shown when app was creating!
            await Utils.Delay(100);

            this.createApps();

            if (this._createBetaTestersDistributionGroup) {
                progress.report({ message: Messages.CreatingDistributionStatusBarProgressMessage });
                const createdBetaTestersGroup: boolean[] = await Promise.all(
                    [
                        this.iOSAppCreator.createBetaTestersDistributionGroup(AppCenterAppBuilder.getiOSAppName(this.projectName), this.ownerName),
                        this.androidAppCreator.createBetaTestersDistributionGroup(AppCenterAppBuilder.getAndroidAppName(this.projectName), this.ownerName)
                    ]
                );

                if (!createdBetaTestersGroup.every((val: boolean) => {
                    return val === true;
                })) {
                    VsCodeUI.ShowErrorMessage(Messages.FailedToCreateDistributionGroup);
                } else {
                    this.logger.debug(LogStrings.DistributionGroupCreated(SettingsHelper.distribitionGroupTestersName(), this.projectName));
                }
            }

            if (this._connectRepositoryToBuildService) {
                progress.report({ message: Messages.ConnectingRepoToBuildServiceStatusBarProgressMessage });
                const conected: boolean[] = await Promise.all(
                    [
                        this.iOSAppCreator.connectRepositoryToBuildService(AppCenterAppBuilder.getiOSAppName(this.projectName), this.ownerName, this.repoUrl, this.isCreatedForOrganization()),
                        this.androidAppCreator.connectRepositoryToBuildService(AppCenterAppBuilder.getAndroidAppName(this.projectName), this.ownerName, this.repoUrl, this.isCreatedForOrganization())
                    ]
                );
                if (!conected.every((val: boolean) => {
                    return val === true;
                })) {
                    VsCodeUI.ShowErrorMessage(Messages.FailedToConnectRepoToBuildService);
                } else {
                    this.logger.debug(LogStrings.ProjectConnected(this.projectName, this.repoUrl));
                    if (this._withBranchConfigurationCreatedAndBuildKickOff) {
                        progress.report({ message: Messages.CreateBranchConfigAndKickOffBuildProgressMessage });
                        const branchConfiguredAndBuildStarted: boolean[] = await Promise.all(
                            [
                                this.iOSAppCreator.withBranchConfigurationCreatedAndBuildKickOff(AppCenterAppBuilder.getiOSAppName(this.projectName), this.defaultBranchName, this.ownerName, this.isCreatedForOrganization()),
                                this.androidAppCreator.withBranchConfigurationCreatedAndBuildKickOff(AppCenterAppBuilder.getAndroidAppName(this.projectName), this.defaultBranchName, this.ownerName, this.isCreatedForOrganization())
                            ]
                        );
                        if (!branchConfiguredAndBuildStarted.every((val: boolean) => {
                            return val === true;
                        })) {
                            VsCodeUI.ShowErrorMessage(Messages.FailedToConfigureBranchAndStartNewBuild);
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
