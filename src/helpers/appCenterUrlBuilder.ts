
import { AppCenterBeacons, AppCenterDistributionTabs, AppCenterEnvironment, Constants } from "../extension/resources/constants";
import { SettingsHelper } from "./settingsHelper";

export class AppCenterUrlBuilder {

    private static ownerPrefix(isOrg: boolean): string {
        return isOrg ? "orgs" : "users";
    }

    public static GetAppCenterLinkByBeacon(ownerName: string, appName: string, beaconName: AppCenterBeacons, isOrg: boolean): string {
        return `${SettingsHelper.getAppCenterPortalEndpoint()}/${this.ownerPrefix(isOrg)}/${ownerName}/apps/${appName}/${beaconName}/`;
    }

    public static GetAppCenterDistributeTabLinkByTabName(ownerName: string, appName: string, tabName: AppCenterDistributionTabs, isOrg: boolean): string {
        return `${SettingsHelper.getAppCenterPortalEndpoint()}/${this.ownerPrefix(isOrg)}/${ownerName}/apps/${appName}/distribute/${tabName}/`;
    }

    public static GetAppCenterAppLink(ownerName: string, appName: string, isOrg: boolean): string {
        return `${SettingsHelper.getAppCenterPortalEndpoint()}/${this.ownerPrefix(isOrg)}/${ownerName}/apps/${appName}/`;
    }

    public static GetPortalBuildConfigureLink(appOwner: string, appName: string, branchName: string, isOrg: boolean): string {
        return `${SettingsHelper.getAppCenterPortalEndpoint()}/${this.ownerPrefix(isOrg)}/${appOwner}/apps/${appName}/build/branches/${branchName}/setup`;
    }

    public static GetPortalConnectRepoLink(appOwner: string, appName: string, isOrg: boolean): string {
        return `${SettingsHelper.getAppCenterPortalEndpoint()}/${this.ownerPrefix(isOrg)}/${appOwner}/apps/${appName}/build/connect`;
    }

    public static GetPortalCrashesLink(appOwner: string, appName: string, isOrg: boolean): string {
        return `${SettingsHelper.getAppCenterPortalEndpoint()}/${this.ownerPrefix(isOrg)}/${appOwner}/apps/${appName}/crashes/`;
    }

    public static GetPortalBuildLink(appOwner: string, appName: string, branchName: string, buildId: string, isOrg: boolean): string {
        return `${SettingsHelper.getAppCenterPortalEndpoint()}/${this.ownerPrefix(isOrg)}/${appOwner}/apps/${appName}/build/branches/${branchName}/builds/${buildId}`;
    }

    public static getCrashesEndpoint(): string {
        const appCenterEnvironment: AppCenterEnvironment = SettingsHelper.getEnvironment();
        switch (appCenterEnvironment) {
            case AppCenterEnvironment.Prod: return Constants.ProdCrashesEndPoint;
            case AppCenterEnvironment.Int: return Constants.IntCrashesEndPoint;
            case AppCenterEnvironment.Staging: return Constants.StagingCrashesEndPoint;
            default: return Constants.ProdCrashesEndPoint;
        }
    }

    public static getTestLink(appOwner: string, appName: string, isOrg: boolean) {
        return `${SettingsHelper.getAppCenterPortalEndpoint()}/${this.ownerPrefix(isOrg)}/${appOwner}/apps/${appName}/test/runs`;
    }
}
