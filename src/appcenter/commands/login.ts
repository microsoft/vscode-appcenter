import * as os from "os";
import * as qs from "qs";
import * as vscode from "vscode";
import { ExtensionManager } from "../../extensionManager";
import { AppCenterLoginType } from "../../helpers/constants";
import { Profile } from "../../helpers/interfaces";
import { SettingsHelper } from "../../helpers/settingsHelper";
import { Strings } from "../../helpers/strings";
import { IButtonMessageItem, VsCodeUtils } from "../../helpers/vsCodeUtils";
import { ILogger, LogLevel } from "../../log/logHelper";
import Auth from "../auth/auth";
import { Command } from "./command";

export default class Login extends Command {

    constructor(manager: ExtensionManager, logger: ILogger) {
        super(manager, logger);
    }

    public async runNoClient(): Promise<void> {
        super.runNoClient();
        const appCenterLoginOptions: string[] = Object.keys(AppCenterLoginType)
        .filter(k => typeof AppCenterLoginType[k as any] === "number");

        return vscode.window.showQuickPick(appCenterLoginOptions, { placeHolder: Strings.SelectLoginTypeMsg })
        .then((loginType) => {
            switch (loginType) {
                case (AppCenterLoginType[AppCenterLoginType.Interactive]):
                    const messageItems: IButtonMessageItem[] = [];
                    const loginUrl = `${SettingsHelper.getAppCenterLoginEndpoint()}?${qs.stringify({ hostname: os.hostname()})}`;
                    messageItems.push({ title : Strings.OkBtnLabel,
                                        url : loginUrl });

                    return VsCodeUtils.ShowInfoMessage(Strings.PleaseLoginViaBrowser, ...messageItems)
                    .then((selection: IButtonMessageItem | undefined) => {
                        if (selection) {
                            return vscode.window.showInputBox({ prompt: Strings.PleaseProvideToken, ignoreFocusOut: true })
                            .then(token => {
                                this.loginWithToken(token);
                            });
                        } else { return Promise.resolve(void 0); }
                    });
                case (AppCenterLoginType[AppCenterLoginType.Token]):
                    return vscode.window.showInputBox({ prompt: Strings.PleaseProvideToken , ignoreFocusOut: true})
                    .then(token => {
                        return this.loginWithToken(token);
                    });
                default:
                    // User canel login otherwise
                    this.logger.log("User cancel login", LogLevel.Info);
                    return Promise.resolve(void 0);
            }
        });
    }

    private loginWithToken(token: string | undefined) {
        if (!token) {
            this.logger.log("No token detected on login", LogLevel.Error);
            return;
        }

        return Auth.doTokenLogin(token, <string>this.manager.projectRootPath).then((profile: Profile) => {
            if (!profile) {
                this.logger.log("Failed to fetch user info from server", LogLevel.Error);
                VsCodeUtils.ShowWarningMessage(Strings.FailedToExecuteLoginMsg);
                return;
            }
            VsCodeUtils.ShowInfoMessage(Strings.YouAreLoggedInMsg(profile.displayName));
            return this.manager.setupAppCenterStatusBar(profile);
        });
    }
}
