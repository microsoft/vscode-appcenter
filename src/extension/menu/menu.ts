import { models } from "../../api/appcenter";
import { CommandParams, CurrentApp, MenuQuickPickItem, Profile, UserOrOrganizationItem, QuickPickAppItem } from "../../helpers/interfaces";
import { FSUtils } from "../../helpers/utils/fsUtils";
import { Utils } from "../../helpers/utils/utils";
import { ILogger } from "../log/logHelper";
import { AppCenterBeacons, AppCenterCrashesTabs, AppCenterDistributionTabs, CommandNames } from "../resources/constants";
import { CustomQuickPickItem, VsCodeUI } from "../ui/vscodeUI";
import { MenuStrings } from "../resources/menuStrings";

export abstract class Menu {
    protected rootPath: string;
    protected logger: ILogger;

    public constructor(protected _params: CommandParams) {
        this.rootPath = _params.manager.projectRootPath;
        this.logger = _params.manager._logger;
    }

    protected isEmptyDir(): boolean {
        return FSUtils.IsEmptyDirectoryToStartNewProject(this.rootPath);
    }

    protected isRNproject(): boolean {
        return Utils.isReactNativeProject(this.logger, this.rootPath, false);
    }

    protected isCodePushProject(): boolean {
        return Utils.isReactNativeCodePushProject(this.logger, this.rootPath, false);
    }

    public async show(): Promise<void> {
        const menuItems: MenuQuickPickItem[] = this.getMenuItems();

        const selected: MenuQuickPickItem = await VsCodeUI.showQuickPick(menuItems);
        if (!selected) {
            return;
        }

        return this.handleMenuSelection(selected);
    }

    protected abstract getMenuItems(): MenuQuickPickItem[];
    protected abstract handleMenuSelection(menuItem: MenuQuickPickItem): Promise<void>;
}

export class MenuItems {
    public static Login: MenuQuickPickItem = {
        label: MenuStrings.LoginMenuLabel,
        description: MenuStrings.LoginMenuDescription,
        command: CommandNames.Login
    };

    public static StartAProject: MenuQuickPickItem = {
        label: MenuStrings.StartAProjectMenuLabel,
        description: MenuStrings.StartAProjectMenuDescription,
        command: CommandNames.Start
    };

    public static CodePushTab: MenuQuickPickItem = {
        label: MenuStrings.CodePushMenuLabel,
        description: MenuStrings.CodePushMenuLabelDescription,
        command: AppCenterBeacons.CodePush
    };

    public static SimulateCrashes: MenuQuickPickItem = {
        label: MenuStrings.SimulateCrashesMenuLabel,
        description: MenuStrings.SimulateCrashesMenuDescription,
        command: AppCenterCrashesTabs.Simulate
    };

    public static AppCenterPortal: MenuQuickPickItem = {
        label: MenuStrings.AppCenterPortalMenuLabel,
        description: MenuStrings.AppCenterPortalMenuDescription,
        command: CommandNames.AppCenterPortal
    };

    public static SetCurrentApp(currentApp: CurrentApp): MenuQuickPickItem {
        return {
            label: MenuStrings.setCurrentAppMenuLabel(currentApp),
            description: MenuStrings.CurrentAppMenuDescription,
            command: CommandNames.SetCurrentApp
        };
    }

    public static InstallSDK: MenuQuickPickItem = {
        label: MenuStrings.InstallSDKMenuLabel,
        description: MenuStrings.InstallSDKMenuDescription,
        command: CommandNames.InstallSDK
    };

    public static Settings: MenuQuickPickItem = {
        label: MenuStrings.SettingsMenuLabel,
        description: MenuStrings.SettingsMenuDescription,
        command: CommandNames.Settings.ShowMenu
    };

    public static TestTab: MenuQuickPickItem = {
        label: MenuStrings.TestTabMenuLabel,
        description: MenuStrings.OpenTabInBrowserMenuDescription(MenuStrings.TestTabMenuLabel),
        command: AppCenterBeacons.Test
    };

