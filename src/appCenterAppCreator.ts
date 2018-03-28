import { AppCenterClient } from "./appcenter/api";
import { Deployment } from "./appcenter/lib/app-center-node-client/models";
import { AppCenterOS, AppCenterPlatform, Constants } from "./helpers/constants";
import { CreatedAppFromAppCenter } from "./helpers/interfaces";
import { SettingsHelper } from "./helpers/settingsHelper";
import { ILogger, LogLevel } from "./log/logHelper";

export default class AppCenterAppCreator {
    protected platform: AppCenterPlatform = AppCenterPlatform.ReactNative;
    protected os: AppCenterOS;

    constructor(private client: AppCenterClient, private logger: ILogger) {}

    public async withBranchConfigurationCreatedAndBuildKickOff(appName: string, branchName: string, ownerName: string): Promise<boolean> {
        // TODO: get out what to do with this magic with not working of method to create default config!
        try {
            const configJson = Constants.defaultBuildConfigJSON;
            const configObj = JSON.parse(configJson);

            await this.client.build.branchConfigurations.create(appName, branchName, ownerName, configObj);
            await this.client.build.builds.create(appName, branchName, ownerName);
        } catch (err) {
            return this.proceedErrorResponse(err);
        }
        return true;
    }

    public async connectRepositoryToBuildService(appName: string, ownerName: string, repoUrl: string): Promise<boolean> {
        try {
            await this.client.build.repositoryConfigurations.createOrUpdate(
                appName,
                ownerName,
                {
                    repoUrl: repoUrl
                }
            );
        } catch (err) {
            return this.proceedErrorResponse(err);
        }
        return true;
    }

    public async createBetaTestersDistributionGroup(appName: string, ownerName: string): Promise<boolean> {
        try {
            await this.client.account.distributionGroups.create(appName, {
                name: SettingsHelper.distribitionGroupTestersName()
            }, ownerName);
        } catch (err) {
            return this.proceedErrorResponse(err);
        }
        return true;
    }

    public async createAppForOrg(appName: string, displayName: string, orgName: string): Promise<CreatedAppFromAppCenter | false> {
        let httpOperationResponse: any;
        try {
            httpOperationResponse = await this.client.account.apps.createForOrgWithHttpOperationResponse( {
                displayName: displayName,
                name: appName,
                os: this.os,
                platform: this.platform
            }, orgName);
        } catch (err) {
            this.proceedErrorResponse(err);
            return false;
        }
        const result = JSON.parse(httpOperationResponse.response.body);
        return {
            appSecret: result.app_secret,
            platform: result.platform,
            os: result.os,
            name: result.name
        };
    }

    public async createApp(appName: string, displayName: string): Promise<CreatedAppFromAppCenter | false> {
        let httpOperationResponse: any;
        try {
            httpOperationResponse = await this.client.account.apps.createWithHttpOperationResponse( {
                displayName: displayName,
                name: appName,
                os: this.os,
                platform: this.platform
            });
        } catch (err) {
            this.proceedErrorResponse(err);
            return false;
        }
        const result = JSON.parse(httpOperationResponse.response.body);
        return {
            appSecret: result.app_secret,
            platform: result.platform,
            os: result.os,
            name: result.name
        };
    }

    public async createCodePushDeployment(appName: string, ownerName: string): Promise<Deployment> {
        const result: any = await this.client.codepush.codePushDeployments.createWithHttpOperationResponse(appName, {
            name: Constants.CodePushStagingDeplymentName
        } , ownerName);
        const codePushDeployment: Deployment = JSON.parse(result.response.body);
        return codePushDeployment;
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

export class NullAppCenterAppCreator extends AppCenterAppCreator {
    constructor(client: AppCenterClient, logger: ILogger) {
        super(client, logger);
        this.os = AppCenterOS.Android;
    }

    public async withBranchConfigurationCreatedAndBuildKickOff(_appName: string, _branchName: string, _ownerName: string): Promise<boolean> {
        return true;
    }

    public async connectRepositoryToBuildService(_appName: string, _ownerName: string, _repoUrl: string): Promise<boolean> {
        return true;
    }

    public async createBetaTestersDistributionGroup(_appName: string, _ownerName: string): Promise<boolean> {
        return true;
    }

    public async createAppForOrg(_appName: string, _displayName: string, _orgName: string): Promise<CreatedAppFromAppCenter | false> {
        return false;
    }

    public async createApp(_appName: string, _displayName: string): Promise<CreatedAppFromAppCenter | false> {
        return false;
    }
}
