import * as vscode from 'vscode';
import * as CodePush from ".";
import { AppCenterDistributionTabs, CommandNames } from '../../../constants';
import { AppCenterUrlBuilder } from '../../../helpers/appCenterUrlBuilder';
import { CommandParams, CurrentApp } from "../../../helpers/interfaces";
import { Utils } from '../../../helpers/utils';
import { CustomQuickPickItem } from '../../../helpers/vsCodeUtils';
import { Strings } from '../../../strings';
import { RNCPAppCommand } from './rncpAppCommand';

/* Internal command */
export default class ShowMenu extends RNCPAppCommand {
    private _params: CommandParams;
    private currentApp: CurrentApp;

    constructor(params: CommandParams) {
        super(params);
        this._params = params;
        this.checkForCodePush = false;
    }

    public async runNoClient(): Promise<boolean | void> {
        if (!await super.runNoClient()) {
            return false;
        }

        return this.getCurrentApp().then((currentApp: CurrentApp) => {
            this.currentApp = currentApp;
            const menuOptions: CustomQuickPickItem[] = [];

            menuOptions.push(<CustomQuickPickItem>{
                label: Strings.DistributeCodePushTabMenuItem,
                description: Strings.OpenTabInBrowserMsg(Strings.DistributeCodePushTabMenuItem),
                target: AppCenterDistributionTabs.CodePush
            });

            menuOptions.push(<CustomQuickPickItem>{
                label: Strings.LinkCodePushMenuLabel,
                description: Strings.LinkCodePushMenuDescription,
                target: CommandNames.CodePush.LinkCodePush
            });

            if (this.hasCodePushDeployments(currentApp)) {
                menuOptions.push(<CustomQuickPickItem>{
                    label: Strings.releaseReactMenuText(currentApp),
                    description: "",
                    target: CommandNames.CodePush.ReleaseReact
                });
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
                            new CodePush.SetCurrentDeployment(this._params).runNoClient();
                            break;

                        case (CommandNames.CodePush.ReleaseReact):
                            new CodePush.ReleaseReact(this._params).run();
                            break;

                        case (CommandNames.CodePush.SetTargetBinaryVersion):
                            new CodePush.SetTargetBinaryVersion(this._params).runNoClient();
                            break;

                        case (CommandNames.CodePush.SwitchMandatoryPropForRelease):
                            new CodePush.SwitchMandatoryPropForRelease(this._params).runNoClient();
                            break;

                        case (CommandNames.CodePush.LinkCodePush):
                            new CodePush.LinkCodePush(this._params).run();
                            break;

                        case (AppCenterDistributionTabs.CodePush):
                            Utils.OpenUrl(AppCenterUrlBuilder.GetAppCenterDistributeTabLinkByTabName(this.currentApp.ownerName, this.currentApp.appName, AppCenterDistributionTabs.CodePush, this.currentApp.type !== "user"));
                            break;

                        default:
                            // Ideally shouldn't be there :)
                            this.logger.error("Unknown App Center menu command");
                            break;
                    }
                    resolve();
                });
        });
    }

}
