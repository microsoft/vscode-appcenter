import AppCenterAppCreator from '../../../createApp/appCenterAppCreator';
import { Deployment } from '../../../helpers/interfaces';
import { Utils } from '../../../helpers/utils/utils';
import CodePushLinker from '../../../link/codePushLinker';
import { Strings } from '../../resources/strings';
import { LinkCommand } from '../linkCommand';
import { VsCodeUI } from '../../ui/vscodeUI';

export default class LinkCodePush extends LinkCommand {
    public async run(): Promise<void> {
        if (!await super.run()) {
            return;
        }

        if (!Utils.isReactNativeProject(this.logger, this.rootPath, false)) {
            VsCodeUI.ShowWarningMessage(Strings.NotReactProjectMsg);
            return;
        }
        if (this.CachedAllApps) {
            this.showAppsQuickPick(this.CachedAllApps, false, true, false, Strings.ProvideSecondAppPromptMsg);
        } else {
            this.refreshCachedAppsAndRepaintQuickPickIfNeeded(true, false, false, Strings.ProvideFirstAppPromptMsg);
        }
    }

    protected async linkApps(): Promise<boolean> {
        const appCenterAppCreator: AppCenterAppCreator = new AppCenterAppCreator(this.client, this.logger);
        const codePushLinker: CodePushLinker = new CodePushLinker(appCenterAppCreator, this.logger, this.rootPath);

        if (!Utils.isReactNativeCodePushProject(this.logger, this.rootPath, false)) {
            const codePushInstalled: boolean = await codePushLinker.installCodePush();
            if (!codePushInstalled) {
                VsCodeUI.ShowErrorMessage(Strings.FailedToLinkCodePush);
                return false;
            }
        }

        let deployments: Deployment[];

        deployments = await codePushLinker.createCodePushDeployments(this.pickedApps, this.pickedApps[0].ownerName);

        if (deployments.length < 1) {
            VsCodeUI.ShowErrorMessage(Strings.FailedToLinkCodePush);
            return false;
        }

        const linked = await codePushLinker.linkCodePush(deployments);
        if (!linked) {
            VsCodeUI.ShowErrorMessage(Strings.FailedToLinkCodePush);
            return false;
        }
        VsCodeUI.ShowInfoMessage(Strings.CodePushLinkedMsg);
        return true;
    }
}
