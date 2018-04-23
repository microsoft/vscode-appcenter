import * as vscode from "vscode";
import { AuthProvider } from "../../../constants";
import { VstsLoginInfo, VstsProfile } from "../../../helpers/interfaces";
import { VsCodeUtils } from "../../../helpers/vsCodeUtils";
import { Strings } from "../../../strings";
import { VSTSProvider } from "../../../vsts/vstsProvider";
import Auth from "../../auth/auth";
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
        return this.vstsAuth.doLogin(loginInfo).then(async (profile: VstsProfile) => {
            if (!profile) {
                this.logger.error("Failed to fetch user info from server");
                VsCodeUtils.ShowWarningMessage(Strings.FailedToExecuteLoginMsg(AuthProvider.Vsts));
                return false;
            }

            const tenantName: string = profile.tenantName; //"msmobilecenter";

            const accessToken: string = await Auth.accessTokenFor(profile);

            const userName: string = profile.userName;
            const vsts = new VSTSProvider({
                tenantName: tenantName,
                accessToken: accessToken,
                userName: userName
            }, this.logger);
            const isValid: boolean = await vsts.TestVstsConnection();
            if (!isValid) {
                VsCodeUtils.ShowErrorMessage(Strings.VstsCredsNotValidMsg);
                this.vstsAuth.doLogout(profile.userId);
                return false;
            } else {
                VsCodeUtils.ShowInfoMessage(Strings.YouAreLoggedInMsg(AuthProvider.Vsts, profile.displayName));
            }
            return true;
        }).catch((e: Error) => {
            VsCodeUtils.ShowErrorMessage("Could not login into account");
            this.logger.error(e.message, e, true);
            return false;
        });
    }
}
