import * as vscode from "vscode";
import { Command } from "../command";
import { VsCodeUtils } from "../../../helpers/vsCodeUtils";
import { Strings } from "../../../strings";
import { Profile, VstsLoginCredentials } from "../../../helpers/interfaces";
import { AuthProvider } from "../../../constants";
import { VSTSProvider } from "../../../vsts/vstsProvider";

export default class LoginToVsts extends Command {
    public async runNoClient(): Promise<boolean | void> {
        if (!await super.runNoClient()) {
            return false;
        }

        let loginCredentials: any = {};
        let value;

        value = await vscode.window.showInputBox({ prompt: Strings.SpecifyTenantTitlePlaceholder, ignoreFocusOut: true });
        if (!value) {
            return true;
        }
        loginCredentials.tenantName = value;

        value = await vscode.window.showInputBox({ prompt: Strings.SpecifyUserNameTitlePlaceholder, ignoreFocusOut: true });
        if (!value) {
            return true;
        }
        loginCredentials.userName = value;

        value = await vscode.window.showInputBox({ prompt: Strings.SpecifyPATTitlePlaceholder, ignoreFocusOut: true });
        if (!value) {
            return true;
        }
        const pat = value;
        loginCredentials.token = VSTSProvider.getGitAccessToken(loginCredentials.userName, pat);

        return await this.login(loginCredentials as VstsLoginCredentials);
    }

    private async login(loginCredentials: VstsLoginCredentials): Promise<boolean> {
        return this.manager.vstsAuth.doLogin(loginCredentials).then((profile: Profile) => {
            if (!profile) {
                this.logger.error("Failed to fetch user info from server");
                VsCodeUtils.ShowWarningMessage(Strings.FailedToExecuteLoginMsg(AuthProvider.Vsts));
                return false;
            }
            VsCodeUtils.ShowInfoMessage(Strings.YouAreLoggedInMsg(AuthProvider.Vsts, profile.displayName));
            return true;
        }).catch((e: Error) => {
            VsCodeUtils.ShowErrorMessage("Could not login into account.");
            this.logger.error(e.message, e, true);
            return false;
        });
    }
}
