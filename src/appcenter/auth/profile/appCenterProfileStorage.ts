import { FSUtils } from "../../../helpers/fsUtils";
import { AppCenterProfile, ProfileStorage } from '../../../helpers/interfaces';

export default class AppCenterProfileStorage implements ProfileStorage<AppCenterProfile> {
    protected storageFile: string;
    protected profiles: AppCenterProfile[];
    protected activeIndex: number | null;

    public get active(): AppCenterProfile | null {
        return (this.activeIndex === null) ? null : this.profiles[this.activeIndex];
    }

    constructor(storageFile: string) {
        this.storageFile = storageFile;
        this.profiles = [];
    }

    public async init(): Promise<void> {
        if (!await this.storageExists()) {
            await this.createEmptyStorage();
        }
        await this.readFromPersistentStorage();
    }

    private async createEmptyStorage(): Promise<void> {
        return await FSUtils.writeFile(this.storageFile, "[]");
    }

    private async storageExists(): Promise<boolean> {
        return await FSUtils.exists(this.storageFile);
    }

    private async readFromPersistentStorage(): Promise<void> {
        const data: string = await FSUtils.readFile(this.storageFile);
        this.profiles = JSON.parse(data);

        // Identify active profile
        const activeProfiles: AppCenterProfile[] = this.profiles.filter(profile => profile.isActive);
        if (activeProfiles.length > 1) {
            throw new Error('Malformed profile storage. Shouldn\'t be more than one active profiles');
        } else if (activeProfiles.length === 1) {
            this.activeIndex = this.profiles.indexOf(activeProfiles[0]);
        }
    }

    private async saveToPersistentStorage(): Promise<void> {
        const data = JSON.stringify(this.profiles, null, "\t");
        await FSUtils.writeFile(this.storageFile, data);
    }

    public async save(profile: AppCenterProfile): Promise<void> {
        const deletedProfile = await this.delete(profile.userId);

        // If user just re-logged in then preserve active state
        if (deletedProfile && deletedProfile.userId === profile.userId) {
            profile.isActive = deletedProfile.isActive;
        }

        // Reset current active user
        const currentActive = this.active;
        if (currentActive) {
            currentActive.isActive = false;
            this.activeIndex = null;
        }

        // Add new user
        const createdIndex = this.profiles.push(profile) - 1;
        if (profile.isActive) {
            this.activeIndex = createdIndex;
        }
        await this.saveToPersistentStorage();
    }

    public async delete(userId: string): Promise<AppCenterProfile | null> {
        const existentProfile = await this.get(userId);
        if (!existentProfile) {
            return null;
        }
        const indexToDelete = this.profiles.indexOf(existentProfile);
        const deletedProfile: AppCenterProfile[] = this.profiles.splice(indexToDelete, 1);
        if (deletedProfile[0].isActive) {
            this.activeIndex = null;
        }
        await this.saveToPersistentStorage();
        return deletedProfile[0];
    }

    public async get(userId: string): Promise<AppCenterProfile | null> {
        const existentProfiles: AppCenterProfile[] = this.profiles.filter(value => value.userId === userId);
        if (existentProfiles.length === 1) {
            return existentProfiles[0];
        } else if (existentProfiles.length > 1) {
            throw new Error('There are more than one profiles with such userId saved.');
        }
        return null;
    }

    public async list(): Promise<AppCenterProfile[]> {
        return this.profiles;
    }
}
