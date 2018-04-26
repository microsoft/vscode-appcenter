import { CurrentApp } from "../../../helpers/interfaces";
import { Utils } from "../../../helpers/utils";
import { VsCodeUtils } from "../../../helpers/vsCodeUtils";
import { Strings } from "../../../strings";
import { ReactNativeAppCommand } from "../reactNativeAppCommand";

export class RNCPAppCommand extends ReactNativeAppCommand {
    protected checkForCodePush: boolean = true;

    public async runNoClient(): Promise<boolean | void> {
        if (!await super.runNoClient()) {
            return false;
        }
        if (this.checkForCodePush && !Utils.isReactNativeCodePushProject(this.logger, this.rootPath, true)) {
            VsCodeUtils.ShowWarningMessage(Strings.NotCodePushProjectMsg);
            return false;
        }
        return true;
    }

    public async run(): Promise<boolean | void> {
        if (!await super.run()) {
            return false;
        }
        if (this.checkForCodePush && !Utils.isReactNativeCodePushProject(this.logger, this.rootPath, true)) {
            VsCodeUtils.ShowWarningMessage(Strings.NotCodePushProjectMsg);
            return false;
        }
        return true;
    }

    protected hasCodePushDeployments(currentApp: CurrentApp): boolean {
        return currentApp.currentAppDeployments && currentApp.currentAppDeployments.codePushDeployments && currentApp.currentAppDeployments.codePushDeployments.length > 0;
    }
}
