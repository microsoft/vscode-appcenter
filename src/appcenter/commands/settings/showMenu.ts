import * as vscode from "vscode";
import * as Settings from ".";
import { CommandNames } from "../../../constants";
import { ExtensionManager } from "../../../extensionManager";
import { CustomQuickPickItem } from "../../../helpers/vsCodeUtils";
import { ILogger } from "../../../log/logHelper";
import { Strings } from "../../../strings";
import { Command } from '../command';

/* Internal command */
export default class ShowMenu extends Command {

    constructor(manager: ExtensionManager, logger: ILogger) {
        super(manager, logger);
    }

    public async run(): Promise<boolean | void> {
        if (! await super.run()) {
            return false;
        }

        const menuOptions: CustomQuickPickItem[] = [];

        //todo change implementation

        menuOptions.push(<CustomQuickPickItem>{
            label: Strings.SwitchAccountMenuLabel,
            description: "",
            target: CommandNames.Settings.SwitchAccount
        });

        menuOptions.push(<CustomQuickPickItem>{
            label: Strings.LoginToAnotherAccountMenuLabel,
            description: "",
            target: CommandNames.Settings.LoginToAnotherAccount
        });

        menuOptions.push(<CustomQuickPickItem>{
            label: Strings.LogoutMenuLabel,
            description: "",
            target: CommandNames.Settings.Logout
        });

        return this.showQuickPick(menuOptions);
    }

    private showQuickPick(menuOptions: CustomQuickPickItem[]): Promise<void> {
        return new Promise((resolve) => {
            return vscode.window.showQuickPick(menuOptions, { placeHolder: Strings.MenuTitlePlaceholder })
                .then((selected: CustomQuickPickItem) => {
                    if (!selected) {
                        // User cancel selection
                        resolve();
                        return;
                    }

                    switch (selected.target) {
                        case (CommandNames.Settings.SwitchAccount):
                            new Settings.SwitchAccount(this.manager, this.logger).run();
                            break;

                        case (CommandNames.Settings.LoginToAnotherAccount):
                            new Settings.LoginToAnotherAccount(this.manager, this.logger).run();
                            break;

                        case (CommandNames.Settings.Logout):
                            new Settings.Logout(this.manager, this.logger).runNoClient();
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
