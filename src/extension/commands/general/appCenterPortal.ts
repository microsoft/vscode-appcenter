import { models } from "../../../api/appcenter";
import { CurrentApp, QuickPickAppItem } from "../../../helpers/interfaces";
import { AppCenterPortalMenu } from "../../menu/appCenterPortalMenu";
import { AppCenterAppType, CommandNames } from "../../resources/constants";
import { ReactNativeAppCommand } from "../reactNativeAppCommand";

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
            return await this.showCreateAppOptions();
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

            let isOrg: boolean;
            let appName: string;
            let ownerName: string;

            if (selectedApp) {
                isOrg = selectedApp.owner.type.toLowerCase() === AppCenterAppType.Org.toLowerCase();
                appName = selectedApp.name;
                ownerName = selectedApp.owner.name;
            } else {
                const currentApp: CurrentApp | null = await this.getCurrentApp();
                if (currentApp) {
                    isOrg = currentApp.type.toLowerCase() === AppCenterAppType.Org.toLowerCase();
                    appName = currentApp.appName;
                    ownerName = currentApp.ownerName;
                } else {
                    this.logger.error("Current app is undefined");
                    throw new Error("Current app is undefined");
                }
            }

            return new AppCenterPortalMenu(isOrg, appName, ownerName, this._params).show();
        }
    }
}
