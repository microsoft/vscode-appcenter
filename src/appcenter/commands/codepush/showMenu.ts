import * as vscode from 'vscode';
import { ExtensionManager } from "../../../extensionManager";
import { CommandNames } from '../../../helpers/constants';
import { CurrentApp } from "../../../helpers/interfaces";
import { Strings } from '../../../helpers/strings';
import { ILogger } from "../../../log/logHelper";
import { RNCPAppCommand } from './rncpAppCommand';
import * as CodePush from ".";

export default class ShowMenu extends RNCPAppCommand {
    constructor(manager: ExtensionManager, logger: ILogger) {
        super(manager, logger);
    }

    public async runNoClient(): Promise<void> {
        if (!await super.runNoClient()) {
            return;
        }

        return this.getCurrentApp().then((currentApp: CurrentApp) => {
            const menuOptions: vscode.QuickPickItem[] = [];

            menuOptions.push(<vscode.QuickPickItem>{
                label: Strings.releaseReactMenuText(currentApp),
                description: "",
                target: CommandNames.CodePush.ReleaseReact
            });
            if (currentApp.currentAppDeployments) {
                menuOptions.push(<vscode.QuickPickItem>{
                    label: Strings.setCurrentAppDeploymentText(<CurrentApp>currentApp),
                    description: "",
                    target: CommandNames.CodePush.SetCurrentDeployment
                });
                menuOptions.push(<vscode.QuickPickItem>{
                    label: Strings.setCurrentAppTargetBinaryVersionText(<CurrentApp>currentApp),
                    description: "",
                    target: CommandNames.CodePush.SetTargetBinaryVersion
                });
                menuOptions.push(<vscode.QuickPickItem>{
                    label: Strings.setCurrentAppIsMandatoryText(<CurrentApp>currentApp),
                    description: "",
                    target: CommandNames.CodePush.SwitchMandatoryPropForRelease
                });
            }
            return this.showQuickPick(menuOptions);
        });
    }

    private showQuickPick(menuOptions: vscode.QuickPickItem[]): Promise<void> {
        return new Promise((resolve) => {
            return vscode.window.showQuickPick(menuOptions, { placeHolder: Strings.MenuTitlePlaceholder })
                .then((selected: { label: string, description: string, target: string }) => {
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