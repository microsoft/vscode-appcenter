export class Constants {
    public static ExtensionName: string = "App Center";
    public static ExtensionCommandPrefix: string = "appcenter";
    public static DefaultAPIEndPoint: string = "https://api.appcenter.ms";
    public static AppCenterPortalURL: string = "https://appcenter.ms";
    public static DefaultLegacyCodePushService: string = "https://codepush-management.azurewebsites.net/";
    public static DefaultDistributionGroupTestersName: string = "Beta Testers";
    public static DefaultBranchName: string = "master";
    public static DefaultLoginEndPoint: string = "https://appcenter.ms/cli-login";
    public static ProdCrashesEndPoint: string = "https://in.mobile.azure.com/logs";
    public static IntCrashesEndPoint: string = "https://in-integration.dev.avalanch.es/logs";
    public static StagingCrashesEndPoint: string = "https://in-staging-south-centralus.staging.avalanch.es/logs";
    public static CodePushStagingDeploymentName: string = "Staging";
    public static iOSAppSuffix: string = "-ios";
    public static AndroidAppSuffix: string = "-android";
    public static AppCenterDefaultTargetBinaryVersion: string = "";
    public static AppCenterDefaultIsMandatoryParam: boolean = false;
    public static IOSAppSecretKey: string = "AppSecret";
    public static AndroidAppSecretKey: string = "app_secret";
    public static IOSCodePushDeploymentKey: string = "CodePushDeploymentKey";
    public static AndroidCodePushDeploymentKey: string = "reactNativeCodePush_androidDeploymentKey";
    public static AppCenterSampleGitRemoteName: string = "appcenter-sample-repo";
    public static AppCenterSampleGitRemoteDefaultBranchName: string = "master";
    public static AppCenterSampleAppName = "AppCenterSample";
    public static GitDefaultRemoteName: string = 'origin';
    public static ProfileDir: string = ".vscode-appcenter";
    public static AppCenterProfileFileName: string = "VSCodeAppCenterProfile.json";
    public static VstsProfileFileName: string = "VSCodeVstsProfile.json";
    public static TokenDir: string = ".vscode-appcenter";
    public static AppCenterTokenFileName = "VSCodeAppCenterTokens.json";
    public static TelemetrySource = "appcenter-vscode-extension";

    // IMPORTANT: this two items below should stay in sync in terms of xcode projectOrWorkspacePath/scheme values
    // We should decide how we should handle this (e.g. create manually within App Center site)
    public static AppCenterDemoAppRepository: string = "https://github.com/Microsoft/appcenter-sampleapp-react-native.git";
    public static defaultBuildConfigJSON: string = `{
        "branch": {
            "name": "master"
        },
        "id": 1,
        "trigger": "continuous",
        "environmentVariables": [],
        "signed": false,
        "testsEnabled": false,
        "badgeIsEnabled": false,
        "toolsets": {
            "buildscripts": {},
            "javascript": {
                "packageJsonPath": "package.json",
                "runTests": false
            },
            "xcode": {
                "projectOrWorkspacePath": "ios/AppCenterSample.xcworkspace",
                "scheme": "AppCenterSample",
                "xcodeVersion": "9.3",
                "automaticSigning": false,
                "podfilePath":"ios/Podfile"
            },
            "android": {
                "module": "app",
                "buildVariant": "release",
                "isRoot": false,
                "runTests": false,
                "runLint": false,
                "automaticSigning": false,
                "gradleWrapperPath": "android/gradlew"
            }
        }
    }`;

    public static AppCenterReactNativePlatformName: string = "React-Native";
}
// tslint:disable:max-classes-per-file
export class CommandNames {
    public static CommandPrefix: string = Constants.ExtensionCommandPrefix + ".";
    public static AppCenterPortal: string = CommandNames.CommandPrefix + "showPortalMenu";
    public static WhoAmI: string = CommandNames.CommandPrefix + "whoAmI";
    public static Login: string = CommandNames.CommandPrefix + "login";
    public static ShowMenu: string = CommandNames.CommandPrefix + "menu";
    public static Start: string = CommandNames.CommandPrefix + "start";
    public static GetCurrentApp: string = CommandNames.CommandPrefix + "getCurrentApp";
    public static SetCurrentApp: string = CommandNames.CommandPrefix + "setCurrentApp";
    public static SimulateCrashes: string = CommandNames.CommandPrefix + "simulateCrashes";
    public static InstallSDK: string = `${CommandNames.CommandPrefix}installSDK`;
    public static CreateNewApp: string = `${CommandNames.CommandPrefix}createNewApp`;

