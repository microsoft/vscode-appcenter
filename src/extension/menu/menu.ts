import { models } from "../../api/appcenter";
import { CommandParams, CurrentApp, MenuQuickPickItem, Profile, UserOrOrganizationItem } from "../../helpers/interfaces";
import { FSUtils } from "../../helpers/utils/fsUtils";
import { Utils } from "../../helpers/utils/utils";
import { ILogger } from "../log/logHelper";
import { AppCenterBeacons, AppCenterCrashesTabs, AppCenterDistributionTabs, CommandNames } from "../resources/constants";
import { Strings } from "../resources/strings";
import { CustomQuickPickItem, VsCodeUI } from "../ui/vscodeUI";

export abstract class Menu {
    protected rootPath: string;
    protected logger: ILogger;

    public constructor(protected _params: CommandParams) {
        this.rootPath = _params.manager.projectRootPath;
        this.logger = _params.manager._logger;
    }

    protected isEmptyDir(): boolean {
        return FSUtils.IsEmptyDirectoryToStartNewIdea(this.rootPath);
    }

    protected isRNproject(): boolean {
        return Utils.isReactNativeProject(this.logger, this.rootPath, false);
    }

    protected isCodePushProject(): boolean {
        return Utils.isReactNativeCodePushProject(this.logger, this.rootPath, false);
    }

    public async show(): Promise<void> {
        const menuItems: MenuQuickPickItem[] = this.getMenuItems();

        const selected: MenuQuickPickItem = await VsCodeUI.showQuickPick(menuItems, Strings.MenuTitlePlaceholder);
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
        label: Strings.LoginMenuLabel,
        description: Strings.LoginMenuDescription,
        command: CommandNames.Login
    };

    public static StartAnIdea: MenuQuickPickItem = {
        label: Strings.StartAnIdeaMenuLabel,
        description: Strings.StartAnIdeaMenuDescription,
        command: CommandNames.Start
    };

    public static CodePushTab: MenuQuickPickItem = {
        label: Strings.CodePushMenuLabelItem,
        description: Strings.CodePushMenuLabelDescription,
        command: AppCenterBeacons.CodePush
    };

    public static SimulateCrashes: MenuQuickPickItem = {
        label: Strings.SimulateCrashesMenuLabel,
        description: Strings.SimulateCrashesMenuDescription,
        command: AppCenterCrashesTabs.Simulate
    };

    public static AppCenterPortal: MenuQuickPickItem = {
        label: Strings.AppCenterPortalMenuLabel,
        description: Strings.AppCenterPortalMenuDescription,
        command: CommandNames.AppCenterPortal
    };

    public static SetCurrentApp(currentApp: CurrentApp): MenuQuickPickItem {
        return {
            label: Strings.setCurrentAppMenuText(currentApp),
            description: Strings.MenuCurrentAppDescription,
            command: CommandNames.SetCurrentApp
        };
    }

    public static InstallSDK: MenuQuickPickItem = {
        label: Strings.InstallSDKMenuLabel,
        description: Strings.InstallSDKMenuDescription,
        command: CommandNames.InstallSDK
    };

    public static Settings: MenuQuickPickItem = {
        label: Strings.SettingsMenuLabel,
        description: Strings.SettingsMenuDescription,
        command: CommandNames.Settings.ShowMenu
    };

    public static TestTab: MenuQuickPickItem = {
        label: Strings.TestTabMenuItem,
        description: Strings.OpenTabInBrowserMsg(Strings.TestTabMenuItem),
        command: AppCenterBeacons.Test
    };

    public static BuildTab: MenuQuickPickItem = {
        label: Strings.BuildTabMenuItem,
        description: Strings.OpenTabInBrowserMsg(Strings.BuildTabMenuItem),
        command: AppCenterBeacons.Build
    };

    public static DistributeTab: MenuQuickPickItem = {
        label: Strings.DistributeTabMenuItem,
        description: Strings.OpenTabInBrowserMsg(Strings.DistributeTabMenuItem),
        command: AppCenterBeacons.Distribute
    };

    public static CrashesTab: MenuQuickPickItem = {
        label: Strings.CrashesTabMenuItem,
        description: Strings.OpenTabInBrowserMsg(Strings.CrashesTabMenuItem),
        command: AppCenterBeacons.Crashes
    };

    public static AnalyticsTab: MenuQuickPickItem = {
        label: Strings.AnalyticsTabMenuItem,
        description: Strings.OpenTabInBrowserMsg(Strings.AnalyticsTabMenuItem),
        command: AppCenterBeacons.Analytics
    };

    public static DistributeGroupsTab: MenuQuickPickItem = {
        label: Strings.DistributeGroupsTabMenuItem,
        description: Strings.OpenTabInBrowserMsg(Strings.DistributeGroupsTabMenuItem),
        command: AppCenterDistributionTabs.Groups
    };

