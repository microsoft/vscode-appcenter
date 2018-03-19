// import * as vscode from "vscode";
// import { ConfigurationReader } from "./configurationReader";
import { Constants } from "./constants";

export class SettingsHelper {
    /**
     * Get appcenter login endpoint setting
     */
    public static getAppCenterLoginEndpoint(): string {
        return Constants.DefaultLoginEndPoint;
    }

    /**
     * Get appcenter api endpoint setting
     */
    public static getAppCenterAPIEndpoint(): string {
       return Constants.DefaulAPIEndPoint;
    }

    public static createIOSAppInAppCenter(): boolean {
       return true;
    }

    public static createAndroidAppInAppCenter(): boolean {
        return true;
    }

    public static createTestersDistributionGroupInAppCenter(): boolean {
        return true;
    }

    public static connectRepoToBuildService(): boolean {
        return true;
    }

    public static configureBranchAndStartNewBuild(): boolean {
        return true;
    }
}
