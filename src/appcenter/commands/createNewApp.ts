import * as vscode from "vscode"
import { CommandParams, CreatedAppFromAppCenter, UserOrOrganizationItem } from '../../helpers/interfaces';
import { CustomQuickPickItem, VsCodeUtils, IButtonMessageItem } from '../../helpers/vsCodeUtils';
import { Strings } from '../../strings';
import { MenuHelper } from '../../helpers/menuHelper';
import { Utils } from "../../helpers/utils";
import AppCenterAppBuilder from "../../appCenterAppBuilder";
import AppCenterAppCreator, { IOSAppCenterAppCreator, AndroidAppCenterAppCreator } from "../../appCenterAppCreator";
import { ReactNativeAppCommand } from "./reactNativeAppCommand";
import { Constants } from "../../constants";
import { AppCenterUrlBuilder } from "../../helpers/appCenterUrlBuilder";

export enum CreateNewAppOption {
    Android,
    IOS,
    Both
}

export class CreateNewApp extends ReactNativeAppCommand {

    private _androidAppCreator: AndroidAppCenterAppCreator;
    private _iOSAppCreator: IOSAppCenterAppCreator;
    private userOrOrg: UserOrOrganizationItem;

    public get iOSAppCreator(): AppCenterAppCreator {
        if (!this._iOSAppCreator) {
            this._iOSAppCreator = new IOSAppCenterAppCreator(this.client, this.logger);
        }
        return this._iOSAppCreator;
    }

    public get androidAppCreator(): AppCenterAppCreator {
        if (!this._androidAppCreator) {
            this._androidAppCreator = new AndroidAppCenterAppCreator(this.client, this.logger);
        }
        return this._androidAppCreator;
    }

    constructor(params: CommandParams, private _option: CreateNewAppOption) {
        super(params);
    }

    public async run(): Promise<boolean | void> {
        if (!await super.run()) {
            return false;
        }

        const userOrOrgQuickPickItems: CustomQuickPickItem[] = await this.getUserOrOrganizationItems();
        vscode.window.showQuickPick(userOrOrgQuickPickItems, { placeHolder: Strings.PleaseSelectCurrentAppOrgMsg, ignoreFocusOut: true })
            .then(async (selectedQuickPickItem: CustomQuickPickItem) => {
                if (!selectedQuickPickItem) {
                    return;
                }
                const userOrOrgItem: UserOrOrganizationItem | null = MenuHelper.getSelectedUserOrOrgItem(selectedQuickPickItem, userOrOrgQuickPickItems);
                if (!userOrOrgItem) {
                    VsCodeUtils.ShowErrorMessage(Strings.FailedToGetSelectedUserOrOrganizationMsg);
                    return;
                }
                this.userOrOrg = userOrOrgItem;

                let createdApps: any;
                await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.VSCodeProgressLoadingTitle }, async p => {
                    p.report({ message: Strings.CreatingAppStatusBarMessage });

                    const promises: Promise<false | CreatedAppFromAppCenter>[] = this.getCreateAppPromises();
                    createdApps = await Promise.all(promises);
                    if (!createdApps.every((val) => {
                        if (val) {
                            return val !== null && val !== false;
                        }
                        return false;
                    })) {
                        VsCodeUtils.ShowErrorMessage(Strings.FailedToCreateAppInAppCenter);
                        return false;
                    }

                    switch (this._option) {
                        case CreateNewAppOption.Android:
                        case CreateNewAppOption.IOS: {
                            this.appCreated(createdApps);
                            return true;
                        }
                        case CreateNewAppOption.Both: {
                            this.pickApp(createdApps);
                            return true;
                        }

                        default: return false;
                    }
                });
            });
    }

    private getCreateAppPromises(): Promise<false | CreatedAppFromAppCenter>[] {
        const appName = Utils.parseJsonFile(this.manager.projectRootPath + "/package.json", "").name;
        let promises: Promise<false | CreatedAppFromAppCenter>[] = [];
        if (this._option == CreateNewAppOption.IOS || this._option == CreateNewAppOption.Both) {
            if (this.userOrOrg.isOrganization) {
                promises.push(this.iOSAppCreator.createAppForOrg(AppCenterAppBuilder.getiOSAppName(appName), AppCenterAppBuilder.getiOSDisplayName(appName), <string>this.userOrOrg.name));
            } else {
                promises.push(this.iOSAppCreator.createApp(AppCenterAppBuilder.getiOSAppName(appName), AppCenterAppBuilder.getiOSDisplayName(appName)));
            }
        }

        if (this._option == CreateNewAppOption.Android || this._option == CreateNewAppOption.Both) {
            if (this.userOrOrg.isOrganization) {
                promises.push(this.androidAppCreator.createAppForOrg(AppCenterAppBuilder.getAndroidAppName(appName), AppCenterAppBuilder.getAndroidDisplayName(appName), <string>this.userOrOrg.name));
            } else {
                promises.push(this.androidAppCreator.createApp(AppCenterAppBuilder.getAndroidAppName(appName), AppCenterAppBuilder.getAndroidDisplayName(appName)));
            }
        }
        return promises;
    }

    private async appCreated(apps: CreatedAppFromAppCenter[]) {
        if (apps.length < 1) {
            VsCodeUtils.ShowErrorMessage(Strings.FailedToCreateAppInAppCenter);
            return;
        }
        await this.setCurrentApp(apps[0]);
        const messageItems: IButtonMessageItem[] = [];
        const appUrl = AppCenterUrlBuilder.GetAppCenterAppLink(this.userOrOrg.name, apps[0].name, this.userOrOrg.isOrganization);
        messageItems.push({
            title: Strings.AppCreatedBtnLabel,
            url: appUrl
        });
        VsCodeUtils.ShowInfoMessage(Strings.AppCreatedMsg(apps[0].name, true), ...messageItems);
    }

    private async pickApp(apps: CreatedAppFromAppCenter[]) {
        if (apps.length < 2) {
            VsCodeUtils.ShowErrorMessage(Strings.FailedToCreateAppInAppCenter);
            return;
        }
        const messageItems: IButtonMessageItem[] = [];

        messageItems.push({
            title: apps[0].name,
            command: "0"
        });

        messageItems.push({
            title: apps[1].name,
            command: "1"
        });

        VsCodeUtils.ShowInfoMessage(Strings.AppCreatedMsg(apps[0].name, false, apps[1].name), ...messageItems)
            .then(async (selection: IButtonMessageItem | undefined) => {
                if (selection) {
                    await this.setCurrentApp(apps[+selection.command]);
                    const messageItems: IButtonMessageItem[] = [];
                    const appUrl = AppCenterUrlBuilder.GetAppCenterAppLink(this.userOrOrg.name, apps[+selection.command].name, this.userOrOrg.isOrganization);
                    messageItems.push({
                        title: Strings.AppCreatedBtnLabel,
                        url: appUrl
                    });
                    return VsCodeUtils.ShowInfoMessage(Strings.AppCreatedMsg(apps[+selection.command].name), ...messageItems);
                } else {
                    return false;
                }
            });
    }

    private async setCurrentApp(app: CreatedAppFromAppCenter) {
        return this.saveCurrentApp(
            `${this.userOrOrg.name}/${app.name}`,
            Utils.toAppCenterOS(app.os),
            null,
            Constants.AppCenterDefaultTargetBinaryVersion,
            this.userOrOrg.isOrganization ? "organization" : "user",
            Constants.AppCenterDefaultIsMandatoryParam,
            app.appSecret
        );
    }
}
