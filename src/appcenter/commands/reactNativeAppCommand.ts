import { Md5 } from "ts-md5/dist/md5";
import * as vscode from "vscode";
import { CommandNames, Constants } from '../../constants';
import { AppCenterProfile, CurrentApp, QuickPickAppItem } from '../../helpers/interfaces';
import { MenuHelper } from "../../helpers/menuHelper";
import { Utils } from '../../helpers/utils';
import { VsCodeUtils } from '../../helpers/vsCodeUtils';
import { Strings } from '../../strings';
import { models } from '../apis';
import { Command } from './command';

export class ReactNativeAppCommand extends Command {
    protected currentAppMenuTarget: string = "MenuCurrentApp";
    protected static cachedApps: models.AppResponse[];
    protected userAlreadySelectedApp: boolean;
    protected checkForReact: boolean = true;

    public get CachedApps(): models.AppResponse[] | null {
        if (ReactNativeAppCommand.cachedApps && ReactNativeAppCommand.cachedApps.length > 0) {
            return ReactNativeAppCommand.cachedApps;
        } else {
            return null;
        }
    }

    public async runNoClient(): Promise<boolean | void> {
        if (!await super.runNoClient()) {
            return false;
        }
        if (this.checkForReact && !Utils.isReactNativeProject(this.logger, this.rootPath, true)) {
            VsCodeUtils.ShowWarningMessage(Strings.NotReactProjectMsg);
            return false;
        }
        return true;
    }

    public async run(): Promise<boolean | void> {
        if (!await super.run()) {
            return false;
        }

        if (this.checkForReact && !Utils.isReactNativeProject(this.logger, this.rootPath, true)) {
            VsCodeUtils.ShowWarningMessage(Strings.NotReactProjectMsg);
            return false;
        }
        return true;
    }

    protected async getCurrentApp(refreshDeployments: boolean = false): Promise<CurrentApp | null> {
        return vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.VSCodeProgressLoadingTitle }, () => {
            return this.appCenterProfile.then(async (profile: AppCenterProfile | null) => {
                if (profile && profile.currentApp) {
                    if (refreshDeployments) {
                        try {
                            const result: models.Deployment = await this.client.codePushDeployments.get(Constants.CodePushStagingDeploymentName, profile.currentApp.ownerName, profile.currentApp.appName);
                            if (result) {
                                profile.currentApp.currentAppDeployments.codePushDeployments.push(result);
                            }
                        } catch (err) { }
                    }
                    return profile.currentApp;
                }
                return null;
            });
        });
    }

    protected async handleShowCurrentAppQuickPickSelection(_target: QuickPickAppItem, _rnApps: models.AppResponse[]) {
        throw Error("handleShowCurrentAppQuickPickSelection not implemented in base class");
    }

    protected async showAppsQuickPick(rnApps: models.AppResponse[], includeSelectCurrent: boolean = false, includeCreateNew: boolean = true, prompt: string = Strings.ProvideCurrentAppPromptMsg) {
        if (!rnApps) {
            this.logger.debug("Do not show apps quick pick due to no apps (either in cache or fetched from server");
            return;
        }
        ReactNativeAppCommand.cachedApps = rnApps;
        const options: QuickPickAppItem[] = MenuHelper.getQuickPickItemsForAppsList(rnApps);
        if (includeCreateNew) {
            const createNewAppItem = {
                label: Strings.CreateNewAppMenuLabel,
                description: "",
                target: CommandNames.CreateApp.CommandName
            };
            options.splice(0, 0, createNewAppItem);
        }
        if (includeSelectCurrent) {
            const currentApp: CurrentApp | null = await this.getCurrentApp();

            if (currentApp) {
                const currentAppItem = {
                    label: Strings.SelectCurrentAppMenuDescription,
                    description: currentApp.type,
                    target: this.currentAppMenuTarget
                };
                options.splice(0, 0, currentAppItem);
            }
        }
        if (!this.userAlreadySelectedApp) {
            vscode.window.showQuickPick(options, { placeHolder: prompt })
                .then((selected: QuickPickAppItem) => {
                    this.userAlreadySelectedApp = true;
                    if (!selected) {
                        return;
                    }
                    this.handleShowCurrentAppQuickPickSelection(selected, rnApps);
                });
        }
    }

    protected refreshCachedAppsAndRepaintQuickPickIfNeeded(includeSelectCurrent: boolean = false, includeCreateNew: boolean = true, includeAllApps: boolean = true, prompt: string = Strings.ProvideCurrentAppPromptMsg) {
        vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.GetAppsListMessage }, () => {
            return this.client.apps.list({
                orderBy: "name"
            }).then((apps: models.AppResponse[]) => {
                const rnApps: models.AppResponse[] = includeAllApps ? apps : apps.filter(app => app.platform === Constants.AppCenterReactNativePlatformName);
                // we repaint menu only in case we have changed apps
                if (this.cachedAppsItemsDiffer(rnApps, ReactNativeAppCommand.cachedApps)) {
                    this.showAppsQuickPick(rnApps, includeSelectCurrent, includeCreateNew, prompt);
                }
            }).catch((e) => {
                VsCodeUtils.ShowErrorMessage(Strings.UnknownError);
                this.logger.error(e.message, e);
            });
        });
    }

    private cachedAppsItemsDiffer(appsList: models.AppResponse[], cachedApps: models.AppResponse[]): boolean {
        if (!cachedApps || !appsList) {
            return true;
        }
        if (cachedApps.length !== appsList.length) {
            return true;
        }

        let differs: boolean = false;
        cachedApps.every((cachedItem) => {
            const matches = appsList.filter((item) => {
                return this.compareAppsItems(cachedItem, item);
            });
            // If we find no matches to this cache item in items, then arrays differ.
            if (matches.length === 0) {
                differs = true;
                return false;
            }
            return true;
        });
        return differs;
    }

    private compareAppsItems(cachedItem: models.AppResponse, item: models.AppResponse): boolean {
        const hashOfTheCachedObject = Md5.hashStr(JSON.stringify(cachedItem));
        const hashOfTheIncomingObject = Md5.hashStr(JSON.stringify(item));
        return hashOfTheCachedObject === hashOfTheIncomingObject;
    }
}
