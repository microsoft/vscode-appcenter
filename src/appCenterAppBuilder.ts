import { AppCenterClient, models } from "./appcenter/api";
import { AndroidAppCenterAppCreator, IOSAppCenterAppCreator } from "./appCenterAppCreator";
import { Constants } from "./helpers/constants";
import { Strings } from "./helpers/strings";
import { VsCodeUtils } from "./helpers/vsCodeUtils";
import { ILogger, LogLevel } from "./log/logHelper";

export default class AppCenterAppBuilder {
    private _createIOSApp: boolean = false;
    private _createAndroidApp: boolean = false;
    private _createBetaTestersDistributionGroup: boolean = false;
    private _connectRepositoryToBuildService: boolean = false;
    private _withBranchConfigurationCreatedAndBuildKickOff: boolean = false;

    constructor(private ideaName: string, private userOrOrg: models.ListOKResponseItem, private repoUrl: string, private defaultBranchName: string, private client: AppCenterClient, private logger: ILogger) {
        this.logger.log('Initialized AppCenterAppBuilder', LogLevel.Info);
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

        // TODO: Looks like we can run some of this tasks in parallel, so check it on 2nd iteration!

        // If no need to create than set this var to true by default
        let IOSAppCreated: boolean = !this._createIOSApp;
        let AndroidAppCretead: boolean = !this._createAndroidApp;

        if (this._createIOSApp) {
            IOSAppCreated = await new IOSAppCenterAppCreator(this.client, this.logger)
                .configureApp(
                    iOSDisplayAppName,
                    iOSAppName,
                    isCreatedForOrganization,
                    this.userOrOrg.name,
                    this.repoUrl,
                    this.defaultBranchName,
                    this._createBetaTestersDistributionGroup,
                    this._connectRepositoryToBuildService,
                    this._withBranchConfigurationCreatedAndBuildKickOff
                );
        }

        if (this._createAndroidApp) {
            AndroidAppCretead = await new AndroidAppCenterAppCreator(this.client, this.logger)
                .configureApp(
                    androidDisplayName,
                    androidAppName,
                    isCreatedForOrganization,
                    this.userOrOrg.name,
                    this.repoUrl,
                    this.defaultBranchName,
                    this._createBetaTestersDistributionGroup,
                    this._connectRepositoryToBuildService,
                    this._withBranchConfigurationCreatedAndBuildKickOff
                );
        }

        if (IOSAppCreated && AndroidAppCretead) {
            VsCodeUtils.ShowInfoMessage(Strings.FinishedConfigMsg);
        }
        return true;
    }
}
