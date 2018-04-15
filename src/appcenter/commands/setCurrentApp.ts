import * as vscode from "vscode";
import { AppCenterOS, Constants } from "../../constants";
import { CommandParams, CurrentApp, CurrentAppDeployments, QuickPickAppItem } from "../../helpers/interfaces";
import { VsCodeUtils } from "../../helpers/vsCodeUtils";
import { Strings } from "../../strings";
import { models } from "../apis";
import { Deployment } from "../apis/generated/models";
import { ReactNativeAppCommand } from './reactNativeAppCommand';

export default class SetCurrentApp extends ReactNativeAppCommand {

    private selectedCachedItem: boolean;

    constructor(params: CommandParams) {
        super(params);
    }

    public async run(): Promise<void> {
        if (!await super.run()) {
            return;
        }

        if (ReactNativeAppCommand.cachedApps && ReactNativeAppCommand.cachedApps.length > 0) {
            this.showApps(ReactNativeAppCommand.cachedApps);
        }
        vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.GetAppsListMessage }, () => {
            return this.client.apps.list({
                orderBy: "name"
            }).then((apps: models.AppResponse[]) => {
                this.showApps(apps);
            }).catch((e) => {
                VsCodeUtils.ShowErrorMessage(Strings.UnknownError);
                this.logger.error(e.message, e);
            });
        });
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
                throw new Error('Unknown AppCenter OS');
        }
    }

    private showApps(appsList: models.AppResponse[]) {
        try {
            let rnApps;
            ReactNativeAppCommand.cachedApps = rnApps = appsList.filter(app => app.platform === Constants.AppCenterReactNativePlatformName);
            const options: QuickPickAppItem[] = VsCodeUtils.getQuickPickItemsForAppsList(rnApps);
            if (!this.selectedCachedItem) {
                vscode.window.showQuickPick(options, { placeHolder: Strings.ProvideCurrentAppPromptMsg }).then((selected: QuickPickAppItem) => {
                    this.selectedCachedItem = true;
                    if (!selected) {
                        return Promise.resolve(void 0);
                    }
                    const selectedApps: models.AppResponse[] = rnApps.filter(app => app.name === selected.target);
                    if (!selectedApps || selectedApps.length !== 1) {
                        return Promise.resolve(void 0);
                    }
                    const selectedApp: models.AppResponse = selectedApps[0];
                    const selectedAppName: string = `${selectedApp.owner.name}/${selectedApp.name}`;
                    const selectedAppSecret: string = selectedApp.appSecret;
                    const type: string = selectedApp.owner.type;

                    const OS: AppCenterOS | undefined = this.toAppCenterOS(selectedApp.os);
                    if (!OS) {
                        this.logger.error(`Couldn't recognize os ${selectedApp.os} returned from CodePush server.`);
                        return false;
                    }
                    try {
                        vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: "Get Deployments" }, p => {
                            p.report({ message: Strings.FetchDeploymentsStatusBarMessage });
                            return this.client.codePushDeployments.list(selectedApp.owner.name, selectedApp.name);
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
                                type,
                                Constants.AppCenterDefaultIsMandatoryParam,
                                selectedAppSecret
                            );
                        }).then((app: CurrentApp | null) => {
                            if (app) {
                                const message = Strings.YourCurrentAppAndDeploymentMsg(selected.target, app.currentAppDeployments.currentDeploymentName);
                                return VsCodeUtils.ShowInfoMessage(message);
                            } else {
                                this.logger.error("Failed to save current app");
                                return false;
                            }
                        });
                    } catch (e) {
                        VsCodeUtils.ShowErrorMessage(Strings.UnknownError);
                        this.logger.error(e.message, e);
                    }
                    return false;
                });
            }
        } catch (e) {
            VsCodeUtils.ShowErrorMessage(Strings.UnknownError);
            this.logger.error(e.message, e);
        }
    }
}
