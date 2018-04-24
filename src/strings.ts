import { AuthProvider } from "./constants";
import { CurrentApp } from "./helpers/interfaces";

export class Strings {

    /* Menu labels */
    public static StartAnIdeaMenuLabel: string = "Start a new project";
    public static StartAnIdeaMenuDescription: string = "";
    public static OrganizationMenuDescriptionLabel: string = "Organization";
    public static UserMenuDescriptionLabel: string = "User";
    public static MenuCurrentAppDescription: string = "Click here to change current app";
    public static LoginMenuLabel: string = "Login";
    public static LoginMenuDescription: string = "";
    public static GetCurrentAppMenuLabel: string = "Get current app info";
    public static CodePushMenuLabelItem: string = "CodePush";
    public static CodePushMenuLabelDescription: string = "";
    public static AppCenterPortalMenuLabel: string = "Portal";
    public static AppCenterPortalMenuDescription: string = "Quick navigate your App Center apps";
    public static CreateNewAppMenuLabel: string = "Create a new App Center app";
    public static CreateNewIOSAppMenuLabel: string = "Create an app for iOS";
    public static CreateNewAndroidAppMenuLabel: string = "Create an app for Android";
    public static CreateNewAppsForBothMenuLabel: string = "Create apps for both platforms";
    public static CreateAppPlaceholder: string = "Choose the app to be created";
    public static SettingsMenuLabel: string = "Settings";
    public static SettingsMenuDescription: string = "";
    public static CrashesMenuLabel: string = "Simulate Crashes";
    public static LinkCodePushMenuLabel: string = "Link Code Push";
    public static LinkAppCenterMenuLabel: string = "Link App Center";
    public static LinkCodePushMenuDescription: string = "Link Code Push SDK to your application";
    public static LinkAppCenterMenuDescription: string = "Link App Center SDK to your application";
    public static ToolsMenuLabel: string = "Tools";
    public static ToolsMenuDescription: string = "";
    public static LoginToAnotherAccountMenuLabel: string = "Add App Center account";
    public static SwitchAccountMenuLabel: string = "Switch App Center account";
    public static LogoutMenuLabel: string = "Logout of App Center";
    public static VstsLoginToAnotherAccountMenuLabel: string = "Add VSTS account";
    public static VstsSwitchAccountMenuLabel: string = "Switch VSTS account";
    public static VstsLogoutMenuLabel: string = "Logout of VSTS";
    public static RunUITestsMenuLabel: string = "Run UI tests";
    public static RunUITestsAsyncMenuLabel: string = "Run UI tests asynchronously";
    public static ViewUITestResultOnPortalenuLabel: string = "View results in portal";

    public static SelectLoginTypeMsg: string = "How would you like to authenticate with App Center?";
    public static OkBtnLabel: string = "Ok";
    public static UserMustSignIn: string = "Please login to App Center.";
    public static PleaseProvideToken: string = "Please paste your App Center access token";
    public static PleaseLoginViaBrowser: string = "You are about to be redirected to page containing a new App Center access token. Please copy and paste it here after you press Ok.";
    public static UserIsNotLoggedInMsg: string = "You are not logged into App Center";
    public static MenuTitlePlaceholder: string = "Please make an App Center selection.";
    public static SelectProfileTitlePlaceholder: string = "Please select account.";
    public static SelectTestDeviceTitlePlaceholder: string = "Please select device configuration to test.";

    public static SpecifyTenantTitlePlaceholder: string = "(Step 1). Please specify instance name";
    public static SpecifyUserNameTitlePlaceholder: string = "(Step 2). Please specify username";
    public static SpecifyPATTitlePlaceholder: string = "(Step 3). Please specify personal access token";

    public static LoginToAppCenterButton: string = "App Center: Login";
    public static PleaseEnterIdeaName: string = "Please enter idea name";
    public static PleaseEnterNewRepositoryUrl: string = "Please enter repository url";
    public static PleaseSelectCurrentAppOrgMsg: string = "Please select user/organization where to create an App";

