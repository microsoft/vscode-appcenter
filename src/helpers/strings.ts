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

    public static CreatingDistributionStatusBarMessage: string = "Creating distribution group for you...";
    public static ConnectingRepoToBuildServiceStatusBarMessage: string = "Connecting repository for you...";
    public static CreateBranchConfigAndKickOffBuildStatusBarMessage: string = "Starting new build for you...";

    public static FailedToConnectRepoToBuildService: string = "Sorry, failed to connect repository to build service";
    public static FailedToConfigureBranchAndStartNewBuild: string = "Sorry, failed to configure branch and start new build";
    public static FailedToCreateDistributionGroup: string = "Sorry, failed to create distribution group";

    public static FailedToPushChangesToRemoteRepoMsg: (repoName: string) => string = (repoName: string) => {
        return `Failed to push changes to remote repository '${repoName}'`;
    }

    public static YouAreLoggedInMsg: (name: string) => string = (name: string) => {
        return `You are logged into App Center as '${name}'`;
    }

    public static CreatingAppStatusBarMessage: (osName: string) => string = (osName: string) => {
        return `Creating ${osName} app for you...`;
    }

    public static FailedToCreateAppInAppCenter: (osName: string) => string = (osName: string) => {
        return `Sorry, failed to create ${osName} app in app center`;
    }
}
