import { AuthProvider } from "./constants";

export class Messages {

    // #region Progress labels
    public static CreatingAppStatusBarProgressMessage: string = `Creating a new App Center app...`;
    public static SimulateCrashesProgressMessage: string = "Generating crash data for you...";
    public static CreatingDistributionStatusBarProgressMessage: string = "Creating distribution groups...";
    public static SimulateCrashesSendProgressMessage: string = "Sending crash data to App Center...";
    public static ReleasingUpdateContentsProgressMessage: string = "Sending update to CodePush...";
    public static FetchDeploymentsProgressMessage: string = "Fetching CodePush deployments for you...";
    public static GetAppsListProgressMessage: string = "Getting apps...";
    public static ConnectingRepoToBuildServiceStatusBarProgressMessage: string = "Configuring cloud build services...";
    public static CreateBranchConfigAndKickOffBuildProgressMessage: string = "Starting a fresh cloud build...";
    public static VSCodeProgressLoadingTitle: string = "Loading...";
    public static InstallCodePushProgressMessage: string = "Installing CodePush...";
    public static InstallAppCenterProgressMessage: string = "Installing App Center modules...";
    public static LinkCodePushProgressMessage: string = "Linking React Native Module for CodePush...";
    public static CheckIfAppsExistProgressMessage: string = "Checking if project name is already in use...";
    public static LoadingVSTSProjectsProgressMessage: string = "Loading VSTS projects for you...";
    public static LoadingStatusBarProgressMessage: string = "Loading some information for you...";
    public static CreateRNProjectProgressMessage: string = "Creating a starting point for your project...";
    public static PushToRemoteRepoProgressMessage: string = "Pushing changes to your new repository...";
    public static CreatingCodePushDeploymentsProgressMessage: string = "Creating CodePush deployments...";
    public static RunNPMInstallProgressMessage: string = "Installing package dependencies...";
    public static FetchingDevicesProgressMessage: string = "Fetching devices...";
    public static CleaningBuildProgressMessage: string = "Cleaning build directory...";
    public static PreparingBuildProgressMessage: string = "Preparing build for testing...";
    public static MakingBundleProgressMessage: string = "Making a bundle...";
    public static UploadingAndRunningTestsProgressMessage: string = "Uploading and running tests on App Center portal...";
    public static CheckingAppCenterCliProgressMessage: string = "Checking for AppCenter CLI installation...";
    public static GettingAppInfoProgressMessage: string = "Retrieving app info...";
    public static DetectingAppVersionProgressMessage: string = "Locating app version...";
    public static RunningBundleCommandProgressMessage: string = "Creating a new bundle...";
    public static ArchivingUpdateContentsProgressMessage: string = "Compressing new bundle...";
    public static MakingMixinProgressMessage(folder: string): string {
        return `Adding contents of ${folder} to bundle...`;
    }

    // #endregion Progress labels

    // #region Info messages
    public static StatusBarAlreadyShownMessage: string = "The status bar is already shown. Look, it's in the bottom left corner of the window, with your name/app name on it!";
    public static StatusBarAlreadyHiddenMessage: string = "You've already hidden the status bar.";
    public static StatusBarShownMessage: string = "Status bar is now visible.";
    public static StatusBarHiddenMessage: string = "Status bar is now hidden.";
    public static CodePushLinkedMessage: string = "CodePush has been successfully linked to your application!";
    public static PleaseLoginViaBrowserMessage: string = "You are about to be redirected to page containing a new App Center access token. Please copy and paste it here after you press Ok.";
    public static CrashesSimulatedMessage: string = "The crash has been successfully generated and sent to App Center!";
    public static PodsNotInstalledMessage: string = "It looks like you haven't installed CocoaPods. You need it to run the application on iOS. After the installation, run 'cd ios && pod update'.";
    public static AppCenterBeforeLinkMessage: string = "We will run 'react-native link' command for you. When you press OK, you will see a message with your app secrets.";

    public static ReleaseMadeMessage(deploymentName: string, appName: string): string {
        return `Successfully released an update to the "${deploymentName}" deployment of the "${appName}" app.`;
    }

    public static BuildManualConfigureMessage(appName: string): string {
        return `Could not configure ${appName} build. Please try to do it manually.`;
    }

    public static RepoManualConnectMessage(appName: string): string {
        return `Could not connect ${appName} to the repository. Please try to do it manually.`;
    }

    public static YourCurrentDeploymentMessage(deploymentName: string): string {
        return `The current CodePush deployment selected is '${deploymentName}'.`;
    }

    public static ChangedTargetBinaryVersionMessage(version?: string): string {
        if (!version) {
            version = "automatically fetched";
        }
        return `Changed target binary version to '${version}'.`;
    }

    public static ChangedMandatoryMessage(newMandatoryValue: boolean): string {
        return `Changed release to ${newMandatoryValue ? "Mandatory" : "NOT Mandatory"}.`;
    }

    // If only one app has been created, pass 1st parameter and squash is true.
    // If two apps were created, pass their names and squash is true.
    // If two apps were created and user has chosen one of them as current, pass only current app name.
    public static AppCreatedMessage(appName: string, squash?: boolean, secondAppName?: string): string {
        if (secondAppName) {
            return `Apps ${appName} and ${secondAppName} have been created in App Center.`;
        } else {
            return squash ?
                `The app ${appName} has been created in App Center and set as current.` :
                `The current app is ${appName}, go see it in App Center.`;
        }
    }

