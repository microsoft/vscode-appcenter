import { SettingsHelper } from "../../helpers/settingsHelper";
import * as Settings from "../commands/settings";
import BaseCommandHandler from "./baseCommandHandler";
import { VsCodeUI } from "../ui/vscodeUI";
import { Messages } from "../resources/messages";

export default class SettingsCommandHandler extends BaseCommandHandler {
    public async ShowMenu(): Promise<void> {
        await new Settings.ShowMenu(this.getCommandParams()).run();
    }

    public async LoginToAnotherAccount(): Promise<void> {
        await new Settings.LoginToAnotherAccount(this.getCommandParams()).run();
    }

    public async SwitchAccount(): Promise<void> {
        await new Settings.SwitchAccount(this.getCommandParams()).runNoClient();
    }

    public async Logout(): Promise<void> {
        await new Settings.Logout(this.getCommandParams()).runNoClient();
    }

    public async LoginToVsts(): Promise<void> {
        await new Settings.LoginToVsts(this.getCommandParams()).runNoClient();
    }

    public async LogoutVsts(): Promise<void> {
        await new Settings.LogoutVsts(this.getCommandParams()).runNoClient();
    }

    public async SwitchVstsAcc(): Promise<void> {
        await new Settings.SwitchVstsAccount(this.getCommandParams()).runNoClient();
    }

    public async ShowStatusBar(): Promise<void> {
        if (SettingsHelper.shouldStatusBarBeShown()) {
            VsCodeUI.ShowInfoMessage(Messages.StatusBarAlreadyShownMessage);
            return;
        }
        await new Settings.ToggleStatusBar(this.getCommandParams()).runNoClient();
    }

    public async HideStatusBar(): Promise<void> {
        if (!SettingsHelper.shouldStatusBarBeShown()) {
            VsCodeUI.ShowInfoMessage(Messages.StatusBarAlreadyHiddenMessage);
            return;
        }
        await new Settings.ToggleStatusBar(this.getCommandParams()).runNoClient();
    }
}
