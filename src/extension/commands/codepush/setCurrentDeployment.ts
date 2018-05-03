import * as vscode from 'vscode';
import { CommandParams, CurrentApp } from '../../../helpers/interfaces';
import { VsCodeUtils } from '../../../helpers/utils/vsCodeUtils';
import { AppCenterOS } from '../../resources/constants';
import { Strings } from '../../resources/strings';
import { RNCPAppCommand } from './rncpAppCommand';

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
            VsCodeUtils.ShowWarningMessage(Strings.NoCurrentAppSetMsg);
            return;
        }
        if (!this.hasCodePushDeployments(currentApp)) {
            VsCodeUtils.ShowWarningMessage(Strings.NoDeploymentsMsg);
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
                    VsCodeUtils.ShowInfoMessage(Strings.YourCurrentDeploymentMsg(deploymentName));
                }
            });
    }
}
