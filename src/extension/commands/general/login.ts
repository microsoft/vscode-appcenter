import * as os from "os";
import * as qs from "qs";
import { CommandParams, Profile } from "../../../helpers/interfaces";
import { SettingsHelper } from "../../../helpers/settingsHelper";
import { AuthProvider } from "../../resources/constants";
import { Strings } from "../../resources/strings";
import { Command } from "../command";
import { IButtonMessageItem, VsCodeUI } from "../../ui/vscodeUI";
import { Messages } from "../../resources/messages";
import { LogStrings } from "../../resources/logStrings";

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

        const selection: IButtonMessageItem | undefined = await VsCodeUI.ShowInfoMessage(Messages.PleaseLoginViaBrowserMessage, ...messageItems);
        if (selection) {
            const token: string = await VsCodeUI.showInput(Strings.PleaseProvideTokenHint);
            this.loginWithToken(token);
            return true;
        } else {
            return void 0;
        }
    }

    private async loginWithToken(token: string | undefined): Promise<boolean> {
        if (!token) {
            this.logger.info(LogStrings.NoTokenProvided);
            return true;
        }
        try {
            const profile: Profile = await this.appCenterAuth.doLogin({ token: token });
            if (!profile) {
                this.logger.error(LogStrings.FailedToGetUserFromServer);
                VsCodeUI.ShowErrorMessage(Messages.FailedToExecuteLoginMsg(AuthProvider.AppCenter));
                return false;
            }
            VsCodeUI.ShowInfoMessage(Messages.YouAreLoggedInMessage(AuthProvider.AppCenter, profile.displayName));
            await this.manager.setupAppCenterStatusBar(profile);
            return true;
        } catch (e) {
            VsCodeUI.ShowErrorMessage(Messages.FailedToLogin);
            this.logger.error(e.message, e, true);
            return false;
        }
    }
}
