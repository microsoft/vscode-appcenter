import Auth from '../../../auth/auth';
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

export default class ReleaseReact extends RNCPAppCommand {
    constructor(params: CommandParams) {
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
                const currentApp: CurrentApp = await this.getCurrentApp(true);

                progress.report({ message: Messages.DetectingAppVersionProgressMessage });
                if (!currentApp) {
                    VsCodeUI.ShowWarningMessage(Messages.NoCurrentAppSetWarning);
                    return void 0;
                }
                if (!this.hasCodePushDeployments(currentApp)) {
                    VsCodeUI.ShowWarningMessage(Messages.NoDeploymentsWarning);
                    return void 0;
                }
                if (!currentApp.os || !reactNative.isValidOS(currentApp.os)) {
                    VsCodeUI.ShowWarningMessage(Messages.UnsupportedOSWarning);
                    return void 0;
                }
                codePushRelaseParams.app = currentApp;
                codePushRelaseParams.deploymentName = currentApp.currentAppDeployments.currentDeploymentName;
                currentApp.os = currentApp.os.toLowerCase();
                isMandatory = !!currentApp.isMandatory;
                let appVersion: string;
                if (currentApp.targetBinaryVersion !== Constants.AppCenterDefaultTargetBinaryVersion) {
                    appVersion = currentApp.targetBinaryVersion;
                } else {
                    switch (currentApp.os) {
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
