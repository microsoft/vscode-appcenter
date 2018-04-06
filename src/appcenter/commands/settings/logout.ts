import { AppCenterCache } from "../../../cache/cache";
import { createAppCenterCache } from "../../../cache/cacheFactory";
import { ExtensionManager } from "../../../extensionManager";
import { VsCodeUtils } from "../../../helpers/vsCodeUtils";
import { ILogger } from "../../../log/logHelper";
import { Strings } from "../../../strings";
import { AppCenterClient, models } from "../../api";
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
            const appsCache: AppCenterCache<models.AppResponse, AppCenterClient> = createAppCenterCache().getAppsCache();
            appsCache.invalidateCache();
            return this.manager.setupAppCenterStatusBar(null);
        }).catch(() => {
            this.logger.error("Sorry, An error occured on logout");
        });
    }
}
