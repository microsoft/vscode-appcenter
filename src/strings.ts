import { AuthProvider } from "./constants";
import { CurrentApp } from "./helpers/interfaces";

export class Strings {

    /* Menu labeles */
    public static StartAnIdeaMenuLabel: string = "Start a new project";
    public static OrganizationMenuDescriptionLabel: string = "Organization";
    public static UserMenuDescriptionLabel: string = "User";
    public static LoginMenuLabel: string = "Login";
    public static GetCurrentAppMenuLabel: string = "Get current app info";
    public static CodePushMenuLabelItem: string = "CodePush";
    public static AppCenterPortalMenuLabel: string = "App Center portal";
    public static SettingsMenuLabel: string = "Settings";
    public static CrashesMenuLabel: string = "Simulate Crashes";
    public static ToolsMenuLabel: string = "Tools";
    public static LoginToAnotherAccountMenuLabel: string = "Add App Center account";
    public static SwitchAccountMenuLabel: string = "Switch App Center account";
    public static LogoutMenuLabel: string = "Logout App Center";
    public static VstsLoginToAnotherAccountMenuLabel: string = "Add VSTS account";
    public static VstsSwitchAccountMenuLabel: string = "Switch VSTS account";
    public static VstsLogoutMenuLabel: string = "Logout VSTS";
    public static RunUITestsMenuLabel: string = "Run UI tests";
    public static RunUITestsAsyncMenuLabel: string = "Run UI tests asynchronously";
    public static ViewUITestResultOnPortalenuLabel: string = "View results in portal";    

    public static SelectLoginTypeMsg: string = "How would you like to authenticate with App Center?";
    public static OkBtnLabel: string = "Ok";
    public static UserMustSignIn: string = "Please login to App Center.";
    public static PleaseProvideToken: string = "Please paste your App Center access token";
    public static PleaseLoginViaBrowser: string = "You are about to be redirected to page containing a new App Center access token. Please copy and paste it here after you press Ok.";
    public static UserIsNotLoggedInMsg: string = "You are not logged into App Center";
    public static MenuTitlePlaceholder: string = "Please select a menu action.";
    public static SelectProfileTitlePlaceholder: string = "Please select account.";
    public static SelectTestDeviceTitlePlaceholder: string = "Please select device.";

    public static SpecifyTenantTitlePlaceholder: string = "(Step 1). Please specify tenant name";
    public static SpecifyUserNameTitlePlaceholder: string = "(Step 2). Please specify user name";
    public static SpecifyPATTitlePlaceholder: string = "(Step 3). Please specify personal access token";

    public static LoginToAppCenterButton: string = "App Center: Login";
    public static PleaseEnterIdeaName: string = "Please enter idea name";
    public static PleaseEnterNewRepositoryUrl: string = "Please enter repository url";
    public static PleaseSelectCurrentAppOrgMsg: string = "Please select user/organization where to create an App";