    public static NoIdeaNameSelectedMsg: string = "Please enter a name for your project.";
    public static VSCodeProgressLoadingTitle: string = "Loading...";
    public static InstallCodePushTitle: string = "Installing Code Push...";
    public static LinkCodePushTitle: string = "Linking React Native Module for CodePush...";
    public static CheckIfAppsExistLoadingMessage: string = "Checking if project name is already in use...";
    public static LoadingVSTSProjectsMessage: string = "Loading VSTS projects for you...";
    public static LoadingStatusBarMessage: string = "Loading some information for you...";
    public static CreateRNProjectStatusBarMessage: string = "Creating a starting point for your project...";
    public static PushToRemoteRepoStatusBarMessage: string = "Pushing changes to your new repository...";
    public static CreatingCodePushDeploymentsStatusBarMessage: string = "Creating CodePush deployments...";
    public static RunNPMInstallStatusBarMessage: string = "Installing package dependencies...";
    public static NodeModulesInstalledMessage: string = "Dependencies have been successfully installed";
    public static PodsInstalledMessage: string = "Pods have been successfully installed";
    public static FinishedConfigMsg: string = "Your project has been successfully configured locally and in the cloud.";
    public static GitIsNotInstalledMsg: string = "It looks like you don't have a local git client installed. ";
    public static FailedToCreateRNProjectMsg: string = "An unexpected error occurred while fetching the project template.";
    public static IdeaNameIsNotValidMsg: string = "Sorry, the project name your entered is invalid.";
    public static VstsCredsNotValidMsg: string = "Vsts credentials are not valid.";
    public static FailedToRemoveRemoteRepositoryMsg: string = "Sorry, failed to remove remote repository!";
    public static FailedToAddRemoteRepositoryMsg: string = "Sorry, failed to add remote repository!";
    public static FailedToGetSelectedUserOrOrganizationMsg: string = "Sorry, failed to get selected account information.";
    public static DirectoryIsNotEmptyForNewIdea: string = "Sorry, you can only start a new project inside an empty folder.";
    public static FailedToProvideRepositoryNameMsg: string = "Sorry, the git url you provided doesn't appear to be valid.";
    public static SelectCurrentAppMenuDescription: string = "Use Current App";
    public static FetchingDevicesStatusBarMessage: string = "Fetching devices...";
    public static CleaningBuildStatusBarMessage: string = "Cleaning build directory...";
    public static PreparingBuildStatusBarMessage: string = "Preparing build for testing...";
    public static UploadingAndRunningTestsStatusBarMessage: string = "Uploading and running tests on App Center portal...";
    public static CheckingAppCenterCli: string = "Checking for AppCenter CLI installation...";

    public static BuildTabMenuItem: string = "Build";
    public static TestTabMenuItem: string = "Test";
    public static DistributeTabMenuItem: string = "Distribute";
    public static CrashesTabMenuItem: string = "Crashes";
    public static AnalyticsTabMenuItem: string = "Analytics";
    public static PushTabMenuItem: string = "Push";

    public static DistributeGroupsTabMenuItem: string = "Groups";
    public static DistributeStoresTabMenuItem: string = "Stores";
    public static DistributeCodePushTabMenuItem: string = "CodePush";
    public static DistributeReleasesTabMenuItem: string = "Releases";

    public static GetAppsListMessage: string = "Getting apps...";
    public static FetchAppsStatusBarMessage: string = "Fetching your list of apps...";
    public static CreatingDistributionStatusBarMessage: string = "Creating distribution groups...";
    public static ConnectingRepoToBuildServiceStatusBarMessage: string = "Configuring cloud build services...";
    public static CreateBranchConfigAndKickOffBuildStatusBarMessage: string = "Starting a fresh cloud build...";
    public static ProvideCurrentAppPromptMsg: string = "Please specify an App Center app";
    public static ProvideVSTSProjectPromptMsg: string = "Please specify VSTS Project";
    public static FetchDeploymentsStatusBarMessage: string = "Fetching CodePush deployments for you...";
    public static InvalidCurrentAppNameMsg: string = "Sorry, the app name isn't valid.";

