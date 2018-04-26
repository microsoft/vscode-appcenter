
import AppCenterAppCreator from '../../../appCenterAppCreator';
import CodePushLinker from '../../../codePushLinker';
import { AppCenterOS, Constants } from '../../../constants';
import { CurrentApp, Deployment, QuickPickAppItem } from '../../../helpers/interfaces';
import { Utils } from '../../../helpers/utils';
import { VsCodeUtils } from '../../../helpers/vsCodeUtils';
import { Strings } from '../../../strings';
import { models } from '../../apis';
import { LinkCommand } from '../linkCommand';

export default class LinkCodePush extends LinkCommand {

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
        const appCenterAppCreator: AppCenterAppCreator = new AppCenterAppCreator(this.client, this.logger);
        const codePushLinker: CodePushLinker = new CodePushLinker(appCenterAppCreator, this.logger, this.rootPath);

        if (!Utils.isReactNativeCodePushProject(this.logger, this.rootPath, false)) {
            const codePushInstalled: boolean = await codePushLinker.installCodePush();
            if (!codePushInstalled) {
                VsCodeUtils.ShowErrorMessage(Strings.FailedToLinkCodePush);
                return false;
            }
        }

        let deployments: Deployment[];

        deployments = await codePushLinker.createCodePushDeployments(this.pickedApps, this.pickedApps[0].ownerName);

        if (deployments.length < 1) {
            VsCodeUtils.ShowErrorMessage(Strings.FailedToLinkCodePush);
            return false;
        }

        const linked = await codePushLinker.linkCodePush(deployments);
        if (!linked) {
            VsCodeUtils.ShowErrorMessage(Strings.FailedToLinkCodePush);
            return false;
        }
        VsCodeUtils.ShowInfoMessage(Strings.CodePushLinkedMsg);
        return true;
    }
}