    public static BuildTab: MenuQuickPickItem = {
        label: MenuStrings.BuildTabMenuLabel,
        description: MenuStrings.OpenTabInBrowserMenuDescription(MenuStrings.BuildTabMenuLabel),
        command: AppCenterBeacons.Build
    };

    public static DistributeTab: MenuQuickPickItem = {
        label: MenuStrings.DistributeTabMenuLabel,
        description: MenuStrings.OpenTabInBrowserMenuDescription(MenuStrings.DistributeTabMenuLabel),
        command: AppCenterBeacons.Distribute
    };

    public static CrashesTab: MenuQuickPickItem = {
        label: MenuStrings.CrashesTabMenuLabel,
        description: MenuStrings.OpenTabInBrowserMenuDescription(MenuStrings.CrashesTabMenuLabel),
        command: AppCenterBeacons.Crashes
    };

    public static AnalyticsTab: MenuQuickPickItem = {
        label: MenuStrings.AnalyticsTabMenuLabel,
        description: MenuStrings.OpenTabInBrowserMenuDescription(MenuStrings.AnalyticsTabMenuLabel),
        command: AppCenterBeacons.Analytics
    };

    public static DistributeGroupsTab: MenuQuickPickItem = {
        label: MenuStrings.DistributeGroupsTabMenuLabel,
        description: MenuStrings.OpenTabInBrowserMenuDescription(MenuStrings.DistributeGroupsTabMenuLabel),
        command: AppCenterDistributionTabs.Groups
    };

    public static DistributeStoresTab: MenuQuickPickItem = {
        label: MenuStrings.DistributeStoresTabMenuLabel,
        description: MenuStrings.OpenTabInBrowserMenuDescription(MenuStrings.DistributeStoresTabMenuLabel),
        command: AppCenterDistributionTabs.Stores
    };

    public static DistributeReleasesTab: MenuQuickPickItem = {
        label: MenuStrings.DistributeReleasesTabMenuLabel,
        description: MenuStrings.OpenTabInBrowserMenuDescription(MenuStrings.DistributeReleasesTabMenuLabel),
        command: AppCenterDistributionTabs.Releases
    };

    public static RunUITests: MenuQuickPickItem = {
        label: MenuStrings.RunUITestsMenuLabel,
        description: "",
        command: CommandNames.Test.RunUITests
    };

    public static RunUITestsAsync: MenuQuickPickItem = {
        label: MenuStrings.RunUITestsAsyncMenuLabel,
        description: "",
        command: CommandNames.Test.RunUITestsAsync
    };

    public static ViewTestResults: MenuQuickPickItem = {
        label: MenuStrings.ViewUITestResultOnPortalMenuLabel,
        description: "",
        command: CommandNames.Test.ViewResults
    };

    public static LinkCodePush: MenuQuickPickItem = {
        label: MenuStrings.LinkCodePushMenuLabel,
        description: MenuStrings.LinkCodePushMenuDescription,
        command: CommandNames.CodePush.LinkCodePush
    };

    public static OpenCodePush: MenuQuickPickItem = {
        label: MenuStrings.DistributeCodePushTabMenuLabel,
        description: MenuStrings.OpenTabInBrowserMenuDescription(MenuStrings.DistributeCodePushTabMenuLabel),
        command: AppCenterDistributionTabs.CodePush
    };

    public static ReleaseReact(currentApp: CurrentApp): MenuQuickPickItem {
        return {
            label: MenuStrings.releaseReactMenuLabel(currentApp),
            description: "",
            command: CommandNames.CodePush.ReleaseReact
        };
    }

    public static SetCurrentDeployment(currentApp: CurrentApp): MenuQuickPickItem {
        return {
            label: MenuStrings.setCurrentAppDeploymentMenuLabel(currentApp),
            description: "",
            command: CommandNames.CodePush.SetCurrentDeployment
        };
    }

    public static SetTargetBinaryVersion(currentApp: CurrentApp): MenuQuickPickItem {
        return {
            label: MenuStrings.setCurrentAppTargetBinaryVersionMenuLabel(currentApp),
            description: "",
            command: CommandNames.CodePush.SetTargetBinaryVersion
        };
    }

