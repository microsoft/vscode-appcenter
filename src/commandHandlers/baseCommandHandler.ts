import AppCenterAuth from "../appcenter/auth/appCenterAuth";
import VstsAuth from "../appcenter/auth/vstsAuth";
import { ExtensionManager } from "../extensionManager";
import { CommandParams } from "../helpers/interfaces";
export default abstract class BaseCommandHandler {

    constructor(
        private manager: ExtensionManager,
        private appCenterAuth: AppCenterAuth,
        private vstsAuth: VstsAuth) { }

    protected getCommandParams(): CommandParams {
        return {
            manager: this.manager,
            appCenterAuth: this.appCenterAuth,
            vstsAuth: this.vstsAuth
        };
    }
}
