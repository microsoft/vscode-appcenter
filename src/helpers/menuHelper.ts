import * as vscode from "vscode";
import { models } from "../appcenter/apis";
import { AppCenterBeacons, AppCenterDistributionTabs } from "../constants";
import { Strings } from "../strings";
import { AppCenterUrlBuilder } from "./appCenterUrlBuilder";
import { QuickPickAppItem } from "./interfaces";
import { Utils } from "./utils";

export class MenuHelper {
    public static handleMenuPortalQuickPickSelection(selected: string, ownerName: string, appName: string, isOrg: boolean) {
        switch (selected) {
            case (AppCenterBeacons.Build):
                Utils.OpenUrl(AppCenterUrlBuilder.GetAppCenterLinkByBeacon(ownerName, appName, AppCenterBeacons.Build, isOrg));
                break;
            case (AppCenterBeacons.Test):
                Utils.OpenUrl(AppCenterUrlBuilder.GetAppCenterLinkByBeacon(ownerName, appName, AppCenterBeacons.Test, isOrg));
                break;
            case (AppCenterBeacons.Distribute):
                vscode.window.showQuickPick(MenuHelper.getAppCenterDistributeTabMenuItems(), { placeHolder: Strings.MenuTitlePlaceholder })
                    .then((selected: QuickPickAppItem) => {
                        if (!selected) {
                            return;
                        }
                        switch (selected.target) {
                            case (AppCenterDistributionTabs.Groups):
                                Utils.OpenUrl(AppCenterUrlBuilder.GetAppCenterDistributeTabLinkByTabName(ownerName, appName, AppCenterDistributionTabs.Groups, isOrg));
                                break;
                            case (AppCenterDistributionTabs.Stores):
                                Utils.OpenUrl(AppCenterUrlBuilder.GetAppCenterDistributeTabLinkByTabName(ownerName, appName, AppCenterDistributionTabs.Stores, isOrg));
                                break;
                            case (AppCenterDistributionTabs.CodePush):
                                Utils.OpenUrl(AppCenterUrlBuilder.GetAppCenterDistributeTabLinkByTabName(ownerName, appName, AppCenterDistributionTabs.CodePush, isOrg));
                                break;
                            case (AppCenterDistributionTabs.Releases):
                                Utils.OpenUrl(AppCenterUrlBuilder.GetAppCenterDistributeTabLinkByTabName(ownerName, appName, AppCenterDistributionTabs.Releases, isOrg));
                                break;
                            default:
                                break;
                        }
                    });
                break;
            case (AppCenterBeacons.Crashes):
                Utils.OpenUrl(AppCenterUrlBuilder.GetAppCenterLinkByBeacon(ownerName, appName, AppCenterBeacons.Crashes, isOrg));
                break;
            case (AppCenterBeacons.Analytics):
                Utils.OpenUrl(AppCenterUrlBuilder.GetAppCenterLinkByBeacon(ownerName, appName, AppCenterBeacons.Analytics, isOrg));
                break;
            case (AppCenterBeacons.Push):
                Utils.OpenUrl(AppCenterUrlBuilder.GetAppCenterLinkByBeacon(ownerName, appName, AppCenterBeacons.Push, isOrg));
                break;
            default:
                break;
        }
    }

    public static getAppCenterPortalMenuItems(): vscode.QuickPickItem[] {
        const appCenterPortalPortalOptions: vscode.QuickPickItem[] = [];
        appCenterPortalPortalOptions.push(<vscode.QuickPickItem>{
            label: Strings.BuildTabMenuItem,
            description: Strings.OpenTabInBrowserMsg(Strings.BuildTabMenuItem),
            target: AppCenterBeacons.Build
        });
        appCenterPortalPortalOptions.push(<vscode.QuickPickItem>{
            label: Strings.TestTabMenuItem,
            description: Strings.OpenTabInBrowserMsg(Strings.TestTabMenuItem),
            target: AppCenterBeacons.Test
        });
        appCenterPortalPortalOptions.push(<vscode.QuickPickItem>{
            label: Strings.DistributeTabMenuItem,
            description: Strings.OpenTabInBrowserMsg(Strings.DistributeTabMenuItem),
            target: AppCenterBeacons.Distribute
        });
        appCenterPortalPortalOptions.push(<vscode.QuickPickItem>{
            label: Strings.CrashesTabMenuItem,
            description: Strings.OpenTabInBrowserMsg(Strings.CrashesTabMenuItem),
            target: AppCenterBeacons.Crashes
        });
        appCenterPortalPortalOptions.push(<vscode.QuickPickItem>{
            label: Strings.AnalyticsTabMenuItem,
            description: Strings.OpenTabInBrowserMsg(Strings.AnalyticsTabMenuItem),
            target: AppCenterBeacons.Analytics
        });
        appCenterPortalPortalOptions.push(<vscode.QuickPickItem>{
            label: Strings.PushTabMenuItem,
            description: Strings.OpenTabInBrowserMsg(Strings.PushTabMenuItem),
            target: AppCenterBeacons.Push
        });
        return appCenterPortalPortalOptions;
    }

    public static getAppCenterDistributeTabMenuItems(): vscode.QuickPickItem[] {
        const getAppCenterDistributeTabMenuItems: vscode.QuickPickItem[] = [];
        getAppCenterDistributeTabMenuItems.push(<vscode.QuickPickItem>{
            label: Strings.DistributeGroupsTabMenuItem,
            description: Strings.OpenTabInBrowserMsg(Strings.DistributeGroupsTabMenuItem),
            target: AppCenterDistributionTabs.Groups
        });
        getAppCenterDistributeTabMenuItems.push(<vscode.QuickPickItem>{
            label: Strings.DistributeStoresTabMenuItem,
            description: Strings.OpenTabInBrowserMsg(Strings.DistributeStoresTabMenuItem),
            target: AppCenterDistributionTabs.Stores
        });
        getAppCenterDistributeTabMenuItems.push(<vscode.QuickPickItem>{
            label: Strings.DistributeCodePushTabMenuItem,
            description: Strings.OpenTabInBrowserMsg(Strings.DistributeCodePushTabMenuItem),
            target: AppCenterDistributionTabs.CodePush
        });
        getAppCenterDistributeTabMenuItems.push(<vscode.QuickPickItem>{
            label: Strings.DistributeReleasesTabMenuItem,
            description: Strings.OpenTabInBrowserMsg(Strings.DistributeReleasesTabMenuItem),
            target: AppCenterDistributionTabs.Releases
        });
        return getAppCenterDistributeTabMenuItems;
    }

    public static getQuickPickItemsForAppsList(appsList: models.AppResponse[]) {
        return appsList.map((app: models.AppResponse) => {
            return {
                label: `${app.name} (${app.os})`,
                description: app.owner.type,
                target: `${app.name}`
            };
        });
    }
}
