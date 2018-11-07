export class LogStrings {
    public static NodeModulesInstalledMessage: string = "Dependencies have been successfully installed.";
    public static PodsInstalledMessage: string = "Pods have been successfully installed.";
    public static CodePushInstallMessage: string = "Make sure you ran \"npm install\" and that you are inside a React Native CodePush project.";
    public static AppCenterInstallMessage: string = "Make sure you ran \"npm install\" and that you are inside a React Native App Center project.";
    public static ReactNativeInstallMessage: string = "Make sure you ran \"npm install\" and that you are inside a React Native project.";
    public static FailedToGetVSTSProjectList: string = "Failed to get VSTS Project list.";
    public static FailedToGetVSTSReposList: string = "Failed to get VSTS Git repositories list.";
    public static FailedToGetAppCenterProfile: string = "Could get profile from App Center.";
    public static FailedToGetProfileFile: string = "Profile not found. Login to the App Center via the Visual Studio Code Extension to create the profile.";
    public static FailedToGetUserProfile: string = "Couldn't get user profile.";
    public static FailedToGetUserFromServer: string = "Failed to fetch user info from server";
    public static NoTokenProvided: string = "No token provided on login";
    public static FailedToGetToken: string = "Failed to get token from profile.";
    public static CodePushError: string = "An error occured on doing Code Push release.";
    public static FailedToSendCrashes: string = "Failed to send crashes information.";
    public static ProjectOrOrgNotSet: string = `Sorry, Project name or User/Organization is not set`;
    public static FailedToClone: string = "Failed to clone into exiting repository";
    public static RootNotFound: string = 'No project root folder found';
    public static FailedToGetClient: string = "Failed to get App Center client";
    public static NoUserSpecified: string = 'No App Center user specified!';
    public static GettingUserOrOrg: string = "Getting user/organization items...";
    public static NoAppsToShow: string = "Do not show apps quick pick due to no apps (either in cache or fetched from server).";
    public static BuildingProject: string = "Building a new App Center project...";
    public static FailedToGetVSTSProfile: string = "Failed to get VSTS profile for command.";
    public static FailedToGetVSTSProject: string = "Failed to get VSTS project.";
    public static FailedToCreateVSTSRepo: string = "Failed to create VSTS git repo.";
    public static CreatingAppsInAppCenter: string = "Creating your iOS and Android app in App Center...";
    public static FailedCreateAppsInAppCenter: string = "Failed to create apps in App Center.";
    public static FailedToSaveCurrentApp: string = "Failed to save current app";
    public static ConfiguringAppCenterSDK: string = "Configuring App Center SDKs...";
    public static FailedToUpdateAppSecret: string = "Failed to update app secret keys!";
    public static CreatingCodePushDeployments: string = "Creating CodePush deployments...";
    public static SettingDeploymentKeys: string = "Setting CodePush deployment keys...";
    public static FailedToCreateDeploymentKeys: string = "Failed to update CodePush deployment keys!";
    public static InstallingPods: string = "Installing pods for ios...";
    public static FailedToInstallPods: string = "Failed to run pod update.";
    public static RunningNpmI: string = "Running npm install...";
    public static FailedNpmI: string = "Failed to run npm install.";
    public static SettingAppSecrets: string = "Setting app secrets...";
    public static PullingSample: string = "Pull App Center sample app into current directory...";

    public static PushingChangesTo(repoUrl: string): string {
        return `Pushing changes to ${repoUrl}...`;
    }
    public static SecretsInfo(appName: string, secret: string): string {

        return `App name: ${appName}, secret: ${secret}.`;
    }

    public static DeploymentInfo(name: string, key: string, os: string): string {
        return `Deployment name: ${name}, secret: ${key}, OS: ${os}.`;
    }
    public static CodePushUpdatedContentsDir(dir: string): string {
        return `CodePush updated contents directory path: ${dir}`;
    }

    public static UnknownOSFromCodePush(os: string): string {
        return `Couldn't recognize os ${os} returned from CodePush server.`;
    }

    public static CheckingProjectName(projectName: string) {
        return `Checking if project name "${projectName}" is not already used before...`;
    }
    public static DistributionGroupCreated(groupName: string, projectName: string): string {
        return `"${groupName}" distribution group was created for your project "${projectName}".`;
    }

    public static ProjectConnected(projectName: string, repoUrl: string): string {
        return `Project "${projectName}" was connected to repositry "${repoUrl}".`;
    }

    public static AppsCreated(projectName: string): string {
        return `Apps for your project "${projectName}" were created.`;
    }

    public static BuildConfigureError(appName: string): string {
        return `An error occurred while configuring your ${appName}" app for build.`;
    }

    public static BuildQueueError(appName: string): string {
        return `An unexpected error occurred while queueing a build for "${appName}".`;
    }

    public static BuildConnectError(appName: string, repoUrl: string): string {
        return `Could not connect your new repository "${repoUrl}" to your "${appName}" App Center project`;
    }

    public static DistributionGroupExists(group: string, appName: string): string {
        return `Distribution group "${group}" in "${appName}" already exists.`;
    }

    public static ErrorCreatingDistributionGroup(appName: string): string {
        return `An unexpected error occurred while creating a distribution group for "${appName}".`;
    }

    public static AppNameExists(appName: string): string {
        return `The app named "${appName}" already exists.`;
    }

    public static FailedCreateAppUnder(appName: string, orgName?: string): string {
        let failed = `An unexpected error occurred trying to create "${appName}"`;
        failed += orgName ? `under ${orgName}.` : ".";
        return failed;
    }

    public static DeploymentExists(appName: string): string {
        return `A CodePush deployment with the name ${appName} already exists, fetching the keys...`;
    }

    public static ErrorCreatingDeploymentsFor(appName: string): string {
        return `An unexpected error occurred trying to create CodePush deployments for ${appName}.`;
    }

    public static SavedCodePushDeploymentKey(path: string): string {
        return `Saved CodePush deployemnt key in ${path}.`;
    }

    public static SavedAppSecret(path: string): string {
        return `Saved App secret to ${path}.`;
    }

    public static CouldNotRead(name: string): string {
        return `Could not read contents of ${name}.`;
    }

    public static ReadContents(name: string): string {
        return `Read contents of ${name}.`;
    }

    public static CouldNotSave(name: string): string {
        return `Unable to save ${name}.`;
    }

    public static ConfigurationFailedToParse(value: string): string {
        return `Configuration Reader: Failed to parse value ${value}.`;
    }

    public static MultipleProfiles(userId: string, storageFilePath: string): string {
        return `There are more than one profile saved with userId ${userId}. Try deleting ${storageFilePath} and log in again.`;
    }

    public static FailedToWriteProfiles(storageFilePath: string): string {
        return `Failed to write profiles into ${storageFilePath}.`;
    }

    public static MultipleActiveProfiles(storageFilePath: string): string {
        return `Malformed profile data. Shouldn\'t be more than one active profile. Try deleting ${storageFilePath} and log in again.`;
    }

    public static FailedToParseStorage(storageFilePath: string): string {
        return `Failed to parse JSON file for ${storageFilePath}.`;
    }

    public static FailedToRemoveRemote(remoteName: string): string {
        return `Failed to remove remote "${remoteName}";`;
    }

    public static FailedToAddRemote(remoteName: string): string {
        return `Failed to add remote ${remoteName}`;
    }

    public static FailedToGetRemote(remoteName: string): string {
        return `Failed to get remote ${remoteName}`;
    }

    public static FailedToPullRemote(remoteName: string): string {
        return `Failed to pull from remote repo "${remoteName}"`;
    }

    public static SuccessfullyPushedTo(remoteRepoName: string, branch: string): string {
        return `Successfully pushed changes to remote repository: "${remoteRepoName}" branchname: "${branch}"`;
    }

    public static FailedToPushTo(remoteRepoName: string): string {
        return `Failed to configure/push to remote repository "${remoteRepoName}".`;
    }
}
