import { Md5 } from "ts-md5/dist/md5";
import { AppCenterOS } from '../../constants';
import { AppCenterProfile, CurrentApp, CurrentAppDeployments } from '../../helpers/interfaces';
import { Utils } from '../../helpers/utils';
import { VsCodeUtils } from '../../helpers/vsCodeUtils';
import { Strings } from '../../strings';
import { models } from '../apis';
import { Command } from './command';

export class ReactNativeAppCommand extends Command {
    protected static cachedApps: models.AppResponse[];

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

    protected async getCurrentApp(): Promise<CurrentApp | null> {
        return this.appCenterProfile.then((profile: AppCenterProfile | null) => {
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
        isMandatory: boolean,
        appSecret: string): Promise<CurrentApp | null> {
        const currentApp = Utils.toCurrentApp(currentAppName, appOS, currentAppDeployments, targetBinaryVersion, type, isMandatory, appSecret);
        if (!currentApp) {
            VsCodeUtils.ShowWarningMessage(Strings.InvalidCurrentAppNameMsg);
            return Promise.resolve(null);
        }

        return this.appCenterProfile.then((profile: AppCenterProfile | null) => {
            if (profile) {
                profile.currentApp = currentApp;
                return this.appCenterAuth.updateProfile(profile).then(() => {
                    return currentApp;
                });
            } else {
                // No profile - not logged in?
                VsCodeUtils.ShowWarningMessage(Strings.UserIsNotLoggedInMsg);
                return Promise.resolve(null);
            }
        });
    }

    protected cachedAppsItemsDiffer(appsList: models.AppResponse[], cachedApps: models.AppResponse[]): boolean {
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
