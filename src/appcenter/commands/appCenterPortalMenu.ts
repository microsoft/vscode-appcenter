import * as vscode from "vscode";
import { AppCenteAppType } from "../../constants";
import { CommandParams, CurrentApp, QuickPickAppItem } from "../../helpers/interfaces";
import { MenuHelper } from "../../helpers/menuHelper";
import { CustomQuickPickItem } from "../../helpers/vsCodeUtils";
import { Strings } from "../../strings";
import { models } from "../apis";
import { ReactNativeAppCommand } from "./reactNativeAppCommand";

export default class AppCenterPortalMenu extends ReactNativeAppCommand {
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
        this.showAppsQuickPick(this.CachedApps, true);
        this.refreshCachedAppsAndRepaintQuickPickIfNeeded(true);
    }

    protected async handleShowCurrentAppQuickPickSelection(selected: QuickPickAppItem, rnApps: models.AppResponse[]) {
        let selectedApp: models.AppResponse;

        const selectedApps: models.AppResponse[] = rnApps.filter(app => app.name === selected.target && app.owner.type === selected.description);

        // If this is not current app then we can assign current app, otherwise we will use GetCurrentApp method
        if (selected.target !== this.currentAppMenuTarget) {
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
                    this.logger.info('Canceled selection of current App Center tabs');
                    return;
                }
                MenuHelper.handleMenuPortalQuickPickSelection(selected.target, this.ownerName, this.appName, this.isOrg);
        });
    }
}
