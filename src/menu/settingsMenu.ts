import * as Settings from "../appcenter/commands/settings";
import { CommandNames } from "../constants";
import { CommandParams, MenuItem } from "../helpers/interfaces";
import { SettingsHelper } from "../helpers/settingsHelper";
import { ILogger } from "../log/logHelper";
import { Menu, MenuItems } from "./menu";

export class SettingsMenu extends Menu {

    constructor(private appCenterProfilesCount: number, private vstsProfilesCount: number, rootPath: string, logger: ILogger, params: CommandParams) {
        super(rootPath, logger, params);
    }

    protected getMenuItems(): MenuItem[] {
        const menuItems: MenuItem[] = [];
        if (this.appCenterProfilesCount > 1) {
            menuItems.push(MenuItems.SwitchAccount);
        }

        menuItems.push(MenuItems.LoginToAnother);

        if (this.vstsProfilesCount > 1) {
            menuItems.push(MenuItems.SwitchVstsAccount);
        }

        menuItems.push(MenuItems.LoginToAnotherVsts);

        if (SettingsHelper.shouldStatusBarBeShown()) {
            menuItems.push(MenuItems.HideStatusBar);
        }
        return menuItems;
    }

    protected handleMenuSelection(menuItem: MenuItem): Promise<void> {
        switch (menuItem.command) {
            case (CommandNames.Settings.SwitchAccount):
                new Settings.SwitchAccount(this._params).runNoClient();
                break;

            case (CommandNames.Settings.LoginToAnotherAccount):
                new Settings.LoginToAnotherAccount(this._params).run();
                break;

            case (CommandNames.Settings.Logout):
                new Settings.Logout(this._params).runNoClient();
                break;

            case (CommandNames.Settings.LoginVsts):
                new Settings.LoginToVsts(this._params).runNoClient();
                break;

            case (CommandNames.Settings.SwitchAccountVsts):
                new Settings.SwitchVstsAccount(this._params).runNoClient();
                break;

            case (CommandNames.Settings.LogoutVsts):
                new Settings.LogoutVsts(this._params).runNoClient();
                break;

            case (CommandNames.Settings.HideStatusBar):
                new Settings.ToggleStatusBar(this._params).runNoClient();
                break;

            default:
                // Ideally shouldn't be there :)
                this.logger.error("Unknown App Center menu command");
                break;
        }
        return void 0;
    }
}
