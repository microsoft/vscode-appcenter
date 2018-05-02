import { CommandNames } from "../../constants";
import { CommandParams, QuickPickAppItem } from "../../helpers/interfaces";
import { models } from "../apis";
import * as AppCenterPortal from "./portal";
import { ReactNativeAppCommand } from "./reactNativeAppCommand";

export default class AppCenterPortalMenu extends ReactNativeAppCommand {

    constructor(params: CommandParams) {
        super(params);
    }

    public async run(): Promise<void> {

        // Disabling the check whether project has react-native package installed cause it's kinda useless here.
        this.checkForReact = false;
        if (!await super.run()) {
            return;
        }
        this.showAppsQuickPick(this.CachedApps, true);
        this.refreshCachedAppsAndRepaintQuickPickIfNeeded(true);
    }

    protected async handleShowCurrentAppQuickPickSelection(selected: QuickPickAppItem, rnApps: models.AppResponse[]) {
        if (selected.target === CommandNames.CreateApp.CommandName) {
            return this.showCreateAppOptions();
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

            new AppCenterPortal.ShowMenu(this._params, selectedApp).run();
        }
    }
}
