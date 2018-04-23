import * as vscode from "vscode";
import AppCenterAppBuilder from "../../appCenterAppBuilder";
import { Profile, UserOrOrganizationItem } from '../../helpers/interfaces';
import { MenuHelper } from "../../helpers/menuHelper";
import { Validators } from "../../helpers/validators";
import { CustomQuickPickItem, VsCodeUtils } from '../../helpers/vsCodeUtils';
import { Strings } from '../../strings';
import { models } from '../apis';
import { Command } from './command';

export class CreateAppCommand extends Command {

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

}
