import { ILogger } from '../extension/log/logHelper';
import { AppCenterOS } from '../extension/resources/constants';
import { Strings } from '../extension/resources/strings';
import { CurrentApp } from '../helpers/interfaces';
import { TerminalHelper } from '../helpers/terminalHelper';
import { cpUtils } from '../helpers/utils/cpUtils';
import { IButtonMessageItem, VsCodeUI } from '../extension/ui/vscodeUI';

export default class AppCenterLinker {

    constructor(private logger: ILogger, private rootPath: string) { }

    public async installAppcenter(): Promise<boolean> {
        const installAppCenterCmd: string = "npm i appcenter appcenter-analytics appcenter-crashes --save";
        return await VsCodeUI.showProgress(async (progress) => {
            progress.report({ message: Strings.InstallAppCenterTitle });
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
        const terminalHelper: TerminalHelper = new TerminalHelper();
        terminalHelper.show();

        const messageItems: IButtonMessageItem[] = [];
        messageItems.push({
            title: Strings.OkBtnLabel
        });

        return await VsCodeUI.ShowInfoMessage(Strings.AppCenterBeforeLinkMsg, ...messageItems)
            .then(async (selection: IButtonMessageItem | undefined) => {
                if (selection) {
                    terminalHelper.run('react-native link');
                    const messageItems: IButtonMessageItem[] = [];
                    messageItems.push({
                        title: "Done"
                    });
                    await VsCodeUI.ShowInfoMessage(Strings.AppCenterSecretsHint(androidAppSecret, iosAppSecret), ...messageItems);
                    return true;
                }
                return false;
            });
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
