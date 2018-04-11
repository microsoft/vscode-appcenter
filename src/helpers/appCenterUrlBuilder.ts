import { AppCenterBeacons, AppCenterDistributionTabs } from "../constants";
import { SettingsHelper } from "./settingsHelper";

export class AppCenterUrlBuilder {
    public static GetAppCenterURLByBeacon(ownerName: string, appName: string, beaconName: AppCenterBeacons, isOrg: boolean): string {
        if (isOrg) {
            return `${SettingsHelper.getAppCenterPortalEndpoint()}/orgs/${ownerName}/apps/${appName}/${beaconName}/`;
        } else {
            return `${SettingsHelper.getAppCenterPortalEndpoint()}/users/${ownerName}/apps/${appName}/${beaconName}/`;
        }
    }

    public static GetAppCenterDistributeTabUrlByTabName(ownerName: string, appName: string, tabName: AppCenterDistributionTabs, isOrg: boolean): string {
        if (isOrg) {
            return `${SettingsHelper.getAppCenterPortalEndpoint()}/orgs/${ownerName}/apps/${appName}/distribute/${tabName}/`;
        } else {
            return `${SettingsHelper.getAppCenterPortalEndpoint()}/users/${ownerName}/apps/${appName}/distribute/${tabName}/`;
        }
    }

    public static GetPortalBuildLink(appOwner: string, appName: string, branchName: string, buildId: string): string {
        return `${SettingsHelper.getAppCenterPortalEndpoint()}/users/${appOwner}/apps/${appName}/build/branches/${branchName}/builds/${buildId}`;
      }
}
