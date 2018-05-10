import { QuickPickItem } from "vscode";
import AppCenterAuth from "../auth/appCenterAuth";
import VstsAuth from "../auth/vstsAuth";
import { ExtensionManager } from "../extension/extensionManager";
import { AppCenterOS } from "../extension/resources/constants";

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

export interface LinkableApp {
    appName: string;
    os: string;
}

export interface CurrentApp extends LinkableApp {
    ownerName: string;
    identifier: string;
    targetBinaryVersion: string;
    isMandatory: boolean;
    type: string;
    currentAppDeployments: CurrentAppDeployments;
    appSecret: string;
}

export interface CreatedAppFromAppCenter extends LinkableApp {
    appSecret: string;
    platform: string;
}

export interface ProfileStorage<T extends Profile> {
    activeProfile: T | null;
    save(profile: Profile): Promise<void>;
    delete(userId: string): Promise<T | null>;
    get(userId: string): Promise<T | null>;
    list(): Promise<T[]>;
    init(): Promise<void>;
    tryFixStorage(): Promise<boolean>;
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
    appCenterAuth: AppCenterAuth;
    vstsAuth: VstsAuth;
}

export interface ReactNativeLinkInputValue {
    label: string; // a part of the string preceding the input.
    input: string; // the value we should paste into input.
    sent: boolean; // whether this value has been already sent.
}

export interface MenuQuickPickItem extends QuickPickItem {
    command: string;
}
