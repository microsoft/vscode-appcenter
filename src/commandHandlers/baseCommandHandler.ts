import AppCenterAuth from "../appcenter/auth/appCenterAuth";
import VstsAuth from "../appcenter/auth/vstsAuth";
import { ExtensionManager } from "../extensionManager";
import { CommandParams } from "../helpers/interfaces";
import { ConsoleLogger } from "../log/consoleLogger";
import { ILogger } from "../log/logHelper";

export default abstract class BaseCommandHandler {

    constructor(
        private manager: ExtensionManager,
        private logger: ILogger = new ConsoleLogger(),
        private appCenterAuth: AppCenterAuth,
        private vstsAuth: VstsAuth) { }

    protected getCommandParams(): CommandParams {
        return {
            manager: this.manager,
            logger: this.logger,
            appCenterAuth: this.appCenterAuth,
            vstsAuth: this.vstsAuth
        };
    }
}
