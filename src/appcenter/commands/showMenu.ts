import * as vscode from 'vscode';
import { AppCenteAppType, AppCenterBeacons, CommandNames } from '../../constants';
import { FSUtils } from '../../helpers/fsUtils';
import { AppCenterProfile, CommandParams, CurrentApp } from '../../helpers/interfaces';
import { MenuHelper } from '../../helpers/menuHelper';
import { SettingsHelper } from '../../helpers/settingsHelper';
import { Utils } from '../../helpers/utils';
import { Strings } from '../../strings';
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
    private appName: string;
    private ownerName: string;
    private isOrg: boolean;

    constructor(params: CommandParams) {
        super(params);
        this._params = params;
    }

    public async runNoClient(): Promise<void> {
        super.runNoClient();

        return this.appCenterProfile.then((profile: AppCenterProfile | null) => {
            let appCenterMenuOptions: vscode.QuickPickItem[] = [];
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
                    description: Strings.StartAnIdeaMenuDescription,
                    target: CommandNames.Start
                });
            } else {
                let currentApp: CurrentApp | undefined;
                if (profile.currentApp) {
                    currentApp = profile.currentApp;
                }

                appCenterMenuOptions.push(<vscode.QuickPickItem>{
                    label: Strings.setCurrentAppMenuText(currentApp),
                    description: Strings.MenuCurrentAppDescription,
                    target: CommandNames.SetCurrentApp
                });

                const isReactNativeProject = Utils.isReactNativeProject(rootPath, /* showMessageOnError */false);
                if (isReactNativeProject && currentApp) {
                    this.isOrg = currentApp.type.toLowerCase() === AppCenteAppType.Org.toLowerCase();
                    this.appName = currentApp.appName;
                    this.ownerName = currentApp.ownerName;
                    appCenterMenuOptions = appCenterMenuOptions.concat(MenuHelper.getAppCenterPortalMenuItems());

                    if (Utils.isReactNativeCodePushProject(rootPath, false)) {
                        appCenterMenuOptions.push(<vscode.QuickPickItem>{
                            label: Strings.CodePushMenuLabelItem,
                            description: Strings.CodePushMenuLabelDescription,
                            target: CommandNames.CodePush.ShowMenu
                        });
                    }
                }
            }

            const crashesEnabled = SettingsHelper.isCrashesEnabled();
            if (crashesEnabled && profile.currentApp) {
                appCenterMenuOptions.push(<vscode.QuickPickItem>{
                    label: Strings.ToolsMenuLabel,
                    description: Strings.ToolsMenuDescription,
                    target: CommandNames.Tools.ShowTools
                });
            }

            appCenterMenuOptions.push(<vscode.QuickPickItem>{
                label: Strings.SettingsMenuLabel,
                description: Strings.SettingsMenuDescription,
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
                        case (AppCenterBeacons.Build):
                        case (AppCenterBeacons.Test):
                        case (AppCenterBeacons.Distribute):
                        case (AppCenterBeacons.Analytics):
                        case (AppCenterBeacons.Crashes):
                        case (AppCenterBeacons.Push):
                            MenuHelper.handleMenuPortalQuickPickSelection(selected.target, this.ownerName, this.appName, this.isOrg);
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
