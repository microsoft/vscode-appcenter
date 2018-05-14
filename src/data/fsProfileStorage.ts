import { ILogger } from "../extension/log/logHelper";
import { Profile, ProfileStorage } from "../helpers/interfaces";
import { FSUtils } from "../helpers/utils/fsUtils";
import { LogStrings } from "../extension/resources/logStrings";

export default class FsProfileStorage<T extends Profile> implements ProfileStorage<T> {
    protected profiles: T[];
    protected indexOfActiveProfile: number | null;

    constructor(protected storageFilePath: string, protected logger: ILogger) {
        this.profiles = [];
    }

    public get activeProfile(): T | null {
        return (this.indexOfActiveProfile === null || this.profiles.length <= this.indexOfActiveProfile) ? null : this.profiles[this.indexOfActiveProfile];
    }

    public async init(): Promise<void> {
        if (!await this.storageExists()) {
            await this.createEmptyStorage();
        }
        await this.loadDataFromStorage();
    }

    private async createEmptyStorage(): Promise<void> {
        return await FSUtils.writeFile(this.storageFilePath, "[]");
    }

    private async storageExists(): Promise<boolean> {
        return await FSUtils.exists(this.storageFilePath);
    }

    private async loadDataFromStorage(): Promise<void> {
        try {
            const data: string = await FSUtils.readFile(this.storageFilePath);
            this.profiles = JSON.parse(data);
        } catch (e) {
            this.logger.info(LogStrings.FailedToParseStorage(this.storageFilePath) + (e && e.message) || "");
            FSUtils.removeFile(this.storageFilePath);
            return;
        }

        // Identify active profile
        const activeProfiles: T[] = this.profiles.filter(profile => profile.isActive);

        if (activeProfiles.length > 1) {
            this.logger.error(LogStrings.MultipleActiveProfiles(this.storageFilePath));
        } else if (activeProfiles.length === 1) {
            this.indexOfActiveProfile = this.profiles.indexOf(activeProfiles[0]);
        }
    }

    public async tryFixStorage(): Promise<boolean> {
        if (this.profiles.length === 0) {
            return false;
        }
        const activeProfiles: T[] = this.profiles.filter(profile => profile.isActive);

        if (activeProfiles.length > 1) {
            for (const activeProfile of activeProfiles) {
                activeProfile.isActive = false;
            }
            const indexInArray: number = this.profiles.indexOf(activeProfiles[0]);
            this.profiles[indexInArray].isActive = true;
            this.indexOfActiveProfile = indexInArray;
            this.saveProfiles();
        } else if (activeProfiles.length === 1) {
            this.indexOfActiveProfile = this.profiles.indexOf(activeProfiles[0]);
        } else {
            this.profiles[0].isActive = true;
            this.indexOfActiveProfile = 0;
            this.saveProfiles();
        }
        return true;
    }

    private async saveProfiles(): Promise<void> {
        const data = JSON.stringify(this.profiles, null, "\t");
        try {
            await FSUtils.writeFile(this.storageFilePath, data);
        } catch (e) {
            this.logger.info(LogStrings.FailedToWriteProfiles(this.storageFilePath) + (e && e.message) || "");
            return;
        }
    }

    public async save(profile: T): Promise<void> {
        const deletedProfile = await this.delete(profile.userId);

        // If user just re-logged in then preserve active state
        if (deletedProfile && deletedProfile.userId === profile.userId) {
            profile.isActive = deletedProfile.isActive;
        }

        if (this.activeProfile) {
            this.activeProfile.isActive = false;
            this.indexOfActiveProfile = null;
        }

        // Add new user
        const createdIndex = this.profiles.push(profile) - 1;
        if (profile.isActive) {
            this.indexOfActiveProfile = createdIndex;
        }
        await this.saveProfiles();
    }

    public async delete(userId: string): Promise<T | null> {
        const foundProfile = await this.get(userId);
        if (!foundProfile) {
            return null;
        }
        const indexToDelete = this.profiles.indexOf(foundProfile);
        const deletedProfile: T[] = this.profiles.splice(indexToDelete, 1);
        if (this.indexOfActiveProfile) {
            if (indexToDelete < this.indexOfActiveProfile) {
                this.indexOfActiveProfile--;
            } else if (indexToDelete === this.indexOfActiveProfile) {
                this.indexOfActiveProfile = null;
            }
        }
        await this.saveProfiles();
        return deletedProfile[0];
    }

    public async get(userId: string): Promise<T | null> {
        const foundProfiles: T[] = this.profiles.filter(value => value.userId === userId);
        if (foundProfiles.length === 1) {
            return foundProfiles[0];
        } else if (foundProfiles.length > 1) {
            throw new Error(LogStrings.MultipleProfiles(userId, this.storageFilePath));
        }
        return null;
    }

    public async list(): Promise<T[]> {
        return this.profiles;
    }
}