    public static SwitchMandatory(currentApp: CurrentApp): MenuQuickPickItem {
        return {
            label: MenuStrings.setCurrentAppIsMandatoryMenuLabel(currentApp),
            description: "",
            command: CommandNames.CodePush.SwitchMandatoryPropForRelease
        };
    }

    public static SwitchAccount: MenuQuickPickItem = {
        label: MenuStrings.SwitchAccountMenuLabel,
        description: MenuStrings.SwitchAccountMenuDescription,
        command: CommandNames.Settings.SwitchAccount
    };

    public static LoginToAnother: MenuQuickPickItem = {
        label: MenuStrings.LoginToAnotherAccountMenuLabel,
        description: MenuStrings.LoginToAnotherAccountMenuDescription,
        command: CommandNames.Settings.LoginToAnotherAccount
    };

    public static SwitchVstsAccount: MenuQuickPickItem = {
        label: MenuStrings.VstsSwitchAccountMenuLabel,
        description: MenuStrings.VstsSwitchAccountMenuDescription,
        command: CommandNames.Settings.SwitchAccountVsts
    };

    public static LoginToAnotherVsts: MenuQuickPickItem = {
        label: MenuStrings.VstsLoginToAnotherAccountMenuLabel,
        description: MenuStrings.VstsLoginToAnotherAccountMenuDescription,
        command: CommandNames.Settings.LoginVsts
    };

    public static HideStatusBar: MenuQuickPickItem = {
        label: MenuStrings.HideStatusBarMenuLabel,
        description: MenuStrings.HideStatusBarMenuDescription,
        command: CommandNames.Settings.HideStatusBar
    };
}

export function getSelectedUserOrOrgItem(selected: CustomQuickPickItem, allItems: CustomQuickPickItem[]): UserOrOrganizationItem | null {
    let userOrOrgItem: UserOrOrganizationItem;
    const selectedUserOrOrgs: CustomQuickPickItem[] = allItems.filter(item => item.target === selected.target);
    if (selectedUserOrOrgs && selectedUserOrOrgs.length === 1) {
        userOrOrgItem = {
            name: selectedUserOrOrgs[0].target,
            displayName: selectedUserOrOrgs[0].label,
            isOrganization: selectedUserOrOrgs[0].description !== MenuStrings.UserMenuDescription
        };
        return userOrOrgItem;
    } else {
        return null;
    }
}

export function getCreateAppOptions(): QuickPickAppItem[] {
    const createAppOptions: QuickPickAppItem[] = [];
    createAppOptions.push(<QuickPickAppItem>{
        label: MenuStrings.CreateNewAndroidAppMenuLabel,
        description: "",
        target: CommandNames.CreateApp.Android
    });
    createAppOptions.push(<QuickPickAppItem>{
        label: MenuStrings.CreateNewIOSAppMenuLabel,
        description: "",
        target: CommandNames.CreateApp.IOS
    });
    createAppOptions.push(<QuickPickAppItem>{
        label: MenuStrings.CreateNewAppsForBothMenuLabel,
        description: "",
        target: CommandNames.CreateApp.Both
    });
    return createAppOptions;
}

export function getQuickPickItemsForAppsList(appsList: models.AppResponse[]) {
    return appsList.map((app: models.AppResponse) => {
        return {
            label: `${app.name} (${app.os})`,
            description: app.owner.type,
            target: `${app.name}`
        };
    });
}

export function getQuickPickItemsForOrgList(orgList: models.ListOKResponseItem[], myself: Profile | null): CustomQuickPickItem[] {
    const options: CustomQuickPickItem[] = orgList.map(item => {
        return {
            label: `${item.displayName} (${item.name})`,
            description: MenuStrings.OrganizationMenuDescription,
            target: item.name
        };
    });
    if (myself) {
        // Insert user at the very 1st position
        options.splice(0, 0, {
            label: `${myself.displayName}`,
            description: MenuStrings.UserMenuDescription,
            target: myself.userName
        });
    }
    return options;
}
