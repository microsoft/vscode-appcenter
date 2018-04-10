import * as vscode from "vscode";
import { AuthProvider } from "../../../constants";
import { Profile, VstsLoginInfo } from "../../../helpers/interfaces";
import { VsCodeUtils } from "../../../helpers/vsCodeUtils";
import { Strings } from "../../../strings";
import { Command } from "../command";

export default class LoginToVsts extends Command {
    public async runNoClient(): Promise<boolean | void> {
        if (!await super.runNoClient()) {
            return false;
        }

        const loginInfo: VstsLoginInfo = {
            tenantName: "",
            userName: "",
            token: ""
        };
        let value;

        value = await vscode.window.showInputBox({ prompt: Strings.SpecifyTenantTitlePlaceholder, ignoreFocusOut: true });
        if (!value) {
            return true;
        }
        loginInfo.tenantName = value;

        value = await vscode.window.showInputBox({ prompt: Strings.SpecifyUserNameTitlePlaceholder, ignoreFocusOut: true });
        if (!value) {
            return true;
        }
        loginInfo.userName = value;

        value = await vscode.window.showInputBox({ prompt: Strings.SpecifyPATTitlePlaceholder, ignoreFocusOut: true });
        if (!value) {
            return true;
        }
        loginInfo.token = value;

        return await this.login(loginInfo);
    }

    private async login(loginInfo: VstsLoginInfo): Promise<boolean> {
        return this.vstsAuth.doLogin(loginInfo).then((profile: Profile) => {
            if (!profile) {
                this.logger.error("Failed to fetch user info from server");
                VsCodeUtils.ShowWarningMessage(Strings.FailedToExecuteLoginMsg(AuthProvider.Vsts));
                return false;
            }
            VsCodeUtils.ShowInfoMessage(Strings.YouAreLoggedInMsg(AuthProvider.Vsts, profile.displayName));
            return true;
        }).catch((e: Error) => {
            VsCodeUtils.ShowErrorMessage("Could not login into account");
            this.logger.error(e.message, e, true);
            return false;
        });
    }
}
