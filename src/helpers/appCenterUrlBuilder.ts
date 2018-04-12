import { AppCenterBeacons, AppCenterDistributionTabs } from "../constants";
import { SettingsHelper } from "./settingsHelper";

export class AppCenterUrlBuilder {
    public static GetAppCenterLinkByBeacon(ownerName: string, appName: string, beaconName: AppCenterBeacons, isOrg: boolean): string {
        if (isOrg) {
            return `${SettingsHelper.getAppCenterPortalEndpoint()}/orgs/${ownerName}/apps/${appName}/${beaconName}/`;
        } else {
            return `${SettingsHelper.getAppCenterPortalEndpoint()}/users/${ownerName}/apps/${appName}/${beaconName}/`;
        }
    }

    public static GetAppCenterDistributeTabLinkByTabName(ownerName: string, appName: string, tabName: AppCenterDistributionTabs, isOrg: boolean): string {
        if (isOrg) {
            return `${SettingsHelper.getAppCenterPortalEndpoint()}/orgs/${ownerName}/apps/${appName}/distribute/${tabName}/`;
        } else {
            return `${SettingsHelper.getAppCenterPortalEndpoint()}/users/${ownerName}/apps/${appName}/distribute/${tabName}/`;
        }
    }

    public static GetPortalBuildConfigureLink(appOwner: string, appName: string, branchName: string): string {
        return `${SettingsHelper.getAppCenterPortalEndpoint()}/users/${appOwner}/apps/${appName}/build/branches/${branchName}/setup`;
    }

    public static GetPortalBuildLink(appOwner: string, appName: string, branchName: string, buildId: string): string {
        return `${SettingsHelper.getAppCenterPortalEndpoint()}/users/${appOwner}/apps/${appName}/build/branches/${branchName}/builds/${buildId}`;
      }
}
