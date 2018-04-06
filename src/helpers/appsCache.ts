import { AppCenterClient, AppCenterClientFactory, createAppCenterClient, models } from "../appcenter/api";

import { Constants } from "../constants";
import { Profile } from "../helpers/interfaces";
import { SettingsHelper } from "../helpers/settingsHelper";

export class AppCenterAppsCache {
    private clientFactory: AppCenterClientFactory;
    private _cachedApps: models.AppResponse[];
    private static instance: AppCenterAppsCache;

    private constructor() {
        this.clientFactory = createAppCenterClient();
    }

    public static getInstance(): AppCenterAppsCache {
        if (!this.instance) {
            this.instance = new AppCenterAppsCache();
        }
        return this.instance;
    }

    public async loadAppsCache(profile: Profile) {
        const client: AppCenterClient | null = this.clientFactory.fromProfile(profile, SettingsHelper.getAppCenterAPIEndpoint());
        if (client) {
            client.account.apps.list({
                orderBy: "name"
            }).then((apps: models.AppResponse[]) => {
                if (apps && apps.length) {
                    this.updateCache(apps, function () { });
                }
            }).catch(() => { });
        }
    }

    public get cachedApps(): models.AppResponse[] {
        return this._cachedApps;
    }

    public hasCache(): boolean {
        return this.cachedApps && this.cachedApps.length > 0;
    }

    protected doesCacheDifferFrom(apps: models.AppResponse[]): boolean {
        if (!this.cachedApps || !apps) {
            return true;
        }
        if (this.cachedApps.length !== apps.length) {
            return true;
        }
        let differs: boolean = false;
        this.cachedApps.every(function (cachedApp) {
            const matches = apps.filter((app) => {
                return cachedApp.id === app.id;
            });
            if (matches.length === 0) {
                differs = true;
                return false;
            }
            return true;
        });
        return differs;
    }

    public updateCache(apps: models.AppResponse[], display: (apps: models.AppResponse[]) => any) {
        const rnApps = apps.filter(app => app.platform === Constants.AppCenterReactNativePlatformName);
        const updateMenu = this.doesCacheDifferFrom(rnApps);
        this._cachedApps = rnApps;
        if (updateMenu) {
            display(rnApps);
        }
    }
}
