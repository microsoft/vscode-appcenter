import * as vscode from "vscode";
import { AppCenteAppType, Constants } from "../../constants";
import { CommandParams, CurrentApp, QuickPickAppItem } from "../../helpers/interfaces";
import { MenuHelper } from "../../helpers/menuHelper";
import { CustomQuickPickItem, VsCodeUtils } from "../../helpers/vsCodeUtils";
import { Strings } from "../../strings";
import { models } from "../apis";
import { ReactNativeAppCommand } from "./reactNativeAppCommand";

export default class AppCenterPortalMenu extends ReactNativeAppCommand {

    private currentAppMenuTarget: string = "MenuCurrentApp";
    private userAlreadySelectedApp: boolean;
    private appName: string;
    private ownerName: string;
    private isOrg: boolean;

    constructor(params: CommandParams) {
        super(params);
    }

    public async run(): Promise<void> {
        if (!await super.run()) {
            return;
        }
        try {
            this.showAppsQuickPick(this.CachedApps);
            vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.GetAppsListMessage }, async () => {
                return await this.client.apps.list({
                    orderBy: "name"
                });
            }).then((apps: any) => {
                const rnApps: models.AppResponse[] = apps.filter(app => app.platform === Constants.AppCenterReactNativePlatformName);
                // we repaint menu only in case we have changed apps
                if (this.cachedAppsItemsDiffer(rnApps, ReactNativeAppCommand.cachedApps)) {
                    this.showAppsQuickPick(rnApps);
                }
            });
        } catch (e) {
            VsCodeUtils.ShowErrorMessage(Strings.UnknownError);
            this.logger.error(e.message, e);
        }
    }

    private async showAppsQuickPick(rnApps: models.AppResponse[]) {
        if (!rnApps) {
            this.logger.debug("Do not show apps quick pick due to no apps (either in cache or fetched from server");
            return;
        }

        ReactNativeAppCommand.cachedApps = rnApps;
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
        if (!this.userAlreadySelectedApp) {
            vscode.window.showQuickPick(options, { placeHolder: Strings.ProvideCurrentAppPromptMsg }).then((selected: QuickPickAppItem) => {
                this.userAlreadySelectedApp = true;
                if (!selected) {
                    return;
                }
                this.handleShowCurrentAppQuickPickSelection(selected.target, rnApps);
            });
        }
    }

    private async handleShowCurrentAppQuickPickSelection(target: string, rnApps: models.AppResponse[]) {
        let selectedApp: models.AppResponse;

        const selectedApps: models.AppResponse[] = rnApps.filter(app => app.name === target);

        // If this is not current app then we can assign current app, otherwise we will use GetCurrentApp method
        if (target !== this.currentAppMenuTarget) {
            if (!selectedApps || selectedApps.length !== 1) {
                return;
            }
            selectedApp = selectedApps[0];
        }

        if (selectedApp) {
            this.isOrg = selectedApp.owner.type.toLowerCase() === AppCenteAppType.Org.toLowerCase();
            this.appName = selectedApp.name;
            this.ownerName = selectedApp.owner.name;
        } else {
            const currentApp: CurrentApp | null = await this.getCurrentApp();
            if (currentApp) {
                this.isOrg = currentApp.type.toLowerCase() === AppCenteAppType.Org.toLowerCase();
                this.appName = currentApp.appName;
                this.ownerName = currentApp.ownerName;
            } else {
                this.logger.error("Current app is undefiend");
                throw new Error("Current app is undefiend");
            }
        }
        this.showAppCenterPortalMenuQuickPick(MenuHelper.getAppCenterPortalMenuItems());
    }

    private async showAppCenterPortalMenuQuickPick(appCenterMenuOptions: CustomQuickPickItem[]): Promise<void> {
        return vscode.window.showQuickPick(appCenterMenuOptions, { placeHolder: Strings.MenuTitlePlaceholder })
            .then(async (selected: QuickPickAppItem) => {
                if (!selected) {
                    this.logger.info('User cancel selection of current appcenter tab');
                    return;
                }
                MenuHelper.handleMenuPortalQuickPickSelection(selected.target, this.ownerName, this.appName, this.isOrg);
        });
    }
}
