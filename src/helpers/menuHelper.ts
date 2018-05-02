import * as os from "os";
import * as vscode from "vscode";
import { models } from "../appcenter/apis";
import * as CodePush from "../appcenter/commands/codepush";
import SimulateCrashes from "../appcenter/commands/simulateCrashes";
import { AppCenterBeacons, AppCenterCrashesTabs, AppCenterDistributionTabs, CommandNames } from "../constants";
import { Strings } from "../strings";
import { AppCenterUrlBuilder } from "./appCenterUrlBuilder";
import { CommandParams, Profile, QuickPickAppItem, UserOrOrganizationItem } from "./interfaces";
import { SettingsHelper } from "./settingsHelper";
import { Utils } from "./utils";
import { CustomQuickPickItem } from "./vsCodeUtils";

export class MenuHelper {
    public static handleMenuPortalQuickPickSelection(params: CommandParams, selected: string, ownerName: string, appName: string, isOrg: boolean) {
        if (!ownerName && !appName) {
            throw new Error("ShowMenu: OwnerName or AppName not specified");
        }
        switch (selected) {
            case (AppCenterBeacons.Build):
                Utils.OpenUrl(AppCenterUrlBuilder.GetAppCenterLinkByBeacon(ownerName, appName, AppCenterBeacons.Build, isOrg));
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
                            case (AppCenterDistributionTabs.Releases):
                                Utils.OpenUrl(AppCenterUrlBuilder.GetAppCenterDistributeTabLinkByTabName(ownerName, appName, AppCenterDistributionTabs.Releases, isOrg));
                                break;
                            default:
                                break;
                        }
                    });
                break;
            case (AppCenterBeacons.Crashes):
                vscode.window.showQuickPick(MenuHelper.getAppCenterCrashesTabMenuItems(), { placeHolder: Strings.MenuTitlePlaceholder })
                    .then((selected: QuickPickAppItem) => {
                        if (!selected) {
                            return;
                        }
                        switch (selected.target) {
                            case (AppCenterCrashesTabs.Crashes):
                                Utils.OpenUrl(AppCenterUrlBuilder.GetAppCenterLinkByBeacon(ownerName, appName, AppCenterBeacons.Crashes, isOrg));
                                break;
                            case (AppCenterCrashesTabs.Simulate):
                                new SimulateCrashes(params).run();
                            default:
                                break;
                        }
                    });
                break;
            case (AppCenterBeacons.Analytics):
                Utils.OpenUrl(AppCenterUrlBuilder.GetAppCenterLinkByBeacon(ownerName, appName, AppCenterBeacons.Analytics, isOrg));
                break;
            case (AppCenterBeacons.CodePush):
                new CodePush.ShowMenu(params).run();
            default:
                break;
        }
    }

    public static getSelectedUserOrOrgItem(selected: CustomQuickPickItem, allItems: CustomQuickPickItem[]): UserOrOrganizationItem | null {
        let userOrOrgItem: UserOrOrganizationItem;
        const selectedUserOrOrgs: CustomQuickPickItem[] = allItems.filter(item => item.target === selected.target);
        if (selectedUserOrOrgs && selectedUserOrOrgs.length === 1) {
            userOrOrgItem = {
                name: selectedUserOrOrgs[0].target,
                displayName: selectedUserOrOrgs[0].label,
                isOrganization: selectedUserOrOrgs[0].description !== Strings.UserMenuDescriptionLabel
            };
            return userOrOrgItem;
        } else {
            return null;
        }
    }

    public static getAppCenterPortalMenuItems(isCodePush: boolean): CustomQuickPickItem[] {
        const appCenterPortalPortalOptions: CustomQuickPickItem[] = [];
        appCenterPortalPortalOptions.push(<CustomQuickPickItem>{
            label: Strings.BuildTabMenuItem,
            description: Strings.OpenTabInBrowserMsg(Strings.BuildTabMenuItem),
            target: AppCenterBeacons.Build
        });
        if (os.platform() === 'darwin') {
            appCenterPortalPortalOptions.push(<CustomQuickPickItem>{
                label: Strings.TestTabMenuItem,
                description: Strings.OpenTabInBrowserMsg(Strings.TestTabMenuItem),
                target: AppCenterBeacons.Test
            });
        }
        if (isCodePush) {
            appCenterPortalPortalOptions.push(<CustomQuickPickItem>{
                label: Strings.CodePushMenuLabelItem,
                description: Strings.CodePushMenuLabelDescription,
                target: AppCenterBeacons.CodePush
            });
        }
        appCenterPortalPortalOptions.push(<CustomQuickPickItem>{
            label: Strings.DistributeTabMenuItem,
            description: Strings.OpenTabInBrowserMsg(Strings.DistributeTabMenuItem),
            target: AppCenterBeacons.Distribute
        });
        appCenterPortalPortalOptions.push(<CustomQuickPickItem>{
            label: Strings.CrashesTabMenuItem,
            description: Strings.OpenTabInBrowserMsg(Strings.CrashesTabMenuItem),
            target: AppCenterBeacons.Crashes
        });
        appCenterPortalPortalOptions.push(<CustomQuickPickItem>{
            label: Strings.AnalyticsTabMenuItem,
            description: Strings.OpenTabInBrowserMsg(Strings.AnalyticsTabMenuItem),
            target: AppCenterBeacons.Analytics
        });
        return appCenterPortalPortalOptions;
    }

    public static getAppCenterDistributeTabMenuItems(): CustomQuickPickItem[] {
        const getAppCenterDistributeTabMenuItems: CustomQuickPickItem[] = [];
        getAppCenterDistributeTabMenuItems.push(<CustomQuickPickItem>{
            label: Strings.DistributeGroupsTabMenuItem,
            description: Strings.OpenTabInBrowserMsg(Strings.DistributeGroupsTabMenuItem),
            target: AppCenterDistributionTabs.Groups
        });
        getAppCenterDistributeTabMenuItems.push(<CustomQuickPickItem>{
            label: Strings.DistributeStoresTabMenuItem,
            description: Strings.OpenTabInBrowserMsg(Strings.DistributeStoresTabMenuItem),
            target: AppCenterDistributionTabs.Stores
        });
        getAppCenterDistributeTabMenuItems.push(<CustomQuickPickItem>{
            label: Strings.DistributeReleasesTabMenuItem,
            description: Strings.OpenTabInBrowserMsg(Strings.DistributeReleasesTabMenuItem),
            target: AppCenterDistributionTabs.Releases
        });
        return getAppCenterDistributeTabMenuItems;
    }

    public static getAppCenterCrashesTabMenuItems(): CustomQuickPickItem[] {
        const getAppCenterCrashesTabMenuItems: CustomQuickPickItem[] = [];
        getAppCenterCrashesTabMenuItems.push(<CustomQuickPickItem>{
            label: Strings.CrashesTabMenuItem,
            description: Strings.OpenTabInBrowserMsg(Strings.CrashesTabMenuItem),
            target: AppCenterCrashesTabs.Crashes
        });
        if (SettingsHelper.isCrashesEnabled()) {
            getAppCenterCrashesTabMenuItems.push(<CustomQuickPickItem>{
                label: Strings.SimulateCrashesMenuLabel,
                description: Strings.SimulateCrashesMenuDescription,
                target: AppCenterCrashesTabs.Simulate
            });
        }
        return getAppCenterCrashesTabMenuItems;
    }

    public static getCreateAppOptions(): vscode.QuickPickItem[] {
        const createAppOptions: vscode.QuickPickItem[] = [];
        createAppOptions.push(<vscode.QuickPickItem>{
            label: Strings.CreateNewAndroidAppMenuLabel,
            description: "",
            target: CommandNames.CreateApp.Android
        });
        createAppOptions.push(<vscode.QuickPickItem>{
            label: Strings.CreateNewIOSAppMenuLabel,
            description: "",
            target: CommandNames.CreateApp.IOS
        });
        createAppOptions.push(<vscode.QuickPickItem>{
            label: Strings.CreateNewAppsForBothMenuLabel,
            description: "",
            target: CommandNames.CreateApp.Both
        });
        return createAppOptions;
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

    public static getQuickPickItemsForOrgList(orgList: models.ListOKResponseItem[], myself: Profile | null): CustomQuickPickItem[] {
        const options: CustomQuickPickItem[] = orgList.map(item => {
            return {
                label: `${item.displayName} (${item.name})`,
                description: Strings.OrganizationMenuDescriptionLabel,
                target: item.name
            };
        });
        if (myself) {
            // Insert user at the very 1st position
            options.splice(0, 0, {
                label: `${myself.displayName}`,
                description: Strings.UserMenuDescriptionLabel,
                target: myself.userName
            });
        }
        return options;
    }
}
