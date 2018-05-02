import * as vscode from "vscode";
import { AppCenterBeacons, AppCenterCrashesTabs, AppCenterDistributionTabs, CommandNames } from "../constants";
import { FSUtils } from "../helpers/fsUtils";
import { CommandParams, CurrentApp, MenuItem } from "../helpers/interfaces";
import { Utils } from "../helpers/utils";
import { ILogger } from "../log/logHelper";
import { Strings } from "../strings";

export abstract class Menu {
    public constructor(protected rootPath: string, protected logger: ILogger, protected _params: CommandParams) { }

    protected isEmptyDir(): boolean {
        return FSUtils.IsEmptyDirectoryToStartNewIdea(this.rootPath);
    }

    protected isRNproject(): boolean {
        return Utils.isReactNativeProject(this.logger, this.rootPath, false);
    }

    protected isCodePushProject(): boolean {
        return Utils.isReactNativeCodePushProject(this.logger, this.rootPath, false);
    }

    public show(): Thenable<void> {
        const menuItems: MenuItem[] = this.getMenuItems();

        return vscode.window.showQuickPick(menuItems, { placeHolder: Strings.MenuTitlePlaceholder })
            .then(async (selected: MenuItem) => {
                if (!selected) {
                    return;
                }

                return this.handleMenuSelection(selected);
            });
    }

    protected abstract getMenuItems(): MenuItem[];
    protected abstract handleMenuSelection(menuItem: MenuItem): Promise<void>;
}

export class MenuItems {
    public static Login: MenuItem = {
        label: Strings.LoginMenuLabel,
        description: Strings.LoginMenuDescription,
        command: CommandNames.Login
    };

    public static StartAnIdea: MenuItem = {
        label: Strings.StartAnIdeaMenuLabel,
        description: Strings.StartAnIdeaMenuDescription,
        command: CommandNames.Start
    };

    public static CodePushTab: MenuItem = {
        label: Strings.CodePushMenuLabelItem,
        description: Strings.CodePushMenuLabelDescription,
        command: AppCenterBeacons.CodePush
    };

    public static SimulateCrashes: MenuItem = {
        label: Strings.SimulateCrashesMenuLabel,
        description: Strings.SimulateCrashesMenuDescription,
        command: AppCenterCrashesTabs.Simulate
    };

    public static AppCenterPortal: MenuItem = {
        label: Strings.AppCenterPortalMenuLabel,
        description: Strings.AppCenterPortalMenuDescription,
        command: CommandNames.AppCenterPortal
    };

    public static SetCurrentApp(currentApp: CurrentApp): MenuItem {
        return {
            label: Strings.setCurrentAppMenuText(currentApp),
            description: Strings.MenuCurrentAppDescription,
            command: CommandNames.SetCurrentApp
        };
    }

    public static InstallSDK: MenuItem = {
        label: Strings.InstallSDKMenuLabel,
        description: Strings.InstallSDKMenuDescription,
        command: CommandNames.InstallSDK
    };

    public static Settings: MenuItem = {
        label: Strings.SettingsMenuLabel,
        description: Strings.SettingsMenuDescription,
        command: CommandNames.Settings.ShowMenu
    };

    public static TestTab: MenuItem = {
        label: Strings.TestTabMenuItem,
        description: Strings.OpenTabInBrowserMsg(Strings.TestTabMenuItem),
        command: AppCenterBeacons.Test
    };

    public static BuildTab: MenuItem = {
        label: Strings.BuildTabMenuItem,
        description: Strings.OpenTabInBrowserMsg(Strings.BuildTabMenuItem),
        command: AppCenterBeacons.Build
    };

    public static DistributeTab: MenuItem = {
        label: Strings.DistributeTabMenuItem,
        description: Strings.OpenTabInBrowserMsg(Strings.DistributeTabMenuItem),
        command: AppCenterBeacons.Distribute
    };

    public static CrashesTab: MenuItem = {
        label: Strings.CrashesTabMenuItem,
        description: Strings.OpenTabInBrowserMsg(Strings.CrashesTabMenuItem),
        command: AppCenterBeacons.Crashes
    };

