import * as vscode from 'vscode';
import { Constants } from '../../../constants';
import { ExtensionManager } from "../../../extensionManager";
import { AppCenterProfile, CurrentApp, ICodePushReleaseParams } from "../../../helpers/interfaces";
import { VsCodeUtils } from '../../../helpers/vsCodeUtils';
import { ILogger, LogLevel } from "../../../log/logHelper";
import { Strings } from '../../../strings';
import Auth from '../../auth/auth';
import { codePushRelease } from '../../codepush';
import { fileUtils, reactNative, updateContents } from '../../codepush/codepush-sdk/src';
import { BundleConfig } from '../../codepush/codepush-sdk/src/react-native/react-native-utils';
import { RNCPAppCommand } from './rncpAppCommand';

export default class ReleaseReact extends RNCPAppCommand {
    constructor(manager: ExtensionManager, logger: ILogger) {
        super(manager, logger);
    }

    public async run(): Promise<void> {
        if (!await super.run()) {
            return;
        }

        const codePushRelaseParams = <ICodePushReleaseParams>{};
        return new Promise<void>((resolve) => {
            let updateContentsDirectory: string;
            let isMandatory: boolean;
            vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: "Get Apps" }, p => {
                return new Promise<CurrentApp>((appResolve, appReject) => {
                    p.report({ message: Strings.GettingAppInfoMessage });
                    this.getCurrentApp()
                        .then((currentApp: CurrentApp) => appResolve(currentApp))
                        .catch(err => appReject(err));
                }).then((currentApp: CurrentApp): any => {
                    p.report({ message: Strings.DetectingAppVersionMessage });
                    if (!currentApp) {
                        throw new Error(`No current app has been specified.`);
                    }
                    if (!currentApp.os || !reactNative.isValidOS(currentApp.os)) {
                        throw new Error(`OS must be "android", "ios", or "windows".`);
                    }
                    codePushRelaseParams.app = currentApp;
                    codePushRelaseParams.deploymentName = currentApp.currentAppDeployments.currentDeploymentName;
                    currentApp.os = currentApp.os.toLowerCase();
                    isMandatory = !!currentApp.isMandatory;
                    if (currentApp.targetBinaryVersion !== Constants.AppCenterDefaultTargetBinaryVersion) {
                        return currentApp.targetBinaryVersion;
                    } else {
                        switch (currentApp.os) {
                            case "android": return reactNative.getAndroidAppVersion(this.manager.projectRootPath);
                            case "ios": return reactNative.getiOSAppVersion(this.manager.projectRootPath);
                            case "windows": return reactNative.getWindowsAppVersion(this.manager.projectRootPath);
                            default: throw new Error(`OS must be "android", "ios", or "windows".`);
                        }
                    }
                }).then((appVersion: string) => {
                    p.report({ message: Strings.RunningBundleCommandMessage });
                    codePushRelaseParams.appVersion = appVersion;
                    return reactNative.makeUpdateContents(<BundleConfig>{
                        os: codePushRelaseParams.app.os,
                        projectRootPath: this.manager.projectRootPath
                    });
                }).then((pathToUpdateContents: string) => {
                    p.report({ message: Strings.ArchivingUpdateContentsMessage });
                    updateContentsDirectory = pathToUpdateContents;
                    this.logger.log(`CodePush updated contents directory path: ${updateContentsDirectory}`, LogLevel.Debug);
                    return updateContents.zip(pathToUpdateContents, this.manager.projectRootPath);
                }).then((pathToZippedBundle: string) => {
                    p.report({ message: Strings.ReleasingUpdateContentsMessage });
                    codePushRelaseParams.updatedContentZipPath = pathToZippedBundle;
                    codePushRelaseParams.isMandatory = isMandatory;
                    return new Promise<any>((publishResolve, publishReject) => {
                        this.appCenterProfile.then((profile: AppCenterProfile) => {
                            return Auth.accessToken(profile);
                        }).then((token: string) => {
                            codePushRelaseParams.token = token;
                            return codePushRelease.exec(this.client, codePushRelaseParams, this.logger);
                        }).then((response: any) => publishResolve(response))
                            .catch((error: any) => publishReject(error));
                    });
                }).then((response: any) => {
                    if (response.succeeded && response.result) {
                        VsCodeUtils.ShowInfoMessage(`Successfully released an update to the "${codePushRelaseParams.deploymentName}" deployment of the "${codePushRelaseParams.app.appName}" app`);
                        resolve(response.result);
                    } else {
                        VsCodeUtils.ShowErrorMessage(response.errorMessage);
                    }
                    fileUtils.rmDir(codePushRelaseParams.updatedContentZipPath);
                }).catch((error: Error) => {
                    if (error && error.message) {
                        VsCodeUtils.ShowErrorMessage(`An error occured on doing Code Push release. ${error.message}`);
                    } else {
                        VsCodeUtils.ShowErrorMessage("An error occured on doing Code Push release");
                    }

                    fileUtils.rmDir(codePushRelaseParams.updatedContentZipPath);
                });
            });
        });
    }
}
