import { Utils } from "../../../helpers/utils/utils";
import AppCenterLinker from "../../../link/appCenterLinker";
import { Strings } from "../../resources/strings";
import { LinkCommand } from "../linkCommand";
import { VsCodeUI } from "../../ui/vscodeUI";

export default class LinkAppCenter extends LinkCommand {

    public async run(): Promise<void> {
        if (!await super.run()) {
            return;
        }

        if (!Utils.isReactNativeProject(this.logger, this.rootPath, false)) {
            VsCodeUI.ShowWarningMessage(Strings.NotReactProjectMsg);
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
                VsCodeUI.ShowErrorMessage(Strings.FailedToLinkAppCenter);
                return void 0;
            }
        }

        return await appCenterLinker.linkAppCenter(this.pickedApps);
    }
}
