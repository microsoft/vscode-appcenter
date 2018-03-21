"use strict";

export class Constants {
    public static ExtensionName: string = "appcenter";
    public static DefaultAPIEndPoint: string = "https://api.appcenter.ms";
    public static DefaultLegacyCodePushService: string = "https://codepush-management.azurewebsites.net/";
    public static DefaultDistributionGroupTestersName: string = "Beta Testers";
    public static DefaultBranchName: string = "master";
    public static DefaultLoginEndPoint: string = "https://appcenter.ms/cli-login";
    public static AppCenterCodePushStatusBarColor: string = "#F3F3B2";
    public static iOSAppSuffix: string = "-ios";
    public static AndroidAppSuffix: string = "-android";

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
                "projectOrWorkspacePath": "ios/rntestextension.xcodeproj",
                "scheme": "rntestextension",
                "xcodeVersion": "9.2",
                "automaticSigning": false
            }
        }
    }`;
}

export class CommandNames {
    public static CommandPrefix: string = Constants.ExtensionName + ".";
    public static WhoAmI: string = CommandNames.CommandPrefix + "whoami";
    public static Login: string = CommandNames.CommandPrefix + "login";
    public static Logout: string = CommandNames.CommandPrefix + "logout";
    public static ShowMenu: string = CommandNames.CommandPrefix + "menu";
    public static Start: string = CommandNames.CommandPrefix + "start";

    public static CodePush = class {
        public static SetCurrentDeployment: string = CommandNames.CommandPrefix + "codepush.setCurrentDeployment";
        public static ReleaseReact: string = CommandNames.CommandPrefix + "codepush.releaseReact";
        public static SwitchMandatoryPropForRelease: string = CommandNames.CommandPrefix + "codepush.switchMandatoryPropForRelease";
        public static SetTargetBinaryVersion: string = CommandNames.CommandPrefix + "codepush.setTargetBinaryVersion";
        public static ShowMenu: string = CommandNames.CommandPrefix + "codepush.showMenu";
    }
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
