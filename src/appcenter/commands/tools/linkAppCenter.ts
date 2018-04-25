import AppCenterLinker from '../../../appCenterLinker';
import { AppCenterOS, Constants } from '../../../constants';
import { CurrentApp, QuickPickAppItem } from '../../../helpers/interfaces';
import { Utils } from '../../../helpers/utils';
import { VsCodeUtils } from '../../../helpers/vsCodeUtils';
import { Strings } from '../../../strings';
import { models } from '../../apis';
import { ReactNativeAppCommand } from '../reactNativeAppCommand';

export default class LinkAppCenter extends ReactNativeAppCommand {
    private showedCount: number = 0;
    private pickedApps: CurrentApp[] = [];

    public async run(): Promise<void> {
        if (!await super.run()) {
            return;
        }

        if (!Utils.isReactNativeProject(this.logger, this.rootPath, false)) {
            VsCodeUtils.ShowWarningMessage(Strings.NotReactProjectMsg);
            return;
        }

        if (this.CachedApps) {
            this.showAppsQuickPick(this.CachedApps, true, false, Strings.ProvideSecondAppPromptMsg);
        }
        this.refreshCachedAppsAndRepaintQuickPickIfNeeded(true, false, Strings.ProvideFirstAppPromptMsg);
    }

    private async linkApps() {
        const appCenterLinker: AppCenterLinker = new AppCenterLinker(this.logger, this.rootPath);

        if (!Utils.isReactNativeAppCenterProject(this.logger, this.rootPath, false)) {
            const appCenterInstalled: boolean = await appCenterLinker.installAppcenter();
            if (!appCenterInstalled) {
                VsCodeUtils.ShowErrorMessage(Strings.FailedToLinkAppCenter);
                return;
            }
        }

        const linked = await appCenterLinker.linkAppCenter(this.pickedApps);
        if (!linked) {
            VsCodeUtils.ShowErrorMessage(Strings.FailedToLinkAppCenter);
            return;
        }
        VsCodeUtils.ShowInfoMessage(Strings.AppCenterLinkedMsg);
    }

    protected async handleShowCurrentAppQuickPickSelection(selected: QuickPickAppItem, _rnApps: models.AppResponse[]) {
        this.userAlreadySelectedApp = false;

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
        if (this.showedCount < 1) {
            this.showedCount++;
            const missingOS: AppCenterOS = currentApp.os.toLowerCase() === AppCenterOS.Android.toLowerCase() ? AppCenterOS.iOS : AppCenterOS.Android;
            const cachedFilteredApps = this.CachedApps.filter((cachedApp) => {
                return cachedApp.os.toLowerCase() === missingOS.toLowerCase();
            });
            const current: CurrentApp | null = await this.getCurrentApp();
            const showCurrentApp: boolean = current.os.toLowerCase() !== currentApp.os.toLowerCase();
            this.showAppsQuickPick(cachedFilteredApps, showCurrentApp, false, Strings.ProvideSecondAppPromptMsg);
        } else {
            this.linkApps();
        }
    }
}
