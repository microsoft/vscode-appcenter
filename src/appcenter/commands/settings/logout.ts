import { ExtensionManager } from "../../../extensionManager";
import { Strings } from "../../../helpers/strings";
import { VsCodeUtils } from "../../../helpers/vsCodeUtils";
import { ILogger } from "../../../log/logHelper";
import Auth from "../../auth/auth";
import { Command } from "../command";

export default class Logout extends Command {

    constructor(manager: ExtensionManager, logger: ILogger) {
        super(manager, logger);
    }

    public async runNoClient(): Promise<void> {
        await super.runNoClient();

        return Auth.doLogout().then(() => {
            VsCodeUtils.ShowInfoMessage(Strings.UserLoggedOutMsg);
            return this.manager.setupAppCenterStatusBar(null);
        }).catch(() => {
            this.logger.error("Sorry, An error occured on logout");
        });
    }
}
