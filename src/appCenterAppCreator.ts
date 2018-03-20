import * as vscode from "vscode";
import { AppCenterClient } from "./appcenter/api";
import { AppCenterOS, AppCenterPlatform } from "./helpers/constants";
import { SettingsHelper } from "./helpers/settingsHelper";
import { Strings } from "./helpers/strings";
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

        if (isCreatedForOrganization) {
            await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.VSCodeProgressLoadingTitle}, p => {
                return new Promise((resolve) => {
                    p.report({message: Strings.CreatingAppStatusBarMessage });
                        this.createAppForOrg().then((created: boolean) => {
                        resolve(created);
                    });
                });
            });
        } else {
            await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.VSCodeProgressLoadingTitle}, p => {
                return new Promise((resolve) => {
                    p.report({message: Strings.CreatingAppStatusBarMessage });
                    this.createApp().then((created: boolean) => {
                        resolve(created);
                    });
                });
            });
        }

        if (this._createBetaTestersDistributionGroup) {
            await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.VSCodeProgressLoadingTitle}, p => {
                return new Promise((resolve) => {
                    p.report({message: Strings.CreatingDistributionStatusBarMessage });
                        this.createBetaTestersDistributionGroup().then((created: boolean) => {
                            resolve(created);
                        });
                });
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
            });
        }

        if (this._withBranchConfigurationCreatedAndBuildKickOff) {
            await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.VSCodeProgressLoadingTitle}, p => {
                return new Promise((resolve) => {
                    p.report({message: Strings.CreateBranchConfigAndKickOffBuildStatusBarMessage });
                        this.withBranchConfigurationCreatedAndBuildKickOff().then((created: boolean) => {
                            resolve(created);
                        });
                });
            });
        }

        return true;
    }

    private async withBranchConfigurationCreatedAndBuildKickOff(): Promise<boolean> {
        // TODO: get out what to do with this magic!
        try {
            const configJson = `{
                "branch": {
                    "name": "master"
                },
                "id": 1,
                "trigger": "continuous",
                "environmentVariables": [],
                "signed": false,
                "testsEnabled": false,
                "badgeIsEnabled": false,
                "toolsets": {
                    "buildscripts": {},
                    "javascript": {
                        "packageJsonPath": "package.json",
                        "runTests": false
                    },
                    "xcode": {
                        "projectOrWorkspacePath": "ios/rntestextension.xcodeproj",
                        "scheme": "rntestextension",
                        "xcodeVersion": "9.2",
                        "automaticSigning": false
                    }
                }
            }`;
            const configObj = JSON.parse(configJson);
            configObj.branch.name = this.defaultBranchName;
            configObj.toolsets.distribution = {};
            configObj.trigger = 'continuous';
            configObj.signed = false;

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
        return false; // OK, here we need to return meaning result so we can determine what goes wrong!
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
