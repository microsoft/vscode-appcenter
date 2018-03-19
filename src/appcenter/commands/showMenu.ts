import * as vscode from "vscode";
import { ExtensionManager } from "../../extensionManager";
import { CommandNames } from "../../helpers/constants";
import { Strings } from "../../helpers/strings";
import { ILogger } from "../../log/logHelper";
import { Command } from "./command";
import Logout from "./logout";
import Start from "./start";

export default class ShowMenu extends Command {

    constructor(manager: ExtensionManager, logger: ILogger) {
        super(manager, logger);
    }

    public async runNoClient(): Promise<void> {
        super.runNoClient();

        const menuPlaceHolederTitle = Strings.MenuTitlePlaceholder;
        const appCenterMenuOptions = [
            {
                label: Strings.StartAnIdeaMenuLabel,
                description: "",
                target: CommandNames.Start
            },
            {
                label: Strings.LogoutMenuLabel,
                description: "",
                target: CommandNames.Logout
            }
         ];
         return vscode.window.showQuickPick(appCenterMenuOptions, { placeHolder: menuPlaceHolederTitle })
            .then((selected: {label: string, description: string, target: string}) => {
            if (!selected) {
                // user cancel selection
                return Promise.resolve(void 0);
            }

            switch (selected.target) {
                case (CommandNames.Start):
                    new Start(this.manager, this.logger).run();
                    return Promise.resolve(void 0);

                case (CommandNames.Logout):
                    new Logout(this.manager, this.logger).runNoClient();
                    return Promise.resolve(void 0);

                default:
                    // Ideally shouldn't be there :)
                    this.logger.error("Unknown AppCenter menu command");
                    return Promise.resolve(void 0);
            }
        });
    }
}
