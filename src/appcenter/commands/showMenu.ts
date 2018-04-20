import * as vscode from 'vscode';
import { AppCenteAppType, AppCenterBeacons, CommandNames } from '../../constants';
import { FSUtils } from '../../helpers/fsUtils';
import { AppCenterProfile, CommandParams, CurrentApp } from '../../helpers/interfaces';
import { MenuHelper } from '../../helpers/menuHelper';
import { SettingsHelper } from '../../helpers/settingsHelper';
import { Utils } from '../../helpers/utils';
import { CustomQuickPickItem } from '../../helpers/vsCodeUtils';
import { Strings } from '../../strings';
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
            let appCenterMenuOptions: CustomQuickPickItem[] = [];
            if (!profile) {
                appCenterMenuOptions.push(<CustomQuickPickItem>{
                    label: Strings.LoginMenuLabel,
                    description: Strings.LoginMenuDescription,
                    target: CommandNames.Login
                });
                return this.showMenuQuickPick(appCenterMenuOptions);
            }

            let currentApp: CurrentApp | undefined;
            if (profile.currentApp) {
                currentApp = profile.currentApp;
            }

            // For empty directory show only `Start New Idea`
            if (FSUtils.IsEmptyDirectoryToStartNewIdea(this.rootPath)) {
                appCenterMenuOptions.push(<CustomQuickPickItem>{
                    label: Strings.StartAnIdeaMenuLabel,
                    description: Strings.StartAnIdeaMenuDescription,
                    target: CommandNames.Start
                });
            } else {
                appCenterMenuOptions.push(<CustomQuickPickItem>{
                    label: Strings.setCurrentAppMenuText(currentApp),
                    description: Strings.MenuCurrentAppDescription,
                    target: CommandNames.SetCurrentApp
                });

                if (Utils.isReactNativeProject(this.rootPath, false) && currentApp) {
                    this.isOrg = currentApp.type.toLowerCase() === AppCenteAppType.Org.toLowerCase();
                    this.appName = currentApp.appName;
                    this.ownerName = currentApp.ownerName;
                    appCenterMenuOptions = appCenterMenuOptions.concat(MenuHelper.getAppCenterPortalMenuItems());
                }
            }

            if (SettingsHelper.isCrashesEnabled() && currentApp) {
                appCenterMenuOptions.push(<CustomQuickPickItem>{
                    label: Strings.ToolsMenuLabel,
                    description: Strings.ToolsMenuDescription,
                    target: CommandNames.Tools.ShowTools
                });
            }

            appCenterMenuOptions.push(<CustomQuickPickItem>{
                label: Strings.SettingsMenuLabel,
                description: Strings.SettingsMenuDescription,
                target: CommandNames.Settings.ShowMenu
            });

            return this.showMenuQuickPick(appCenterMenuOptions);
        });
    }

    private async showMenuQuickPick(appCenterMenuOptions: CustomQuickPickItem[]): Promise<void> {
        return vscode.window.showQuickPick(appCenterMenuOptions, { placeHolder: Strings.MenuTitlePlaceholder })
            .then(async (selected: CustomQuickPickItem) => {
                if (!selected) {
                    return;
                }

                switch (selected.target) {
                    case (AppCenterBeacons.Build):
                    case (AppCenterBeacons.Test):
                    case (AppCenterBeacons.Distribute):
                    case (AppCenterBeacons.Analytics):
                    case (AppCenterBeacons.Crashes):
                        MenuHelper.handleMenuPortalQuickPickSelection(this._params, selected.target, this.ownerName, this.appName, this.isOrg, await this.isCodePushEnabled);
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

                    case (CommandNames.Settings.ShowMenu):
                        new Settings.ShowMenu(this._params).run();
                        break;

                    case (CommandNames.Tools.ShowTools):
                        new Tools.ShowTools(this._params).runNoClient();
                        break;

                    default:
                        // Ideally shouldn't be there :)
                        this.logger.error("Unknown App Center menu command");
                        break;
            }
        });
    }
}
