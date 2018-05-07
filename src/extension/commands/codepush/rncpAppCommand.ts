import { CurrentApp } from "../../../helpers/interfaces";
import { Utils } from "../../../helpers/utils/utils";
import { ReactNativeAppCommand } from "../reactNativeAppCommand";
import { VsCodeUI } from "../../ui/vscodeUI";
import { Messages } from "../../resources/messages";

export class RNCPAppCommand extends ReactNativeAppCommand {
    protected checkForCodePush: boolean = true;

    public async runNoClient(): Promise<boolean | void> {
        if (!await super.runNoClient()) {
            return false;
        }
        if (this.checkForCodePush && !Utils.isReactNativeCodePushProject(this.logger, this.rootPath, true)) {
            VsCodeUI.ShowWarningMessage(Messages.NotCodePushProjectWarning);
            return false;
        }
        return true;
    }

    public async run(): Promise<boolean | void> {
        if (!await super.run()) {
            return false;
        }
        if (this.checkForCodePush && !Utils.isReactNativeCodePushProject(this.logger, this.rootPath, true)) {
            VsCodeUI.ShowWarningMessage(Messages.NotCodePushProjectWarning);
            return false;
        }
        return true;
    }

    protected hasCodePushDeployments(currentApp: CurrentApp): boolean {
        return currentApp.currentAppDeployments && currentApp.currentAppDeployments.codePushDeployments && currentApp.currentAppDeployments.codePushDeployments.length > 0;
    }
}