    public static YourCurrentAppMessage(appName: string): string {
        return `The current app is '${appName}'.`;
    }

    public static YouAreLoggedInMessage(provider: AuthProvider, name: string): string {
        return `You are logged into ${provider} as '${name}'.`;
    }

    public static YouAreLoggedInCurrentAppIsMessage(provider: AuthProvider, name: string, currentAppName: string): string {
        return `You are logged into ${provider} as '${name}'.
The current app is '${currentAppName}'.`;
    }

    public static YourCurrentAppAndDeploymentMessage(appName: string, deploymentName: string): string {
        if (deploymentName) {
            return `${appName} (${deploymentName}) is now your current app and deployment.`;
        } else {
            return `${appName} is now your current app.`;
        }
    }

    public static UserLoggedOutMessage(provider: AuthProvider, name: string): string {
        return `You have successfully logged out of ${provider} as '${name}'.`;
    }

    public static UserSwitchedMessage(provider: AuthProvider, name: string): string {
        return `Successfully switched ${provider} account to '${name}'.`;
    }

    public static AppCenterSecretsHintMessage(androidSecret: string, iosSecret: string): string {
        let secretsHint = "Paste these app secrets when needed. ";
        if (androidSecret) {
            secretsHint += ` Android app secret:< ${androidSecret}   > `;
        }
        if (iosSecret) {
            secretsHint += ` iOS app secret:<   ${iosSecret}   > `;
        }
        return secretsHint;
    }
    // #endregion Info messages

    // #region Warnings
    public static NotReactProjectWarning: string = "This command can only be executed from a React Native project. Check out the Output window for more details.";
    public static NoCurrentAppSetWarning: string = "You haven't specified an App Center app for this project.";
    public static UnsupportedOSWarning: string = `OS must be "android", "ios", or "windows".`;
    public static NoDeploymentsWarning: string = "There are no deployments for current app.";
    public static InvalidCurrentAppNameWarning: string = "Sorry, the app name isn't valid.";
    public static UserIsNotLoggedInWarning: string = "You are not logged into App Center.";
    public static InvalidAppVersionParamWarning: string = "Sorry, the provided app version isn't valid. It should be in a valid semver vesion format.";
    public static NotCodePushProjectWarning: string = "This command can only be executed from a React Native project with CodePush installed. Check out the Output window for more details.";
    public static GitIsNotInstalledWarning: string = "It looks like you don't have a local git client installed.";
    public static ProjectNameIsNotValidWarning: string = "Sorry, the project name your entered is invalid. Make sure its starts with a letter and has no whitespaces in it.";
    public static VstsCredsNotValidWarning: string = "VSTS credentials are not valid.";
    public static DirectoryIsNotEmptyForNewProjectWarning: string = "Sorry, you can only start a new project inside an empty folder.";
    public static NoProjectRootFolderFoundWarning: string = "Please open a project before using this command.";
    public static AppAlreadyExistInAppCenterWarning(appName: string): string {
        return `An app with the name ${appName} already exists in App Center. Please choose a new name.`;
    }

    public static PackageIsNotInstalledGloballyWarning(packageName: string) {
        return `You have not installed package ${packageName} globally. Please run "npm i -g ${packageName}" and try again.`;
    }
    // #endregion Warnings

    // #region Error messages
    public static FailedToMakeCodePushRelease: string = "An error occured on doing Code Push release.";
    public static FailedToCreateAppInAppCenter: string = `An error occurred while creating the new App Center app.`;
    public static FailedToGetVSTSProjects: string = `An error while trying to retrieve your VSTS projects.`;
    public static FailedToCreateVSTSGitrepository: string = `An error occurred while creating your new VSTS repository.`;
    public static FailedToCreateDeployments: string = `Failed to create deployments for the app. Check out the output window for more details.`;
    public static FailedToLinkCodePush: string = `Failed to link CodePush to the application. Check out the Output window for more details.`;
    public static FailedToLinkAppCenter: string = `Failed to link App Center to the application. Check out the Output window for more details.`;
    public static FailedToConnectRepoToBuildService: string = "Failed to connect the repository to the build service. Check out the Output window for more details.";
    public static FailedToConfigureBranchAndStartNewBuild: string = "Failed to configure the branch for build. Check out the Output window for more details.";
    public static FailedToCreateDistributionGroup: string = "Failed to create distribution groups. Check out the Output window for more details.";
    public static FailedToCreateRNProjectMsg: string = "An unexpected error occurred while fetching the sample project.";
    public static FailedToAddRemoteRepositoryMsg: string = "Sorry, failed to add remote repository.";
    public static FailedToGetSelectedUserOrOrganizationMsg: string = "Sorry, failed to get selected account information.";
    public static FailedToProvideRepositoryNameMsg: string = "Sorry, the git url you provided doesn't appear to be valid.";
    public static FailedToLogin: string = "Could not login into account.";
    public static FailedToLogout: string = "Error occured during the logout.";
    public static FailedToSwitchAccounts: string = "Error occured during the switching accounts.";
    public static FailedToGenerateCrashes: string = "An error occurred while generating crashes. Please check the output window for more details.";
    public static UnknownError: string = "An unknown error has occured. Please check the output window for more details.";

    public static FailedToExecuteLoginMsg(provider: AuthProvider): string {
        return `Failed to login to ${provider}.`;
    }

    public static FailedToPushChangesToRemoteRepoMsg: (repoName: string) => string = (repoName: string) => {
        return `Failed to push local changes to remote repository '${repoName}'.`;
    }
    // #endregion Error messages
}
