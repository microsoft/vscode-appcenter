import { AppCenterClient, models } from "./appcenter/api";
import { AppCenterOS, AppCenterPlatform, Constants } from "./helpers/constants";
import { SettingsHelper } from "./helpers/settingsHelper";
import { ILogger, LogLevel } from "./log/logHelper";

export default class AppCenterAppCreator {
    protected platform: AppCenterPlatform = AppCenterPlatform.ReactNative;
    protected os: AppCenterOS;

    constructor(private client: AppCenterClient, private logger: ILogger) {
        this.logger.log('Initiazlied AppCenter Creator', LogLevel.Info);
    }

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

    public async createAppForOrg(appName: string, displayName: string, orgName: string): Promise<models.AppResponse | null> {
        let httpOperationResponse: any;
        try {
            httpOperationResponse = await this.client.account.apps.createForOrgWithHttpOperationResponse( {
                displayName: displayName,
                name: appName,
                os: this.os,
                platform: this.platform
            }, orgName);
        } catch (err) {
            const errMessage: string = err.response ? err.response.body : err;
            this.logger.error(errMessage);
            throw new Error(errMessage);
        }
        return JSON.parse(httpOperationResponse.response.body);
    }

    public async createApp(appName: string, displayName: string): Promise<models.AppResponse | null> {
        let httpOperationResponse: any;
        try {
            httpOperationResponse = await this.client.account.apps.createWithHttpOperationResponse( {
                displayName: displayName,
                name: appName,
                os: this.os,
                platform: this.platform
            });
        } catch (err) {
            const errMessage: string = err.response ? err.response.body : err;
            this.logger.error(errMessage);
            throw new Error(errMessage);
        }
        return JSON.parse(httpOperationResponse.response.body);
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

    public async createAppForOrg(_appName: string, _displayName: string, _orgName: string): Promise<models.AppResponse | null> {
        return null;
    }

    public async createApp(_appName: string, _displayName: string): Promise<models.AppResponse | null> {
        return null;
    }
}
