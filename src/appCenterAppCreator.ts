import { AppCenterClient, models } from "./appcenter/api";
import { AppCenterOS, AppCenterPlatform, Constants } from "./helpers/constants";
import { ILogger, LogLevel } from "./log/logHelper";

export default class AppCenterAppCreator {
    private _createIOSApp: boolean = false;
    private _createAndroidApp: boolean = false;
    private _createBetaTestersDistributionGroup: boolean = false;
    private _connectRepositoryToBuildService: boolean = false;
    private _withBranchConfigurationCreatedAndBuildKickOff: boolean = false;

    constructor(private ideaName: string, private userOrOrg: models.ListOKResponseItem, private client: AppCenterClient, private logger: ILogger) {
        this.logger.log('Initiazlied AppCenterAppCreator', LogLevel.Info);
    }

    public withIOSApp(ok: boolean): AppCenterAppCreator {
        this._createIOSApp = ok;
        return this;
    }

    public withAndroidApp(ok: boolean): AppCenterAppCreator {
        this._createAndroidApp = ok;
        return this;
    }

    public withBetaTestersDistributionGroup(ok: boolean): AppCenterAppCreator {
        this._createBetaTestersDistributionGroup = ok;
        return this;
    }

    public withConnectedRepositoryToBuildService(ok: boolean): AppCenterAppCreator {
        this._connectRepositoryToBuildService = ok;
        return this;
    }

    public withBranchConfigurationCreatedAndBuildKickOff(ok: boolean): AppCenterAppCreator {
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

        // TODO: Looks like we can run some of this tasks in parallel, so check it on 2nd iteration!

        if (this._createIOSApp) {
            if (isCreatedForOrganization) {
                try {
                    await this.client.account.apps.createForOrg( {
                        displayName: iOSDisplayAppName,
                        name: iOSAppName,
                        os: AppCenterOS.iOS,
                        platform: AppCenterPlatform.ReactNative
                    }, <string>this.userOrOrg.name);
                } catch (err) {
                    const errMessage: string = err.response ? err.response.body : err;
                    this.logger.error(errMessage);
                    return false; // OK, here we need to return meaning result so we can determine what goes wrong!
                }
            } else {
                try {
                    await this.client.account.apps.create( {
                        displayName: iOSDisplayAppName,
                        name: iOSAppName,
                        os: AppCenterOS.iOS,
                        platform: AppCenterPlatform.ReactNative
                    });
                } catch (err) {
                    const errMessage: string = err.response ? err.response.body : err;
                    this.logger.error(errMessage);
                    return false; // OK, here we need to return meaning result so we can determine what goes wrong!
                }
            }
        }

        if (this._createAndroidApp) {
            if (isCreatedForOrganization) {
                try {
                    await this.client.account.apps.createForOrg( {
                        displayName: androidDisplayName,
                        name: androidAppName,
                        os: AppCenterOS.Android,
                        platform: AppCenterPlatform.ReactNative
                    }, <string>this.userOrOrg.name);
                } catch (err) {
                    const errMessage: string = err.response ? err.response.body : err;
                    this.logger.error(errMessage);
                    return false; // OK, here we need to return meaning result so we can determine what goes wrong!
                }
            } else {
                try {
                    await this.client.account.apps.create( {
                        displayName: androidDisplayName,
                        name: androidAppName,
                        os: AppCenterOS.Android,
                        platform: AppCenterPlatform.ReactNative
                    });
                } catch (err) {
                    const errMessage: string = err.response ? err.response.body : err;
                    this.logger.error(errMessage);
                    return false; // OK, here we need to return meaning result so we can determine what goes wrong!
                }
            }
        }

        if (this._createBetaTestersDistributionGroup) {
            console.log('1');
        }

        if (this._connectRepositoryToBuildService) {
            console.log('2');
        }

        if (this._withBranchConfigurationCreatedAndBuildKickOff) {
            console.log('3');
        }

        return true;
    }
}
