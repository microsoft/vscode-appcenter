import { CommandParams, Profile } from "../../../helpers/interfaces";
import { AuthProvider } from "../../resources/constants";
import { Strings } from "../../resources/strings";
import { Command } from "../command";
import { VsCodeUI } from "../../ui/vscodeUI";

export default class WhoAmI extends Command {

    constructor(params: CommandParams) {
        super(params);
    }

    public async runNoClient(): Promise<void> {
        super.runNoClient();
        const profile: Profile | null = await this.appCenterProfile;
        if (profile) {
            VsCodeUI.ShowInfoMessage(Strings.YouAreLoggedInMsg(AuthProvider.AppCenter, profile.displayName));
        } else {
            VsCodeUI.ShowInfoMessage(Strings.UserIsNotLoggedInMsg);
        }
    }
}
