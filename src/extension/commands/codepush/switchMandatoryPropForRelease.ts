
import { CommandParams, CurrentApp } from "../../../helpers/interfaces";
import { AppCenterOS } from "../../resources/constants";
import { RNCPAppCommand } from "./rncpAppCommand";
import { VsCodeUI } from "../../ui/vscodeUI";
import { Messages } from "../../resources/messages";

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
            VsCodeUI.ShowWarningMessage(Messages.NoCurrentAppSetWarning);
            return;
        }
        if (!this.hasCodePushDeployments(app)) {
            VsCodeUI.ShowWarningMessage(Messages.NoDeploymentsWarning);
            return;
        }
        const newMandatoryValue = !!!app.isMandatory;
        await this.saveCurrentApp(
            app.identifier,
            AppCenterOS[app.os],
            {
                currentDeploymentName: app.currentAppDeployments.currentDeploymentName,
                codePushDeployments: app.currentAppDeployments.codePushDeployments
            },
            app.targetBinaryVersion,
            app.type,
            newMandatoryValue,
            app.appSecret);
        VsCodeUI.ShowInfoMessage(Messages.ChangedMandatoryMessage(newMandatoryValue));
    }
}
