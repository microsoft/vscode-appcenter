import * as vscode from 'vscode';
import { CommandParams, CurrentApp } from '../../../helpers/interfaces';
import { AppCenterOS } from '../../resources/constants';
import { Strings } from '../../resources/strings';
import { RNCPAppCommand } from './rncpAppCommand';
import { VsCodeUI } from '../../ui/vscodeUI';

export default class SetCurrentDeployment extends RNCPAppCommand {
    constructor(params: CommandParams) {
        super(params);
    }

    public async run(): Promise<boolean | void> {
        if (!await super.run()) {
            return;
        }
        const currentApp: CurrentApp = await this.getCurrentApp(true);
        if (!currentApp) {
            VsCodeUI.ShowWarningMessage(Strings.NoCurrentAppSetMsg);
            return;
        }
        if (!this.hasCodePushDeployments(currentApp)) {
            VsCodeUI.ShowWarningMessage(Strings.NoDeploymentsMsg);
            return;
        }
        const deploymentOptions: string[] = currentApp.currentAppDeployments.codePushDeployments.map((deployment) => {
            return deployment.name;
        });
        return vscode.window.showQuickPick(deploymentOptions, { placeHolder: Strings.SelectCurrentDeploymentMsg })
            .then((deploymentName) => {
                if (deploymentName) {
                    this.saveCurrentApp(
                        currentApp.identifier,
                        AppCenterOS[currentApp.os], {
                            currentDeploymentName: deploymentName,
                            codePushDeployments: currentApp.currentAppDeployments.codePushDeployments
                        },
                        currentApp.targetBinaryVersion,
                        currentApp.type,
                        currentApp.isMandatory,
                        currentApp.appSecret
                    );
                    VsCodeUI.ShowInfoMessage(Strings.YourCurrentDeploymentMsg(deploymentName));
                }
            });
    }
}
