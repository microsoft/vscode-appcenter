import { AppCenterLoginCredentials, AppCenterProfile, CurrentApp } from "../../helpers/interfaces";
import { SettingsHelper } from "../../helpers/settingsHelper";
import { createAppCenterClient } from "../api";
import Auth from "./auth";

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

export default class AppCenterAuth extends Auth<AppCenterProfile, AppCenterLoginCredentials> {

    protected async getUserInfo(credentials: AppCenterLoginCredentials): Promise<AppCenterProfile> {
        //TODO Handle situation when user had deleted token in appcenter portal already
        const client = createAppCenterClient().fromToken(credentials.token, SettingsHelper.getAppCenterAPIEndpoint());
        const userResponse = await client.account.users.get();
        if (!userResponse) {
            throw new Error("Could get profile from appcenter.");
        }
        return new AppCenterProfileImpl(userResponse);
    }
}
