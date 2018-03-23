import * as vscode from "vscode";
import { AppCenterClient, models } from "./appcenter/api";
import AppCenterAppCreator, { AndroidAppCenterAppCreator, IOSAppCenterAppCreator, NullAppCenterAppCreator } from "./appCenterAppCreator";
import { Constants } from "./helpers/constants";
import { Strings } from "./helpers/strings";
import { Utils } from "./helpers/utils";
import { VsCodeUtils } from "./helpers/vsCodeUtils";
import { ILogger, LogLevel } from "./log/logHelper";

export default class AppCenterAppBuilder {
    private _createIOSApp: boolean = false;
    private _createAndroidApp: boolean = false;
    private _createBetaTestersDistributionGroup: boolean = false;
    private _connectRepositoryToBuildService: boolean = false;
    private _withBranchConfigurationCreatedAndBuildKickOff: boolean = false;

    constructor(private ideaName: string, private userOrOrg: models.ListOKResponseItem, private repoUrl: string, private defaultBranchName: string, private client: AppCenterClient, private logger: ILogger) {
        this.logger.log('Initiazlied AppCenterAppBuilder', LogLevel.Info);
    }

    public withIOSApp(ok: boolean): AppCenterAppBuilder {
        this._createIOSApp = ok;
        return this;
    }

    public withAndroidApp(ok: boolean): AppCenterAppBuilder {
        this._createAndroidApp = ok;
        return this;
    }

    public withBetaTestersDistributionGroup(ok: boolean): AppCenterAppBuilder {
        this._createBetaTestersDistributionGroup = ok;
        return this;
    }

    public withConnectedRepositoryToBuildService(ok: boolean): AppCenterAppBuilder {
        this._connectRepositoryToBuildService = ok;
        return this;
    }

    public withBranchConfigurationCreatedAndBuildKickOff(ok: boolean): AppCenterAppBuilder {
        this._withBranchConfigurationCreatedAndBuildKickOff = ok;
        return this;
    }

    public async create(): Promise<boolean> {
        if (this.userOrOrg.name === undefined || this.userOrOrg.displayName === undefined || this.ideaName === undefined) {
            this.logger.error("Name for idea is undefined!");
            return false;
        }

        // Ok, probably there is a better way to determine it ;)
        const isCreatedForOrganization = this.userOrOrg.origin !== undefined;

        const androidAppName = `${this.ideaName}${Constants.AndroidAppSuffix}`;
        const androidDisplayName = `${this.ideaName}${Constants.AndroidAppSuffix}`;

        const iOSAppName = `${this.ideaName}${Constants.iOSAppSuffix}`;
        const iOSDisplayAppName = `${this.ideaName}${Constants.iOSAppSuffix}`;

        if (this._createIOSApp) {
            const iosApp: AppCenterAppCreator = this._createIOSApp ? new IOSAppCenterAppCreator(this.client, this.logger) : new NullAppCenterAppCreator(this.client, this.logger);
            const androidApp: AppCenterAppCreator = this._createAndroidApp ? new AndroidAppCenterAppCreator(this.client, this.logger) : new NullAppCenterAppCreator(this.client, this.logger);
            await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.VSCodeProgressLoadingTitle}, async p => {
                // The was an issue for me and without Delay spinner was not shown when app was creating!
                await Utils.Delay(100);
                p.report({message: Strings.CreatingAppStatusBarMessage });
                let created: boolean[];
                if (isCreatedForOrganization) {
                    created = await Promise.all(
                        [
                            iosApp.createAppForOrg(iOSAppName, iOSDisplayAppName, <string>this.userOrOrg.name),
                            androidApp.createAppForOrg(androidAppName, androidDisplayName, <string>this.userOrOrg.name)
                        ]
                    );
                } else {
                    created = await Promise.all(
                        [
                            iosApp.createApp(iOSAppName, iOSDisplayAppName),
                            androidApp.createApp(androidAppName, androidDisplayName)
                        ]
                    );
                }

                if (!created.every( (val: boolean) => {
                    return val === true;
                })) {
                    VsCodeUtils.ShowErrorMessage(Strings.FailedToCreateAppInAppCenter);
                    return false;
                }

                if (this._createBetaTestersDistributionGroup) {
                    p.report({message: Strings.CreatingDistributionStatusBarMessage });
                    const createdBetaTestersGroup: boolean[] = await Promise.all(
                        [
                            iosApp.createBetaTestersDistributionGroup(iOSAppName, <string>this.userOrOrg.name),
                            androidApp.createBetaTestersDistributionGroup(androidAppName, <string>this.userOrOrg.name)
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
                            iosApp.connectRepositoryToBuildService(iOSAppName, <string>this.userOrOrg.name, this.repoUrl),
                            androidApp.connectRepositoryToBuildService(androidAppName, <string>this.userOrOrg.name, this.repoUrl)
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
                                    iosApp.withBranchConfigurationCreatedAndBuildKickOff(iOSAppName, this.defaultBranchName, <string>this.userOrOrg.name),
                                    androidApp.withBranchConfigurationCreatedAndBuildKickOff(androidAppName, this.defaultBranchName, <string>this.userOrOrg.name)
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
        }
        return true;
    }
}
