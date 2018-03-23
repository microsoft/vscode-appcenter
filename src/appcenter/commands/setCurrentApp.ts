import { Command } from "./command";
import { ExtensionManager } from "../../extensionManager";
import { ILogger } from "../../log/logHelper";
import { Strings } from "../../helpers/strings";
import * as models from '../lib/app-center-node-client/models';

import * as vscode from "vscode";
import { Constants, AppCenterOS } from "../../helpers/constants";
import { CurrentAppDeployments, DefaultApp } from "../../helpers/interfaces";
import { Deployment } from "../lib/app-center-node-client/models";
import { VsCodeUtils } from "../../helpers/vsCodeUtils";
import { ProjectRootNotFoundError } from "../../helpers/errors";

interface QuickPickAppItem {
    label: string,
    description: string,
    target: string
}

export default class SetCurrentApp extends Command {

    constructor(manager: ExtensionManager, logger: ILogger) {
        super(manager, logger);
    }

    public getQPromisifiedClientResult<T>(action: Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            action.then((result: T) => resolve(result)).catch((e) => reject(e));
        });
    }

    public async run(): Promise<void> {
        try {
            await super.run();
        } catch (e) {
            return this.handleRunError(e);
        }

        if(!this.client){
            return Promise.resolve(void 0);
        }

        let rnApps;
        try {
            vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: "Get Apps" }, () => {
                return this.client.account.apps.list();
            }).then((apps: models.AppResponse[]) => {
                const appsList: models.AppResponse[] = apps;
                rnApps = appsList.filter(app => app.platform === Constants.AppCenterReactNativePlatformName);
                let options: QuickPickAppItem[] = rnApps.map(app => {
                    return {
                        label: `${app.name} (${app.os})`,
                        description: app.displayName,
                        target: app.name,
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
                const OS: AppCenterOS = AppCenterOS[selectedApp.os.toLowerCase()];

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
                                    name: d.name,
                                };
                            });
                            currentDeployments = {
                                codePushDeployments: deployments,
                                currentDeploymentName: appDeployments[0].name, // Select 1st one by default
                            };
                        }
                        return this.saveCurrentApp(
                            this.manager.projectRootPath as string,
                            selectedAppName,
                            OS,
                            currentDeployments,
                            Constants.AppCenterDefaultTargetBinaryVersion,
                            Constants.AppCenterDefaultIsMandatoryParam
                        );
                    }).then((app: DefaultApp | null) => {
                        if (app) {
                            const message = Strings.YourCurrentAppAndDeploymentMsg(selected.target, app.currentAppDeployments.currentDeploymentName);
                            return VsCodeUtils.ShowInfoMessage(message);
                        } else {
                            const error = new Error("Failed to save current app");
                            this.logger.error(error.message);
                            return Promise.resolve(void 0);                          
                        }
                    });
                } catch (e) {
                    VsCodeUtils.ShowErrorMessage(Strings.UnknownError);
                    return Promise.reject(e);
                }
            });
        } catch (e) {
            VsCodeUtils.ShowErrorMessage(Strings.UnknownError);
            return Promise.reject(e);
        }
        return Promise.resolve(void 0);
    }
}