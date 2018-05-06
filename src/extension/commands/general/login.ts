import * as os from "os";
import * as qs from "qs";
import * as vscode from "vscode";
import { CommandParams, Profile } from "../../../helpers/interfaces";
import { SettingsHelper } from "../../../helpers/settingsHelper";
import { AuthProvider } from "../../resources/constants";
import { Strings } from "../../resources/strings";
import { Command } from "../command";
import { IButtonMessageItem, VsCodeUI } from "../../ui/vscodeUI";

export default class Login extends Command {

    constructor(params: CommandParams) {
        super(params);
    }

    public async runNoClient(): Promise<boolean | void> {
        if (! await super.runNoClient()) {
            return false;
        }

        const messageItems: IButtonMessageItem[] = [];
        const loginUrl = `${SettingsHelper.getAppCenterLoginEndpoint()}?${qs.stringify({ hostname: os.hostname() })}`;
        messageItems.push({
            title: Strings.OkBtnLabel,
            url: loginUrl
        });

        return VsCodeUI.ShowInfoMessage(Strings.PleaseLoginViaBrowser, ...messageItems)
            .then((selection: IButtonMessageItem | undefined) => {
                if (selection) {
                    return vscode.window.showInputBox({ prompt: Strings.PleaseProvideToken, ignoreFocusOut: true })
                        .then(token => {
                            this.loginWithToken(token);
                        });
                } else { return void 0; }
            });
    }

    private async loginWithToken(token: string | undefined): Promise<boolean> {
        if (!token) {
            this.logger.info("No token provided on login");
            return true;
        }

        return this.appCenterAuth.doLogin({ token: token }).then((profile: Profile) => {
            if (!profile) {
                this.logger.error("Failed to fetch user info from server");
                VsCodeUI.ShowWarningMessage(Strings.FailedToExecuteLoginMsg(AuthProvider.AppCenter));
                return false;
            }
            VsCodeUI.ShowInfoMessage(Strings.YouAreLoggedInMsg(AuthProvider.AppCenter, profile.displayName));
            return this.manager.setupAppCenterStatusBar(profile).then(() => true);
        }).catch((e: Error) => {
            VsCodeUI.ShowErrorMessage("Could not login into account.");
            this.logger.error(e.message, e, true);
            return false;
        });
    }
}
