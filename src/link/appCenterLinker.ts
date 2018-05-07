import { ILogger } from '../extension/log/logHelper';
import { AppCenterOS } from '../extension/resources/constants';
import { Strings } from '../extension/resources/strings';
import { CurrentApp } from '../helpers/interfaces';
import { cpUtils } from '../helpers/utils/cpUtils';
import { IButtonMessageItem, VsCodeUI } from '../extension/ui/vscodeUI';
import { VsCodeTerminal } from '../extension/ui/VsCodeTerminal';
import { Messages } from '../extension/resources/messages';

export default class AppCenterLinker {

    constructor(private logger: ILogger, private rootPath: string) { }

    public async installAppcenter(): Promise<boolean> {
        const installAppCenterCmd: string = "npm i appcenter appcenter-analytics appcenter-crashes --save";
        return await VsCodeUI.showProgress(async (progress) => {
            progress.report({ message: Messages.InstallAppCenterProgressMessage });
            try {
                await cpUtils.executeCommand(this.logger, true, this.rootPath, installAppCenterCmd);
                return true;
            } catch (error) {
                this.logger.error(`Failed to run ${installAppCenterCmd}`);
                return false;
            }
        });
    }

    public async linkAppCenter(apps: CurrentApp[]): Promise<boolean> {
        const iosAppSecret = this.findSecretFor(AppCenterOS.iOS, apps);
        const androidAppSecret = this.findSecretFor(AppCenterOS.Android, apps);
        const terminalHelper: VsCodeTerminal = new VsCodeTerminal();
        terminalHelper.show();

        const messageItems: IButtonMessageItem[] = [];
        messageItems.push({
            title: Strings.OkBtnLabel
        });

        const selection: IButtonMessageItem | undefined = await VsCodeUI.ShowInfoMessage(Messages.AppCenterBeforeLinkMessage, ...messageItems);
        if (selection) {
            terminalHelper.run('react-native link');
            const messageItems: IButtonMessageItem[] = [];
            messageItems.push({
                title: Strings.LinkDoneBtnLabel
            });
            VsCodeUI.ShowInfoMessage(Messages.AppCenterSecretsHintMessage(androidAppSecret, iosAppSecret), ...messageItems);
            return true;
        }
        return false;
    }

    private findSecretFor(os: AppCenterOS, apps: CurrentApp[]): string {
        const filteredApps: CurrentApp[] = apps.filter((app) => {
            return app.os.toLowerCase() === os.toLowerCase();
        });
        if (filteredApps.length === 0) {
            return "";
        }
        return filteredApps[0].appSecret || "";
    }
}
