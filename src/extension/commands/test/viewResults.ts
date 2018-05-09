import { AppCenterUrlBuilder } from "../../../helpers/appCenterUrlBuilder";
import { AppCenterProfile, CurrentApp, CommandParams } from "../../../helpers/interfaces";
import { Utils } from "../../../helpers/utils/utils";
import { ReactNativeAppCommand } from "../reactNativeAppCommand";

export default class ViewResults extends ReactNativeAppCommand {

    public constructor(params: CommandParams, private _app: CurrentApp = null) {
        super(params);
    }

    public async runNoClient(): Promise<boolean | void> {
        if (!await super.runNoClient()) {
            return false;
        }
        if (!this._app) {
            const app: CurrentApp | null = await this.getCurrentApp();
            if (!app) {
                return false;
            }
            this._app = app;
        }

        const profile: AppCenterProfile | null = await this.appCenterProfile;
        if (!profile) {
            return false;
        }

        Utils.OpenUrl(AppCenterUrlBuilder.getTestLink(this._app.ownerName, this._app.appName, this._app.type !== "user"));
        return true;
    }
}
