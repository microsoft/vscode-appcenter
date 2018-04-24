import AppCenterLinker from '../../../appCenterLinker';
import { AppCenterOS } from '../../../constants';
import { AppCenterProfile, CurrentApp } from '../../../helpers/interfaces';
import { Utils } from '../../../helpers/utils';
import { VsCodeUtils } from '../../../helpers/vsCodeUtils';
import { Strings } from '../../../strings';
import { Command } from '../command';

export default class LinkAppCenter extends Command {
    public async run(): Promise<void> {
        if (!await super.run()) {
            return;
        }

        const profile: AppCenterProfile = await this.appCenterProfile;
        const currentApp: CurrentApp = profile.currentApp;

        if (!currentApp) {
            VsCodeUtils.ShowWarningMessage(Strings.NoCurrentAppSetMsg);
            return;
        }

        if (!Utils.isReactNativeProject(this.logger, this.rootPath, false)) {
            VsCodeUtils.ShowWarningMessage(Strings.NotReactProjectMsg);
            return;
        }

        const appCenterLinker: AppCenterLinker = new AppCenterLinker(this.logger, this.rootPath);

        if (!Utils.isReactNativeAppCenterProject(this.logger, this.rootPath, false)) {
            const appCenterInstalled: boolean = await appCenterLinker.installAppcenter();
            if (!appCenterInstalled) {
                VsCodeUtils.ShowErrorMessage(Strings.FailedToLinkAppCenter);
                return;
            }
        }

        const appSecret: string = currentApp.appSecret;
        let os: AppCenterOS;
        if (currentApp.os.toLowerCase() === AppCenterOS.iOS.toLowerCase()) {
            os = AppCenterOS.iOS;
        }
        if (currentApp.os.toLowerCase() === AppCenterOS.Android.toLowerCase()) {
            os = AppCenterOS.Android;
        }

        const linked = await appCenterLinker.linkAppCenter(appSecret, os);
        if (!linked) {
            VsCodeUtils.ShowErrorMessage(Strings.FailedToLinkAppCenter);
            return;
        }
        VsCodeUtils.ShowInfoMessage(Strings.AppCenterLinkedMsg);
    }
}
