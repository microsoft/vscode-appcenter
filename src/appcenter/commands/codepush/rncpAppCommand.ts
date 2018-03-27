import { Utils } from "../../../helpers/utils";
import { ReactNativeAppCommand } from "../reactNativeAppCommand";

export class RNCPAppCommand extends ReactNativeAppCommand {
    public async runNoClient(): Promise<boolean | void> {
        if (!await super.runNoClient()) {
            return false;
        }
        if (!Utils.isReactNativeCodePushProject(this.manager.projectRootPath, true)) {
            return false;
        }
        return true;
    }

    public async run(): Promise<boolean | void> {
        if (!await super.run()) {
            return false;
        }
        if (!Utils.isReactNativeCodePushProject(this.manager.projectRootPath, true)) {
            return false;
        }
        return true;
    }
}
