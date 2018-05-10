import { AppCenterUrlBuilder } from "../../helpers/appCenterUrlBuilder";
import { CommandParams, MenuQuickPickItem, CurrentApp } from "../../helpers/interfaces";
import { SettingsHelper } from "../../helpers/settingsHelper";
import { Utils } from "../../helpers/utils/utils";
import * as CodePush from "../commands/codepush";
import { SimulateCrashes } from "../commands/general";
import * as Test from "../commands/test";
import { AppCenterBeacons, AppCenterCrashesTabs, AppCenterDistributionTabs,  AppCenterAppType } from "../resources/constants";
import { Menu, MenuItems } from "./menu";
import { VsCodeUI } from "../ui/vscodeUI";

export class AppCenterPortalMenu extends Menu {
    private isOrg: boolean;
    constructor(private app: CurrentApp, params: CommandParams) {
        super(params);
        this.isOrg = app.type.toLowerCase() === AppCenterAppType.Org.toLowerCase();
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

    protected async handleMenuSelection(menuItem: MenuQuickPickItem): Promise<void> {
        switch (menuItem.command) {
            case (AppCenterBeacons.Build):
                Utils.OpenUrl(AppCenterUrlBuilder.GetAppCenterLinkByBeacon(this.app.ownerName, this.app.appName, AppCenterBeacons.Build, this.isOrg));
                break;
            case (AppCenterBeacons.Distribute):
                const selected: MenuQuickPickItem = await VsCodeUI.showQuickPick(this.getAppCenterDistributeTabMenuItems());
                if (!selected) {
                    return;
                }
                switch (selected.command) {
                    case (AppCenterDistributionTabs.Groups):
                        Utils.OpenUrl(AppCenterUrlBuilder.GetAppCenterDistributeTabLinkByTabName(this.app.ownerName, this.app.appName, AppCenterDistributionTabs.Groups, this.isOrg));
                        break;
                    case (AppCenterDistributionTabs.Stores):
                        Utils.OpenUrl(AppCenterUrlBuilder.GetAppCenterDistributeTabLinkByTabName(this.app.ownerName, this.app.appName, AppCenterDistributionTabs.Stores, this.isOrg));
                        break;
                    case (AppCenterDistributionTabs.Releases):
                        Utils.OpenUrl(AppCenterUrlBuilder.GetAppCenterDistributeTabLinkByTabName(this.app.ownerName, this.app.appName, AppCenterDistributionTabs.Releases, this.isOrg));
                        break;
                    default:
                        break;
                }
                break;
            case (AppCenterBeacons.Crashes):
                const selectedCrash: MenuQuickPickItem = await VsCodeUI.showQuickPick(this.getAppCenterCrashesTabMenuItems());
                if (!selectedCrash) {
                    return;
                }
                switch (selectedCrash.command) {
                    case (AppCenterBeacons.Crashes):
                        Utils.OpenUrl(AppCenterUrlBuilder.GetAppCenterLinkByBeacon(this.app.ownerName, this.app.appName, AppCenterBeacons.Crashes, this.isOrg));
                        break;
                    case (AppCenterCrashesTabs.Simulate):
                        new SimulateCrashes(this._params, this.app).run();
                    default:
                        break;
                }
                break;
            case (AppCenterBeacons.Analytics):
                Utils.OpenUrl(AppCenterUrlBuilder.GetAppCenterLinkByBeacon(this.app.ownerName, this.app.appName, AppCenterBeacons.Analytics, this.isOrg));
                break;
            case (AppCenterBeacons.CodePush):
                new CodePush.ShowMenu(this._params, this.app).run();
                break;
            case (AppCenterBeacons.Test):
                new Test.ShowMenu(this._params, this.app).runNoClient();
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
