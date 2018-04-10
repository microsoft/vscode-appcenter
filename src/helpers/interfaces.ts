import { AppCenterOS } from "../constants";

export interface Deployment {
    name: string;
    key?: string;
    os?: AppCenterOS;
}

export interface CurrentAppDeployments {
    currentDeploymentName: string;
    codePushDeployments: Deployment[];
}

export interface UserOrOrganizationItem {
    isOrganization: boolean;
    name?: string;
    displayName?: string;
}

export interface CurrentApp {
    ownerName: string;
    appName: string;
    identifier: string;
    targetBinaryVersion: string;
    isMandatory: boolean;
    os: string;
    type: string;
    currentAppDeployments: CurrentAppDeployments;
}

export interface CreatedAppFromAppCenter {
    appSecret: string;
    platform: string;
    os: string;
    name: string;
}

export interface ProfileStorage<T extends Profile> {
    active: T | null;
    save(profile: Profile): Promise<void>;
    delete(userId: string): Promise<T | null>;
    get(userId: string): Promise<T | null>;
    list(): Promise<T[]>;
    init(): Promise<void>;
}

export interface Profile {
    userId: string;
    userName: string;
    displayName: string;
    isActive: boolean;
}

export interface AppCenterProfile extends Profile {
    email: string;
    currentApp?: CurrentApp;
}

export interface VstsProfile extends Profile {
}

export interface LoginCredentials {
    token: string;
}

export interface AppCenterLoginCredentials extends LoginCredentials {
}

export interface VstsLoginCredentials extends LoginCredentials {
    tenantName: string;
    userName: string;
}

export interface IDefaultCommandParams {
    app: CurrentApp;
}
export interface ICodePushReleaseParams extends IDefaultCommandParams {
    deploymentName: string;
    updatedContentZipPath: string;
    appVersion?: string;
    description?: string;
    isDisabled?: boolean;
    isMandatory?: boolean;
    label?: string;
    packageHash?: string;
    rollout?: number;
    token?: string;
}

export interface QuickPickAppItem {
    label: string;
    description: string;
    target: string;
}

export interface ProfileQuickPickItem {
    label: string;
    description: string;
    profile: Profile;
}
