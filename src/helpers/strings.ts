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
    public static PleaseSelectCurrentAppOrgMsg: string = "Please select user/organization where to create an App";
    public static OrganizationMenuDescriptionLabel: string = "Organization";
    public static UserMenuDescriptionLabel: string = "User";
    public static NoIdeaNameSelectedMsg: string = "Please select an idea name!";
    public static VSCodeProgressLoadingTitle: string = "Loading...";
    public static LoadingStatusBarMessage: string = "Loading some information for you...";

    public static CreatingAppStatusBarMessage: string = "Creating app for you...";
    public static CreatingDistributionStatusBarMessage: string = "Creating distribution group for you...";
    public static ConnectingRepoToBuildServiceStatusBarMessage: string = "Connecting repository for you...";
    public static CreateBranchConfigAndKickOffBuildStatusBarMessage: string = "Starting new build for you...";

    public static YouAreLoggedInMsg: (name: string) => string = (name: string) => {
        return `You are logged into App Center as '${name}'`;
   }
}
