import { AppCenterClient, models } from "./appcenter/apis";
import { AppCenterOS, AppCenterPlatform, Constants } from "./constants";
import { AppCenterUrlBuilder } from "./helpers/appCenterUrlBuilder";
import { CreatedAppFromAppCenter } from "./helpers/interfaces";
import { SettingsHelper } from "./helpers/settingsHelper";
import { ILogger } from "./log/logHelper";

export default class AppCenterAppCreator {
    protected platform: AppCenterPlatform = AppCenterPlatform.ReactNative;
    protected os: AppCenterOS;

    constructor(private client: AppCenterClient, private logger: ILogger) {}

    public async withBranchConfigurationCreatedAndBuildKickOff(appName: string, branchName: string, ownerName: string): Promise<boolean> {
        // TODO: get out what to do with this magic with not working of method to create default config!
        try {
            const configJson = Constants.defaultBuildConfigJSON;
            const configObj = JSON.parse(configJson);
            // tslint:disable-next-line:no-debugger
            await this.client.branchConfigurations.create(branchName, ownerName, appName, configObj);
            const queueBuildRequestResponse: models.Build = await this.client.builds.create(branchName, ownerName, appName);
            const buildId = queueBuildRequestResponse.id;
            const realBranchName = queueBuildRequestResponse.sourceBranch;

            const url = AppCenterUrlBuilder.GetPortalBuildLink(ownerName, appName, realBranchName, buildId.toString());
            this.logger.info(`Queued build link for "${appName}": "${url}"`);
        } catch (error) {
            if (error.statusCode === 400) {
                this.logger.error(`app "${appName}" is not configured for building`);
              } else {
                this.logger.error(`failed to queue build request for "${appName}"`);
            }
            return false;
        }
        return true;
    }

    public async connectRepositoryToBuildService(appName: string, ownerName: string, repoUrl: string): Promise<boolean> {
        try {
            await this.client.repositoryConfigurations.createOrUpdate(ownerName, appName, repoUrl);
            return true;
        } catch (err) {
            this.logger.error(`failed to connect repository "${repoUrl}" to build service for app "${appName}"`);
            return false;
        }
    }

    public async createBetaTestersDistributionGroup(appName: string, ownerName: string): Promise<boolean> {
        try {
            await this.client.distributionGroups.create(ownerName, appName, SettingsHelper.distribitionGroupTestersName());
        } catch (error) {
            if (error === 409) {
                this.logger.error(`distribution group "${SettingsHelper.distribitionGroupTestersName()}" in "${appName}" already exists`);
              } else {
                this.logger.error(`failed to create distribution group for "${appName}"`);
              }
            return false;
        }
        return true;
    }

    public async createAppForOrg(appName: string, displayName: string, orgName: string): Promise<CreatedAppFromAppCenter | false> {
        try {
            const result: models.AppResponse = await this.client.apps.createForOrg(orgName, {
                displayName: displayName,
                name: appName,
                os: this.os,
                platform: this.platform
            });
            return {
                appSecret: result.appSecret,
                platform: result.platform,
                os: result.os,
                name: result.name
            };
        } catch (err) {
            this.logger.error(`failed to create "${appName}" app for org "${orgName}"`);
            return false;
        }
    }

    public async createApp(appName: string, displayName: string): Promise<CreatedAppFromAppCenter | false> {
        try {
            const result: models.AppResponse = await this.client.apps.create({
                displayName: displayName,
                name: appName,
                os: this.os,
                platform: this.platform
            });
            return {
                appSecret: result.appSecret,
                platform: result.platform,
                os: result.os,
                name: result.name
            };
        } catch (err) {
            this.logger.error(`failed to create app "${appName}"`);
            return false;
        }
    }

    public async createCodePushDeployment(appName: string, ownerName: string): Promise<models.Deployment> {
        try {
            const result: models.Deployment = await this.client.codePushDeployments.create(ownerName, appName, Constants.CodePushStagingDeplymentName);
            return result;
        } catch (err) {
            this.logger.error(`failed to create codepush deployment for ${appName}`);
            throw new Error(`failed to create codepush deployment for ${appName}`);
        }
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
