import AppCenterLinker from '../../appCenterLinker';
import { Utils } from '../../helpers/utils';
import { VsCodeUtils } from '../../helpers/vsCodeUtils';
import { Strings } from '../../strings';
import { LinkCommand } from './linkCommand';

export default class LinkAppCenter extends LinkCommand {

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
        this.refreshCachedAppsAndRepaintQuickPickIfNeeded(true, false, false, Strings.ProvideFirstAppPromptMsg);
    }

    protected async linkApps(): Promise<boolean> {
        const appCenterLinker: AppCenterLinker = new AppCenterLinker(this.logger, this.rootPath);

        if (!Utils.isReactNativeAppCenterProject(this.logger, this.rootPath, false)) {
            const appCenterInstalled: boolean = await appCenterLinker.installAppcenter();
            if (!appCenterInstalled) {
                VsCodeUtils.ShowErrorMessage(Strings.FailedToLinkAppCenter);
                return void 0;
            }
        }

        return await appCenterLinker.linkAppCenter(this.pickedApps);
    }
}
