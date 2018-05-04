import { Utils } from "../../../helpers/utils/utils";
import { VsCodeUtils } from "../../../helpers/utils/vsCodeUtils";
import AppCenterLinker from "../../../link/appCenterLinker";
import { Strings } from "../../resources/strings";
import { LinkCommand } from "../linkCommand";

export default class LinkAppCenter extends LinkCommand {

    public async run(): Promise<void> {
        if (!await super.run()) {
            return;
        }

        if (!Utils.isReactNativeProject(this.logger, this.rootPath, false)) {
            VsCodeUtils.ShowWarningMessage(Strings.NotReactProjectMsg);
            return;
        }

        this.showAppsQuickPick(this.CachedAllApps, false, true, false, Strings.ProvideSecondAppPromptMsg);
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
