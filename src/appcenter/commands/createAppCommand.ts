import * as vscode from "vscode";
import AppCenterAppBuilder from "../../appCenterAppBuilder";
import { Constants } from "../../constants";
import { AppCenterUrlBuilder } from "../../helpers/appCenterUrlBuilder";
import { CreatedAppFromAppCenter, Profile, QuickPickAppItem, UserOrOrganizationItem } from '../../helpers/interfaces';
import { MenuHelper } from "../../helpers/menuHelper";
import { Utils } from "../../helpers/utils";
import { Validators } from "../../helpers/validators";
import { CustomQuickPickItem, IButtonMessageItem, VsCodeUtils  } from '../../helpers/vsCodeUtils';
import { Strings } from '../../strings';
import { models } from '../apis';
import { Command } from './command';

export class CreateAppCommand extends Command {

    protected userOrOrg: UserOrOrganizationItem;

    public async run(): Promise<boolean | void> {
        if (!await super.run()) {
            return false;
        }
        return true;
    }

    protected async getUserOrOrganizationItems(): Promise<CustomQuickPickItem[]> {
        const sortOrganizations = function (a: models.ListOKResponseItem, b: models.ListOKResponseItem): number {
            if (a.displayName && b.displayName) {
                const nameA = a.displayName.toUpperCase();
                const nameB = b.displayName.toUpperCase();
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
                return 0; // sort alphabetically
            } else {
                return 0;
            }
        };
        let items: CustomQuickPickItem[] = [];
        this.logger.debug("Getting user/organization items...");
        await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.VSCodeProgressLoadingTitle }, p => {
            p.report({ message: Strings.LoadingStatusBarMessage });
            return this.client.organizations.list().then((orgList: models.ListOKResponseItem[]) => {
                const organizations: models.ListOKResponseItem[] = orgList;
                return organizations.sort(sortOrganizations);
            });
        }).then(async (orgList: models.ListOKResponseItem[]) => {
            const myself: Profile | null = await this.appCenterProfile;
            items = MenuHelper.getQuickPickItemsForOrgList(orgList, myself);
        });
        return items;
    }

    protected async appAlreadyExistInAppCenter(ideaName: string): Promise<boolean> {
        let exist: boolean = false;
        this.logger.debug(`Checkig if idea name "${ideaName}" is not already used before...`);
        await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.VSCodeProgressLoadingTitle }, async p => {
            p.report({ message: Strings.CheckIfAppsExistLoadingMessage });
            let apps: models.AppResponse[];
            apps = await this.client.apps.list();
            exist = apps.some(item => {
                return (item.name === AppCenterAppBuilder.getiOSAppName(ideaName) || item.name === AppCenterAppBuilder.getAndroidAppName(ideaName));
            });
        });
        return exist;
    }

    protected getIdeaName(appNameFromPackage: string = ""): Thenable<string | null> {
        return vscode.window.showInputBox({ prompt: Strings.PleaseEnterIdeaName, ignoreFocusOut: true, value: appNameFromPackage })
            .then(async ideaName => {
                if (ideaName.length === 0) {
                    VsCodeUtils.ShowErrorMessage(Strings.IdeaNameIsNotValidMsg);
                    return null;
                }

                if (!ideaName) {
                    return "";
                }

                if (!Validators.ValidateProjectName(ideaName)) {
                    VsCodeUtils.ShowErrorMessage(Strings.IdeaNameIsNotValidMsg);
                    return null;
                }

                if (await this.appAlreadyExistInAppCenter(ideaName)) {
                    VsCodeUtils.ShowErrorMessage(Strings.FailedToCreateAppAlreadyExistInAppCenter);
                    return null;
                }
                return ideaName;
            });
    }

    protected async getOrg(): Promise<UserOrOrganizationItem | null> {
        const userOrOrgQuickPickItems: CustomQuickPickItem[] = await this.getUserOrOrganizationItems();
        return vscode.window.showQuickPick(userOrOrgQuickPickItems, { placeHolder: Strings.PleaseSelectCurrentAppOrgMsg, ignoreFocusOut: true })
            .then(async (selectedQuickPickItem: CustomQuickPickItem) => {
                if (selectedQuickPickItem) {
                    const userOrOrgItem: UserOrOrganizationItem | null = MenuHelper.getSelectedUserOrOrgItem(selectedQuickPickItem, userOrOrgQuickPickItems);
                    if (!userOrOrgItem) {
                        VsCodeUtils.ShowErrorMessage(Strings.FailedToGetSelectedUserOrOrganizationMsg);
                        return null;
                    }
                    return userOrOrgItem;
                } else {
                    return null;
                }
            });
    }

    protected async setCurrentApp(app: CreatedAppFromAppCenter) {
        return this.saveCurrentApp(
            `${this.userOrOrg.name}/${app.appName}`,
            Utils.toAppCenterOS(app.os),
            null,
            Constants.AppCenterDefaultTargetBinaryVersion,
            this.userOrOrg.isOrganization ? "organization" : "user",
            Constants.AppCenterDefaultIsMandatoryParam,
            app.appSecret
        );
    }

    protected async pickApp(apps: CreatedAppFromAppCenter[]) {
        if (apps.length < 2) {
            VsCodeUtils.ShowErrorMessage(Strings.FailedToCreateAppInAppCenter);
            return;
        }

        const messageItems: IButtonMessageItem[] = [];

        messageItems.push({
            title: `Go to ${apps[0].appName}`,
            url: AppCenterUrlBuilder.GetAppCenterAppLink(this.userOrOrg.name, apps[0].appName, this.userOrOrg.isOrganization)
        });

        messageItems.push({
            title: `Go to ${apps[1].appName}`,
            url: AppCenterUrlBuilder.GetAppCenterAppLink(this.userOrOrg.name, apps[1].appName, this.userOrOrg.isOrganization)
        });

        VsCodeUtils.ShowInfoMessage(Strings.AppCreatedMsg(apps[0].appName, false, apps[1].appName), ...messageItems);

        const options: QuickPickAppItem[] = [
            {
                label: apps[0].appName,
                description: "",
                target: `0`
            },
            {
                label: apps[1].appName,
                description: "",
                target: `1`
            }
        ];
        await vscode.window.showQuickPick(options, { placeHolder: Strings.ChooseAppToBeSet })
            .then(async (selected: QuickPickAppItem) => {
                if (selected) {
                    await this.setCurrentApp(apps[+selected.target]);
                    const messageItems: IButtonMessageItem[] = [];
                    const appUrl = AppCenterUrlBuilder.GetAppCenterAppLink(this.userOrOrg.name, apps[+selected.target].appName, this.userOrOrg.isOrganization);
                    messageItems.push({
                        title: Strings.AppCreatedBtnLabel,
                        url: appUrl
                    });
                    return VsCodeUtils.ShowInfoMessage(Strings.AppCreatedMsg(apps[+selected.target].appName), ...messageItems);
                } else {
                    return false;
                }
            });
    }

}
