import { Profile, ProfileQuickPickItem } from '../../../helpers/interfaces';
import { AuthProvider } from '../../resources/constants';
import { Strings } from '../../resources/strings';
import { Command } from '../command';
import { VsCodeUI } from '../../ui/vscodeUI';

export default class SwitchAccount extends Command {

    public async runNoClient(): Promise<boolean | void> {
        if (!await super.runNoClient()) {
            return false;
        }

        const profiles = await this.appCenterAuth.getProfiles();
        if (profiles.length < 2) {
            return true;
        }

        const menuOptions: ProfileQuickPickItem[] = [];
        profiles.forEach(profile => {
            if (!profile.isActive) {
                menuOptions.push(<ProfileQuickPickItem>{
                    label: profile.userName,
                    description: "",
                    profile: profile
                });
            }
        });

        try {
            const selected: ProfileQuickPickItem = await VsCodeUI.showQuickPick(menuOptions, Strings.SelectProfileTitlePlaceholder);
            if (!selected) {
                // User cancel selection
                return void 0;
            }
            return this.switchActiveProfile(selected.profile);
        } catch (error) {
            this.handleError(error);
        }
    }

    private async switchActiveProfile(selectedProfile: Profile): Promise<boolean> {
        try {

            selectedProfile.isActive = true;
            await this.appCenterAuth.updateProfile(selectedProfile);

            VsCodeUI.ShowInfoMessage(Strings.UserSwitchedMsg(AuthProvider.AppCenter, selectedProfile.userName));
            await this.manager.setupAppCenterStatusBar(selectedProfile);
        } catch (e) {
            this.handleError(e);
            return false;
        }
        return true;
    }

    private handleError(error: Error) {
        VsCodeUI.ShowErrorMessage("Error occured during the switching accounts.");
        this.logger.error(error.message, error, true);
    }
}
