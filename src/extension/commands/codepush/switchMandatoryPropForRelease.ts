
import { CommandParams, CurrentApp } from "../../../helpers/interfaces";
import { AppCenterOS } from "../../resources/constants";
import { Strings } from "../../resources/strings";
import { RNCPAppCommand } from "./rncpAppCommand";
import { VsCodeUI } from "../../ui/vscodeUI";

export default class SwitchMandatoryPropForRelease extends RNCPAppCommand {
    constructor(params: CommandParams) {
        super(params);
    }

    public async run(): Promise<void> {
        if (!await super.run()) {
            return;
        }

        const app: CurrentApp = await this.getCurrentApp(true);
        if (!app) {
            VsCodeUI.ShowWarningMessage(Strings.NoCurrentAppSetMsg);
            return;
        }
        if (!this.hasCodePushDeployments(app)) {
            VsCodeUI.ShowWarningMessage(Strings.NoDeploymentsMsg);
            return;
        }
        const newMandatoryValue = !!!app.isMandatory;
        return this.saveCurrentApp(
            app.identifier,
            AppCenterOS[app.os],
            {
                currentDeploymentName: app.currentAppDeployments.currentDeploymentName,
                codePushDeployments: app.currentAppDeployments.codePushDeployments
            },
            app.targetBinaryVersion,
            app.type,
            newMandatoryValue,
            app.appSecret
        ).then(() => {
            VsCodeUI.ShowInfoMessage(`Changed release to ${newMandatoryValue ? "Mandatory" : "NOT Mandatory"}`);
        });
    }
}
