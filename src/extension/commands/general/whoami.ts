import { CommandParams, Profile } from "../../../helpers/interfaces";
import { AuthProvider } from "../../resources/constants";
import { Command } from "../command";
import { VsCodeUI } from "../../ui/vscodeUI";
import { Messages } from "../../resources/messages";

export default class WhoAmI extends Command {

    constructor(params: CommandParams) {
        super(params);
    }

    public async runNoClient(): Promise<void> {
        super.runNoClient();
        const profile: Profile | null = await this.appCenterProfile;
        if (profile) {
            VsCodeUI.ShowInfoMessage(Messages.YouAreLoggedInMessage(AuthProvider.AppCenter, profile.displayName));
        } else {
            VsCodeUI.ShowWarningMessage(Messages.UserIsNotLoggedInWarning);
        }
    }
}