    public static FailedToConnectRepoToBuildService: string = "Sorry, we failed to connect the repository to the build service.";
    public static FailedToConfigureBranchAndStartNewBuild: string = "Sorry, we failed to configure the branch for build.";
    public static FailedToCreateDistributionGroup: string = "Sorry, we failed to create any distribution groups.";
    public static NoCurrentAppSetMsg: string = "You haven't specified an App Center app for this project.";
    public static UnsupportedOSMsg: string = `OS must be "android", "ios", or "windows".`;
    public static NoDeploymentsMsg: string = "There are no deployments for current app.";
    public static NoProjectRootFolderFound: string = "Please open a project before using this command.";
    public static UnknownError: string = "An unknown error has occured. Please check the output window for more details.";
    public static GenerateCrashesError: string = "An error occurred while generating crashes. Please check the output window for more details.";
    public static SelectCurrentDeploymentMsg: string = "Please specify a CodePush deployment.";
    public static PleaseProvideTargetBinaryVersion: string = "Please provide a target binary version in semver format";
    public static InvalidAppVersionParamMsg: string = "Sorry, the provided app version isn't valid";
    public static GettingAppInfoMessage: string = "Retrieving app info...";
    public static DetectingAppVersionMessage: string = "Locating app version...";
    public static RunningBundleCommandMessage: string = "Creating a new bundle...";
    public static ArchivingUpdateContentsMessage: string = "Compressing new bundle...";
    public static ReactNativeInstallHint: string = "Make sure you ran \"npm install\" and that you are inside a React Native project.";
    public static CodePushInstallHint: string = "Make sure you ran \"npm install\" and that you are inside a React Native Code Push project.";
    public static ReleasingUpdateContentsMessage: string = "Sending update to CodePush...";
    public static RepoManualConnectBtnLabel: string = "Connect";
    public static PodInstallBtnLabel: string = "Install CocoaPods";
    public static BuildManualConfigureBtnLabel: string = "Configure build";
    public static OnlyIOSError: string = "Running UI tests is supported only for iOS.";
    public static AppCreatedBtnLabel: string = "Check it out";
    public static NotReactProjectMsg: string = "This command can only be executed from a React Native project. Check out the Output window for more details.";
    public static CodePushAlreadyLinked: string = "Code Push has already been linked to this application.";
    public static NotCodePushProjectMsg: string = "This command can only be executed from a React Native project with Code Push installed. Check out the Output window for more details.";
    public static CodePushLinkedMsg: string = "Code Push has been successfully linked to your application!";

    public static CreatingAppStatusBarMessage: string = `Creating a new App Center app...`;
    public static FailedToCreateAppInAppCenter: string = `An error occurred while creating the new App Center app`;
    public static FailedToGetVSTSProjects: string = `An error while trying to retrieve your VSTS projects`;
    public static FailedToCreateVSTSGitrepository: string = `An error occurred while creating your new VSTS repository`;
    public static FailedToCreateAppAlreadyExistInAppCenter: string = `An app with that name already exists in App Center. Please choose a new name.`;
    public static FailedToCreateDeployments: string = `Failed to create deployments for the app. Check out the output window for more details.`;
    public static FailedToLinkCodePush: string = `Failed to link Code Push to the application. Check out the Output window for more details.`;
    public static FailedToLinkAppCenter: string = `Failed to link App Center to the application. Check out the Output window for more details.`;

    public static SimulateCrashesMessage: string = "Generating crash data for you...";
    public static SimulateCrashesSendMessage: string = "Sending crash data to App Center...";
    public static CrashesSimulated: string = "The crash has been successfully generated and sent to App Center!";
    public static CrashesSimulatedHint: string = "Check it out";

