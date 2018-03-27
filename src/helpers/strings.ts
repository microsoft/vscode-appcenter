import { CurrentApp } from "./interfaces";

export class Strings {
    public static SelectLoginTypeMsg: string = "Select the way you would like to authenticate with App Center";
    public static OkBtnLabel: string = "Ok";
    public static UserMustSignIn: string = "You are signed out. Please login to App Center";
    public static PleaseProvideToken: string = "Please provide token to authenticate";
    public static PleaseLoginViaBrowser: string = "We are about to launch a browser window so you can automatically create an App Center API token";
    public static FailedToExecuteLoginMsg: string = "Failed to execute login to App Center";
    public static UserIsNotLoggedInMsg: string = "You are not logged into App Center";
    public static UserLoggedOutMsg: string = "Successfully logged out of App Center";
    public static MenuTitlePlaceholder: string = "Please select action";
    public static LogoutMenuLabel: string = "Logout";
    public static StartAnIdeaMenuLabel: string = "Start An Idea";
    public static LoginToAppCenterButton: string = "Login to App Center";
    public static PleaseEnterIdeaName: string = "Please enter idea name";
    public static PleaseEnterNewRepositoryUrl: string = "Please enter repository url";
    public static PleaseSelectCurrentAppOrgMsg: string = "Please select user/organization where to create an App";
    public static OrganizationMenuDescriptionLabel: string = "Organization";
    public static UserMenuDescriptionLabel: string = "User";
    public static NoIdeaNameSelectedMsg: string = "Please select an idea name!";
    public static VSCodeProgressLoadingTitle: string = "Loading...";
    public static LoadingStatusBarMessage: string = "Loading some information for you...";
    public static CreateRNProjectStatusBarMessage: string = "Creating RN project for you...";
    public static FinishedConfigMsg: string = "Ace, you're done!";
    public static GitIsNotInstalledMsg: string = "Sorry, git is not installed!";
    public static FailedToCreateRNProjectMsg: string = "Failed to create RN project!";
    public static NotRNProjectMsg: string = "Sorry, this is not an RN project!";
    public static IdeaNameIsNotValidMsg: string = "Sorry, idea name is not valid!";
    public static DirectoryIsNotEmptyForNewIdea: string = "Start New Idea should work only for empty directory!";
    public static FailedToProvideRepositoryNameMsg: string = "Sorry, can't go ahead, repository name was not provided or valid!";
    public static LoginMenuLabel: string = "Login";
    public static GetCurrentAppMenuLabel: string = "Get current app info";

    public static FetchAppsStatusBarMessage: string = "Fetching current apps for you...";
    public static CreatingDistributionStatusBarMessage: string = "Creating distribution group for you...";
    public static ConnectingRepoToBuildServiceStatusBarMessage: string = "Connecting repository for you...";
    public static CreateBranchConfigAndKickOffBuildStatusBarMessage: string = "Starting new build for you...";
    public static ProvideCurrentAppPromptMsg: string = "Please specify an App Center app";
    public static FetchDeploymentsStatusBarMessage: string = "Fetching app deployments for you...";
    public static InvalidCurrentAppNameMsg: string = "Sorry, provided app name is invalid";
    public static OpenAppCenterPortalMenuLabel: string = "Open AppCenter Portal";

    public static FailedToConnectRepoToBuildService: string = "Sorry, failed to connect repository to build service";
    public static FailedToConfigureBranchAndStartNewBuild: string = "Sorry, failed to configure branch and start new build";
    public static FailedToCreateDistributionGroup: string = "Sorry, failed to create distribution group";
    public static NoCurrentAppSetMsg: string = "No current app specified";
    public static NoProjectRootFolderFound: string = "Please, open project folder before using this command";
    public static UnknownError: string = "Unknown error occured. Please, check logs for details.";
    public static SelectCurrentDeploymentMsg: string = "Please select current deployment";
    public static PleaseProvideTargetBinaryVersion: string = "Please provide semver compliant version";
    public static InvalidAppVersionParamMsg: string = "Sorry, provided app version is invalid";
    public static GettingAppInfoMessage: string = "Getting app info...";
    public static DetectingAppVersionMessage: string = "Detecting app version...";
    public static RunningBundleCommandMessage: string = "Running bundle command...";
    public static ArchivingUpdateContentsMessage: string = "Archiving update contents...";
    public static ReleasingUpdateContentsMessage: string = "Releasing update contents to CodePush...";
    public static ReactNativeInstallHint: string = "Make sure you ran \"npm install\" and that you are inside a React Native project.";
    public static CodePushInstallHint: string = "Make sure you ran \"npm install\" and that you are inside a React Native Code Push project.";

    public static CreatingAppStatusBarMessage: string = `Creating app for you...`;
    public static FailedToCreateAppInAppCenter: string = `Sorry, failed to create app in app center`;

    public static FailedToPushChangesToRemoteRepoMsg: (repoName: string) => string = (repoName: string) => {
        return `Failed to push changes to remote repository '${repoName}'`;
    }

    public static YouAreLoggedInMsg(name: string): string {
        return `You are logged into App Center as '${name}'`;
    }

    public static YourCurrentAppMsg(appName: string): string {
        return `Your current app is '${appName}'`;
    }

    public static YourCurrentAppAndDeploymentMsg(appName: string, deploymentName: string): string {
        if (deploymentName) {
            return `Your current app is '${appName}', current deployment is '${deploymentName}'`;
        } else {
            return `Your current app is '${appName}', you have no deployments specified`;
        }
    }

    public static YourCurrentDeploymentMsg(deploymentName: string): string {
        return `Your current deployment is '${deploymentName}'`;
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
            return `Change '${app.appName}' to a different app`;
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
