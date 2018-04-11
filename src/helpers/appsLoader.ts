import { AppCenterClient, models } from "../appcenter/api";
import { Constants } from "../constants";
import { AppCenterLoader } from "./interfaces";

export class AppCenterAppsLoader implements AppCenterLoader<models.AppResponse> {
    private _client: AppCenterClient;

    public constructor(client: AppCenterClient) {
        this._client = client;
    }

    public load(): Promise<models.AppResponse[]> {
        return this._client.account.apps.list({
            orderBy: "name"
        }).then((apps: models.AppResponse[]) => {
            return apps.filter(app => app.platform === Constants.AppCenterReactNativePlatformName);
        });
    }
}
