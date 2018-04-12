import * as vscode from 'vscode';
import * as Tools from '.';
import { CommandNames } from '../../../constants';
import { CommandParams } from '../../../helpers/interfaces';
import { Strings } from '../../../strings';
import { Command } from '../command';

export default class ShowTools extends Command {
    private _params: CommandParams;
    constructor(params: CommandParams) {
        super(params);
        this._params = params;
    }

    public async runNoClient(): Promise<void> {
        super.runNoClient();
        const appCenterMenuOptions: vscode.QuickPickItem[] = [];

        // Tools menu
        appCenterMenuOptions.push(<vscode.QuickPickItem>{
            label: Strings.CrashesMenuLabel,
            description: "",
            target: CommandNames.Tools.SimulateCrashes
        });

        return this.showQuickPick(appCenterMenuOptions);
    }

    private showQuickPick(appCenterMenuOptions: vscode.QuickPickItem[]): Promise<void> {
        return new Promise((resolve) => {
            return vscode.window.showQuickPick(appCenterMenuOptions, { placeHolder: Strings.MenuTitlePlaceholder })
                .then((selected: { label: string, description: string, target: string }) => {
                    if (!selected) {
                        // user cancel selection
                        resolve();
                        return;
                    }

                    switch (selected.target) {
                        case (CommandNames.Tools.SimulateCrashes):
                            new Tools.SimulateCrashes(this._params).runNoClient();
                            break;

                        default:
                            // Ideally shouldn't be there :)
                            this.logger.error("Unknown AppCenter menu command");
                            break;
                    }
                    resolve();
                });
        });
    }
}
