
import { AppCenterClient, models } from "../appcenter/api";
import { AppCenterAppsCache } from "./appsCache";
import { AppCenterCache } from "./cache";

// tslint:disable-next-line:interface-name
export interface AppCenterCacheFactory {
    getAppsCache(): AppCenterCache<models.AppResponse, AppCenterClient>;
}

export function createAppCenterCache(): AppCenterCacheFactory {
    return {
        getAppsCache(): AppCenterCache<models.AppResponse, AppCenterClient> {
            return AppCenterAppsCache.getInstance();
        }
    };
}
