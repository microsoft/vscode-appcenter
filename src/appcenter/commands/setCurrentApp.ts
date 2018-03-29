import * as vscode from "vscode";
import { ExtensionManager } from "../../extensionManager";
import { AppCenterOS, Constants } from "../../helpers/constants";
import { CurrentApp, CurrentAppDeployments } from "../../helpers/interfaces";
import { Strings } from "../../helpers/strings";
import { VsCodeUtils } from "../../helpers/vsCodeUtils";
import { ILogger } from "../../log/logHelper";
import * as models from '../lib/app-center-node-client/models';
import { Deployment } from "../lib/app-center-node-client/models";
import { ReactNativeAppCommand } from './reactNativeAppCommand';

interface QuickPickAppItem {
    label: string;
    description: string;
    target: string;
}

export default class SetCurrentApp extends ReactNativeAppCommand {

    constructor(manager: ExtensionManager, logger: ILogger) {
        super(manager, logger);
    }

    public async run(): Promise<void> {
        if (!await super.run()) {
            return;
        }

        let rnApps;
        try {
            vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: "Get Apps" }, () => {
                return this.client.account.apps.list();
            }).then((apps: models.AppResponse[]) => {
                const appsList: models.AppResponse[] = apps;
                rnApps = appsList.filter(app => app.platform === Constants.AppCenterReactNativePlatformName);
                const options: QuickPickAppItem[] = rnApps.map(app => {
                    return {
                        label: `${app.name} (${app.os})`,
                        description: app.displayName,
                        target: app.name
                    };
                });
                return vscode.window.showQuickPick(options, { placeHolder: Strings.ProvideCurrentAppPromptMsg });
            }).then((selected: QuickPickAppItem) => {
                if (!selected) {
                    return Promise.resolve(void 0);
                }
                const selectedApps: models.AppResponse[] = rnApps.filter(app => app.name === selected.target);
                if (!selectedApps || selectedApps.length !== 1) {
                    return Promise.resolve(void 0);
                }
                const selectedApp: models.AppResponse = selectedApps[0];
                const selectedAppName: string = `${selectedApp.owner.name}/${selectedApp.name}`;

                const OS: AppCenterOS | undefined = this.toAppCenterOS(selectedApp.os);
                if (!OS) {
                    this.logger.error(`Couldn't recognise os ${selectedApp.os} returned from CodePush server.`);
                    return;
                }
                try {
                    vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: "Get Deployments" }, p => {
                        p.report({ message: Strings.FetchDeploymentsStatusBarMessage });
                        return this.client.codepush.codePushDeployments.list(selectedApp.name, selectedApp.owner.name);
                    }).then((deployments: models.Deployment[]) => {
                        return deployments.sort((a, b): any => {
                            return a.name < b.name; // sort alphabetically
                        });
                    }).then((appDeployments: models.Deployment[]) => {
                        let currentDeployments: CurrentAppDeployments | null = null;
                        if (appDeployments.length > 0) {
                            const deployments: Deployment[] = appDeployments.map((d) => {
                                return {
                                    name: d.name
                                };
                            });
                            currentDeployments = {
                                codePushDeployments: deployments,
                                currentDeploymentName: appDeployments[0].name // Select 1st one by default
                            };
                        }
                        return this.saveCurrentApp(
                            selectedAppName,
                            OS,
                            currentDeployments,
                            Constants.AppCenterDefaultTargetBinaryVersion,
                            Constants.AppCenterDefaultIsMandatoryParam
                        );
                    }).then((app: CurrentApp | null) => {
                        if (app) {
                            const message = Strings.YourCurrentAppAndDeploymentMsg(selected.target, app.currentAppDeployments.currentDeploymentName);
                            return VsCodeUtils.ShowInfoMessage(message);
                        } else {
                            this.logger.error("Failed to save current app");
                            return;
                        }
                    });
                } catch (e) {
                    VsCodeUtils.ShowErrorMessage(Strings.UnknownError);
                    this.logger.error(e.message, e);
                }
                return;
            });
        } catch (e) {
            VsCodeUtils.ShowErrorMessage(Strings.UnknownError);
            this.logger.error(e.message, e);
        }
    }

    private toAppCenterOS(codePushOs: string): AppCenterOS | undefined {
        switch (codePushOs.toLowerCase()) {
            case 'android':
                return AppCenterOS.Android;
            case 'ios':
                return AppCenterOS.iOS;
            case 'windows':
                return AppCenterOS.Windows;
            default:
                return;
        }
    }
}