    public static AnalyticsTab: MenuItem = {
        label: Strings.AnalyticsTabMenuItem,
        description: Strings.OpenTabInBrowserMsg(Strings.AnalyticsTabMenuItem),
        command: AppCenterBeacons.Analytics
    };

    public static DistributeGroupsTab: MenuItem = {
        label: Strings.DistributeGroupsTabMenuItem,
        description: Strings.OpenTabInBrowserMsg(Strings.DistributeGroupsTabMenuItem),
        command: AppCenterDistributionTabs.Groups
    };

    public static DistributeStoresTab: MenuItem = {
        label: Strings.DistributeStoresTabMenuItem,
        description: Strings.OpenTabInBrowserMsg(Strings.DistributeStoresTabMenuItem),
        command: AppCenterDistributionTabs.Stores
    };

    public static DistributeReleasesTab: MenuItem = {
        label: Strings.DistributeReleasesTabMenuItem,
        description: Strings.OpenTabInBrowserMsg(Strings.DistributeReleasesTabMenuItem),
        command: AppCenterDistributionTabs.Releases
    };

    public static RunUITests: MenuItem = {
        label: Strings.RunUITestsMenuLabel,
        description: "",
        command: CommandNames.Test.RunUITests
    };

    public static RunUITestsAsync: MenuItem = {
        label: Strings.RunUITestsAsyncMenuLabel,
        description: "",
        command: CommandNames.Test.RunUITestsAsync
    };

    public static ViewTestResults: MenuItem = {
        label: Strings.ViewUITestResultOnPortalenuLabel,
        description: "",
        command: CommandNames.Test.ViewResults
    };

    public static LinkCodePush: MenuItem = {
        label: Strings.LinkCodePushMenuLabel,
        description: Strings.LinkCodePushMenuDescription,
        command: CommandNames.CodePush.LinkCodePush
    };

    public static OpenCodePush: MenuItem = {
        label: Strings.DistributeCodePushTabMenuItem,
        description: Strings.OpenTabInBrowserMsg(Strings.DistributeCodePushTabMenuItem),
        command: AppCenterDistributionTabs.CodePush
    };

    public static ReleaseReact(currentApp: CurrentApp): MenuItem {
        return {
            label: Strings.releaseReactMenuText(currentApp),
            description: "",
            command: CommandNames.CodePush.ReleaseReact
        };
    }

    public static SetCurrentDeployment(currentApp: CurrentApp): MenuItem {
        return {
            label: Strings.setCurrentAppDeploymentText(currentApp),
            description: "",
            command: CommandNames.CodePush.SetCurrentDeployment
        };
    }

    public static SetTargetBinaryVersion(currentApp: CurrentApp): MenuItem {
        return {
            label: Strings.setCurrentAppTargetBinaryVersionText(currentApp),
            description: "",
            command: CommandNames.CodePush.SetTargetBinaryVersion
        };
    }

    public static SwitchMandatory(currentApp: CurrentApp): MenuItem {
        return {
            label: Strings.setCurrentAppIsMandatoryText(currentApp),
            description: "",
            command: CommandNames.CodePush.SwitchMandatoryPropForRelease
        };
    }

    public static SwitchAccount: MenuItem = {
        label: Strings.SwitchAccountMenuLabel,
        description: Strings.SwitchAccountMenuDescription,
        command: CommandNames.Settings.SwitchAccount
    };

    public static LoginToAnother: MenuItem = {
        label: Strings.LoginToAnotherAccountMenuLabel,
        description: Strings.LoginToAnotherAccountMenuDescription,
        command: CommandNames.Settings.LoginToAnotherAccount
    };

    public static SwitchVstsAccount: MenuItem = {
        label: Strings.VstsSwitchAccountMenuLabel,
        description: Strings.VstsSwitchAccountMenuDescription,
        command: CommandNames.Settings.SwitchAccountVsts
    };

    public static LoginToAnotherVsts: MenuItem = {
        label: Strings.VstsLoginToAnotherAccountMenuLabel,
        description: Strings.VstsLoginToAnotherAccountMenuDescription,
        command: CommandNames.Settings.LoginVsts
    };

    public static HideStatusBar: MenuItem = {
        label: Strings.HideStatusBarMenuLabel,
        description: Strings.HideStatusBarMenuDescription,
        command: CommandNames.Settings.HideStatusBar
    };
}
