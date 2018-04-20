import AppCenterAuth from "../appcenter/auth/appCenterAuth";
import VstsAuth from "../appcenter/auth/vstsAuth";
import { AppCenterOS } from "../constants";
import { ExtensionManager } from "../extensionManager";
import { ILogger } from "../log/logHelper";

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
    appSecret: string;
}

export interface CreatedAppFromAppCenter {
    appSecret: string;
    platform: string;
    os: string;
    name: string;
}

export interface ProfileStorage<T extends Profile> {
    activeProfile: T | null;
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
    currentApp?: CurrentApp;
}

export interface AppCenterProfile extends Profile {
    email: string;
    currentApp?: CurrentApp;
}

export interface VstsProfile extends Profile {
    tenantName: string;
}

export interface LoginInfo {
    token: string;
}

// tslint:disable-next-line:no-empty-interface
export interface AppCenterLoginInfo extends LoginInfo {
}

export interface VstsLoginInfo extends LoginInfo {
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

export interface CommandParams {
    manager: ExtensionManager;
    logger: ILogger;
    appCenterAuth: AppCenterAuth;
    vstsAuth: VstsAuth;
}
