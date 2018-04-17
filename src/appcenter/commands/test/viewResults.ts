import { ReactNativeAppCommand } from "../reactNativeAppCommand";
import { CurrentApp } from "../../../helpers/interfaces";
import { AppCenterUrlBuilder } from "../../../helpers/appCenterUrlBuilder";
import { Utils } from "../../../helpers/utils";

export default class ViewResults extends ReactNativeAppCommand {
    public async runNoClient(): Promise<boolean | void> {
        if (!await super.runNoClient()) {
            return false;
        }

        const app: CurrentApp | null = await this.getCurrentApp();
        if (!app) {
            return false;
        }
        
        Utils.OpenUrl(AppCenterUrlBuilder.getTestLink(app.ownerName, app.appName));
        return true;
    }
}