import { validRange } from 'semver';
import * as vscode from 'vscode';
import { AppCenterOS, Constants } from '../../../constants';
import { CommandParams, CurrentApp } from '../../../helpers/interfaces';
import { VsCodeUtils } from '../../../helpers/vsCodeUtils';
import { Strings } from '../../../strings';
import { RNCPAppCommand } from './rncpAppCommand';

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
            VsCodeUtils.ShowWarningMessage(Strings.NoCurrentAppSetMsg);
            return void 0;
        }
        if (!this.hasCodePushDeployments(app)) {
            VsCodeUtils.ShowWarningMessage(Strings.NoDeploymentsMsg);
            return void 0;
        }
        return vscode.window.showInputBox({ prompt: Strings.PleaseProvideTargetBinaryVersion, ignoreFocusOut: true })
            .then(appVersion => {
                if (!appVersion) {
                    // if user press esc do nothing then
                    return void 0;
                }
                if (appVersion !== Constants.AppCenterDefaultTargetBinaryVersion && !validRange(appVersion)) {
                    VsCodeUtils.ShowWarningMessage(Strings.InvalidAppVersionParamMsg);
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
                    VsCodeUtils.ShowInfoMessage(Strings.ChangedTargetBinaryVersion(appVersion));
                });
            });
    }
}
