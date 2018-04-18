import * as vscode from "vscode";
import { AppCenteAppType, Constants } from "../../constants";
import { CommandParams, CurrentApp, QuickPickAppItem } from "../../helpers/interfaces";
import { MenuHelper } from "../../helpers/menuHelper";
import { VsCodeUtils } from "../../helpers/vsCodeUtils";
import { Strings } from "../../strings";
import { models } from "../apis";
import { ReactNativeAppCommand } from "./reactNativeAppCommand";

export default class AppCenterPortalMenu extends ReactNativeAppCommand {

    private currentAppMenuTarget: string = "MenuCurrentApp";
    private selectedCachedItem: boolean;

    constructor(params: CommandParams) {
        super(params);
    }

    public async run(): Promise<void> {
        if (!await super.run()) {
            return;
        }
        try {
            if (ReactNativeAppCommand.cachedApps && ReactNativeAppCommand.cachedApps.length > 0) {
                this.showApps(ReactNativeAppCommand.cachedApps);
            }
            vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.GetAppsListMessage }, async () => {
                return await this.client.apps.list({
                    orderBy: "name"
                });
            }).then(async (apps: any) => {
                this.showApps(apps);
            });
        } catch (e) {
            VsCodeUtils.ShowErrorMessage(Strings.UnknownError);
            this.logger.error(e.message, e);
        }
    }

    private async showApps(appsList: models.AppResponse[]) {
        try {
            let rnApps;

            ReactNativeAppCommand.cachedApps = rnApps = appsList.filter(app => app.platform === Constants.AppCenterReactNativePlatformName);
            const options: QuickPickAppItem[] = MenuHelper.getQuickPickItemsForAppsList(rnApps);
            const currentApp: CurrentApp | null = await this.getCurrentApp();

            if (currentApp) {
                const currentAppItem = {
                    label: Strings.SelectCurrentAppMenuDescription,
                    description: currentApp.type,
                    target: this.currentAppMenuTarget
                };
                options.splice(0, 0, currentAppItem);
            }
            if (!this.selectedCachedItem) {
                vscode.window.showQuickPick(options, { placeHolder: Strings.ProvideCurrentAppPromptMsg }).then(async (selected: QuickPickAppItem) => {
                    this.selectedCachedItem = true;
                    if (!selected) {
                        this.logger.info('User cancel selection of current app');
                        return;
                    }
                    let selectedApp: models.AppResponse;

                    const selectedApps: models.AppResponse[] = rnApps.filter(app => app.name === selected.target);

                    // If this is not current app then we can assign current app, otherwise we will use GetCurrentApp method
                    if (selected.target !== this.currentAppMenuTarget) {
                        if (!selectedApps || selectedApps.length !== 1) {
                            return;
                        }
                        selectedApp = selectedApps[0];
                    }

                    vscode.window.showQuickPick(MenuHelper.getAppCenterPortalMenuItems(), { placeHolder: Strings.MenuTitlePlaceholder })
                        .then(async (selected: QuickPickAppItem) => {
                            if (!selected) {
                                this.logger.info('User cancel selection of current appcenter tab');
                                return;
                            }

                            let isOrg: boolean;
                            let appName: string;
                            let ownerName: string;

                            if (selectedApp) {
                                isOrg = selectedApp.owner.type.toLowerCase() === AppCenteAppType.Org.toLowerCase();
                                appName = selectedApp.name;
                                ownerName = selectedApp.owner.name;
                            } else {
                                const currentApp: CurrentApp | null = await this.getCurrentApp();
                                if (currentApp) {
                                    isOrg = currentApp.type.toLowerCase() === AppCenteAppType.Org.toLowerCase();
                                    appName = currentApp.appName;
                                    ownerName = currentApp.ownerName;
                                } else {
                                    this.logger.error("Current app is undefiend");
                                    throw new Error("Current app is undefiend");
                                }
                            }
                            MenuHelper.handleMenuPortalQuickPickSelection(selected.target, ownerName, appName, isOrg);
                        });
                    }
                );
            }
        } catch (e) {
            VsCodeUtils.ShowErrorMessage(Strings.UnknownError);
            this.logger.error(e.message, e);
        }
    }
}
