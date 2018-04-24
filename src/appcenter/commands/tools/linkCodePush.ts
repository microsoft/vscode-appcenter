
import AppCenterAppCreator from '../../../appCenterAppCreator';
import CodePushLinker from '../../../codePushLinker';
import { AppCenterProfile, CurrentApp, Deployment } from '../../../helpers/interfaces';
import { Utils } from '../../../helpers/utils';
import { VsCodeUtils } from '../../../helpers/vsCodeUtils';
import { Strings } from '../../../strings';
import { Command } from '../command';

export default class LinkCodePush extends Command {
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

        const appCenterAppCreator: AppCenterAppCreator = new AppCenterAppCreator(this.client, this.logger);
        const codePushLinker: CodePushLinker = new CodePushLinker(appCenterAppCreator, this.logger, this.rootPath);

        if (!Utils.isReactNativeCodePushProject(this.logger, this.rootPath, false)) {
            const codePushInstalled: boolean = await codePushLinker.installCodePush();
            if (!codePushInstalled) {
                VsCodeUtils.ShowErrorMessage(Strings.FailedToLinkCodePush);
                return;
            }
        }

        let deployments: Deployment[];
        if (this.hasCodePushDeployments(currentApp)) {
            deployments = currentApp.currentAppDeployments.codePushDeployments;
        } else {
            deployments = await codePushLinker.createCodePushDeployments([currentApp], currentApp.ownerName);
        }
        if (deployments.length < 1) {
            VsCodeUtils.ShowErrorMessage(Strings.FailedToLinkCodePush);
            return;
        }

        const linked = await codePushLinker.linkCodePush(deployments);
        if (!linked) {
            VsCodeUtils.ShowErrorMessage(Strings.FailedToLinkCodePush);
            return;
        }
        VsCodeUtils.ShowInfoMessage(Strings.CodePushLinkedMsg);
    }

    private hasCodePushDeployments(currentApp: CurrentApp) {
        return currentApp.currentAppDeployments && currentApp.currentAppDeployments.codePushDeployments && currentApp.currentAppDeployments.codePushDeployments.length;
    }
}
