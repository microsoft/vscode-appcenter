import * as vscode from 'vscode';
import { CommandNames } from '../../constants';
import { FSUtils } from '../../helpers/fsUtils';
import { AppCenterProfile, CommandParams, CurrentApp } from '../../helpers/interfaces';
import { SettingsHelper } from '../../helpers/settingsHelper';
import { Utils } from '../../helpers/utils';
import { Strings } from '../../strings';
import AppCenterPortalMenu from './appCenterPortalMenu';
import * as CodePush from './codepush';
import { Command } from './command';
import GetCurrentApp from './getCurrentApp';
import Login from './login';
import SetCurrentApp from './setCurrentApp';
import * as Settings from './settings';
import Start from './start';
import * as Tools from './tools';

export default class ShowMenu extends Command {
    private _params: CommandParams;
    constructor(params: CommandParams) {
        super(params);
        this._params = params;
    }

    public async runNoClient(): Promise<void> {
        super.runNoClient();

        return this.appCenterProfile.then((profile: AppCenterProfile | null) => {
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
            const rootPath: string = <string>this.manager.projectRootPath;
            // For empty directory show only `Start New Idea`
            if (FSUtils.IsEmptyDirectoryToStartNewIdea(rootPath)) {
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
                const isReactNativeProject = Utils.isReactNativeProject(rootPath, /* showMessageOnError */false);
                if (isReactNativeProject) {
                    appCenterMenuOptions.push(<vscode.QuickPickItem>{
                        label: Strings.AppCenterPortalMenuLabel,
                        description: "",
                        target: CommandNames.AppCenterPortal
                    });
                    const isReactNativeCodePushProject = Utils.isReactNativeCodePushProject(rootPath, /* showMessageOnError */false);
                    if (isReactNativeCodePushProject) {
                        appCenterMenuOptions.push(<vscode.QuickPickItem>{
                            label: Strings.setCurrentAppMenuText(currentApp),
                            description: "",
                            target: CommandNames.SetCurrentApp
                        });
                        if (currentApp) {
                            appCenterMenuOptions.push(<vscode.QuickPickItem>{
                                label: Strings.CodePushMenuLabelItem,
                                description: "",
                                target: CommandNames.CodePush.ShowMenu
                            });
                        }
                    }
                }
            }

            const crashesEnabled = SettingsHelper.isCrashesEnabled();
            if (crashesEnabled) {
                appCenterMenuOptions.push(<vscode.QuickPickItem>{
                    label: Strings.ToolsMenuLabel,
                    description: "",
                    target: CommandNames.Tools.ShowTools
                });
            }

            // Settings menu
            appCenterMenuOptions.push(<vscode.QuickPickItem>{
                label: Strings.SettingsMenuLabel,
                description: "",
                target: CommandNames.Settings.ShowMenu
            });

            return this.showQuickPick(appCenterMenuOptions);
        });
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
                            new AppCenterPortalMenu(this._params).run();
                            break;

                        case (CommandNames.Start):
                            new Start(this._params).run();
                            break;

                        case (CommandNames.Login):
                            new Login(this._params).run();
                            break;

                        case (CommandNames.SetCurrentApp):
                            new SetCurrentApp(this._params).run();
                            break;

                        case (CommandNames.GetCurrentApp):
                            new GetCurrentApp(this._params).runNoClient();
                            break;

                        case (CommandNames.CodePush.ShowMenu):
                            new CodePush.ShowMenu(this._params).runNoClient();
                            break;

                        case (CommandNames.Settings.ShowMenu):
                            new Settings.ShowMenu(this._params).run();
                            break;

                        case (CommandNames.Tools.ShowTools):
                            new Tools.ShowTools(this._params).runNoClient();
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
