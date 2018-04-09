import { SettingsHelper } from "../../helpers/settingsHelper";
import { createAppCenterClient, models } from "../api";
import AppCenterProfileImpl from "./profile/appCenterProfileImpl";
import { ProfileStorage, Profile, AppCenterProfile } from "../../helpers/interfaces";
import { tokenStore } from "./tokenStore";
import { ILogger } from "../../log/logHelper";

export default class Auth {

    constructor(private profileStorage: ProfileStorage<AppCenterProfile>, private logger: ILogger) {
    }

    public static accessTokenFor(profile: AppCenterProfile): Promise<string> {
        const getter = tokenStore.get(profile.userId);
        const emptyToken = "";
        // tslint:disable-next-line:no-any
        return getter.then((entry: any) => {
            if (entry) {
                return entry.accessToken.token;
            }
            return emptyToken;
        }).catch((e: Error) => {
            // TODO Find a way to log it via logger
            console.error("Failed to get token from profile", e);
            return emptyToken;
        });
    }

    public get activeProfile(): AppCenterProfile | null {
        return this.profileStorage.active;
    }

    public async initialize(): Promise<void> {
        await this.profileStorage.init();
    }

    public async doTokenLogin(token: string): Promise<Profile | null> {
        if (!token) {
            return null;
        }

        // Ask server for user info by token
        const userResponse: models.UserProfileResponse = await this.getUserInfo(token);
        if (!userResponse) {
            this.logger.error("Couldn't get user profile from appcenter.");
            return null;
        }

        // Remove existent token for user from local store
        // TODO: Probably we need to delete token from server also?
        await tokenStore.remove(userResponse.id);

        // Remove saved profile if exists
        await this.profileStorage.delete(userResponse.id);

        // Save token in local store
        await tokenStore.set(userResponse.id, { token: token });

        // Convert server user to local profile
        const profile: AppCenterProfile = new AppCenterProfileImpl(userResponse);

        // Make it active
        profile.isActive = true;

        // Save it in local store
        await this.profileStorage.save(profile);

        return profile;
    }

    public async doLogout(userId: string): Promise<void> {

        // Remove token from local store
        // TODO: Probably we need to delete token from server also?
        await tokenStore.remove(userId);

        // Remove saved profile from local store
        await this.profileStorage.delete(userId);

        // Choose first saved profile and make it active if possible
        const profiles: AppCenterProfile[] | null = await this.profileStorage.list();
        if (profiles.length === 0) {
            return;
        }
        const firstProfile = profiles[0];
        firstProfile.isActive = true;
        await this.profileStorage.save(firstProfile);
    }

    public async updateProfile(profile: Profile): Promise<void> {
        await this.profileStorage.save(profile);
    }

    public async getProfiles(): Promise<Profile[]> {
        return await this.profileStorage.list();
    }

    private getUserInfo(token: string): Promise<models.UserProfileResponse> {
        //TODO Handle situation when user had deleted token in appcenter portal already
        const client = createAppCenterClient().fromToken(token, SettingsHelper.getAppCenterAPIEndpoint());
        return client.account.users.get();
    }
}
