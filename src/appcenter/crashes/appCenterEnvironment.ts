import { Constants } from "../../constants";

export enum AppCenterEnvironment {
    Prod = 0,
    Staging = 1,
    Int = 2
}

export class AppCenterEnvironmentHelper {
    public static getEndpoint(appCenterEnvironment: AppCenterEnvironment): string {
        switch (appCenterEnvironment) {
            case AppCenterEnvironment.Prod: return Constants.ProdCrashesEndPoint;
            case AppCenterEnvironment.Int: return Constants.IntCrashesEndPoint;
            case AppCenterEnvironment.Staging: return Constants.StagingCrashesEndPoint;
            default: return Constants.ProdCrashesEndPoint;
        }
    }
}
