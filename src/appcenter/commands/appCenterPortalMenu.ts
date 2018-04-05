import * as vscode from "vscode";
import { AppCenteAppType, AppCenterBeacons, AppCenterDistributionTabs, Constants } from "../../constants";
import { ExtensionManager } from "../../extensionManager";
import { AppCenterUrlBuilder } from "../../helpers/appCenterUrlBuilder";
import { CurrentApp, QuickPickAppItem } from "../../helpers/interfaces";
import { Utils } from "../../helpers/utils";
import { VsCodeUtils } from "../../helpers/vsCodeUtils";
import { ILogger } from "../../log/logHelper";
import { Strings } from "../../strings";
import { models } from "../api";
import { ReactNativeAppCommand } from "./reactNativeAppCommand";

export default class AppCenterPortalMenu extends ReactNativeAppCommand {

    private currentAppMenuTarget: string = "MenuCurrentApp";
    private selectedCachedItem: boolean;

    constructor(manager: ExtensionManager, logger: ILogger) {
        super(manager, logger);
    }

    public async run(): Promise<void> {
        if (!await super.run()) {
            return;
        }
        try {
            if (ReactNativeAppCommand.cachedApps && ReactNativeAppCommand.cachedApps.length > 0) {
                this.showApps(ReactNativeAppCommand.cachedApps);
            }
            vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.GetAppsListMessage }, async () => {
                return await this.client.account.apps.list({
                    orderBy: "name"
                });
            }).then(async (apps: any) => {
                this.showApps(apps);
            });
        } catch (e) {
            VsCodeUtils.ShowErrorMessage(Strings.UnknownError);
            this.logger.error(e.message, e);
        }
    }

    private getAppCenterDistributeTabMenuItems(): vscode.QuickPickItem[] {
        const getAppCenterDistributeTabMenuItems: vscode.QuickPickItem[] = [];
        getAppCenterDistributeTabMenuItems.push(<vscode.QuickPickItem>{
            label: Strings.DistributeGroupsTabMenuItem,
            description: Strings.OpenTabInBrowserMsg(Strings.DistributeGroupsTabMenuItem),
            target: AppCenterDistributionTabs.Groups
        });
        getAppCenterDistributeTabMenuItems.push(<vscode.QuickPickItem>{
            label: Strings.DistributeStoresTabMenuItem,
            description: Strings.OpenTabInBrowserMsg(Strings.DistributeStoresTabMenuItem),
            target: AppCenterDistributionTabs.Stores
        });
        getAppCenterDistributeTabMenuItems.push(<vscode.QuickPickItem>{
            label: Strings.DistributeCodePushTabMenuItem,
            description: Strings.OpenTabInBrowserMsg(Strings.DistributeCodePushTabMenuItem),
            target: AppCenterDistributionTabs.CodePush
        });
        getAppCenterDistributeTabMenuItems.push(<vscode.QuickPickItem>{
            label: Strings.DistributeReleasesTabMenuItem,
            description: Strings.OpenTabInBrowserMsg(Strings.DistributeReleasesTabMenuItem),
            target: AppCenterDistributionTabs.Releases
        });
        return getAppCenterDistributeTabMenuItems;
    }

    private getAppCenterTabsMenuItems(): vscode.QuickPickItem[] {
        const appCenterPortalTabOptions: vscode.QuickPickItem[] = [];
        appCenterPortalTabOptions.push(<vscode.QuickPickItem>{
            label: Strings.BuildTabMenuItem,
            description: Strings.OpenTabInBrowserMsg(Strings.BuildTabMenuItem),
            target: AppCenterBeacons.Build
        });
        appCenterPortalTabOptions.push(<vscode.QuickPickItem>{
            label: Strings.TestTabMenuItem,
            description: Strings.OpenTabInBrowserMsg(Strings.TestTabMenuItem),
            target: AppCenterBeacons.Test
        });
        appCenterPortalTabOptions.push(<vscode.QuickPickItem>{
            label: Strings.DistributeTabMenuItem,
            description: Strings.OpenTabInBrowserMsg(Strings.DistributeTabMenuItem),
            target: AppCenterBeacons.Distribute
        });
        appCenterPortalTabOptions.push(<vscode.QuickPickItem>{
            label: Strings.CrashesTabMenuItem,
            description: Strings.OpenTabInBrowserMsg(Strings.CrashesTabMenuItem),
            target: AppCenterBeacons.Crashes
        });
        appCenterPortalTabOptions.push(<vscode.QuickPickItem>{
            label: Strings.AnalyticsTabMenuItem,
            description: Strings.OpenTabInBrowserMsg(Strings.AnalyticsTabMenuItem),
            target: AppCenterBeacons.Analytics
        });
        appCenterPortalTabOptions.push(<vscode.QuickPickItem>{
            label: Strings.PushTabMenuItem,
            description: Strings.OpenTabInBrowserMsg(Strings.PushTabMenuItem),
            target: AppCenterBeacons.Push
        });
        return appCenterPortalTabOptions;
    }

    private async showApps(appsList: models.AppResponse[]) {
        try {
            let rnApps;

            ReactNativeAppCommand.cachedApps = rnApps = appsList.filter(app => app.platform === Constants.AppCenterReactNativePlatformName);
            const options: QuickPickAppItem[] = VsCodeUtils.getQuickPickItemsForAppsList(rnApps);
            const currentApp: CurrentApp | null = await this.getCurrentApp();

            if (currentApp) {
                const currentAppItem = {
                    label: Strings.SelectCurrentAppMenuDescription,
                    description: currentApp.type,
                    target: this.currentAppMenuTarget
                };
                options.splice(0, 0, currentAppItem);
            }
            if (!this.selectedCachedItem) {
                vscode.window.showQuickPick(options, { placeHolder: Strings.ProvideCurrentAppPromptMsg }).then(async (selected: QuickPickAppItem) => {
                    this.selectedCachedItem = true;
                    if (!selected) {
                        this.logger.info('User cancel selection of current app');
                        return;
                    }
                    let selectedApp: models.AppResponse;

                    const selectedApps: models.AppResponse[] = rnApps.filter(app => app.name === selected.target);

                    // If this is not current app then we can assign current app, otherwise we will use GetCurrentApp method
                    if (selected.target !== this.currentAppMenuTarget) {
                        if (!selectedApps || selectedApps.length !== 1) {
                            return;
                        }
                        selectedApp = selectedApps[0];
                    }

                    const appCenterPortalTabOptions: vscode.QuickPickItem[] = this.getAppCenterTabsMenuItems();

                    vscode.window.showQuickPick(appCenterPortalTabOptions, { placeHolder: Strings.MenuTitlePlaceholder })
                        .then(async (selected: QuickPickAppItem) => {
                            if (!selected) {
                                this.logger.info('User cancel selection of current appcenter tab');
                                return;
                            }

                            let isOrg: boolean;
                            let appName: string;
                            let ownerName: string;

                            if (selectedApp) {
                                isOrg = selectedApp.owner.type.toLowerCase() === AppCenteAppType.Org.toLowerCase();
                                appName = selectedApp.name;
                                ownerName = selectedApp.owner.name;
                            } else {
                                const currentApp: CurrentApp | null = await this.getCurrentApp();
                                if (currentApp) {
                                    isOrg = currentApp.type.toLowerCase() === AppCenteAppType.Org.toLowerCase();
                                    appName = currentApp.appName;
                                    ownerName = currentApp.ownerName;
                                } else {
                                    this.logger.error("Current app is undefiend");
                                    throw new Error("Current app is undefiend");
                                }
                            }

                            switch (selected.target) {
                                case (AppCenterBeacons.Build):
                                    Utils.OpenUrl(AppCenterUrlBuilder.GetAppCenterURLByBeacon(ownerName, appName, AppCenterBeacons.Build, isOrg));
                                    break;
                                case (AppCenterBeacons.Test):
                                    Utils.OpenUrl(AppCenterUrlBuilder.GetAppCenterURLByBeacon(ownerName, appName, AppCenterBeacons.Test, isOrg));
                                    break;
                                case (AppCenterBeacons.Distribute):
                                    const appCenterDistributeTabMenuItems: vscode.QuickPickItem[] = this.getAppCenterDistributeTabMenuItems();
                                    vscode.window.showQuickPick(appCenterDistributeTabMenuItems, { placeHolder: Strings.MenuTitlePlaceholder })
                                        .then((selected: QuickPickAppItem) => {
                                            if (!selected) {
                                                this.logger.info('User cancel selection of current appcenter tab');
                                                return;
                                            }
                                            switch (selected.target) {
                                                case (AppCenterDistributionTabs.Groups):
                                                    Utils.OpenUrl(AppCenterUrlBuilder.GetAppCenterDistributeTabUrlByTabName(ownerName, appName, AppCenterDistributionTabs.Groups, isOrg));
                                                    break;
                                                case (AppCenterDistributionTabs.Stores):
                                                    Utils.OpenUrl(AppCenterUrlBuilder.GetAppCenterDistributeTabUrlByTabName(ownerName, appName, AppCenterDistributionTabs.Stores, isOrg));
                                                    break;
                                                case (AppCenterDistributionTabs.CodePush):
                                                    Utils.OpenUrl(AppCenterUrlBuilder.GetAppCenterDistributeTabUrlByTabName(ownerName, appName, AppCenterDistributionTabs.CodePush, isOrg));
                                                    break;
                                                case (AppCenterDistributionTabs.Releases):
                                                    Utils.OpenUrl(AppCenterUrlBuilder.GetAppCenterDistributeTabUrlByTabName(ownerName, appName, AppCenterDistributionTabs.Releases, isOrg));
                                                    break;
                                                default:
                                                    // Ideally shouldn't be there :)
                                                    this.logger.error("Unknown option selected name");
                                                    break;
                                            }
                                        });
                                    break;
                                case (AppCenterBeacons.Crashes):
                                    Utils.OpenUrl(AppCenterUrlBuilder.GetAppCenterURLByBeacon(ownerName, appName, AppCenterBeacons.Crashes, isOrg));
                                    break;
                                case (AppCenterBeacons.Analytics):
                                    Utils.OpenUrl(AppCenterUrlBuilder.GetAppCenterURLByBeacon(ownerName, appName, AppCenterBeacons.Analytics, isOrg));
                                    break;
                                case (AppCenterBeacons.Push):
                                    Utils.OpenUrl(AppCenterUrlBuilder.GetAppCenterURLByBeacon(ownerName, appName, AppCenterBeacons.Push, isOrg));
                                    break;
                                default:
                                    // Ideally shouldn't be there :)
                                    this.logger.error("Unknown AppCenter beacon name");
                                    break;
                            }
                        });
                });
            }
        } catch (e) {
            VsCodeUtils.ShowErrorMessage(Strings.UnknownError);
            this.logger.error(e.message, e);
        }
    }
}
