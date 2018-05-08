import { AppCenterClient, models } from "../api/appcenter";
import { ILogger } from "../extension/log/logHelper";
import { AppCenterOS, AppCenterPlatform, Constants } from "../extension/resources/constants";
import { Strings } from "../extension/resources/strings";
import { AppCenterUrlBuilder } from "../helpers/appCenterUrlBuilder";
import { CreatedAppFromAppCenter } from "../helpers/interfaces";
import { SettingsHelper } from "../helpers/settingsHelper";
import { VsCodeUI, IButtonMessageItem } from "../extension/ui/vscodeUI";
import { Messages } from "../extension/resources/messages";
import { LogStrings } from "../extension/resources/logStrings";

export default class AppCenterAppCreator {
    protected platform: AppCenterPlatform = AppCenterPlatform.ReactNative;
    protected os: AppCenterOS;

    constructor(private client: AppCenterClient, private logger: ILogger) { }

    public async withBranchConfigurationCreatedAndBuildKickOff(appName: string, branchName: string, ownerName: string, isOrg: boolean): Promise<boolean> {
        // TODO: get out what to do with this magic with not working of method to create default config!
        try {
            const configJson = Constants.defaultBuildConfigJSON;
            const configObj = JSON.parse(configJson);
            // tslint:disable-next-line:no-debugger
            await this.client.branchConfigurations.create(branchName, ownerName, appName, configObj);
            const queueBuildRequestResponse: models.Build = await this.client.builds.create(branchName, ownerName, appName);
            const buildId = queueBuildRequestResponse.id;
            const realBranchName = queueBuildRequestResponse.sourceBranch;

            const url = AppCenterUrlBuilder.GetPortalBuildLink(ownerName, appName, realBranchName, buildId.toString(), isOrg);
            this.logger.info(`Queued a new build for "${appName}": ${url}`);
        } catch (error) {
            const configureBuildLink: string = AppCenterUrlBuilder.GetPortalBuildConfigureLink(ownerName, appName, branchName, isOrg);
            if (error.statusCode === 400) {
                this.logger.error(LogStrings.BuildConfigureError(appName));
            } else {
                this.logger.error(LogStrings.BuildQueueError(appName));
            }
            const messageItems: IButtonMessageItem[] = [];
            messageItems.push({
                title: Strings.BuildManualConfigureBtnLabel,
                url: configureBuildLink
            });
            VsCodeUI.ShowInfoMessage(Messages.BuildManualConfigureMessage(appName), ...messageItems);
            return false;
        }
        return true;
    }

    public async connectRepositoryToBuildService(appName: string, ownerName: string, repoUrl: string, isOrg: boolean): Promise<boolean> {
        try {
            await this.client.repositoryConfigurations.createOrUpdate(ownerName, appName, repoUrl);
            return true;
        } catch (err) {
            const connectRepoLink: string = AppCenterUrlBuilder.GetPortalConnectRepoLink(ownerName, appName, isOrg);
            this.logger.error(LogStrings.BuildConnectError(appName, repoUrl));

            const messageItems: IButtonMessageItem[] = [];
            messageItems.push({
                title: Strings.RepoManualConnectBtnLabel,
                url: connectRepoLink
            });
            VsCodeUI.ShowInfoMessage(Messages.RepoManualConnectMessage(appName), ...messageItems);
            return false;
        }
    }

    public async createBetaTestersDistributionGroup(appName: string, ownerName: string): Promise<boolean> {
        try {
            await this.client.distributionGroups.create(ownerName, appName, SettingsHelper.distribitionGroupTestersName());
        } catch (error) {
            if (error === 409) {
                this.logger.error(LogStrings.DistributionGroupExists(SettingsHelper.distribitionGroupTestersName(), appName));
            } else {
                this.logger.error(`${LogStrings.ErrorCreatingDistributionGroup(appName)} ${error}`);
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
                appName: result.name
            };
        } catch (err) {
            if (err.statusCode === 409) {
                this.logger.error(LogStrings.AppNameExists(appName));
            } else {
                this.logger.error(`${LogStrings.FailedCreateAppUnder(appName, orgName)} ${(err && err.message) || ""}`);
            }
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
                appName: result.name
            };
        } catch (err) {
            if (err.statusCode === 409) {
                this.logger.error(LogStrings.AppNameExists(appName));
            } else {
                this.logger.error(`${LogStrings.FailedCreateAppUnder(appName)} ${(err && err.message) || ""}`);
            }
            return false;
        }
    }

    public async createCodePushDeployment(appName: string, ownerName: string): Promise<models.Deployment | null> {
        try {
            const result: models.Deployment = await this.client.codePushDeployments.create(ownerName, appName, Constants.CodePushStagingDeploymentName);
            return result;
        } catch (err) {
            if (err.statusCode === 409) {
                this.logger.info(LogStrings.DeploymentExists(appName));
                try {
                    const result: models.Deployment = await this.client.codePushDeployments.get(Constants.CodePushStagingDeploymentName, ownerName, appName);
                    return result;
                } catch (err) {
                    this.logger.error(`${LogStrings.ErrorCreatingDeploymentsFor(appName)} ${err && err.message || ""}`);
                }
            } else {
                this.logger.error(`${LogStrings.ErrorCreatingDeploymentsFor(appName)} ${err && err.message || ""}`);
            }
            return null;
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
