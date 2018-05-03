import AppCenterPortal from "../appcenter/commands/appCenterPortal";
import * as CodePush from "../appcenter/commands/codePush";
import GetCurrentApp from "../appcenter/commands/getCurrentApp";
import LinkAppCenter from "../appcenter/commands/linkAppCenter";
import Login from "../appcenter/commands/login";
import SetCurrentApp from "../appcenter/commands/setCurrentApp";
import * as Settings from "../appcenter/commands/settings";
import SimulateCrashes from "../appcenter/commands/simulateCrashes";
import Start from "../appcenter/commands/start";
import * as Test from "../appcenter/commands/test";
import { AppCenterBeacons, AppCenterCrashesTabs, CommandNames } from "../constants";
import { CommandParams, CurrentApp, MenuQuickPickItem, Profile } from "../helpers/interfaces";
import { SettingsHelper } from "../helpers/settingsHelper";
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

        // For empty directory show only `Start New Idea`
        if (this.isEmptyDir()) {
            menuItems.push(MenuItems.StartAnIdea);
        } else {
            if (this.isRNproject() && currentApp) {
                menuItems.push(MenuItems.TestTab);
                if (this.isCodePushProject()) {
                    menuItems.push(MenuItems.CodePushTab);
                }
                if (SettingsHelper.isCrashesEnabled()) {
                    menuItems.push(MenuItems.SimulateCrashes);
                }
            }
        }

        menuItems.push(MenuItems.AppCenterPortal);

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
                new SimulateCrashes(this._params).run();
                break;

            case (CommandNames.AppCenterPortal):
                new AppCenterPortal(this._params).run();
                break;

            case (CommandNames.Start):
                new Start(this._params).run();
                break;

            case (CommandNames.Login):
                new Login(this._params).run();
                break;

            case (CommandNames.SetCurrentApp):
                new SetCurrentApp(this._params).run();
                break;

            case (CommandNames.GetCurrentApp):
                new GetCurrentApp(this._params).runNoClient();
                break;

            case (CommandNames.Settings.ShowMenu):
                new Settings.ShowMenu(this._params).run();
                break;

            case (CommandNames.InstallSDK):
                new LinkAppCenter(this._params).run();
                break;

            default:
                // Ideally shouldn't be there :)
                this.logger.error("Unknown App Center menu command");
                break;
        }
        return void 0;
    }
}
