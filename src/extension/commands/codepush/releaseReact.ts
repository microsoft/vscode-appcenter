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
        return new Promise<void>((resolve) => {
            let updateContentsDirectory: string;
            let isMandatory: boolean;
            VsCodeUI.showProgress(progress => {
                return new Promise<CurrentApp>((appResolve, appReject) => {
                    progress.report({ message: Messages.GettingAppInfoProgressMessage });
                    this.getCurrentApp(true)
                        .then((currentApp: CurrentApp) => appResolve(currentApp))
                        .catch(err => appReject(err));
                }).then(async (currentApp: CurrentApp) => {
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
                    if (currentApp.targetBinaryVersion !== Constants.AppCenterDefaultTargetBinaryVersion) {
                        return currentApp.targetBinaryVersion;
                    } else {
                        switch (currentApp.os) {
                            case "android": return reactNative.getAndroidAppVersion(this.rootPath);
                            case "ios": return reactNative.getiOSAppVersion(this.rootPath);
                            case "windows": return reactNative.getWindowsAppVersion(this.rootPath);
                            default: {
                                VsCodeUI.ShowWarningMessage(Messages.UnsupportedOSWarning);
                                return void 0;
                            }
                        }
                    }
                }).then((appVersion: string) => {
                    if (!appVersion) {
                        return null;
                    }
                    progress.report({ message: Messages.RunningBundleCommandProgressMessage });
                    codePushRelaseParams.appVersion = appVersion;
                    return reactNative.makeUpdateContents(<BundleConfig>{
                        os: codePushRelaseParams.app.os,
                        projectRootPath: this.rootPath
                    });
                }).then((pathToUpdateContents: string) => {
                    if (!pathToUpdateContents) {
                        return null;
                    }
                    progress.report({ message: Messages.ArchivingUpdateContentsProgressMessage });
                    updateContentsDirectory = pathToUpdateContents;
                    this.logger.log(LogStrings.CodePushUpdatedContentsDir(updateContentsDirectory), LogLevel.Debug);
                    return updateContents.zip(pathToUpdateContents, this.rootPath);
                }).then((pathToZippedBundle: string) => {
                    if (!pathToZippedBundle) {
                        return null;
                    }
                    progress.report({ message: Messages.ReleasingUpdateContentsProgressMessage });
                    codePushRelaseParams.updatedContentZipPath = pathToZippedBundle;
                    codePushRelaseParams.isMandatory = isMandatory;
                    return new Promise<any>((publishResolve, publishReject) => {
                        this.appCenterProfile.then((profile: AppCenterProfile) => {
                            return Auth.accessTokenFor(profile);
                        }).then((token: string) => {
                            codePushRelaseParams.token = token;
                            return codePushRelease.exec(this.client, codePushRelaseParams, this.logger);
                        }).then((response: any) => publishResolve(response))
                            .catch((error: any) => publishReject(error));
                    });
                }).then((response: any) => {
                    if (!response) {
                        return;
                    }
                    if (response.succeeded && response.result) {
                        VsCodeUI.ShowInfoMessage(Messages.ReleaseMadeMessage(codePushRelaseParams.deploymentName, codePushRelaseParams.app.appName));
                        resolve(response.result);
                    } else {
                        VsCodeUI.ShowErrorMessage(response.errorMessage);
                    }
                    fileUtils.rmDir(codePushRelaseParams.updatedContentZipPath);
                }).catch((error: Error) => {
                    if (error && error.message) {
                        VsCodeUI.ShowErrorMessage(`${Messages.FailedToMakeCodePushRelease} ${error.message}`);
                    } else {
                        VsCodeUI.ShowErrorMessage(Messages.FailedToMakeCodePushRelease);
                    }

                    fileUtils.rmDir(codePushRelaseParams.updatedContentZipPath);
                });
            });
        });
    }
}
