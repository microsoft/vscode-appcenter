import { VSTSProvider } from "../../../api/vsts/vstsProvider";
import Auth from "../../../auth/auth";
import { VstsLoginInfo, VstsProfile } from "../../../helpers/interfaces";
import { AuthProvider } from "../../resources/constants";
import { Strings } from "../../resources/strings";
import { Command } from "../command";
import { VsCodeUI } from "../../ui/vscodeUI";

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

        value = await VsCodeUI.showInput(Strings.SpecifyTenantTitlePlaceholder);
        if (!value) {
            return true;
        }
        loginInfo.tenantName = value;

        value = await VsCodeUI.showInput(Strings.SpecifyUserNameTitlePlaceholder);
        if (!value) {
            return true;
        }
        loginInfo.userName = value;

        value = await VsCodeUI.showInput(Strings.SpecifyPATTitlePlaceholder);
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
                VsCodeUI.ShowWarningMessage(Strings.FailedToExecuteLoginMsg(AuthProvider.Vsts));
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
                VsCodeUI.ShowErrorMessage(Strings.VstsCredsNotValidMsg);
                this.vstsAuth.doLogout(profile.userId);
                return false;
            } else {
                VsCodeUI.ShowInfoMessage(Strings.YouAreLoggedInMsg(AuthProvider.Vsts, profile.displayName));
            }
            return true;
        }).catch((e: Error) => {
            VsCodeUI.ShowErrorMessage("Could not login into account");
            this.logger.error(e.message, e, true);
            return false;
        });
    }
}
