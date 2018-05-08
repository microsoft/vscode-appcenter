import { SettingsHelper } from '../../../helpers/settingsHelper';
import { Strings } from '../../resources/strings';
import { Command } from '../command';
import { VsCodeUI } from '../../ui/vscodeUI';

export default class ToggleStatusBar extends Command {

    public async runNoClient(): Promise<boolean | void> {
        if (!await super.runNoClient()) {
            return false;
        }

        if (SettingsHelper.shouldStatusBarBeShown()) {
            SettingsHelper.setHideStatusBar();
            this.manager.hideStatusBar();
            VsCodeUI.ShowInfoMessage(Strings.StatusBarHidden);
        } else {
            SettingsHelper.setShowStatusBar();
            this.manager.showStatusBar();
            VsCodeUI.ShowInfoMessage(Strings.StatusBarShown);
        }
    }
}
