import * as vscode from 'vscode';
import { AppCenteAppType, AppCenterBeacons, CommandNames } from '../../constants';
import { FSUtils } from '../../helpers/fsUtils';
import { AppCenterProfile, CommandParams, CurrentApp } from '../../helpers/interfaces';
import { MenuHelper } from '../../helpers/menuHelper';
import { Utils } from '../../helpers/utils';
import { CustomQuickPickItem } from '../../helpers/vsCodeUtils';
import { Strings } from '../../strings';
import AppCenterPortalMenu from './appCenterPortalMenu';
import { Command } from './command';
import GetCurrentApp from './getCurrentApp';
import LinkAppCenter from './linkAppCenter';
import Login from './login';
import SetCurrentApp from './setCurrentApp';
import * as Settings from './settings';
import Start from './start';
import * as Test from "./test";

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
                if (Utils.isReactNativeProject(this.logger, this.rootPath, false) && currentApp) {
                    this.isOrg = currentApp.type.toLowerCase() === AppCenteAppType.Org.toLowerCase();
                    this.appName = currentApp.appName;
                    this.ownerName = currentApp.ownerName;
                    appCenterMenuOptions = appCenterMenuOptions.concat(MenuHelper.getAppCenterPortalMenuItems());
                }
            }

            appCenterMenuOptions.push(<CustomQuickPickItem>{
                label: Strings.AppCenterPortalMenuLabel,
                description: Strings.AppCenterPortalMenuDescription,
                target: CommandNames.AppCenterPortal
            });

            if (!FSUtils.IsEmptyDirectoryToStartNewIdea(this.rootPath) && Utils.isReactNativeProject(this.logger, this.rootPath, false)) {
                appCenterMenuOptions.push(<CustomQuickPickItem>{
                    label: Strings.setCurrentAppMenuText(currentApp),
                    description: Strings.MenuCurrentAppDescription,
                    target: CommandNames.SetCurrentApp
                });

                appCenterMenuOptions.push(<CustomQuickPickItem>{
                    label: Strings.InstallSDKMenuLabel,
                    description: Strings.InstallSDKMenuDescription,
                    target: CommandNames.InstallSDK
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
                    case (AppCenterBeacons.Distribute):
                    case (AppCenterBeacons.Analytics):
                    case (AppCenterBeacons.Crashes):
                        MenuHelper.handleMenuPortalQuickPickSelection(this._params, selected.target, this.ownerName, this.appName, this.isOrg, Utils.isReactNativeProject(this.logger, this.rootPath, false));
                        break;

                    case (AppCenterBeacons.Test):
                        new Test.ShowMenu(this._params).runNoClient();
                        break;

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

                    case (CommandNames.Settings.ShowMenu):
                        new Settings.ShowMenu(this._params).run();
                        break;

                    case (CommandNames.InstallSDK):
                        new LinkAppCenter(this._params).run();
                        break;

                    default:
                        // Ideally shouldn't be there :)
                        this.logger.error("Unknown App Center menu command");
                        break;
                }
            });
    }
}
