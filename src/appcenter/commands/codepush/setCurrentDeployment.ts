import * as vscode from 'vscode';
import { ExtensionManager } from '../../../extensionManager';
import { AppCenterOS } from '../../../helpers/constants';
import { CurrentApp } from '../../../helpers/interfaces';
import { Strings } from '../../../helpers/strings';
import { VsCodeUtils } from '../../../helpers/vsCodeUtils';
import { ILogger } from '../../../log/logHelper';
import { AppCommand } from '../appCommand';

export default class SetCurrentDeployment extends AppCommand {
    constructor(manager: ExtensionManager, logger: ILogger) {
        super(manager, logger);
    }

    public async runNoClient(): Promise<boolean | void> {
        if (!await super.runNoClient()) {
            return;
        }

        this.getCurrentApp().then((currentApp: CurrentApp) => {
            if (!currentApp || !currentApp.currentAppDeployments || !currentApp.currentAppDeployments.codePushDeployments) {
                VsCodeUtils.ShowInfoMessage(Strings.NoCurrentAppSetMsg);
                return;
            }
            const deploymentOptions: string[] = currentApp.currentAppDeployments.codePushDeployments.map((deployment) => {
                return deployment.name;
            });
            vscode.window.showQuickPick(deploymentOptions, { placeHolder: Strings.SelectCurrentDeploymentMsg })
                .then((deploymentName) => {
                    if (deploymentName) {
                        this.saveCurrentApp(
                            this.manager.projectRootPath as string,
                            currentApp.identifier,
                            AppCenterOS[currentApp.os], {
                                currentDeploymentName: deploymentName,
                                codePushDeployments: currentApp.currentAppDeployments.codePushDeployments
                            },
                            currentApp.targetBinaryVersion,
                            currentApp.isMandatory
                        );
                        VsCodeUtils.ShowInfoMessage(Strings.YourCurrentDeploymentMsg(deploymentName));
                    }
                });
        });
    }
}
