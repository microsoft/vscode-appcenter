import * as vscode from 'vscode';
import { ConfigurationReader } from '../data/configurationReader';
import { LogLevel } from '../extension/log/logHelper';
import { AppCenterEnvironment, Constants } from '../extension/resources/constants';

export class SettingsHelper {
    public static getAppCenterDemoAppGitRepo(): string {
        const workspaceConfiguration = vscode.workspace.getConfiguration();
        if (workspaceConfiguration.has("appcenter.demoAppGitRepo")) {
            const demoAppGitRepo: string = ConfigurationReader.readString(workspaceConfiguration.get("appcenter.demoAppGitRepo"));
            return demoAppGitRepo;
        }
        return Constants.AppCenterDemoAppRepository;
    }

    public static getAppCenterLoginEndpoint(): string {
        const workspaceConfiguration = vscode.workspace.getConfiguration();
        if (workspaceConfiguration.has("appcenter.api.loginendpoint")) {
            const loginEndpoint: string = ConfigurationReader.readString(workspaceConfiguration.get("appcenter.api.loginendpoint"));
            return loginEndpoint;
        }
        return Constants.DefaultLoginEndPoint;
    }

    public static getAppCenterPortalEndpoint(): string {
        const workspaceConfiguration = vscode.workspace.getConfiguration();
        if (workspaceConfiguration.has("appcenter.portalEndpoint")) {
            const portalEndpoint: string = ConfigurationReader.readString(workspaceConfiguration.get("appcenter.portalEndpoint"));
            return portalEndpoint;
        }
        return Constants.AppCenterPortalURL;
    }

    public static getAppCenterAPIEndpoint(): string {
        const workspaceConfiguration = vscode.workspace.getConfiguration();
        if (workspaceConfiguration.has("appcenter.api.endpoint")) {
            const apiEndpoint: string = ConfigurationReader.readString(workspaceConfiguration.get("appcenter.api.endpoint"));
            return apiEndpoint;
        }
        return Constants.DefaultAPIEndPoint;
    }

    public static createIOSAppInAppCenter(): boolean {
        const workspaceConfiguration = vscode.workspace.getConfiguration();
        if (workspaceConfiguration.has("appcenter.createiosapp")) {
            const createIOSAppInAppCenter: boolean = ConfigurationReader.readBoolean(workspaceConfiguration.get("appcenter.createiosapp"));
            return createIOSAppInAppCenter;
        }
        return true;
    }

    public static createAndroidAppInAppCenter(): boolean {
        const workspaceConfiguration = vscode.workspace.getConfiguration();
        if (workspaceConfiguration.has("appcenter.createandroidapp")) {
            const createAndroidAppInAppCenter: boolean = ConfigurationReader.readBoolean(workspaceConfiguration.get("appcenter.createandroidapp"));
            return createAndroidAppInAppCenter;
        }
        return true;
    }

    public static createTestersDistributionGroupInAppCenter(): boolean {
        const workspaceConfiguration = vscode.workspace.getConfiguration();
        if (workspaceConfiguration.has("appcenter.createtestersdistibutiongroup")) {
            const createTestersDistributionGroupInAppCenter: boolean = ConfigurationReader.readBoolean(workspaceConfiguration.get("appcenter.createtestersdistibutiongroup"));
            return createTestersDistributionGroupInAppCenter;
        }
        return true;
    }

    public static connectRepoToBuildService(): boolean {
        const workspaceConfiguration = vscode.workspace.getConfiguration();
        if (workspaceConfiguration.has("appcenter.connectrepotobuildservice")) {
            const createTestersDistributionGroupInAppCenter: boolean = ConfigurationReader.readBoolean(workspaceConfiguration.get("appcenter.connectrepotobuildservice"));
            return createTestersDistributionGroupInAppCenter;
        }
        return true;
    }

    public static configureBranchAndStartNewBuild(): boolean {
        const workspaceConfiguration = vscode.workspace.getConfiguration();
        if (workspaceConfiguration.has("appcenter.configurebranchandstartnewbuild")) {
            const createTestersDistributionGroupInAppCenter: boolean = ConfigurationReader.readBoolean(workspaceConfiguration.get("appcenter.configurebranchandstartnewbuild"));
            return createTestersDistributionGroupInAppCenter;
        }
        return true;
    }

