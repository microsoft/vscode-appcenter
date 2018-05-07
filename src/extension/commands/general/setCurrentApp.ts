import { models } from "../../../api/appcenter";
import { CommandParams, CurrentApp, CurrentAppDeployments, Deployment, QuickPickAppItem } from "../../../helpers/interfaces";
import { Utils } from "../../../helpers/utils/utils";
import { AppCenterOS, CommandNames, Constants } from "../../resources/constants";
import { ReactNativeAppCommand } from "../reactNativeAppCommand";
import { VsCodeUI } from "../../ui/vscodeUI";
import { LogStrings } from "../../resources/logStrings";
import { Messages } from "../../resources/messages";

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
            return await this.showCreateAppOptions();
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
                this.logger.error(LogStrings.UnknownOSFromCodePush(selectedApp.os));
                return;
            }
            try {
                await VsCodeUI.showProgress(progress => {
                    progress.report({ message: Messages.FetchDeploymentsProgressMessage });
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
                        const message = Messages.YourCurrentAppAndDeploymentMessage(selected.target, app.currentAppDeployments.currentDeploymentName);
                        VsCodeUI.ShowInfoMessage(message);
                    } else {
                        this.logger.error(LogStrings.FailedToSaveCurrentApp);
                    }
                });
            } catch (e) {
                this.logger.error(LogStrings.FailedToSaveCurrentApp);
            }
        }
    }
}
