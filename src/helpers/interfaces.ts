export interface Deployment {
    name: string;
}

export interface CurrentAppDeployments {
    currentDeploymentName: string;
    codePushDeployments: Deployment[];
}
export interface DefaultApp {
    ownerName: string;
    appName: string;
    identifier: string;
    targetBinaryVersion: string;
    isMandatory: boolean;
    os: string;
    currentAppDeployments: CurrentAppDeployments;
}

export interface Profile {
    userId: string;
    userName: string;
    displayName: string;
    email: string;
    readonly accessToken: Promise<string>;
    defaultApp?: DefaultApp;
    save(projectRootPath: string): Profile;
    logout(projectRootPath: string): Promise<void>;
}

export interface IDefaultCommandParams {
    app: DefaultApp;
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