    public static NoIdeaNameSelectedMsg: string = "Please enter a name for your project.";
    public static VSCodeProgressLoadingTitle: string = "Loading...";
    public static CheckIfAppsExistLoadingMessage: string = "Checking if project name is already in use...";
    public static LoadingVSTSProjectsMessage: string = "Loading VSTS projects for you...";
    public static LoadingStatusBarMessage: string = "Loading some information for you...";
    public static CreateRNProjectStatusBarMessage: string = "Creating a starting point for your project...";
    public static PushToRemoteRepoStatusBarMessage: string = "Pushing changes to your new repository...";
    public static CreatingCodePushDeploymentsStatusBarMessage: string = "Creating CodePush deployments for hotfixing...";
    public static RunNPMInstallStatusBarMessage: string = "Installing package dependencies...";
    public static NodeModulesInstalledMessage: string = "Dependencies have been successfully installed";
    public static FinishedConfigMsg: string = "Your project has been successfully configured locally and in the cloud.";
    public static GitIsNotInstalledMsg: string = "It looks like you don't have a local git client installed. ";
    public static FailedToCreateRNProjectMsg: string = "An unexpected error occurred while fetching the project template.";
    public static NotRNProjectMsg: string = "Sorry, this project doesn't appear to be React Native.";
    public static IdeaNameIsNotValidMsg: string = "Sorry, the project name your entered is invalid.";
    public static FailedToRemoveRemoteRepositoryMsg: string = "Sorry, failed to remove remote repository!";
    public static FailedToAddRemoteRepositoryMsg: string = "Sorry, failed to add remote repository!";
    public static FailedToGetSelectedUserOrOrganizationMsg: string = "Sorry, failed to get selected account information.";
    public static DirectoryIsNotEmptyForNewIdea: string = "Sorry, you can only start a new project inside an empty folder.";
    public static FailedToProvideRepositoryNameMsg: string = "Sorry, the git url you provided doesn't appear to be valid.";
    public static SelectCurrentAppMenuDescription: string = "SELECT CURRENT APP";
    public static FetchingDevicesStatusBarMessage: string = "Fetching devices...";
    public static CleaningBuildStatusBarMessage: string = "Cleaning build directory...";
    public static MakingBuildStatusBarMessage: string = "Making build for testing...";
    public static UploadingAndRunningTestsStatusBarMessage: string = "Uploading and running tests on App Center portal...";

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
    public static FetchDeploymentsStatusBarMessage: string = "Fetching CodePush deployments for you...";
    public static InvalidCurrentAppNameMsg: string = "Sorry, the app name isn't valid.";

    public static FailedToConnectRepoToBuildService: string = "Sorry, we failed to connect the repository to the build service.";
    public static FailedToConfigureBranchAndStartNewBuild: string = "Sorry, we failed to configure the branch for build.";
    public static FailedToCreateDistributionGroup: string = "Sorry, we failed to create any distribution groups.";
    public static NoCurrentAppSetMsg: string = "You haven't specified an App Center app for this project.";
    public static NoProjectRootFolderFound: string = "Please open a project before using this command.";
    public static UnknownError: string = "An unknown error has occured. Please check the output window for more details.";
    public static SelectCurrentDeploymentMsg: string = "Please specify a CodePush deployment.";
    public static PleaseProvideTargetBinaryVersion: string = "Please provide a target binary version in semver format";
    public static InvalidAppVersionParamMsg: string = "Sorry, the provided app version isn't valid";
    public static GettingAppInfoMessage: string = "Retrieving app info...";
    public static DetectingAppVersionMessage: string = "Locating app version...";
    public static RunningBundleCommandMessage: string = "Creating a new bundle...";
    public static ArchivingUpdateContentsMessage: string = "Compressing new bundle...";
    public static ReleasingUpdateContentsMessage: string = "Sending update to CodePush...";
    public static ReactNativeInstallHint: string = "Make sure you ran \"npm install\" and that you are inside a React Native project.";
    public static CodePushInstallHint: string = "Make sure you ran \"npm install\" and that you are inside a React Native Code Push project.";

    public static CreatingAppStatusBarMessage: string = `Creating a new App Center app...`;
    public static FailedToCreateAppInAppCenter: string = `An error occurred while creating the new App Center app`;
    public static FailedToGetVSTSProjects: string = `An error while trying to retrieve your VSTS projects`;
    public static FailedToCreateVSTSGitrepository: string = `An error occurred while creating your new VSTS repository`;
    public static FailedToCreateAppAlreadyExistInAppCenter: string = `An app with that name already exists in App Center. Please choose a new name.`;

    public static FailedToExecuteLoginMsg(provider: AuthProvider): string {
        return `Failed to login to ${provider}`;
    }

    public static OpenTabInBrowserMsg(tabName: string): string {
        return `Open '${tabName}' tab for currently selected app`;
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
            return `The current app is '${appName}', current CodePush deployment is '${deploymentName}'`;
        } else {
            return `The current app is '${appName}', but you have no CodePush deployments specified`;
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
            return `Change current app | ${app.appName}(${app.os})`;
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
}
