import AppCenterAuth from "../../auth/appCenterAuth";
import VstsAuth from "../../auth/vstsAuth";
import { CommandParams } from "../../helpers/interfaces";
import { ExtensionManager } from "../extensionManager";
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
