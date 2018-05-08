import { createAppCenterClient } from "../api/appcenter";
import { AppCenterLoginInfo, AppCenterProfile, CurrentApp } from "../helpers/interfaces";
import { SettingsHelper } from "../helpers/settingsHelper";
import Auth from "./auth";
import { LogStrings } from "../extension/resources/logStrings";

class AppCenterProfileImpl implements AppCenterProfile {
    public userId: string;
    public userName: string;
    public displayName: string;
    public email: string;
    public currentApp?: CurrentApp;
    public isActive: boolean;

    // tslint:disable-next-line:no-any
    constructor(fileContents: any) {
        this.userId = fileContents.userId || fileContents.id;
        this.userName = fileContents.userName || fileContents.name;
        this.displayName = fileContents.displayName;
        this.email = fileContents.email;
        this.currentApp = fileContents.currentApp;
        this.isActive = fileContents.isActive;
    }
}

export default class AppCenterAuth extends Auth<AppCenterProfile> {

    protected async getUserInfo(credentials: AppCenterLoginInfo): Promise<AppCenterProfile> {
        //TODO Handle situation when user had deleted token in App Center portal already
        const client = createAppCenterClient().fromToken(credentials.token, SettingsHelper.getAppCenterAPIEndpoint());
        const userResponse = await client.users.get();
        if (!userResponse) {
            throw new Error(LogStrings.FailedToGetAppCenterProfile);
        }
        return new AppCenterProfileImpl(userResponse);
    }
}