    public static PodsNotInstalledMessage: string = "It looks like you haven't installed CocoaPods. You need it to run the application on iOS. After the installation, run 'cd ios && pod update'.";
    public static RepoManualConnectMessage(appName: string): string {
        return `Could not connect ${appName} to the repository. Please try to do it manually.`;
    }

    public static BuildManualConfigureMessage(appName: string): string {
        return `Could not configure ${appName} build. Please try to do it manually.`;
    }

    public static FailedToExecuteLoginMsg(provider: AuthProvider): string {
        return `Failed to login to ${provider}`;
    }

    public static OpenTabInBrowserMsg(tabName: string): string {
        return `Navigate to '${tabName}' options for current app`;
    }

    public static FailedToPushChangesToRemoteRepoMsg: (repoName: string) => string = (repoName: string) => {
        return `Failed to push local changes to remote repository '${repoName}'`;
    }

    public static YouAreLoggedInMsg(provider: AuthProvider, name: string): string {
        return `You are logged into ${provider} as '${name}'`;
    }

    public static UserLoggedOutMsg(provider: AuthProvider, name: string): string {
        return `You have successfully logged out of ${provider} as '${name}'`;
    }

    public static UserSwitchedMsg(provider: AuthProvider, name: string): string {
        return `Successfully switched ${provider} account to '${name}'`;
    }

    public static YourCurrentAppMsg(appName: string): string {
        return `The current app is '${appName}'`;
    }

    public static YourCurrentAppAndDeploymentMsg(appName: string, deploymentName: string): string {
        if (deploymentName) {
            return `${appName} (${deploymentName}) is now your current app and deployment`;
        } else {
            return `${appName} is now your current app`;
        }
    }

    // If only one app has been created, pass 1st parameter and squash is true.
    // If two apps were created, pass their names and squash is true.
    // If two apps were created and user has chosen one of them as current, pass only current app name.
    public static AppCreatedMsg(appName: string, squash?: boolean, secondAppName?: string): string {
        if (secondAppName) {
            return `Apps ${appName} and ${secondAppName} have been created in App Center. Which one do you want to set as current?`;
        } else {
            return squash ?
                `The app ${appName} has been created in App Center and set as current` :
                `The current app is ${appName}, go see it in App Center`;
        }
    }

    public static YourCurrentDeploymentMsg(deploymentName: string): string {
        return `The current CodePush deployment selected is '${deploymentName}'`;
    }

    public static setCurrentAppDeploymentText(app: CurrentApp): string {
        return `Change '${app.currentAppDeployments.currentDeploymentName}' to a different deployment`;
    }

    public static setCurrentAppTargetBinaryVersionText(app: CurrentApp): string {
        const targetBinaryVersionProvided = app.targetBinaryVersion !== undefined && app.targetBinaryVersion;
        return `Change ${targetBinaryVersionProvided ? `'${app.targetBinaryVersion}'` : "automatically fetched"} target binary version`;
    }

    public static setCurrentAppIsMandatoryText(app: CurrentApp): string {
        const isMandatory = app.isMandatory !== undefined && app.isMandatory;
        return `Change release to ${isMandatory ? "be not Mandatory" : "be Mandatory"}`;
    }

    public static setCurrentAppMenuText(app?: CurrentApp): string {
        if (app) {
            return `Switch ${app.appName} (${app.os})`;
        } else {
            return `Set current app`;
        }
    }

    public static releaseReactMenuText(app?: CurrentApp): string {
        if (app) {
            return `Release '${app.appName}' to '${app.currentAppDeployments.currentDeploymentName}' deployment`;
        } else {
            return `Release react (please specify current app first)`;
        }
    }

    public static packageIsNotInstalledGlobally(packageName: string) {
        return `You have not ${packageName} package installed globally. Please run "npm i -g ${packageName}" and try again.`;
    }
}
