import * as fs from "fs";
import * as mkdirp from "mkdirp";
import * as path from "path";
import { CurrentApp, Profile } from "../../../helpers/interfaces";
import { tokenStore, TokenValueType } from "../tokenStore/index";
import { getProfileDir, profileFile } from "./getProfileDir";

export { Profile } from "../../../helpers/interfaces";

class ProfileImpl implements Profile {
    public userId: string;
    public userName: string;
    public displayName: string;
    public email: string;
    public currentApp?: CurrentApp;

    // tslint:disable-next-line:no-any
    constructor(fileContents: any) {
        this.userId = fileContents.userId || fileContents.id;
        this.userName = fileContents.userName || fileContents.name;
        this.displayName = fileContents.displayName;
        this.email = fileContents.email;
        this.currentApp = fileContents.currentApp;
    }

    get accessToken(): Promise<string> {
        const getter = tokenStore.get(this.userName)
          .catch(() => {
              });
        const emptyToken = "";
        // tslint:disable-next-line:no-any
        return getter.then((entry: any) => {
            if (entry) {
                return entry.accessToken.token;
            }
            return emptyToken;
        }).catch(() => {
                // Failed to get token from porfile, return no result
                return emptyToken;
            });
    }

    public save(): Profile {
        // tslint:disable-next-line:no-any
        const profile: any = {
            userId: this.userId,
            userName: this.userName,
            displayName: this.displayName,
            email: this.email,
            currentApp: this.currentApp
          };

        mkdirp.sync(getProfileDir());
        fs.writeFileSync(getProfileFilename(), JSON.stringify(profile, null, "\t"), { encoding: "utf8" });
        return this;
    }

    public logout(): Promise<void> {
        return tokenStore.remove(this.userName).then(() => {
            try {
                fs.unlinkSync(getProfileFilename());
            } catch (err) {
                // File not found is ok, probably doesn't exist
            }
        });
    }
}

let currentProfile: Profile | null;

function getProfileFilename(): string {
    const profileDir = getProfileDir();
    return path.join(profileDir, profileFile);
}

function loadProfile(): Profile | null {
    const profilePath = getProfileFilename();
    if (!fs.existsSync(profilePath)) {
        return null;
    }

    const profileContents = fs.readFileSync(profilePath, "utf8");
    // tslint:disable-next-line:no-any
    const profile: any = JSON.parse(profileContents);
    return new ProfileImpl(profile);
}

export function getUser(): Profile | null {
    if (!currentProfile) {
      currentProfile = loadProfile();
    }
    return currentProfile;
}

// tslint:disable-next-line:no-any
export function saveUser(user: any, token: TokenValueType): Promise<Profile> {
    return tokenStore.set(user.name, token).then(() => {
        const profile = new ProfileImpl(user);
        profile.save();
        return profile;
    });
}

export function deleteUser(): Promise<void> {
    const profile = getUser();
    if (profile) {
      currentProfile = null;
      return profile.logout();
    }
    return Promise.resolve(void 0);
}
