import { ExtensionManager } from "../../extensionManager";
import { Profile } from "../../helpers/interfaces";
import { Strings } from "../../helpers/strings";
import { VsCodeUtils } from "../../helpers/vsCodeUtils";
import { ILogger } from "../../log/logHelper";
import Auth from "../auth/auth";
import { Command } from "./command";

export default class WhoAmI extends Command {

    constructor(manager: ExtensionManager, logger: ILogger) {
        super(manager, logger);
    }

    public async runNoClient(): Promise<void> {
        super.runNoClient();

        return Auth.getProfile(<string>this.manager.projectRootPath).then((profile: Profile | null) => {
            if (profile && profile.displayName) {
                VsCodeUtils.ShowInfoMessage(Strings.YouAreLoggedInMsg(profile.displayName));
            } else {
                VsCodeUtils.ShowInfoMessage(Strings.UserIsNotLoggedInMsg);
            }
            return Promise.resolve(void 0);
        });
    }
}
