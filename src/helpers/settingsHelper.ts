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
}
