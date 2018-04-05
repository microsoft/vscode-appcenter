import * as vscode from 'vscode';
import * as CodePush from ".";
import { ExtensionManager } from "../../../extensionManager";
import { CommandNames } from '../../../helpers/constants';
import { CurrentApp } from "../../../helpers/interfaces";
import { Strings } from '../../../helpers/strings';
import { CustomQuickPickItem } from '../../../helpers/vsCodeUtils';
import { ILogger } from "../../../log/logHelper";
import { RNCPAppCommand } from './rncpAppCommand';

/* Internal command */
export default class ShowMenu extends RNCPAppCommand {
    constructor(manager: ExtensionManager, logger: ILogger) {
        super(manager, logger);
    }

    public async runNoClient(): Promise<boolean | void> {
        if (!await super.runNoClient()) {
            return false;
        }

        return this.getCurrentApp().then((currentApp: CurrentApp) => {
            const menuOptions: CustomQuickPickItem[] = [];

            menuOptions.push(<CustomQuickPickItem>{
                label: Strings.releaseReactMenuText(currentApp),
                description: "",
                target: CommandNames.CodePush.ReleaseReact
            });
            if (currentApp.currentAppDeployments) {
                menuOptions.push(<CustomQuickPickItem>{
                    label: Strings.setCurrentAppDeploymentText(<CurrentApp>currentApp),
                    description: "",
                    target: CommandNames.CodePush.SetCurrentDeployment
                });
                menuOptions.push(<CustomQuickPickItem>{
                    label: Strings.setCurrentAppTargetBinaryVersionText(<CurrentApp>currentApp),
                    description: "",
                    target: CommandNames.CodePush.SetTargetBinaryVersion
                });
                menuOptions.push(<CustomQuickPickItem>{
                    label: Strings.setCurrentAppIsMandatoryText(<CurrentApp>currentApp),
                    description: "",
                    target: CommandNames.CodePush.SwitchMandatoryPropForRelease
                });
            }
            return this.showQuickPick(menuOptions);
        });
    }

    private showQuickPick(menuOptions: CustomQuickPickItem[]): Promise<void> {
        return new Promise((resolve) => {
            return vscode.window.showQuickPick(menuOptions, { placeHolder: Strings.MenuTitlePlaceholder })
                .then((selected: CustomQuickPickItem) => {
                    if (!selected) {
                        // user cancel selection
                        resolve();
                        return;
                    }

                    switch (selected.target) {
                        case (CommandNames.CodePush.SetCurrentDeployment):
                            new CodePush.SetCurrentDeployment(this.manager, this.logger).runNoClient();
                            break;

                        case (CommandNames.CodePush.ReleaseReact):
                            new CodePush.ReleaseReact(this.manager, this.logger).run();
                            break;

                        case (CommandNames.CodePush.SetTargetBinaryVersion):
                            new CodePush.SetTargetBinaryVersion(this.manager, this.logger).runNoClient();
                            break;

                        case (CommandNames.CodePush.SwitchMandatoryPropForRelease):
                            new CodePush.SwitchMandatoryPropForRelease(this.manager, this.logger).runNoClient();
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
