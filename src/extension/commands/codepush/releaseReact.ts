import Auth from '../../../auth/auth';
import * as path from "path";
import { codePushRelease } from '../../../codepush';
import { fileUtils, reactNative, updateContents } from '../../../codepush/codepush-sdk/src';
import { BundleConfig } from '../../../codepush/codepush-sdk/src/react-native/react-native-utils';
import { AppCenterProfile, CommandParams, CurrentApp, ICodePushReleaseParams } from '../../../helpers/interfaces';
import { LogLevel } from '../../log/logHelper';
import { Constants } from '../../resources/constants';
import { RNCPAppCommand } from './rncpAppCommand';
import { VsCodeUI } from '../../ui/vscodeUI';
import { LogStrings } from '../../resources/logStrings';
import { Messages } from '../../resources/messages';
import { SettingsHelper } from '../../../helpers/settingsHelper';
import { FSUtils } from '../../../helpers/utils/fsUtils';

export default class ReleaseReact extends RNCPAppCommand {
    constructor(params: CommandParams, private _app: CurrentApp = null) {
        super(params);
    }

    public async run(): Promise<void> {
        if (!await super.run()) {
            return;
        }

        const codePushRelaseParams = <ICodePushReleaseParams>{};
        let updateContentsDirectory: string;
        let isMandatory: boolean;
        return await VsCodeUI.showProgress<void>(async progress => {
            try {
                progress.report({ message: Messages.GettingAppInfoProgressMessage });
                if (!this._app) {
                    const currentApp: CurrentApp = await this.getCurrentApp(true);
                    if (!currentApp) {
                        VsCodeUI.ShowWarningMessage(Messages.NoCurrentAppSetWarning);
                        return void 0;
                    }
                    this._app = currentApp;
                }

                progress.report({ message: Messages.DetectingAppVersionProgressMessage });
                if (!this.hasCodePushDeployments(this._app)) {
                    VsCodeUI.ShowWarningMessage(Messages.NoDeploymentsWarning);
                    return void 0;
                }
                if (!this._app.os || !reactNative.isValidOS(this._app.os)) {
                    VsCodeUI.ShowWarningMessage(Messages.UnsupportedOSWarning);
                    return void 0;
                }
                codePushRelaseParams.app = this._app;
                codePushRelaseParams.deploymentName = this._app.currentAppDeployments.currentDeploymentName;
                this._app.os = this._app.os.toLowerCase();
                isMandatory = !!this._app.isMandatory;
                let appVersion: string;
                if (this._app.targetBinaryVersion !== Constants.AppCenterDefaultTargetBinaryVersion) {
                    appVersion = this._app.targetBinaryVersion;
                } else {
                    switch (this._app.os) {
                        case "android": appVersion = await reactNative.getAndroidAppVersion(this.rootPath); break;
                        case "ios": appVersion = await reactNative.getiOSAppVersion(this.rootPath); break;
                        case "windows": appVersion = await reactNative.getWindowsAppVersion(this.rootPath); break;
                        default: {
                            VsCodeUI.ShowWarningMessage(Messages.UnsupportedOSWarning);
                            return void 0;
                        }
                    }
                }
                if (!appVersion) {
                    return void 0;
                }
                progress.report({ message: Messages.RunningBundleCommandProgressMessage });
                codePushRelaseParams.appVersion = appVersion;
                const pathToUpdateContents: string = await reactNative.makeUpdateContents(<BundleConfig>{
                    os: codePushRelaseParams.app.os,
                    projectRootPath: this.rootPath
                });
                if (!pathToUpdateContents) {
                    return void 0;
                }

                // If user has enabled a mixin update, this is the place where we would add mixin folder contents to a bundle.
                let codePushReleaseMixinPath: string = SettingsHelper.codePushReleaseMixinPath();
                if (codePushReleaseMixinPath) {
                    progress.report({ message: Messages.MakingMixinProgressMessage(codePushReleaseMixinPath) });
                    codePushReleaseMixinPath = path.join(this.rootPath, codePushReleaseMixinPath);
                    FSUtils.copyFiles(codePushReleaseMixinPath, pathToUpdateContents);
                }

                progress.report({ message: Messages.ArchivingUpdateContentsProgressMessage });
                updateContentsDirectory = pathToUpdateContents;
                this.logger.log(LogStrings.CodePushUpdatedContentsDir(updateContentsDirectory), LogLevel.Debug);
                const pathToZippedBundle: string = await updateContents.zip(pathToUpdateContents, this.rootPath);
                if (!pathToZippedBundle) {
                    return void 0;
                }
                progress.report({ message: Messages.ReleasingUpdateContentsProgressMessage });
                codePushRelaseParams.updatedContentZipPath = pathToZippedBundle;
                codePushRelaseParams.isMandatory = isMandatory;
                const profile: AppCenterProfile = await this.appCenterProfile;
                const token: string = await Auth.accessTokenFor(profile);
                codePushRelaseParams.token = token;
                const response: any = await codePushRelease.exec(this.client, codePushRelaseParams, this.logger);
                if (!response) {
                    return void 0;
                }
                if (response.succeeded && response.result) {
                    VsCodeUI.ShowInfoMessage(Messages.ReleaseMadeMessage(codePushRelaseParams.deploymentName, codePushRelaseParams.app.appName));
                    return response.result;
                } else {
                    VsCodeUI.ShowErrorMessage(response.errorMessage);
                }
                fileUtils.rmDir(codePushRelaseParams.updatedContentZipPath);
            } catch (error) {
                if (error && error.message) {
                    VsCodeUI.ShowErrorMessage(`${Messages.FailedToMakeCodePushRelease} ${error.message}`);
                } else {
                    VsCodeUI.ShowErrorMessage(Messages.FailedToMakeCodePushRelease);
                }

                fileUtils.rmDir(codePushRelaseParams.updatedContentZipPath);
            }
        });
    }
}
