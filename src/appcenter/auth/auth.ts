import { SettingsHelper } from "../../helpers/settingsHelper";
import { createAppCenterClient, models } from "../api";
import { deleteUser, getUser, Profile, saveUser } from "./profile/profile";

export default class Auth {
    public static getProfile(): Promise<Profile | null> {
        const profile: Profile | null = getUser();
        if (profile) {
            return Promise.resolve(profile);
        } else {
            return Promise.resolve(null);
        }
    }

    public static doTokenLogin(token: string): Promise<Profile | null> {
        if (!token) {
            return Promise.resolve(null);
        }

        return this.removeLoggedInUser().then(() => {
            return Auth.fetchUserInfoByTokenAndSave(token).then((profile: Profile) => {
                return Promise.resolve(profile);
            }).catch(() => {
                return Promise.resolve(null);
            });
        });
    }

    public static doLogout(): Promise<void> {
        // TODO: Probably we need to delete token from server also?
        return this.removeLoggedInUser();
    }

    private static fetchUserInfoByTokenAndSave(token: string): Promise<Profile> {
        return Auth.getUserInfo(token).then(userResponse => {
            return saveUser(userResponse, { token: token }).then((profile: Profile) => {
                return Promise.resolve(profile);
            });
            // tslint:disable-next-line:no-any
        }).catch((e: any) => {
            throw e;
        });
    }

    private static getUserInfo(token: string): Promise<models.UserProfileResponse> {
        const client = createAppCenterClient().fromToken(token, SettingsHelper.getAppCenterAPIEndpoint());
        return client.account.users.get();
    }

    private static removeLoggedInUser(): Promise<void> {
        return deleteUser().then(() => {
            return Promise.resolve(void 0);
        }).catch(() => { }); // Noop, it's ok if deletion fails
    }
}
