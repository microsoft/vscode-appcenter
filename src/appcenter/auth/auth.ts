import { SettingsHelper } from "../../helpers/settingsHelper";
import { createAppCenterClient, models } from "../api";
import { deleteUser, getUser, Profile, saveUser } from "./profile/profile";

export default class Auth {
    public static getProfile(projectRootPath: string): Promise<Profile | null> {
        const profile: Profile | null = getUser(projectRootPath);
        if (profile) {
            return Promise.resolve(profile);
        } else {
            return Promise.resolve(null);
        }
    }

    public static doTokenLogin(token: string, projectRootPath: string): Promise<Profile | null> {
        if (!token) {
            return Promise.resolve(null);
        }

        return this.removeLoggedInUser(projectRootPath).then(() => {
            return Auth.fetchUserInfoByTokenAndSave(token, projectRootPath).then((profile: Profile) => {
                return Promise.resolve(profile);
            }).catch(() => {
                    return Promise.resolve(null);
            });
        });
    }

    public static doLogout(projectRootPath: string): Promise<void> {
        // TODO: Probably we need to delete token from server also?
        return this.removeLoggedInUser(projectRootPath);
    }

    private static fetchUserInfoByTokenAndSave(token: string, projectRootPath: string): Promise<Profile>  {
        return Auth.getUserInfo(token).then(userResponse => {
            return saveUser(userResponse, { token: token }, projectRootPath).then((profile: Profile) => {
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

    private static removeLoggedInUser(projectRootPath: string): Promise<void> {
        return deleteUser(projectRootPath).then(() => {
            return Promise.resolve(void 0);
        }).catch(() => { }); // Noop, it's ok if deletion fails
    }
}
