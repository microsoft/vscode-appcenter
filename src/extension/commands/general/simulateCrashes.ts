import { CrashGenerator } from '../../../crashes/crashGenerator';
import { AppCenterUrlBuilder } from '../../../helpers/appCenterUrlBuilder';
import { AppCenterProfile } from '../../../helpers/interfaces';
import { Strings } from '../../resources/strings';
import { Command } from '../command';
import { VsCodeUI, IButtonMessageItem } from '../../ui/vscodeUI';
import { Messages } from '../../resources/messages';
export default class SimulateCrashes extends Command {

    public async run(): Promise<void> {
        if (!await super.run()) {
            return;
        }
        try {
            await VsCodeUI.showProgress((progress) => {
                progress.report({ message: Messages.SimulateCrashesProgressMessage });
                return this.appCenterProfile.then(async (profile: AppCenterProfile | null) => {
                    if (profile && profile.currentApp) {
                        const crashGenerator: CrashGenerator = new CrashGenerator(profile.currentApp, AppCenterUrlBuilder.getCrashesEndpoint(), this.logger, progress);
                        try {
                            await crashGenerator.generateCrashes();
                            return AppCenterUrlBuilder.GetPortalCrashesLink(profile.currentApp.ownerName, profile.currentApp.appName, profile.currentApp.type !== "user");
                        } catch {
                            VsCodeUI.ShowErrorMessage(Messages.FailedToGenerateCrashes);
                        }
                    } else {
                        VsCodeUI.ShowWarningMessage(Messages.NoCurrentAppSetWarning);
                    }
                    return null;
                });
            }).then((link) => {
                if (link) {
                    const messageItems: IButtonMessageItem[] = [];
                    messageItems.push({
                        title: Strings.CrashesSimulatedBtnLabel,
                        url: link
                    });
                    VsCodeUI.ShowInfoMessage(Messages.CrashesSimulatedMessage, ...messageItems);
                }
            });
        } catch (e) {
            VsCodeUI.ShowErrorMessage(Messages.FailedToGenerateCrashes);
            this.logger.error(e.message, e);
        }
    }
}
