import * as vscode from "vscode";
import { LogLevel } from "../log/logHelper";
import { ConfigurationReader } from "./configurationReader";
import { Constants } from "./constants";

export class SettingsHelper {
    public static getAppCenterDemoAppGitRepo(): string {
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
}
