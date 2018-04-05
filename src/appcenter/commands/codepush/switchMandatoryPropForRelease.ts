import { AppCenterOS } from "../../../constants";
import { ExtensionManager } from "../../../extensionManager";
import { CurrentApp } from "../../../helpers/interfaces";
import { VsCodeUtils } from "../../../helpers/vsCodeUtils";
import { ILogger } from "../../../log/logHelper";
import { Strings } from "../../../strings";
import { RNCPAppCommand } from "./rncpAppCommand";

export default class SwitchMandatoryPropForRelease extends RNCPAppCommand {
    constructor(manager: ExtensionManager, logger: ILogger) {
        super(manager, logger);
    }

    public async runNoClient(): Promise<void> {
        if (!await super.runNoClient()) {
            return;
        }

        this.getCurrentApp().then((app: CurrentApp) => {
            if (!app) {
                VsCodeUtils.ShowInfoMessage(Strings.NoCurrentAppSetMsg);
                return;
            }
            const newMandatoryValue = !!!app.isMandatory;
            this.saveCurrentApp(
                app.identifier,
                AppCenterOS[app.os],
                {
                    currentDeploymentName: app.currentAppDeployments.currentDeploymentName,
                    codePushDeployments: app.currentAppDeployments.codePushDeployments
                },
                app.targetBinaryVersion,
                app.type,
                newMandatoryValue
            ).then(() => {
                VsCodeUtils.ShowInfoMessage(`Changed release to ${newMandatoryValue ? "Mandatory" : "NOT Mandatory"}`);
            });
        });
    }
}
