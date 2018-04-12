import * as vscode from 'vscode';
import { AuthProvider } from '../../../constants';
import { CommandParams, Profile, ProfileQuickPickItem } from '../../../helpers/interfaces';
import { VsCodeUtils } from '../../../helpers/vsCodeUtils';
import { Strings } from '../../../strings';
import { Command } from '../command';

export default class Logout extends Command {

    constructor(params: CommandParams) {
        super(params);
    }

    public async runNoClient(): Promise<boolean | void> {
        if (!await super.runNoClient()) {
            return false;
        }

        // Get profiles in which user is logged in
        const profiles: Profile[] = await this.vstsAuth.getProfiles();

        // No profiles - exit
        if (profiles.length === 0) {
            return true;
        }

        // One profile - log out from it
        if (profiles.length === 1) {
            return await this.logoutUser(profiles[0]);
        }

        // Two or more users - choose from which one user should be logged out
        const menuOptions: ProfileQuickPickItem[] = [];
        profiles.forEach(profile => {
            menuOptions.push(<ProfileQuickPickItem>{
                label: profile.userName,
                description: "",
                profile: profile
            });
        });

        return await vscode.window.showQuickPick(menuOptions, { placeHolder: Strings.SelectProfileTitlePlaceholder })
            .then((selected: ProfileQuickPickItem) => {
                if (!selected) {
                    // User cancel selection
                    return void 0;
                }
                return this.logoutUser(selected.profile);
            }, this.handleError);
    }

    private async logoutUser(profile: Profile): Promise<boolean> {
        try {
            await this.vstsAuth.doLogout(profile.userId);
            VsCodeUtils.ShowInfoMessage(Strings.UserLoggedOutMsg(AuthProvider.Vsts, profile.userName));
            return true;
        } catch (e) {
            this.handleError(e);
            return false;
        }
    }

    private handleError(error: Error) {
        VsCodeUtils.ShowErrorMessage("Error occured during the logout.");
        this.logger.error(error.message, error, true);
    }
}
