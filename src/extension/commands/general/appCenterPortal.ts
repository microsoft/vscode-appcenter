import { models } from "../../../api/appcenter";
import * as General from "../general";
import { CurrentApp, QuickPickAppItem, CurrentAppDeployments, Deployment } from "../../../helpers/interfaces";
import { AppCenterPortalMenu } from "../../menu/appCenterPortalMenu";
import { CommandNames, AppCenterOS, Constants } from "../../resources/constants";
import { ReactNativeAppCommand } from "../reactNativeAppCommand";
import { Utils } from "../../../helpers/utils/utils";
import { VsCodeUI } from "../../ui/vscodeUI";
import { Messages } from "../../resources/messages";

export default class AppCenterPortal extends ReactNativeAppCommand {

    public async run(): Promise<void> {

        // Disabling the check whether project has react-native package installed cause it's kinda useless here.
        this.checkForReact = false;
        if (!await super.run()) {
            return;
        }
        this.showAppsQuickPick(this.CachedAllApps, true);
        this.refreshCachedAppsAndRepaintQuickPickIfNeeded(true);
    }

    protected async handleShowCurrentAppQuickPickSelection(selected: QuickPickAppItem, rnApps: models.AppResponse[]) {
        if (selected.target === CommandNames.CreateApp.CommandName) {
            await new General.CreateNewApp(this._params).run();
            return;
        } else {

            let selectedApp: models.AppResponse;

            const selectedApps: models.AppResponse[] = rnApps.filter(app => app.name === selected.target && app.owner.type === selected.description);

            // If this is not current app then we can assign current app, otherwise we will use GetCurrentApp method
            if (selected.target !== this.currentAppMenuTarget) {
                if (!selectedApps || selectedApps.length !== 1) {
                    return;
                }
                selectedApp = selectedApps[0];
            }
            let currentAppToUse: CurrentApp;

            if (selectedApp) {

                const selectedApp: models.AppResponse = selectedApps[0];
                const selectedAppName: string = `${selectedApp.owner.name}/${selectedApp.name}`;
                const selectedAppSecret: string = selectedApp.appSecret;
                const type: string = selectedApp.owner.type;

                const OS: AppCenterOS | undefined = Utils.toAppCenterOS(selectedApp.os);

                const deployments: models.Deployment[] = await VsCodeUI.showProgress(async progress => {
                    progress.report({ message: Messages.FetchDeploymentsProgressMessage });
                    return await this.client.codePushDeployments.list(selectedApp.owner.name, selectedApp.name);
                });
                const appDeployments: models.Deployment[] = deployments.sort((a, b): any => {
                    return a.name < b.name; // sort alphabetically
                });

                let currentDeployments: CurrentAppDeployments | null = null;
                if (appDeployments.length > 0) {
                    const deployments: Deployment[] = appDeployments.map((d) => {
                        return {
                            name: d.name
                        };
                    });
                    currentDeployments = {
                        codePushDeployments: deployments,
                        currentDeploymentName: Utils.selectCurrentDeploymentName(deployments)
                    };
                }

                currentAppToUse = Utils.toCurrentApp(selectedAppName, OS,
                    currentDeployments, Constants.AppCenterDefaultTargetBinaryVersion, type, false, selectedAppSecret);
            } else {
                const currentApp: CurrentApp | null = await this.getCurrentApp();
                if (currentApp) {
                    currentAppToUse = currentApp;
                } else {
                    this.logger.error("Current app is undefined");
                    throw new Error("Current app is undefined");
                }
            }

            return new AppCenterPortalMenu(currentAppToUse, this._params).show();
        }
    }
}
