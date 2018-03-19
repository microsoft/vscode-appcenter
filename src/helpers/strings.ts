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

    public static YouAreLoggedInMsg: (name: string) => string = (name: string) => {
        return `You are logged into App Center as '${name}'`;
   }
}
