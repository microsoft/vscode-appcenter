import * as vscode from "vscode";

import { ExtensionManager } from "../../extensionManager";
import { CommandNames } from "../../helpers/constants";
import { FSUtils } from "../../helpers/fsUtils";
import { CurrentApp } from "../../helpers/interfaces";
import { Strings } from "../../helpers/strings";
import { Utils } from "../../helpers/utils";
import { ILogger } from "../../log/logHelper";
import { Profile } from "../auth/profile/profile";
import AppCenterPortalMenu from "./appCenterPortalMenu";
import * as CodePush from "./codepush";
import { Command } from "./command";
import GetCurrentApp from "./getCurrentApp";
import Login from "./login";
import Logout from "./logout";
import SetCurrentApp from "./setCurrentApp";
import Start from "./start";

export default class ShowMenu extends Command {

    constructor(manager: ExtensionManager, logger: ILogger) {
        super(manager, logger);
    }

    public async runNoClient(): Promise<void> {
        super.runNoClient();

        return this.Profile.then((profile: Profile | null) => {
            const appCenterMenuOptions: vscode.QuickPickItem[] = [];
            if (!profile) {

                // In rare cases that might happen.
                appCenterMenuOptions.push(<vscode.QuickPickItem>{
                    label: Strings.LoginMenuLabel,
                    description: "",
                    target: CommandNames.Login
                });
                return this.showQuickPick(appCenterMenuOptions);
            }

            // For empty directory show only `Start New Idea`
            if (FSUtils.IsNewDirectoryForProject(<string>this.manager.projectRootPath)) {
                appCenterMenuOptions.push(<vscode.QuickPickItem>{
                    label: Strings.StartAnIdeaMenuLabel,
                    description: "",
                    target: CommandNames.Start
                });
            } else {
                let currentApp: CurrentApp | undefined;
                if (profile.currentApp) {
                    currentApp = profile.currentApp;
                }
                const isReactNativeProject = Utils.isReactNativeProject(this.manager.projectRootPath, /* showMessageOnError */false);
                if (isReactNativeProject) {
                    appCenterMenuOptions.push(<vscode.QuickPickItem>{
                        label: Strings.AppCenterPortalMenuLabel,
                        description: "",
                        target: CommandNames.AppCenterPortal
                    });
                    const isReactNativeCodePushProject = Utils.isReactNativeCodePushProject(this.manager.projectRootPath, /* showMessageOnError */false);
                    if (isReactNativeCodePushProject) {
                        this.addCodePushMenuItems(appCenterMenuOptions, currentApp);
                    }
                }
            }

            // Logout should be the last option
            appCenterMenuOptions.push(<vscode.QuickPickItem>{
                label: Strings.LogoutMenuLabel,
                description: "",
                target: CommandNames.Logout
            });

            return this.showQuickPick(appCenterMenuOptions);
        });
    }

    private addCodePushMenuItems(appCenterMenuOptions: vscode.QuickPickItem[], currentApp?: CurrentApp): void {
        appCenterMenuOptions.push(<vscode.QuickPickItem>{
            label: Strings.setCurrentAppMenuText(currentApp),
            description: "",
            target: CommandNames.SetCurrentApp
        });
        if (currentApp) {
            appCenterMenuOptions.push(<vscode.QuickPickItem>{
                label: Strings.releaseReactMenuText(currentApp),
                description: "",
                target: CommandNames.CodePush.ReleaseReact
            });
            if (currentApp.currentAppDeployments) {
                appCenterMenuOptions.push(<vscode.QuickPickItem>{
                    label: Strings.setCurrentAppDeploymentText(<CurrentApp>currentApp),
                    description: "",
                    target: CommandNames.CodePush.SetCurrentDeployment
                });
                appCenterMenuOptions.push(<vscode.QuickPickItem>{
                    label: Strings.setCurrentAppTargetBinaryVersionText(<CurrentApp>currentApp),
                    description: "",
                    target: CommandNames.CodePush.SetTargetBinaryVersion
                });
                appCenterMenuOptions.push(<vscode.QuickPickItem>{
                    label: Strings.setCurrentAppIsMandatoryText(<CurrentApp>currentApp),
                    description: "",
                    target: CommandNames.CodePush.SwitchMandatoryPropForRelease
                });
            }
        }
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
                        case (CommandNames.AppCenterPortal):
                            new AppCenterPortalMenu(this.manager, this.logger).run();
                            break;

                        case (CommandNames.Start):
                            new Start(this.manager, this.logger).run();
                            break;

                        case (CommandNames.Logout):
                            new Logout(this.manager, this.logger).runNoClient();
                            break;

                        case (CommandNames.Login):
                            new Login(this.manager, this.logger).run();
                            break;

                        case (CommandNames.SetCurrentApp):
                            new SetCurrentApp(this.manager, this.logger).run();
                            break;

                        case (CommandNames.GetCurrentApp):
                            new GetCurrentApp(this.manager, this.logger).runNoClient();
                            break;

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
