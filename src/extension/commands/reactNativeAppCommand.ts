import { Md5 } from "ts-md5/dist/md5";
import { models } from "../../api/appcenter";
import { AppCenterProfile, CommandParams, CurrentApp, QuickPickAppItem } from '../../helpers/interfaces';
import { Utils } from "../../helpers/utils/utils";
import * as Menu from "../menu/menu";
import { CommandNames, Constants } from "../resources/constants";
import { Strings } from "../resources/strings";
import { Command } from './command';
import * as General from "./general";
import { CreateNewAppOption } from "./general/createNewApp";
import { VsCodeUI } from "../ui/vscodeUI";

export class ReactNativeAppCommand extends Command {
    protected currentAppMenuTarget: string = "MenuCurrentApp";
    protected static cachedAllApps: models.AppResponse[];
    protected userAlreadySelectedApp: boolean;
    protected checkForReact: boolean = true;
    protected _params: CommandParams;

    constructor(params: CommandParams) {
        super(params);
        this._params = params;
    }

    public get CachedAllApps(): models.AppResponse[] | null {
        if (ReactNativeAppCommand.cachedAllApps && ReactNativeAppCommand.cachedAllApps.length > 0) {
            return ReactNativeAppCommand.cachedAllApps;
        } else {
            return null;
        }
    }

    public async runNoClient(): Promise<boolean | void> {
        if (!await super.runNoClient()) {
            return false;
        }
        if (this.checkForReact && !Utils.isReactNativeProject(this.logger, this.rootPath, true)) {
            VsCodeUI.ShowWarningMessage(Strings.NotReactProjectMsg);
            return false;
        }
        return true;
    }

    public async run(): Promise<boolean | void> {
        if (!await super.run()) {
            return false;
        }

        if (this.checkForReact && !Utils.isReactNativeProject(this.logger, this.rootPath, true)) {
            VsCodeUI.ShowWarningMessage(Strings.NotReactProjectMsg);
            return false;
        }
        return true;
    }

    protected async getCurrentApp(refreshDeployments: boolean = false): Promise<CurrentApp | null> {
        return await VsCodeUI.showProgress(() => {
            return this.appCenterProfile.then(async (profile: AppCenterProfile | null) => {
                if (profile && profile.currentApp) {
                    if (refreshDeployments) {
                        try {
                            const result: models.Deployment[] = await this.client.codePushDeployments.list(profile.currentApp.ownerName, profile.currentApp.appName);
                            if (result) {
                                profile.currentApp.currentAppDeployments.codePushDeployments = [];
                                profile.currentApp.currentAppDeployments.codePushDeployments.push(...result);
                                profile.currentApp.currentAppDeployments.currentDeploymentName = Constants.CodePushStagingDeploymentName;
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

    protected async showAppsQuickPick(apps: models.AppResponse[], includeAllApps: boolean = false, includeSelectCurrent: boolean = false, includeCreateNew: boolean = true, prompt: string = Strings.ProvideCurrentAppPromptMsg, force: boolean = false) {
        if (!apps) {
            this.logger.debug("Do not show apps quick pick due to no apps (either in cache or fetched from server");
            return;
        }
        const rnApps: models.AppResponse[] = this.getRnApps(apps);
        if (!force) {
            ReactNativeAppCommand.cachedAllApps = apps;
        }
        const options: QuickPickAppItem[] = Menu.getQuickPickItemsForAppsList(includeAllApps ? apps : rnApps);
        if (includeCreateNew && Utils.isReactNativeProject(this.logger, this.rootPath, false)) {
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
        if (!this.userAlreadySelectedApp || force) {
            const selected: QuickPickAppItem = await VsCodeUI.showQuickPick(options, prompt);
            this.userAlreadySelectedApp = true;
            if (!selected) {
                return;
            }
            this.handleShowCurrentAppQuickPickSelection(selected, apps);
        }
    }

    protected getRnApps(apps: models.AppResponse[]): models.AppResponse[] {
        if (!apps) {
            return [];
        }
        return apps.filter(app => app.platform === Constants.AppCenterReactNativePlatformName);
    }

    protected refreshCachedAppsAndRepaintQuickPickIfNeeded(includeSelectCurrent: boolean = false, includeCreateNew: boolean = true, includeAllApps: boolean = true, prompt: string = Strings.ProvideCurrentAppPromptMsg) {
        VsCodeUI.showProgress((progress) => {
            progress.report({ message: Strings.GetAppsListMessage });

            return this.client.apps.list({
                orderBy: "name"
            }).then((apps: models.AppResponse[]) => {
                const rnApps: models.AppResponse[] = includeAllApps ? apps : this.getRnApps(apps);
                // we repaint menu only in case we have changed apps
                if (this.cachedAppsItemsDiffer(rnApps, includeAllApps ? ReactNativeAppCommand.cachedAllApps : this.getRnApps(ReactNativeAppCommand.cachedAllApps))) {
                    this.showAppsQuickPick(rnApps, includeAllApps, includeSelectCurrent, includeCreateNew, prompt);
                }
            }).catch((e) => {
                VsCodeUI.ShowErrorMessage(Strings.UnknownError);
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

    protected async showCreateAppOptions() {
        const appCenterPortalTabOptions: QuickPickAppItem[] = Menu.getCreateAppOptions();

        const selected: QuickPickAppItem = await VsCodeUI.showQuickPick(appCenterPortalTabOptions, Strings.CreateAppPlaceholder);

        if (!selected) {
            this.logger.debug('User cancel selection of create app tab');
            return;
        }

        switch (selected.target) {
            case (CommandNames.CreateApp.Android):
                new General.CreateNewApp(this._params, CreateNewAppOption.Android).run();
                break;
            case (CommandNames.CreateApp.IOS):
                new General.CreateNewApp(this._params, CreateNewAppOption.IOS).run();
                break;
            case (CommandNames.CreateApp.Both):
                new General.CreateNewApp(this._params, CreateNewAppOption.Both).run();
                break;
            default:
                // Ideally shouldn't be there :)
                this.logger.error("Unknown create app option");
                break;
        }
    }
}
