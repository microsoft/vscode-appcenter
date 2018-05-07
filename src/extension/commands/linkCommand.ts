
import { models } from '../../api/appcenter';
import { CurrentApp, QuickPickAppItem } from '../../helpers/interfaces';
import { SettingsHelper } from "../../helpers/settingsHelper";
import { Utils } from '../../helpers/utils/utils';
import { AppCenterOS, Constants } from '../resources/constants';
import { Strings } from '../resources/strings';
import { ReactNativeAppCommand } from "./reactNativeAppCommand";

export class LinkCommand extends ReactNativeAppCommand {
    protected showedCount: number = 0;
    protected pickedApps: CurrentApp[] = [];

    public async run(): Promise<boolean | void> {
        if (!await super.run()) {
            return false;
        }
        return true;
    }

    protected async handleShowCurrentAppQuickPickSelection(selected: QuickPickAppItem, _rnApps: models.AppResponse[]) {
        let currentApp: CurrentApp | null;
        if (selected.target === this.currentAppMenuTarget) {
            currentApp = await this.getCurrentApp();
        } else {
            const selectedApps: models.AppResponse[] = _rnApps.filter(app => app.name === selected.target && app.owner.type === selected.description);
            if (!selectedApps || selectedApps.length !== 1) {
                this.showedCount = 0;
                this.pickedApps = [];
                return;
            }
            const selectedApp: models.AppResponse = selectedApps[0];
            const selectedAppName: string = `${selectedApp.owner.name}/${selectedApp.name}`;
            const selectedAppSecret: string = selectedApp.appSecret;
            const type: string = selectedApp.owner.type;

            const OS: AppCenterOS | undefined = Utils.toAppCenterOS(selectedApp.os);
            currentApp = Utils.toCurrentApp(selectedAppName, OS, null, Constants.AppCenterDefaultTargetBinaryVersion, type, Constants.AppCenterDefaultIsMandatoryParam, selectedAppSecret);
        }
        this.pickedApps.push(currentApp);
        if (this.showedCount < 1 && SettingsHelper.linkTwoApps()) {
            this.showedCount++;
            const missingOS: AppCenterOS = currentApp.os.toLowerCase() === AppCenterOS.Android.toLowerCase() ? AppCenterOS.iOS : AppCenterOS.Android;
            const cachedFilteredApps = this.getRnApps(this.CachedAllApps).filter((cachedApp) => {
                return cachedApp.os.toLowerCase() === missingOS.toLowerCase();
            });
            const current: CurrentApp | null = await this.getCurrentApp();
            const showCurrentApp: boolean = current.os.toLowerCase() !== currentApp.os.toLowerCase();
            this.showAppsQuickPick(cachedFilteredApps, false, showCurrentApp, false, Strings.ProvideSecondAppHint, true);
        } else {
            this.linkApps();
        }
    }

    protected async linkApps(): Promise<boolean> {
        throw Error("linkApps not implemented in base class");
    }
}
