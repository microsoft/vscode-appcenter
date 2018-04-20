import { AppCenterUrlBuilder } from "../../../helpers/appCenterUrlBuilder";
import { CurrentApp } from "../../../helpers/interfaces";
import { Utils } from "../../../helpers/utils";
import { ReactNativeAppCommand } from "../reactNativeAppCommand";

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
