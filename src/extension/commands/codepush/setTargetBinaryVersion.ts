import { validRange } from 'semver';
import * as vscode from 'vscode';
import { CommandParams, CurrentApp } from '../../../helpers/interfaces';
import { AppCenterOS, Constants } from '../../resources/constants';
import { Strings } from '../../resources/strings';
import { RNCPAppCommand } from './rncpAppCommand';
import { VsCodeUI } from '../../ui/vscodeUI';

export default class SetTargetBinaryVersion extends RNCPAppCommand {
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
            return void 0;
        }
        if (!this.hasCodePushDeployments(app)) {
            VsCodeUI.ShowWarningMessage(Strings.NoDeploymentsMsg);
            return void 0;
        }
        return vscode.window.showInputBox({ prompt: Strings.PleaseProvideTargetBinaryVersion, ignoreFocusOut: true })
            .then(appVersion => {
                if (!appVersion) {
                    // if user press esc do nothing then
                    return void 0;
                }
                if (appVersion !== Constants.AppCenterDefaultTargetBinaryVersion && !validRange(appVersion)) {
                    VsCodeUI.ShowWarningMessage(Strings.InvalidAppVersionParamMsg);
                    return void 0;
                }

                return this.saveCurrentApp(
                    app.identifier,
                    AppCenterOS[app.os], {
                        currentDeploymentName: app.currentAppDeployments.currentDeploymentName,
                        codePushDeployments: app.currentAppDeployments.codePushDeployments
                    },
                    appVersion,
                    app.type,
                    app.isMandatory,
                    app.appSecret
                ).then((currentApp) => {
                    if (!currentApp) {
                        return;
                    }
                    VsCodeUI.ShowInfoMessage(Strings.ChangedTargetBinaryVersion(appVersion));
                });
            });
    }
}