    public static distribitionGroupTestersName(): string {
        const workspaceConfiguration = vscode.workspace.getConfiguration();
        if (workspaceConfiguration.has("appcenter.distribitiongrouptestersname")) {
            const distribitionGroupTestersName: string = ConfigurationReader.readString(workspaceConfiguration.get("appcenter.distribitiongrouptestersname"));
            return distribitionGroupTestersName;
        }
        return Constants.DefaultDistributionGroupTestersName;
    }

    public static defaultBranchName(): string {
        const workspaceConfiguration = vscode.workspace.getConfiguration();
        if (workspaceConfiguration.has("appcenter.defaultbranchname")) {
            const branchName: string = ConfigurationReader.readString(workspaceConfiguration.get("appcenter.defaultbranchname"));
            return branchName;
        }
        return Constants.DefaultBranchName;
    }

    public static getLegacyCodePushServiceEnabled(): boolean {
        return true;
    }

    public static getLegacyCodePushEndpoint(): string {
        return Constants.DefaultLegacyCodePushService;
    }

    public static getLogLevel(): LogLevel {
        const workspaceConfiguration = vscode.workspace.getConfiguration();
        if (workspaceConfiguration.has("appcenter.logLevel")) {
            const logLevelString: string = ConfigurationReader.readString(workspaceConfiguration.get("appcenter.logLevel"));
            return <LogLevel>parseInt(LogLevel[<any>logLevelString], 10);
        }
        return LogLevel.Info;
    }

    public static getEnvironment(): AppCenterEnvironment {
        const workspaceConfiguration = vscode.workspace.getConfiguration();
        if (workspaceConfiguration.has("appcenter.environment")) {
            const appCenterEnvironment: string = ConfigurationReader.readString(workspaceConfiguration.get("appcenter.environment"));
            return <AppCenterEnvironment>parseInt(AppCenterEnvironment[<any>appCenterEnvironment], 10);
        }
        return AppCenterEnvironment.Prod;
    }

    public static isCrashesEnabled(): boolean {
        const workspaceConfiguration = vscode.workspace.getConfiguration();
        if (workspaceConfiguration.has("appcenter.crashes")) {
            const crashesEnabled: boolean = ConfigurationReader.readBoolean(workspaceConfiguration.get("appcenter.crashes"));
            return crashesEnabled;
        }
        return false;
    }

    public static shouldStatusBarBeShown(): boolean {
        const workspaceConfiguration = vscode.workspace.getConfiguration();
        if (workspaceConfiguration.has("appcenter.showStatusBar")) {
            const showStatusBar: boolean = ConfigurationReader.readBoolean(workspaceConfiguration.get("appcenter.showStatusBar"));
            return showStatusBar;
        }
        return true;
    }

    public static setShowStatusBar(): void {
        const workspaceConfiguration = vscode.workspace.getConfiguration();
        if (workspaceConfiguration.has("appcenter.showStatusBar")) {
            workspaceConfiguration.update("appcenter.showStatusBar", true);
        }
    }

    public static setHideStatusBar(): void {
        const workspaceConfiguration = vscode.workspace.getConfiguration();
        if (workspaceConfiguration.has("appcenter.showStatusBar")) {
            workspaceConfiguration.update("appcenter.showStatusBar", false);
        }
    }

    public static linkTwoApps(): boolean {
        const workspaceConfiguration = vscode.workspace.getConfiguration();
        if (workspaceConfiguration.has("appcenter.linkTwoApps")) {
            const linkTwoApps: boolean = ConfigurationReader.readBoolean(workspaceConfiguration.get("appcenter.linkTwoApps"));
            return linkTwoApps;
        }
        return false;
    }

    public static isTelemetryEnabled(): boolean {
        const workspaceConfiguration = vscode.workspace.getConfiguration();
        if (workspaceConfiguration.has("appcenter.telemetryEnabled")) {
            const telemetryEnabled: boolean = ConfigurationReader.readBoolean(workspaceConfiguration.get("appcenter.telemetryEnabled"));
            return telemetryEnabled;
        }
        return true;
    }

    public static codePushReleaseMixinPath(): string {
        const workspaceConfiguration = vscode.workspace.getConfiguration();
        if (workspaceConfiguration.has("appcenter.codePushMixinPath")) {
            const mixinPath: string = ConfigurationReader.readString(workspaceConfiguration.get("appcenter.codePushMixinPath"));
            if (mixinPath.length === 0) {
                return null;
            }
            return mixinPath;
        }
        return null;
    }
}
