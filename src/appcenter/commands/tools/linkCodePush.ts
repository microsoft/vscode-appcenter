
import AppCenterAppCreator from '../../../appCenterAppCreator';
import CodePushLinker from '../../../codePushLinker';
import { AppCenterOS, Constants } from '../../../constants';
import { CurrentApp, Deployment, QuickPickAppItem } from '../../../helpers/interfaces';
import { Utils } from '../../../helpers/utils';
import { VsCodeUtils } from '../../../helpers/vsCodeUtils';
import { Strings } from '../../../strings';
import { models } from '../../apis';
import { ReactNativeAppCommand } from '../reactNativeAppCommand';

export default class LinkCodePush extends ReactNativeAppCommand {
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

        deployments = await codePushLinker.createCodePushDeployments(this.pickedApps, this.pickedApps[0].ownerName);

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

    protected async handleShowCurrentAppQuickPickSelection(selected: QuickPickAppItem, _rnApps: models.AppResponse[]) {
        this.userAlreadySelectedApp = false;
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
        const currentApp = Utils.toCurrentApp(selectedAppName, OS, null, Constants.AppCenterDefaultTargetBinaryVersion, type, Constants.AppCenterDefaultIsMandatoryParam, selectedAppSecret);

        this.pickedApps.push(currentApp);
        if (this.showedCount < 1) {
            this.showedCount++;
            const missingOS: AppCenterOS = OS === AppCenterOS.Android ? AppCenterOS.iOS : AppCenterOS.Android;
            const cachedFilteredApps = this.CachedApps.filter((cachedApp) => {
                return cachedApp.os.toLowerCase() === missingOS.toLowerCase();
            });
            const currentApp: CurrentApp | null = await this.getCurrentApp();
            const showCurrentApp: boolean = currentApp.os.toLowerCase() !== OS.toLowerCase();
            this.showAppsQuickPick(cachedFilteredApps, showCurrentApp, false, Strings.ProvideSecondAppPromptMsg);
        } else {
            this.linkApps();
        }
    }
}
