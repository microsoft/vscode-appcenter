import { AppCenterClient, models } from "./appcenter/apis";
import { AppCenterOS, AppCenterPlatform, Constants } from "./constants";
import { AppCenterUrlBuilder } from "./helpers/appCenterUrlBuilder";
import { CreatedAppFromAppCenter } from "./helpers/interfaces";
import { SettingsHelper } from "./helpers/settingsHelper";
import { IButtonMessageItem, VsCodeUtils } from "./helpers/vsCodeUtils";
import { ILogger } from "./log/logHelper";
import { Strings } from "./strings";

export default class AppCenterAppCreator {
    protected platform: AppCenterPlatform = AppCenterPlatform.ReactNative;
    protected os: AppCenterOS;

    constructor(private client: AppCenterClient, private logger: ILogger) { }

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
            this.logger.info(`Queued a new build for "${appName}": ${url}`);
        } catch (error) {
            const configureBuildLink: string = AppCenterUrlBuilder.GetPortalBuildConfigureLink(ownerName, appName, branchName);
            if (error.statusCode === 400) {
                this.logger.error(`An error occurred while configuring your ${appName}" app for build`);
            } else {
                this.logger.error(`An unexpected error occurred while queueing a build for "${appName}"`);
            }
            const messageItems: IButtonMessageItem[] = [];
            messageItems.push({
                title: Strings.BuildManualConfigureBtnLabel,
                url: configureBuildLink
            });
            VsCodeUtils.ShowInfoMessage(Strings.BuildManualConfigureMessage(appName), ...messageItems);
            return false;
        }
        return true;
    }

    public async connectRepositoryToBuildService(appName: string, ownerName: string, repoUrl: string): Promise<boolean> {
        try {
            await this.client.repositoryConfigurations.createOrUpdate(ownerName, appName, repoUrl);
            return true;
        } catch (err) {
            const connectRepoLink: string = AppCenterUrlBuilder.GetPortalConnectRepoLink(ownerName, appName);
            this.logger.error(`Could not connect your new repository "${repoUrl}" to your "${appName}" App Center project`);

            const messageItems: IButtonMessageItem[] = [];
            messageItems.push({
                title: Strings.RepoManualConnectBtnLabel,
                url: connectRepoLink
            });
            VsCodeUtils.ShowInfoMessage(Strings.RepoManualConnectMessage(appName), ...messageItems);
            return false;
        }
    }

    public async createBetaTestersDistributionGroup(appName: string, ownerName: string): Promise<boolean> {
        try {
            await this.client.distributionGroups.create(ownerName, appName, SettingsHelper.distribitionGroupTestersName());
        } catch (error) {
            if (error === 409) {
                this.logger.error(`Distribution group "${SettingsHelper.distribitionGroupTestersName()}" in "${appName}" already exists`);
            } else {
                this.logger.error(`An unexpected error occurred while creating a distribution group for "${appName}"`);
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
            this.logger.error(`An unexpected error occurred trying to create "${appName}" under "${orgName}"`);
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
            this.logger.error(`An unexpected error occurred trying to create your ${appName} app in App Center`);
            return false;
        }
    }

    public async createCodePushDeployment(appName: string, ownerName: string): Promise<models.Deployment> {
        try {
            const result: models.Deployment = await this.client.codePushDeployments.create(ownerName, appName, Constants.CodePushStagingDeplymentName);
            return result;
        } catch (err) {
            this.logger.error(`An unexpected error occurred trying to create CodePush deployments for ${appName}`);
            throw new Error(`An unexpected error occurred trying to create CodePush deployments for ${appName}`);
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
