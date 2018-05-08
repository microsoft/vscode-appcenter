import { Utils } from "../../../helpers/utils/utils";
import AppCenterLinker from "../../../link/appCenterLinker";
import { Strings } from "../../resources/strings";
import { LinkCommand } from "../linkCommand";
import { VsCodeUI } from "../../ui/vscodeUI";
import { Constants, AppCenterOS } from "../../resources/constants";
import { Messages } from "../../resources/messages";

export default class LinkAppCenter extends LinkCommand {

    public async run(): Promise<void> {
        if (!await super.run()) {
            return;
        }

        if (!Utils.isReactNativeProject(this.logger, this.rootPath, false)) {
            VsCodeUI.ShowWarningMessage(Messages.NotReactProjectWarning);
            return;
        }

        this.showAppsQuickPick(this.CachedAllApps, false, true, false, Strings.ProvideSecondAppHint);
        this.refreshCachedAppsAndRepaintQuickPickIfNeeded(true, false, false, Strings.ProvideFirstAppHint);
    }

    protected async linkApps(): Promise<boolean> {
        const appCenterLinker: AppCenterLinker = new AppCenterLinker(this.logger, this.rootPath);

        if (!Utils.isReactNativeAppCenterProject(this.logger, this.rootPath, false)) {
            const appCenterInstalled: boolean = await appCenterLinker.installAppcenter();
            if (!appCenterInstalled) {
                VsCodeUI.ShowErrorMessage(Messages.FailedToLinkAppCenter);
                return void 0;
            }
        }

        this.removeAppSecretKeys();

        return await appCenterLinker.linkAppCenter(this.pickedApps);
    }

    private removeAppSecretKeys() {
        const appName: string = Utils.getAppName(this.rootPath);

        const appCenterConfig = Utils.createAppCenterConfigFrom(appName, this.rootPath, this.logger);

        const hasAndroidApps: boolean = this.pickedApps.some(app => {
            return app.os.toLowerCase() === AppCenterOS.Android.toLowerCase();
        });

        const hasiOSApps: boolean = this.pickedApps.some(app => {
            return app.os.toLowerCase() === AppCenterOS.iOS.toLowerCase();
        });

        if (hasiOSApps) {
            appCenterConfig.deleteConfigPlistValueByKey(Constants.IOSAppSecretKey);
            appCenterConfig.saveConfigPlist();
        }

        if (hasAndroidApps) {
            appCenterConfig.deleteAndroidAppCenterConfigValueByKey(Constants.AndroidAppSecretKey);
            appCenterConfig.saveAndroidAppCenterConfig();
        }
    }

}
