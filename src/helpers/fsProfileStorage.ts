import { ILogger } from '../log/logHelper';
import { FSUtils } from './fsUtils';
import { Profile, ProfileStorage } from './interfaces';

export default class FsProfileStorage<T extends Profile> implements ProfileStorage<T> {
    protected storageFile: string;
    protected profiles: T[];
    protected activeIndex: number | null;
    protected logger: ILogger;

    constructor(storageFile: string, logger: ILogger) {
        this.storageFile = storageFile;
        this.profiles = [];
        this.logger = logger;
    }

    public get active(): T | null {
        return (this.activeIndex === null) ? null : this.profiles[this.activeIndex];
    }

    public async init(): Promise<void> {
        if (!await this.storageExists()) {
            await this.createEmptyStorage();
        }
        await this.loadDataFromStorage();
    }

    private async createEmptyStorage(): Promise<void> {
        return await FSUtils.writeFile(this.storageFile, "[]");
    }

    private async storageExists(): Promise<boolean> {
        return await FSUtils.exists(this.storageFile);
    }

    private async loadDataFromStorage(): Promise<void> {
        const data: string = await FSUtils.readFile(this.storageFile);
        try {
            this.profiles = JSON.parse(data);
        } catch (e) {
            this.logger.info(`Failed to parse JSON file for ${this.storageFile}`);
            return;
        }

        // Identify active profile
        const activeProfiles: T[] = this.profiles.filter(profile => profile.isActive);
        if (activeProfiles.length > 1) {
            throw new Error('Malformed profile data. Shouldn\'t be more than one active profiles.');
        } else if (activeProfiles.length === 1) {
            this.activeIndex = this.profiles.indexOf(activeProfiles[0]);
        }
    }

    private async commitChanges(): Promise<void> {
        const data = JSON.stringify(this.profiles, null, "\t");
        await FSUtils.writeFile(this.storageFile, data);
    }

    public async save(profile: T): Promise<void> {
        const deletedProfile = await this.delete(profile.userId);

        // If user just re-logged in then preserve active state
        if (deletedProfile && deletedProfile.userId === profile.userId) {
            profile.isActive = deletedProfile.isActive;
        }

        // Reset current active user
        const currentActive: T | null = this.active;
        if (currentActive) {
            currentActive.isActive = false;
            this.activeIndex = null;
        }

        // Add new user
        const createdIndex = this.profiles.push(profile) - 1;
        if (profile.isActive) {
            this.activeIndex = createdIndex;
        }
        await this.commitChanges();
    }

    public async delete(userId: string): Promise<T | null> {
        const existentProfile = await this.get(userId);
        if (!existentProfile) {
            return null;
        }
        const indexToDelete = this.profiles.indexOf(existentProfile);
        const deletedProfile: T[] = this.profiles.splice(indexToDelete, 1);
        if (this.activeIndex) {
            if (indexToDelete < this.activeIndex) {
                this.activeIndex--;
            } else if (indexToDelete === this.activeIndex) {
                this.activeIndex = null;
            }
        }
        await this.commitChanges();
        return deletedProfile[0];
    }

    public async get(userId: string): Promise<T | null> {
        const existentProfiles: T[] = this.profiles.filter(value => value.userId === userId);
        if (existentProfiles.length === 1) {
            return existentProfiles[0];
        } else if (existentProfiles.length > 1) {
            throw new Error('There are more than one profiles with such userId saved.');
        }
        return null;
    }

    public async list(): Promise<T[]> {
        return this.profiles;
    }
}
