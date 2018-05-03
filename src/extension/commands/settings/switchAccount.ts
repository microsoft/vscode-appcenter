import * as vscode from 'vscode';
import { Profile, ProfileQuickPickItem } from '../../../helpers/interfaces';
import { VsCodeUtils } from '../../../helpers/utils/vsCodeUtils';
import { AuthProvider } from '../../resources/constants';
import { Strings } from '../../resources/strings';
import { Command } from '../command';

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

        return await vscode.window.showQuickPick(menuOptions, { placeHolder: Strings.SelectProfileTitlePlaceholder })
            .then((selected: ProfileQuickPickItem) => {
                if (!selected) {
                    // User cancel selection
                    return true;
                }
                return this.switchActiveProfile(selected.profile);
            }, this.handleError);
    }

    private async switchActiveProfile(selectedProfile: Profile): Promise<boolean> {
        try {

            selectedProfile.isActive = true;
            await this.appCenterAuth.updateProfile(selectedProfile);

            VsCodeUtils.ShowInfoMessage(Strings.UserSwitchedMsg(AuthProvider.AppCenter, selectedProfile.userName));
            await this.manager.setupAppCenterStatusBar(selectedProfile);
        } catch (e) {
            this.handleError(e);
            return false;
        }
        return true;
    }

    private handleError(error: Error) {
        VsCodeUtils.ShowErrorMessage("Error occured during the switching accounts.");
        this.logger.error(error.message, error, true);
    }
}
