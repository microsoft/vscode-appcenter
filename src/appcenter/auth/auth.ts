import { Profile, ProfileStorage, LoginCredentials } from '../../helpers/interfaces';
import { ILogger } from '../../log/logHelper';
import { TokenStore } from './tokenStore';

export default abstract class Auth<T extends Profile, C extends LoginCredentials> {

    public constructor(protected profileStorage: ProfileStorage<T>, protected tokenStore: TokenStore, protected logger: ILogger) {
    }

    protected abstract async getUserInfo(credentials: C): Promise<Profile>;

    public get activeProfile(): T | null {
        return this.profileStorage.active;
    }

    public async initialize(): Promise<void> {
        await this.profileStorage.init();
    }

    public async doLogin(credentials: C): Promise<Profile | null> {
        const token: string = credentials.token;
        if (!token) {
            return null;
        }

        // Ask server for user info by token
        const profile: Profile = await this.getUserInfo(credentials);
        if (!profile) {
            this.logger.error("Couldn't get user profile.");
            return null;
        }

        // Remove existent token for user from local store
        // TODO: Probably we need to delete token from server also?
        await this.tokenStore.remove(profile.userId);

        // Remove saved profile if exists
        await this.profileStorage.delete(profile.userId);

        // Save token in local store
        await this.tokenStore.set(profile.userId, { token: token });

        // Make it active
        profile.isActive = true;

        // Save it in local store
        await this.profileStorage.save(profile);

        return profile;
    }

    public async doLogout(userId: string): Promise<void> {

        // Remove token from local store
        // TODO: Probably we need to delete token from server also?
        await this.tokenStore.remove(userId);

        // Remove saved profile from local store
        await this.profileStorage.delete(userId);

        // If there are no profiles left just exit
        const profiles: T[] | null = await this.profileStorage.list();
        if (profiles.length === 0) {
            return;
        }

        // If there is no active profile then choose first saved profile and make it active if possible
        if (!this.profileStorage.active) {
            const firstProfile = profiles[0];
            firstProfile.isActive = true;
            await this.profileStorage.save(firstProfile);
        }
    }

    public async updateProfile(profile: Profile): Promise<void> {
        await this.profileStorage.save(profile);
    }

    public async getProfiles(): Promise<Profile[]> {
        return await this.profileStorage.list();
    }

    public static accessTokenFor(tokenStore: TokenStore, profile: Profile): Promise<string> {
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
}
