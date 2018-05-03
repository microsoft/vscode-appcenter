import * as vscode from "vscode";
import * as CodePush from "../appcenter/commands/codepush";
import SimulateCrashes from "../appcenter/commands/simulateCrashes";
import * as Test from "../appcenter/commands/test";
import { AppCenterBeacons, AppCenterCrashesTabs, AppCenterDistributionTabs, CommandNames } from "../constants";
import { AppCenterUrlBuilder } from "../helpers/appCenterUrlBuilder";
import { CommandParams, MenuQuickPickItem } from "../helpers/interfaces";
import { SettingsHelper } from "../helpers/settingsHelper";
import { Utils } from "../helpers/utils";
import { Strings } from "../strings";
import { Menu, MenuItems } from "./menu";

export class AppCenterPortalMenu extends Menu {

    constructor(private isOrg: boolean, private appName: string, private ownerName: string, params: CommandParams) {
        super(params);
    }

    protected getMenuItems(): MenuQuickPickItem[] {
        const menuItems: MenuQuickPickItem[] = [];
        menuItems.push(MenuItems.BuildTab);
        menuItems.push(MenuItems.TestTab);
        if (this.isRNproject()) {
            menuItems.push(MenuItems.CodePushTab);
        }
        menuItems.push(MenuItems.DistributeTab);
        menuItems.push(MenuItems.CrashesTab);
        menuItems.push(MenuItems.AnalyticsTab);

        return menuItems;
    }

    protected handleMenuSelection(menuItem: MenuQuickPickItem): Promise<void> {
        switch (menuItem.command) {
            case (AppCenterBeacons.Build):
                Utils.OpenUrl(AppCenterUrlBuilder.GetAppCenterLinkByBeacon(this.ownerName, this.appName, AppCenterBeacons.Build, this.isOrg));
                break;
            case (AppCenterBeacons.Distribute):
                vscode.window.showQuickPick(this.getAppCenterDistributeTabMenuItems(), { placeHolder: Strings.MenuTitlePlaceholder })
                    .then((selected: MenuQuickPickItem) => {
                        if (!selected) {
                            return;
                        }
                        switch (selected.command) {
                            case (AppCenterDistributionTabs.Groups):
                                Utils.OpenUrl(AppCenterUrlBuilder.GetAppCenterDistributeTabLinkByTabName(this.ownerName, this.appName, AppCenterDistributionTabs.Groups, this.isOrg));
                                break;
                            case (AppCenterDistributionTabs.Stores):
                                Utils.OpenUrl(AppCenterUrlBuilder.GetAppCenterDistributeTabLinkByTabName(this.ownerName, this.appName, AppCenterDistributionTabs.Stores, this.isOrg));
                                break;
                            case (AppCenterDistributionTabs.Releases):
                                Utils.OpenUrl(AppCenterUrlBuilder.GetAppCenterDistributeTabLinkByTabName(this.ownerName, this.appName, AppCenterDistributionTabs.Releases, this.isOrg));
                                break;
                            case (CommandNames.CodePush.ShowMenu):
                                new CodePush.ShowMenu(this._params).run();
                            default:
                                break;
                        }
                    });
                break;
            case (AppCenterBeacons.Crashes):
                vscode.window.showQuickPick(this.getAppCenterCrashesTabMenuItems(), { placeHolder: Strings.MenuTitlePlaceholder })
                    .then((selected: MenuQuickPickItem) => {
                        if (!selected) {
                            return;
                        }
                        switch (selected.command) {
                            case (AppCenterBeacons.Crashes):
                                Utils.OpenUrl(AppCenterUrlBuilder.GetAppCenterLinkByBeacon(this.ownerName, this.appName, AppCenterBeacons.Crashes, this.isOrg));
                                break;
                            case (AppCenterCrashesTabs.Simulate):
                                new SimulateCrashes(this._params).run();
                            default:
                                break;
                        }
                    });
                break;
            case (AppCenterBeacons.Analytics):
                Utils.OpenUrl(AppCenterUrlBuilder.GetAppCenterLinkByBeacon(this.ownerName, this.appName, AppCenterBeacons.Analytics, this.isOrg));
                break;
            case (AppCenterBeacons.CodePush):
                new CodePush.ShowMenu(this._params).run();
                break;
            case (AppCenterBeacons.Test):
                new Test.ShowMenu(this._params).runNoClient();
                break;
            default:
                break;
        }
        return void 0;
    }

    private getAppCenterDistributeTabMenuItems(): MenuQuickPickItem[] {
        const getAppCenterDistributeTabMenuItems: MenuQuickPickItem[] = [];
        getAppCenterDistributeTabMenuItems.push(MenuItems.DistributeGroupsTab);
        getAppCenterDistributeTabMenuItems.push(MenuItems.DistributeStoresTab);
        getAppCenterDistributeTabMenuItems.push(MenuItems.DistributeReleasesTab);
        return getAppCenterDistributeTabMenuItems;
    }

    private getAppCenterCrashesTabMenuItems(): MenuQuickPickItem[] {
        const getAppCenterCrashesTabMenuItems: MenuQuickPickItem[] = [];
        getAppCenterCrashesTabMenuItems.push(MenuItems.CrashesTab);
        if (SettingsHelper.isCrashesEnabled()) {
            getAppCenterCrashesTabMenuItems.push(MenuItems.SimulateCrashes);
        }
        return getAppCenterCrashesTabMenuItems;
    }
}
