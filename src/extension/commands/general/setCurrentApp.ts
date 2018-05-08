import * as vscode from "vscode";
import * as General from "../general";
import { models } from "../../../api/appcenter";
import { CommandParams, CurrentApp, CurrentAppDeployments, Deployment, QuickPickAppItem } from "../../../helpers/interfaces";
import { Utils } from "../../../helpers/utils/utils";
import { VsCodeUtils } from "../../../helpers/utils/vsCodeUtils";
import { AppCenterOS, CommandNames, Constants } from "../../resources/constants";
import { Strings } from "../../resources/strings";
import { ReactNativeAppCommand } from "../reactNativeAppCommand";

export default class SetCurrentApp extends ReactNativeAppCommand {
    constructor(params: CommandParams) {
        super(params);
    }

    public async run(): Promise<void> {
        if (!await super.run()) {
            return;
        }
        this.showAppsQuickPick(this.CachedAllApps);
        this.refreshCachedAppsAndRepaintQuickPickIfNeeded(false, true, false);
    }

    protected async handleShowCurrentAppQuickPickSelection(selected: QuickPickAppItem, rnApps: models.AppResponse[]) {
        if (selected.target === CommandNames.CreateApp.CommandName) {
            await new General.CreateNewApp(this._params).run();
            return;
        } else {
            const selectedApps: models.AppResponse[] = rnApps.filter(app => app.name === selected.target && app.owner.type === selected.description);
            if (!selectedApps || selectedApps.length !== 1) {
                return;
            }
            const selectedApp: models.AppResponse = selectedApps[0];
            const selectedAppName: string = `${selectedApp.owner.name}/${selectedApp.name}`;
            const selectedAppSecret: string = selectedApp.appSecret;
            const type: string = selectedApp.owner.type;

            const OS: AppCenterOS | undefined = Utils.toAppCenterOS(selectedApp.os);
            if (!OS) {
                this.logger.error(`Couldn't recognize os ${selectedApp.os} returned from CodePush server.`);
                return;
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
                        VsCodeUtils.ShowInfoMessage(message);
                    } else {
                        this.logger.error("Failed to save current app");
                    }
                });
            } catch (e) {
                this.logger.error("Failed to save current app");
            }
        }
    }
}
