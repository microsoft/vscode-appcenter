import { tokenStore } from "../data/tokenStore";
import { fileTokenStore } from "../data/tokenStore";
import { ILogger } from "../extension/log/logHelper";
import { LoginInfo, Profile, ProfileStorage } from "../helpers/interfaces";
import { LogStrings } from "../extension/resources/logStrings";

export default abstract class Auth<T extends Profile> {

    public constructor(
        protected profileStorage: ProfileStorage<T>,
        protected logger: ILogger) {
    }

    protected abstract async getUserInfo(credentials: LoginInfo): Promise<T>;

    public get activeProfile(): Promise<T | null> {
        const activeProfile: T = this.profileStorage.activeProfile;
        if (!activeProfile) {
            return this.tryFixProfileStorage();
        } else {
            return Promise.resolve(activeProfile);
        }
    }

    private async tryFixProfileStorage(): Promise<T | null> {
        const fixed: boolean = await this.profileStorage.tryFixStorage();
        if (fixed) {
            return this.profileStorage.activeProfile;
        } else {
            this.logger.info(LogStrings.FailedToGetProfileFile);
            return null;
        }
    }

    public async initialize(): Promise<void> {
        await this.profileStorage.init();
    }

    public async doLogin(loginInfo: LoginInfo): Promise<T | null> {
        const token: string = loginInfo.token;
        if (!token) {
            return null;
        }

        // Ask server for user info by token
        const profile: T = await this.getUserInfo(loginInfo);
        if (!profile) {
            this.logger.error(LogStrings.FailedToGetUserProfile);
            return null;
        }

        // Remove existent token for user from local store
        // TODO: Probably we need to delete token from server also?
        try {
            await tokenStore.remove(profile.userId);
        } catch (e) {
            // It is ok if removing token failed.
        }

        await tokenStore.set(profile.userId, { token: token });

        // Make it active
        profile.isActive = true;

        // Save it in local store
        await this.profileStorage.save(profile);
        return profile;
    }

    public async doLogout(userId: string): Promise<void> {

        // Remove token from the store
        // TODO: Probably we need to delete token from server also?
        try {
            await tokenStore.remove(userId);
        } catch (e) {
            // If removing token fails, then maybe we have something stored in the file storage, need to clean that up, too.
            await fileTokenStore.remove(userId);
        }
        await this.profileStorage.delete(userId);

        // If there are no profiles left just exit
        const profiles: T[] | null = await this.profileStorage.list();
        if (profiles.length === 0) {
            return;
        }

        // If there is no active profile then choose first saved profile and make it active if possible
        if (!this.profileStorage.activeProfile) {
            const firstProfile = profiles[0];
            firstProfile.isActive = true;
            await this.profileStorage.save(firstProfile);
        }
    }

    public async updateProfile(profile: Profile): Promise<void> {
        await this.profileStorage.save(profile);
    }

    public async getProfiles(): Promise<T[]> {
        return await this.profileStorage.list();
    }

    public static async accessTokenFor(profile: Profile): Promise<string> {
        const emptyToken = "";
        // tslint:disable-next-line:no-any
        try {
            const entry = await tokenStore.get(profile.userId);
            if (entry) {
                return entry.accessToken.token;
            }
            throw new Error("Empty token!");
        } catch (err) {
            // compatibility
            try {
                const oldToken = await fileTokenStore.get(profile.userId);
                if (oldToken) {
                    await fileTokenStore.remove(profile.userId);
                    await tokenStore.set(profile.userId, { token: oldToken.accessToken.token });
                    return oldToken.accessToken.token;
                }
                return emptyToken;
            } catch (e) {
                // TODO Find a way to log it via logger
                console.error(LogStrings.FailedToGetToken, err);
                return emptyToken;
            }

        }
    }
}
