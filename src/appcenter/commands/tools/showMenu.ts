import * as vscode from 'vscode';
import * as Tools from '.';
import { CommandNames } from '../../../constants';
import { CommandParams, AppCenterProfile } from '../../../helpers/interfaces';
import { SettingsHelper } from '../../../helpers/settingsHelper';
import { Strings } from '../../../strings';
import { Command } from '../command';
import { Utils } from '../../../helpers/utils';

export default class ShowMenu extends Command {
    private _params: CommandParams;
    constructor(params: CommandParams) {
        super(params);
        this._params = params;
    }

    public async runNoClient(): Promise<void> {
        if (! await super.runNoClient()) {
            return;
        }
        const appCenterMenuOptions: vscode.QuickPickItem[] = [];

        // Tools menu
        const crashesEnabled = SettingsHelper.isCrashesEnabled();
        if (crashesEnabled) {
            appCenterMenuOptions.push(<vscode.QuickPickItem>{
                label: Strings.CrashesMenuLabel,
                description: "",
                target: CommandNames.Tools.SimulateCrashes
            });
        }

        const profile: AppCenterProfile = await this.appCenterProfile;
        if (profile) {
            if (Utils.isReactNativeProject(this.logger, this.rootPath, false) && profile.currentApp) {
                appCenterMenuOptions.push(<vscode.QuickPickItem>{
                    label: Strings.LinkCodePushMenuLabel,
                    description: Strings.LinkCodePushMenuDescription,
                    target: CommandNames.Tools.LinkCodePush
                });

                appCenterMenuOptions.push(<vscode.QuickPickItem>{
                    label: Strings.LinkAppCenterMenuLabel,
                    description: Strings.LinkAppCenterMenuDescription,
                    target: CommandNames.Tools.LinkAppCenter
                });
            }
        }

        return this.showQuickPick(appCenterMenuOptions);
    }

    private async showQuickPick(appCenterMenuOptions: vscode.QuickPickItem[]): Promise<void> {
        return vscode.window.showQuickPick(appCenterMenuOptions, { placeHolder: Strings.MenuTitlePlaceholder })
            .then((selected: { label: string, description: string, target: string }) => {
                if (!selected) {
                    // user cancel selection
                    return;
                }

                switch (selected.target) {
                    case (CommandNames.Tools.SimulateCrashes):
                        new Tools.SimulateCrashes(this._params).run();
                        break;

                    case (CommandNames.Tools.LinkCodePush):
                        new Tools.LinkCodePush(this._params).run();
                        break;
                    case (CommandNames.Tools.LinkAppCenter):
                        new Tools.LinkAppCenter(this._params).run();
                        break;

                    default:
                        // Ideally shouldn't be there :)
                        this.logger.error("Unknown App Center menu command");
                        break;
                }
                return;
            });
    }
}
