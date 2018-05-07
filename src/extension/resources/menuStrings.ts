import { CurrentApp } from "../../helpers/interfaces";

export class MenuStrings {

    // #region Menu labels
    public static BuildTabMenuLabel: string = "Build";
    public static TestTabMenuLabel: string = "Test";
    public static DistributeTabMenuLabel: string = "Distribute";
    public static CrashesTabMenuLabel: string = "Crashes";
    public static AnalyticsTabMenuLabel: string = "Analytics";
    public static PushTabMenuLabel: string = "Push";
    public static DistributeGroupsTabMenuLabel: string = "Groups";
    public static DistributeStoresTabMenuLabel: string = "Stores";
    public static DistributeCodePushTabMenuLabel: string = "CodePush";
    public static DistributeReleasesTabMenuLabel: string = "Releases";
    public static StartAProjectMenuLabel: string = "Start a new project";
    public static LoginMenuLabel: string = "Login";
    public static GetCurrentAppMenuLabel: string = "Get current app info";
    public static CodePushMenuLabel: string = "CodePush";
    public static CodePushMenuLabelDescription: string = "Release a new CodePush update";
    public static AppCenterPortalMenuLabel: string = "Portal";
    public static CreateNewAppMenuLabel: string = "Create a new App Center app";
    public static CreateNewIOSAppMenuLabel: string = "Create an app for iOS";
    public static CreateNewAndroidAppMenuLabel: string = "Create an app for Android";
    public static CreateNewAppsForBothMenuLabel: string = "Create apps for both platforms";
    public static SettingsMenuLabel: string = "Settings";
    public static SimulateCrashesMenuLabel: string = "Simulate Crashes";
    public static LinkCodePushMenuLabel: string = "Link CodePush";
    public static LinkAppCenterMenuLabel: string = "Link App Center";
    public static InstallSDKMenuLabel: string = "Install SDK";
    public static SwitchAccountMenuLabel: string = "Switch App Center account";
    public static LogoutMenuLabel: string = "Logout of App Center";
    public static VstsLoginToAnotherAccountMenuLabel: string = "Add VSTS account";
    public static VstsSwitchAccountMenuLabel: string = "Switch VSTS account";
    public static LoginToAnotherAccountMenuLabel: string = "Add App Center account";
    public static VstsLogoutMenuLabel: string = "Logout of VSTS";
    public static HideStatusBarMenuLabel: string = "Hide status bar";
    public static RunUITestsMenuLabel: string = "Run UI tests";
    public static RunUITestsAsyncMenuLabel: string = "Run UI tests asynchronously";
    public static ViewUITestResultOnPortalMenuLabel: string = "View results in portal";
    public static setCurrentAppDeploymentMenuLabel(app: CurrentApp): string {
        return `Change '${app.currentAppDeployments.currentDeploymentName}' to a different deployment`;
    }

    public static setCurrentAppTargetBinaryVersionMenuLabel(app: CurrentApp): string {
        const targetBinaryVersionProvided = app.targetBinaryVersion !== undefined && app.targetBinaryVersion;
        return `Change ${targetBinaryVersionProvided ? `'${app.targetBinaryVersion}'` : "automatically fetched"} target binary version`;
    }

    public static setCurrentAppIsMandatoryMenuLabel(app: CurrentApp): string {
        const isMandatory = app.isMandatory !== undefined && app.isMandatory;
        return `Change release to ${isMandatory ? "be not Mandatory" : "be Mandatory"}`;
    }

    public static setCurrentAppMenuLabel(app?: CurrentApp): string {
        if (app) {
            return `Switch ${app.appName} (${app.os})`;
        } else {
            return `Set current app`;
        }
    }

    public static releaseReactMenuLabel(app?: CurrentApp): string {
        if (app) {
            return `Release '${app.appName}' to '${app.currentAppDeployments.currentDeploymentName}' deployment`;
        } else {
            return `Release react (please specify current app first)`;
        }
    }
    // #endregion Menu labels

    // #region Menu Descriptions
    public static AppCenterPortalMenuDescription: string = "Quick navigate your App Center apps";
    public static SelectCurrentAppMenuDescription: string = "Use Current App";
    public static StartAProjectMenuDescription: string = "";
    public static OrganizationMenuDescription: string = "Organization";
    public static UserMenuDescription: string = "User";
    public static CurrentAppMenuDescription: string = "Click here to change current app";
    public static LoginMenuDescription: string = "";
    public static SettingsMenuDescription: string = "";
    public static SimulateCrashesMenuDescription: string = "Send test crash data to your current application in App Center";
    public static LinkCodePushMenuDescription: string = "Link CodePush SDK to your application";
    public static LinkAppCenterMenuDescription: string = "Link App Center SDK to your application";
    public static InstallSDKMenuDescription: string = "Link the App Center or CodePush SDK to your project";
    public static LoginToAnotherAccountMenuDescription: string = "Log in to another App Center account";
    public static SwitchAccountMenuDescription: string = "Switch to an App Center account you've previously logged in to";
    public static VstsLoginToAnotherAccountMenuDescription: string = "Log in to another VSTS account";
    public static VstsSwitchAccountMenuDescription: string = "Switch to a VSTS account you've previously logged in to";
    public static HideStatusBarMenuDescription: string = "Hide status bar from the bottom left corner. You can enable it with 'Show status bar' cmd.";
    public static OpenTabInBrowserMenuDescription(tabName: string): string {
        return `Navigate to '${tabName}' options for current app`;
    }

    public static DeviceSetsDescription(ownerType: string): string {
        return `configured device set (${ownerType})`;
    }
    // #endregion Menu Descriptions
}
