import { ExtensionManager } from "../../extensionManager";
import { Profile } from "../../helpers/interfaces";
import { Strings } from "../../helpers/strings";
import { VsCodeUtils } from "../../helpers/vsCodeUtils";
import { ILogger } from "../../log/logHelper";
import { Command } from "./command";

export default class WhoAmI extends Command {

    constructor(manager: ExtensionManager, logger: ILogger) {
        super(manager, logger);
    }

    public async runNoClient(): Promise<void> {
        super.runNoClient();
        const profile: Profile | null = await this.Profile;
        if (profile) {
            VsCodeUtils.ShowInfoMessage(Strings.YouAreLoggedInMsg(profile.displayName));
        } else {
            VsCodeUtils.ShowInfoMessage(Strings.UserIsNotLoggedInMsg);
        }
    }
}