    public static DistributeStoresTab: MenuQuickPickItem = {
        label: Strings.DistributeStoresTabMenuItem,
        description: Strings.OpenTabInBrowserMsg(Strings.DistributeStoresTabMenuItem),
        command: AppCenterDistributionTabs.Stores
    };

    public static DistributeReleasesTab: MenuQuickPickItem = {
        label: Strings.DistributeReleasesTabMenuItem,
        description: Strings.OpenTabInBrowserMsg(Strings.DistributeReleasesTabMenuItem),
        command: AppCenterDistributionTabs.Releases
    };

    public static RunUITests: MenuQuickPickItem = {
        label: Strings.RunUITestsMenuLabel,
        description: "",
        command: CommandNames.Test.RunUITests
    };

    public static RunUITestsAsync: MenuQuickPickItem = {
        label: Strings.RunUITestsAsyncMenuLabel,
        description: "",
        command: CommandNames.Test.RunUITestsAsync
    };

    public static ViewTestResults: MenuQuickPickItem = {
        label: Strings.ViewUITestResultOnPortalenuLabel,
        description: "",
        command: CommandNames.Test.ViewResults
    };

    public static LinkCodePush: MenuQuickPickItem = {
        label: Strings.LinkCodePushMenuLabel,
        description: Strings.LinkCodePushMenuDescription,
        command: CommandNames.CodePush.LinkCodePush
    };

    public static OpenCodePush: MenuQuickPickItem = {
        label: Strings.DistributeCodePushTabMenuItem,
        description: Strings.OpenTabInBrowserMsg(Strings.DistributeCodePushTabMenuItem),
        command: AppCenterDistributionTabs.CodePush
    };

    public static ReleaseReact(currentApp: CurrentApp): MenuQuickPickItem {
        return {
            label: Strings.releaseReactMenuText(currentApp),
            description: "",
            command: CommandNames.CodePush.ReleaseReact
        };
    }

    public static SetCurrentDeployment(currentApp: CurrentApp): MenuQuickPickItem {
        return {
            label: Strings.setCurrentAppDeploymentText(currentApp),
            description: "",
            command: CommandNames.CodePush.SetCurrentDeployment
        };
    }

    public static SetTargetBinaryVersion(currentApp: CurrentApp): MenuQuickPickItem {
        return {
            label: Strings.setCurrentAppTargetBinaryVersionText(currentApp),
            description: "",
            command: CommandNames.CodePush.SetTargetBinaryVersion
        };
    }

    public static SwitchMandatory(currentApp: CurrentApp): MenuQuickPickItem {
        return {
            label: Strings.setCurrentAppIsMandatoryText(currentApp),
            description: "",
            command: CommandNames.CodePush.SwitchMandatoryPropForRelease
        };
    }

    public static SwitchAccount: MenuQuickPickItem = {
        label: Strings.SwitchAccountMenuLabel,
        description: Strings.SwitchAccountMenuDescription,
        command: CommandNames.Settings.SwitchAccount
    };

    public static LoginToAnother: MenuQuickPickItem = {
        label: Strings.LoginToAnotherAccountMenuLabel,
        description: Strings.LoginToAnotherAccountMenuDescription,
        command: CommandNames.Settings.LoginToAnotherAccount
    };

    public static SwitchVstsAccount: MenuQuickPickItem = {
        label: Strings.VstsSwitchAccountMenuLabel,
        description: Strings.VstsSwitchAccountMenuDescription,
        command: CommandNames.Settings.SwitchAccountVsts
    };

    public static LoginToAnotherVsts: MenuQuickPickItem = {
        label: Strings.VstsLoginToAnotherAccountMenuLabel,
        description: Strings.VstsLoginToAnotherAccountMenuDescription,
        command: CommandNames.Settings.LoginVsts
    };

    public static HideStatusBar: MenuQuickPickItem = {
        label: Strings.HideStatusBarMenuLabel,
        description: Strings.HideStatusBarMenuDescription,
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
            isOrganization: selectedUserOrOrgs[0].description !== Strings.UserMenuDescriptionLabel
        };
        return userOrOrgItem;
    } else {
        return null;
    }
}

export function getCreateAppOptions(): CustomQuickPickItem[] {
    const createAppOptions: CustomQuickPickItem[] = [];
    createAppOptions.push(<CustomQuickPickItem>{
        label: Strings.CreateNewAndroidAppMenuLabel,
        description: "",
        target: CommandNames.CreateApp.Android
    });
    createAppOptions.push(<CustomQuickPickItem>{
        label: Strings.CreateNewIOSAppMenuLabel,
        description: "",
        target: CommandNames.CreateApp.IOS
    });
    createAppOptions.push(<CustomQuickPickItem>{
        label: Strings.CreateNewAppsForBothMenuLabel,
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
            description: Strings.OrganizationMenuDescriptionLabel,
            target: item.name
        };
    });
    if (myself) {
        // Insert user at the very 1st position
        options.splice(0, 0, {
            label: `${myself.displayName}`,
            description: Strings.UserMenuDescriptionLabel,
            target: myself.userName
        });
    }
    return options;
}
