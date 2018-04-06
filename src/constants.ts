"use strict";

export class Constants {
    public static ExtensionName: string = "appcenter";
    public static DefaultAPIEndPoint: string = "https://api.appcenter.ms";
    public static AppCenterPortalURL: string = "https://appcenter.ms";
    public static DefaultLegacyCodePushService: string = "https://codepush-management.azurewebsites.net/";
    public static DefaultDistributionGroupTestersName: string = "Beta Testers";
    public static DefaultBranchName: string = "master";
    public static DefaultLoginEndPoint: string = "https://appcenter.ms/cli-login";
    public static AppCenterCodePushStatusBarColor: string = "#F3F3B2";
    public static CodePushStagingDeplymentName: string = "Staging";
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
    public static GitDefaultRemoteName: string = 'origin';

    // IMPORTANT: this two items below should stay in sync in terms of xcode projectOrWorkspacePath/scheme values
    // We should decide how we should handle this (e.g. create manually within AppCenter site)
    public static AppCenterDemoAppRepository: string = "https://github.com/Microsoft/appcenter-sampleapp-react-native.git";
    public static defaultBuildConfigJSON: string = `{
        "branch": {
            "name": "master"
        },
        "id": 2,
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
                "xcodeVersion": "9.2",
                "automaticSigning": false,
                "podfilePath":"ios/Podfile"
            }
        }
    }`;

    public static AppCenterReactNativePlatformName: string = "React-Native";
}

export class CommandNames {
    public static CommandPrefix: string = Constants.ExtensionName + ".";
    public static AppCenterPortal: string = CommandNames.CommandPrefix + "showPortalMenu";
    public static WhoAmI: string = CommandNames.CommandPrefix + "whoAmI";
    public static Login: string = CommandNames.CommandPrefix + "login";
    public static ShowMenu: string = CommandNames.CommandPrefix + "menu";
    public static Start: string = CommandNames.CommandPrefix + "start";
    public static GetCurrentApp: string = CommandNames.CommandPrefix + "getCurrentApp";
    public static SetCurrentApp: string = CommandNames.CommandPrefix + "setCurrentApp";

    public static Settings = class {
        public static ShowMenu: string = `${CommandNames.CommandPrefix}settings.showMenu`;
        public static LoginToAnotherAccount: string = `${CommandNames.CommandPrefix}settings.loginToAnotherAccount`;
        public static SwitchAccount: string = `${CommandNames.CommandPrefix}settings.switchAccount`;
        public static Logout: string = `${CommandNames.CommandPrefix}settings.logout`;

        public static LoginVsts: string = `${CommandNames.CommandPrefix}settings.vsts.login`;
        public static SwitchAccountVsts: string = `${CommandNames.CommandPrefix}settings.vsts.switchAccount`;
        public static LogoutVsts: string = `${CommandNames.CommandPrefix}settings.vsts.logout`;
    };

    public static CodePush = class {
        public static ShowMenu: string = CommandNames.CommandPrefix + "codepush.showMenu";
        public static SetCurrentDeployment: string = CommandNames.CommandPrefix + "codepush.setCurrentDeployment";
        public static ReleaseReact: string = CommandNames.CommandPrefix + "codepush.releaseReact";
        public static SwitchMandatoryPropForRelease: string = CommandNames.CommandPrefix + "codepush.switchMandatoryPropForRelease";
        public static SetTargetBinaryVersion: string = CommandNames.CommandPrefix + "codepush.setTargetBinaryVersion";
    };
}

export enum MessageTypes {
    Error = 0,
    Warn = 1,
    Info = 2
}

export enum AppCenterLoginType {
    Interactive,
    Token
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

export enum AppCenteAppType {
    User = "User",
    Org = "Org"
}
