import { SettingsHelper } from '../../../helpers/settingsHelper';
import { Command } from '../command';
import { VsCodeUI } from '../../ui/vscodeUI';
import { Messages } from '../../resources/messages';

export default class ToggleStatusBar extends Command {

    public async runNoClient(): Promise<boolean | void> {
        if (!await super.runNoClient()) {
            return false;
        }

        if (SettingsHelper.shouldStatusBarBeShown()) {
            SettingsHelper.setHideStatusBar();
            this.manager.hideStatusBar();
            VsCodeUI.ShowInfoMessage(Messages.StatusBarHiddenMessage);
        } else {
            SettingsHelper.setShowStatusBar();
            this.manager.showStatusBar();
            VsCodeUI.ShowInfoMessage(Messages.StatusBarShownMessage);
        }
    }
}
