import { CommandParams, CurrentApp, MenuQuickPickItem, Profile } from "../../helpers/interfaces";
import { SettingsHelper } from "../../helpers/settingsHelper";
import * as CodePush from "../commands/codePush";
import * as General from "../commands/general";
import * as Settings from "../commands/settings";
import * as Test from "../commands/test";
import { AppCenterBeacons, AppCenterCrashesTabs, CommandNames } from "../resources/constants";
import { Menu, MenuItems } from "./menu";

export class GeneralMenu extends Menu {

    constructor(private profile: Profile | undefined, params: CommandParams) {
        super(params);
    }

    protected getMenuItems(): MenuQuickPickItem[] {
        const menuItems: MenuQuickPickItem[] = [];
        if (!this.profile) {
            menuItems.push(MenuItems.Login);
            return menuItems;
        }

        let currentApp: CurrentApp | undefined;
        if (this.profile.currentApp) {
            currentApp = this.profile.currentApp;
        }

        // For empty directory show only `Start New Project`
        if (this.isEmptyDir()) {
            menuItems.push(MenuItems.StartAProject);
            menuItems.push(MenuItems.AppCenterPortal);
        } else {
            menuItems.push(MenuItems.AppCenterPortal);
            if (this.isRNproject() && currentApp) {
                menuItems.push(MenuItems.TestTab);
                menuItems.push(MenuItems.CodePushTab);

                if (SettingsHelper.isCrashesEnabled()) {
                    menuItems.push(MenuItems.SimulateCrashes);
                }
            }
        }

        if (!this.isEmptyDir() && this.isRNproject()) {
            menuItems.push(MenuItems.SetCurrentApp(currentApp));
            menuItems.push(MenuItems.InstallSDK);
        }

        menuItems.push(MenuItems.Settings);
        return menuItems;
    }

    protected handleMenuSelection(menuItem: MenuQuickPickItem): Promise<void> {
        switch (menuItem.command) {
            case (AppCenterBeacons.CodePush):
                new CodePush.ShowMenu(this._params).run();
                break;

            case (AppCenterBeacons.Test):
                new Test.ShowMenu(this._params).runNoClient();
                break;

            case (AppCenterCrashesTabs.Simulate):
                new General.SimulateCrashes(this._params).run();
                break;

            case (CommandNames.AppCenterPortal):
                new General.AppCenterPortal(this._params).run();
                break;

            case (CommandNames.Start):
                new General.Start(this._params).run();
                break;

            case (CommandNames.Login):
                new General.Login(this._params).run();
                break;

            case (CommandNames.SetCurrentApp):
                new General.SetCurrentApp(this._params).run();
                break;

            case (CommandNames.GetCurrentApp):
                new General.GetCurrentApp(this._params).runNoClient();
                break;

            case (CommandNames.Settings.ShowMenu):
                new Settings.ShowMenu(this._params).run();
                break;

            case (CommandNames.InstallSDK):
                new General.LinkAppCenter(this._params).run();
                break;

            default:
                // Ideally shouldn't be there :)
                this.logger.error("Unknown App Center menu command");
                break;
        }
        return void 0;
    }
}
