import * as vscode from 'vscode';
import { AppCenterUrlBuilder } from '../../../helpers/appCenterUrlBuilder';
import { AppCenterProfile } from '../../../helpers/interfaces';
import { IButtonMessageItem, VsCodeUtils } from '../../../helpers/vsCodeUtils';
import { Strings } from '../../../strings';
import { CrashGenerator } from '../../crashes/crashGenerator';
import { Command } from '../command';

export default class SimulateCrashes extends Command {

    public async run(): Promise<void> {
        if (!await super.run()) {
            return;
        }
        try {
            vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.SimulateCrashesMessage }, (progress) => {
                return this.appCenterProfile.then(async (profile: AppCenterProfile | null) => {
                    if (profile && profile.currentApp) {
                        const crashGenerator: CrashGenerator = new CrashGenerator(profile.currentApp, AppCenterUrlBuilder.getCrashesEndpoint(), this.logger, progress);
                        try {
                            await crashGenerator.generateCrashes();
                            return AppCenterUrlBuilder.GetPortalCrashesLink(profile.currentApp.ownerName, profile.currentApp.appName, profile.currentApp.type !== "user");
                        } catch {
                            VsCodeUtils.ShowErrorMessage(Strings.GenerateCrashesError);
                        }
                    }
                    return null;
                });
            }).then((link) => {
                if (link) {
                    const messageItems: IButtonMessageItem[] = [];
                    messageItems.push({
                        title: Strings.CrashesSimulatedHint,
                        url: link
                    });
                    VsCodeUtils.ShowInfoMessage(Strings.CrashesSimulated, ...messageItems);
                }
            });
        } catch (e) {
            VsCodeUtils.ShowErrorMessage(Strings.GenerateCrashesError);
            this.logger.error(e.message, e);
        }
    }
}
