import { AuthProvider } from "../../constants";
import { CommandParams, Profile } from "../../helpers/interfaces";
import { VsCodeUtils } from "../../helpers/vsCodeUtils";
import { Strings } from "../../strings";
import { Command } from "./command";

export default class WhoAmI extends Command {

    constructor(params: CommandParams) {
        super(params);
    }

    public async runNoClient(): Promise<void> {
        super.runNoClient();
        const profile: Profile | null = await this.appCenterProfile;
        if (profile) {
            VsCodeUtils.ShowInfoMessage(Strings.YouAreLoggedInMsg(AuthProvider.AppCenter, profile.displayName));
        } else {
            VsCodeUtils.ShowInfoMessage(Strings.UserIsNotLoggedInMsg);
        }
    }
}
