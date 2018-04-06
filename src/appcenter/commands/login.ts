import * as os from "os";
import * as qs from "qs";
import * as vscode from "vscode";
import { AppCenterLoginType } from "../../constants";
import { ExtensionManager } from "../../extensionManager";
import { Profile } from "../../helpers/interfaces";
import { SettingsHelper } from "../../helpers/settingsHelper";
import { IButtonMessageItem, VsCodeUtils } from "../../helpers/vsCodeUtils";
import { ILogger } from "../../log/logHelper";
import { Strings } from "../../strings";
import { Command } from "./command";

export default class Login extends Command {

    constructor(manager: ExtensionManager, logger: ILogger) {
        super(manager, logger);
    }

    public async runNoClient(): Promise<boolean | void> {

        if (! await super.runNoClient()) {
            return false;
        }
        const appCenterLoginOptions: string[] = Object.keys(AppCenterLoginType)
            .filter(k => typeof AppCenterLoginType[k as any] === "number");

        return vscode.window.showQuickPick(appCenterLoginOptions, { placeHolder: Strings.SelectLoginTypeMsg })
            .then((loginType) => {
                switch (loginType) {
                    case (AppCenterLoginType[AppCenterLoginType.Interactive]):
                        const messageItems: IButtonMessageItem[] = [];
                        const loginUrl = `${SettingsHelper.getAppCenterLoginEndpoint()}?${qs.stringify({ hostname: os.hostname() })}`;
                        messageItems.push({
                            title: Strings.OkBtnLabel,
                            url: loginUrl
                        });

                        return VsCodeUtils.ShowInfoMessage(Strings.PleaseLoginViaBrowser, ...messageItems)
                            .then((selection: IButtonMessageItem | undefined) => {
                                if (selection) {
                                    return vscode.window.showInputBox({ prompt: Strings.PleaseProvideToken, ignoreFocusOut: true })
                                        .then(token => {
                                            return this.loginWithToken(token);
                                        });
                                } else {
                                    return true;
                                }
                            });
                    case (AppCenterLoginType[AppCenterLoginType.Token]):
                        return vscode.window.showInputBox({ prompt: Strings.PleaseProvideToken, ignoreFocusOut: true })
                            .then(token => {
                                return this.loginWithToken(token);
                            });
                    default:
                        // User cancel login otherwise
                        this.logger.info("User cancel login");
                        return true;
                }
            });
    }

    private async loginWithToken(token: string | undefined): Promise<boolean> {
        if (!token) {
            this.logger.info("No token provided on login");
            return true;
        }

        return this.manager.auth.doTokenLogin(token).then((profile: Profile) => {
            if (!profile) {
                this.logger.error("Failed to fetch user info from server");
                VsCodeUtils.ShowWarningMessage(Strings.FailedToExecuteLoginMsg);
                return false;
            }
            VsCodeUtils.ShowInfoMessage(Strings.YouAreLoggedInMsg(profile.displayName));
            return this.manager.setupAppCenterStatusBar(profile).then(() => true);
        }).catch((e: Error) => {
            VsCodeUtils.ShowErrorMessage("Could not login into account.");
            this.logger.error(e.message, e, true);
            return false;
        });
    }
}
