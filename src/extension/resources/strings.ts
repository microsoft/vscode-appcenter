export class Strings {

    // #region Buttons
    public static OkBtnLabel: string = "Ok";
    public static RepoManualConnectBtnLabel: string = "Connect";
    public static PodInstallBtnLabel: string = "Install CocoaPods";
    public static BuildManualConfigureBtnLabel: string = "Configure build";
    public static AppCreatedBtnLabel: string = "Check it out";
    public static CrashesSimulatedBtnLabel: string = "Check it out";
    public static LinkDoneBtnLabel: string = "Done";
    // #endregion Buttons

    // #region Status bar
    public static UserMustSignInStatusBarMessage: string = "Please login to App Center";
    public static LoginToAppCenterStatusBarButton: string = "App Center: Login";
    // #endregion Status bar

    // #region Hints
    public static PleaseEnterProjectNameHint: string = "Please enter a project name";
    public static PleaseProvideTokenHint: string = "Please paste your App Center access token";
    public static PleaseEnterNewRepositoryUrlHint: string = "Please enter repository url";
    public static MenuTitleHint: string = "Please make an App Center selection";
    public static SelectProfileTitleHint: string = "Please select account";
    public static SpecifyTenantTitleHint: string = "(Step 1). Please specify instance name";
    public static SpecifyUserNameTitleHint: string = "(Step 2). Please specify username";
    public static SpecifyPATTitleHint: string = "(Step 3). Please specify personal access token";
    public static CreateAppHint: string = "Choose the app to be created";
    public static ProvideCurrentAppHint: string = "Please specify an App Center app";
    public static ProvideVSTSProjectPromptHint: string = "Please specify VSTS Project";
    public static SelectCurrentDeploymentHint: string = "Please specify a CodePush deployment";
    public static PleaseSelectCurrentAppOrgHint: string = "Please select user/organization where to create an App";
    public static ChooseAppToBeSetHint: string = "Choose which app you want to set as current";
    public static PleaseProvideTargetBinaryVersionHint: string = "Please provide a target binary version in semver format";
    public static ProvideFirstAppHint: string = "Choose the first app to be linked";
    public static ProvideSecondAppHint: string = "Choose the second app to be linked";

    public static SelectTestDeviceTitleHint(appName: string): string {
        return `Please select device configuration to test ${appName}`;
    }
    // #endregion Hints
}