    public static Settings = class {
        public static ShowMenu: string = `${CommandNames.CommandPrefix}settings.showMenu`;
        public static LoginToAnotherAccount: string = `${CommandNames.CommandPrefix}settings.loginToAnotherAccount`;
        public static SwitchAccount: string = `${CommandNames.CommandPrefix}settings.switchAccount`;
        public static Logout: string = `${CommandNames.CommandPrefix}settings.logout`;

        public static LoginVsts: string = `${CommandNames.CommandPrefix}settings.vsts.login`;
        public static SwitchAccountVsts: string = `${CommandNames.CommandPrefix}settings.vsts.switchAccount`;
        public static LogoutVsts: string = `${CommandNames.CommandPrefix}settings.vsts.logout`;
        public static ShowStatusBar: string = `${CommandNames.CommandPrefix}settings.showStatusBar`;
        public static HideStatusBar: string = `${CommandNames.CommandPrefix}settings.hideStatusBar`;
    };

    public static CreateApp = class {
        public static CommandName: string = `${CommandNames.CommandPrefix}appcenter.createNewApp`;
        public static Android: string = `${CommandNames.CommandPrefix}appcenter.createNewApp.android`;
        public static IOS: string = `${CommandNames.CommandPrefix}appcenter.createNewApp.ios`;
        public static Both: string = `${CommandNames.CommandPrefix}appcenter.createNewApp.both`;
    };

    public static CodePush = class {
        public static SetCurrentDeployment: string = CommandNames.CommandPrefix + "codePush.setCurrentDeployment";
        public static ReleaseReact: string = CommandNames.CommandPrefix + "codePush.releaseReact";
        public static SwitchMandatoryPropForRelease: string = CommandNames.CommandPrefix + "codePush.switchMandatoryPropForRelease";
        public static SetTargetBinaryVersion: string = CommandNames.CommandPrefix + "codePush.setTargetBinaryVersion";
        public static LinkCodePush: string = `${CommandNames.CommandPrefix}codePush.linkCodePush`;
    };

    public static Test = class {
        public static ShowMenu: string = CommandNames.CommandPrefix + "test.showMenu";
        public static RunUITests: string = CommandNames.CommandPrefix + "test.runUITests";
        public static RunUITestsAsync: string = CommandNames.CommandPrefix + "test.runUITestsAsync";
        public static ViewResults: string = CommandNames.CommandPrefix + "test.viewResults";
    };
}

export enum MessageTypes {
    Error = 0,
    Warn = 1,
    Info = 2
}

export enum AppCenterOS {
    iOS = "iOS",
    Android = "Android",
    macOS = "macOS",
    Tizen = "Tizen",
    tvOS = "tvOS",
    Windows = "Windows"
}

export enum AppCenterPlatform {
    ReactNative = "React-Native",
    Cordova = "Cordova",
    UWP = "UWP",
    Xamarin = "Xamarin",
    Java = "Java"
}

export enum AppCenterBeacons {
    Build = "Build",
    Test = "Test",
    CodePush = "CodePush",
    Distribute = "Distribute",
    Crashes = "Crashes",
    Analytics = "Analytics",
    Push = "Push"
}

export enum AppCenterDistributionTabs {
    Stores = "distribution-stores",
    Groups = "distribution-groups",
    CodePush = "code-push",
    Releases = "releases"
}

export enum AppCenterCrashesTabs {
    Crashes = "crashes-portal",
    Simulate = "simulate-crashes"
}

export enum AppCenterAppType {
    User = "User",
    Org = "Org"
}

export enum AuthProvider {
    Vsts = "VSTS",
    AppCenter = "App Center"
}

export enum AppCenterEnvironment {
    Prod = 0,
    Staging = 1,
    Int = 2
}

export enum ReactNativePlatformDirectory {
    IOS = "ios",
    Android = "android"
}
