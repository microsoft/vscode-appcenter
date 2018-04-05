import * as vscode from "vscode";
import { AppCenterOS } from "../../constants";
import { AppCenterAppsCache } from "../../helpers/appsCache";
import { CurrentApp, CurrentAppDeployments, Profile } from "../../helpers/interfaces";
import { Utils } from "../../helpers/utils";
import { VsCodeUtils } from "../../helpers/vsCodeUtils";
import { Strings } from "../../strings";
import { models } from "../api";
import { Command } from "./command";

export class ReactNativeAppCommand extends Command {
    public async runNoClient(): Promise<boolean | void> {
        if (!await super.runNoClient()) {
            return false;
        }
        if (!Utils.isReactNativeProject(this.manager.projectRootPath, true)) {
            return false;
        }
        return true;
    }

    public async run(): Promise<boolean | void> {
        if (!await super.run()) {
            return false;
        }
        if (!Utils.isReactNativeProject(this.manager.projectRootPath, true)) {
            return false;
        }
        return true;
    }

    protected getCurrentApp(): Promise<CurrentApp | null> {
        return this.Profile.then((profile: Profile | null) => {
            if (profile && profile.currentApp) {
                return profile.currentApp;
            }
            return null;
        });
    }

    protected saveCurrentApp(
        currentAppName: string,
        appOS: AppCenterOS,
        currentAppDeployments: CurrentAppDeployments | null,
        targetBinaryVersion: string,
        type: string,
        isMandatory: boolean): Promise<CurrentApp | null> {
        const currentApp = Utils.toCurrentApp(currentAppName, appOS, currentAppDeployments, targetBinaryVersion, type, isMandatory);
        if (!currentApp) {
            VsCodeUtils.ShowWarningMessage(Strings.InvalidCurrentAppNameMsg);
            return Promise.resolve(null);
        }

        return this.Profile.then((profile: Profile | null) => {
            if (profile) {
                profile.currentApp = currentApp;
                profile.save();
                return Promise.resolve(currentApp);
            } else {
                // No profile - not logged in?
                VsCodeUtils.ShowWarningMessage(Strings.UserIsNotLoggedInMsg);
                return Promise.resolve(null);
            }
        });
    }

    protected loadApps(display: (apps: models.AppResponse[]) => any) {
        const appsCache: AppCenterAppsCache = AppCenterAppsCache.getInstance();
        try {
            if (appsCache.hasCache()) {
                display(appsCache.cachedApps);
            }
            vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.GetAppsListMessage }, () => {
                return this.client.account.apps.list({
                    orderBy: "name"
                });
            }).then((apps: models.AppResponse[]) => {
                appsCache.updateCache(apps, display);
            });
        } catch (e) {
            VsCodeUtils.ShowErrorMessage(Strings.UnknownError);
            this.logger.error(e.message, e);
        }
    }
}
