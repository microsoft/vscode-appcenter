import { AppCenterOS } from "../../../constants";
import { CommandParams, CurrentApp } from "../../../helpers/interfaces";
import { VsCodeUtils } from "../../../helpers/vsCodeUtils";
import { Strings } from "../../../strings";
import { RNCPAppCommand } from "./rncpAppCommand";

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
            VsCodeUtils.ShowWarningMessage(Strings.NoCurrentAppSetMsg);
            return;
        }
        if (!this.hasCodePushDeployments(app)) {
            VsCodeUtils.ShowWarningMessage(Strings.NoDeploymentsMsg);
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
            VsCodeUtils.ShowInfoMessage(`Changed release to ${newMandatoryValue ? "Mandatory" : "NOT Mandatory"}`);
        });
    }
}
