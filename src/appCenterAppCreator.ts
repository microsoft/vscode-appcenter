import * as vscode from "vscode";
import { AppCenterClient } from "./appcenter/api";
import { AppCenterOS, AppCenterPlatform, Constants } from "./helpers/constants";
import { SettingsHelper } from "./helpers/settingsHelper";
import { Strings } from "./helpers/strings";
import { VsCodeUtils } from "./helpers/vsCodeUtils";
import { ILogger, LogLevel } from "./log/logHelper";

export default class AppCenterAppCreator {

    protected appDisplayAppName: string;
    protected appName: string;
    protected isCreatedForOrganization: boolean;
    protected ownerName: string;
    protected repoUrl: string;
    protected defaultBranchName: string;
    protected _createBetaTestersDistributionGroup: boolean;
    protected _connectRepositoryToBuildService: boolean;
    protected _withBranchConfigurationCreatedAndBuildKickOff: boolean;
    protected platform: AppCenterPlatform = AppCenterPlatform.ReactNative;
    protected os: AppCenterOS;

    constructor(private client: AppCenterClient, private logger: ILogger) {
        this.logger.log('Initiazlied AppCenter Creator', LogLevel.Info);
    }

    public async configureApp(
         displayAppName: string,
         appName: string,
         isCreatedForOrganization: boolean,
         ownerName: string,
         repoUrl: string,
         defaultBranchName: string,
         createBetaTestersDistributionGroup: boolean,
         connectRepositoryToBuildService: boolean,
         withBranchConfigurationCreatedAndBuildKickOff: boolean
        ): Promise<boolean> {

        this.appDisplayAppName = displayAppName;
        this.appName = appName;
        this.isCreatedForOrganization = isCreatedForOrganization;
        this.ownerName = ownerName;
        this.repoUrl = repoUrl;
        this.defaultBranchName = defaultBranchName;

        this._createBetaTestersDistributionGroup = createBetaTestersDistributionGroup;
        this._connectRepositoryToBuildService = connectRepositoryToBuildService;
        this._withBranchConfigurationCreatedAndBuildKickOff = withBranchConfigurationCreatedAndBuildKickOff;

        let configured: boolean = false;

        await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.VSCodeProgressLoadingTitle}, p => {
            return new Promise((resolve) => {
                p.report({message: Strings.CreatingAppStatusBarMessage(this.os.toString()) });
                if (isCreatedForOrganization) {
                    this.createAppForOrg().then((created: boolean) => {
                        resolve(created);
                    });
                } else {
                    this.createApp().then((created: boolean) => {
                        resolve(created);
                    });
                }
            });
        }).then(async appCreated => {
            if (appCreated) {
                // We consider that configured is true because app is created, if other things goes wrong
                // Just show the error message
                configured = true;

                // this step is optional, so if we skip it or failed we can go further
                if (this._createBetaTestersDistributionGroup) {
                    await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.VSCodeProgressLoadingTitle}, p => {
                        return new Promise((resolve) => {
                            p.report({message: Strings.CreatingDistributionStatusBarMessage });
                                this.createBetaTestersDistributionGroup().then((created: boolean) => {
                                    resolve(created);
                                });
                        });
                    }).then(async distributionGroupCreated => {
                        if (!distributionGroupCreated) {
                            VsCodeUtils.ShowErrorMessage(Strings.FailedToCreateDistributionGroup);
                        }
                    });
                }

                if (this._connectRepositoryToBuildService) {
                    await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.VSCodeProgressLoadingTitle}, p => {
                        return new Promise((resolve) => {
                            p.report({message: Strings.ConnectingRepoToBuildServiceStatusBarMessage });
                                this.connectRepositoryToBuildService().then((created: boolean) => {
                                    resolve(created);
                                });
                        });
                    }).then(async repoConnectedToBuildService => {
                        if (repoConnectedToBuildService) {
                            if (this._withBranchConfigurationCreatedAndBuildKickOff) {
                                await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.VSCodeProgressLoadingTitle}, p => {
                                    return new Promise((resolve) => {
                                        p.report({message: Strings.CreateBranchConfigAndKickOffBuildStatusBarMessage });
                                            this.withBranchConfigurationCreatedAndBuildKickOff().then((created: boolean) => {
                                                resolve(created);
                                            });
                                    });
                                }).then(async branchConfiguredAndBuildStarted => {
                                    if (!branchConfiguredAndBuildStarted) {
                                        VsCodeUtils.ShowErrorMessage(Strings.FailedToConfigureBranchAndStartNewBuild);
                                    }
                                });
                            }
                        } else {
                            VsCodeUtils.ShowErrorMessage(Strings.FailedToConnectRepoToBuildService);
                        }
                    });
                }
            } else {
                // This is the only case when we haven't done anything in appcenter, for other cases just show error message
                VsCodeUtils.ShowErrorMessage(Strings.FailedToCreateAppInAppCenter(this.os));
            }
        });

        return configured;
    }

    private async withBranchConfigurationCreatedAndBuildKickOff(): Promise<boolean> {
        // TODO: get out what to do with this magic with not working of method to create default config!
        try {
            const configJson = Constants.defaultBuildConfigJSON;
            const configObj = JSON.parse(configJson);

            await this.client.build.branchConfigurations.create(this.appName, this.defaultBranchName, this.ownerName, configObj);
            await this.client.build.builds.create(this.appName, this.defaultBranchName, this.ownerName);
        } catch (err) {
            return this.proceedErrorResponse(err);
        }
        return true;
    }

    private async connectRepositoryToBuildService(): Promise<boolean> {
        try {
            await this.client.build.repositoryConfigurations.createOrUpdate(
                this.appName,
                this.ownerName,
                {
                    repoUrl: this.repoUrl
                }
            );
        } catch (err) {
            return this.proceedErrorResponse(err);
        }
        return true;
    }

    private async createBetaTestersDistributionGroup(): Promise<boolean> {
        try {
            await this.client.account.distributionGroups.create(this.appName, {
                name: SettingsHelper.distribroupTestersName()
            }, this.ownerName);
        } catch (err) {
            return this.proceedErrorResponse(err);
        }
        return true;
    }

    private async createAppForOrg(): Promise<boolean> {
        try {
            await this.client.account.apps.createForOrg( {
                displayName: this.appDisplayAppName,
                name: this.appName,
                os: this.os,
                platform: this.platform
            }, this.ownerName);
        } catch (err) {
            return this.proceedErrorResponse(err);
        }
        return true;
    }

    private async createApp(): Promise<boolean> {
        try {
            await this.client.account.apps.create( {
                displayName: this.appDisplayAppName,
                name: this.appName,
                os: this.os,
                platform: this.platform
            });
        } catch (err) {
            return this.proceedErrorResponse(err);
        }
        return true;
    }

    private proceedErrorResponse(error: any): boolean {
        const errMessage: string = error.response ? error.response.body : error;
        this.logger.error(errMessage);
        return false;
    }
}

export class IOSAppCenterAppCreator extends AppCenterAppCreator {
    constructor(client: AppCenterClient, logger: ILogger) {
        super(client, logger);
        this.os = AppCenterOS.iOS;
    }
}

export class AndroidAppCenterAppCreator extends AppCenterAppCreator {
    constructor(client: AppCenterClient, logger: ILogger) {
        super(client, logger);
        this.os = AppCenterOS.Android;
    }
}
