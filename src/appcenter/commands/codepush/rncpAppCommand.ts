import { Utils } from "../../../helpers/utils";
import { ReactNativeAppCommand } from "../reactNativeAppCommand";
import { CurrentApp } from "../../../helpers/interfaces";

export class RNCPAppCommand extends ReactNativeAppCommand {
    public async runNoClient(): Promise<boolean | void> {
        if (!await super.runNoClient()) {
            return false;
        }
        if (!Utils.isReactNativeCodePushProject(this.rootPath, true)) {
            return false;
        }
        return true;
    }

    public async run(): Promise<boolean | void> {
        if (!await super.run()) {
            return false;
        }
        if (!Utils.isReactNativeCodePushProject(this.rootPath, true)) {
            return false;
        }
        return true;
    }

    protected hasCodePushDeployments(currentApp: CurrentApp): boolean {
        return currentApp.currentAppDeployments && currentApp.currentAppDeployments.codePushDeployments && currentApp.currentAppDeployments.codePushDeployments.length > 0;
    }
}
