import { CrashGenerator } from '../../../crashes/crashGenerator';
import { AppCenterUrlBuilder } from '../../../helpers/appCenterUrlBuilder';
import { AppCenterProfile, CommandParams, CurrentApp } from '../../../helpers/interfaces';
import { Strings } from '../../resources/strings';
import { Command } from '../command';
import { VsCodeUI, IButtonMessageItem } from '../../ui/vscodeUI';
import { Messages } from '../../resources/messages';
export default class SimulateCrashes extends Command {

    public constructor(params: CommandParams, private _app: CurrentApp = null) {
        super(params);
    }

    public async run(): Promise<void> {
        if (!await super.run()) {
            return;
        }
        try {
            const link: string = await VsCodeUI.showProgress(async progress => {
                progress.report({ message: Messages.SimulateCrashesProgressMessage });
                const profile: AppCenterProfile | null = await this.appCenterProfile;
                if (!this._app) {
                    if (profile && profile.currentApp) {
                        this._app = profile.currentApp;
                    } else {
                        VsCodeUI.ShowWarningMessage(Messages.NoCurrentAppSetWarning);
                    }
                }

                progress.report({ message: Messages.SimulateCrashesSendProgressMessage });

                const crashGenerator: CrashGenerator = new CrashGenerator(this._app, AppCenterUrlBuilder.getCrashesEndpoint(), this.logger);
                try {
                    await crashGenerator.generateCrashes();
                    return AppCenterUrlBuilder.GetPortalCrashesLink(this._app.ownerName, this._app.appName, this._app.type !== "user");
                } catch (e) {
                    VsCodeUI.ShowErrorMessage(Messages.FailedToGenerateCrashes);
                    this.logger.error(e.message, e);
                }

                return null;
            });
            if (link) {
                const messageItems: IButtonMessageItem[] = [];
                messageItems.push({
                    title: Strings.CrashesSimulatedBtnLabel,
                    url: link
                });
                VsCodeUI.ShowInfoMessage(Messages.CrashesSimulatedMessage, ...messageItems);
            }
        } catch (e) {
            VsCodeUI.ShowErrorMessage(Messages.FailedToGenerateCrashes);
            this.logger.error(e.message, e);
        }
    }
}
