import * as vscode from "vscode";
import { models } from "../appcenter/apis";
import { CommandNames } from "../constants";
import { Strings } from "../strings";
import { Profile, UserOrOrganizationItem } from "./interfaces";
import { CustomQuickPickItem } from "./vsCodeUtils";

export class MenuHelper {

    public static getSelectedUserOrOrgItem(selected: CustomQuickPickItem, allItems: CustomQuickPickItem[]): UserOrOrganizationItem | null {
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

    public static getCreateAppOptions(): vscode.QuickPickItem[] {
        const createAppOptions: vscode.QuickPickItem[] = [];
        createAppOptions.push(<vscode.QuickPickItem>{
            label: Strings.CreateNewAndroidAppMenuLabel,
            description: "",
            target: CommandNames.CreateApp.Android
        });
        createAppOptions.push(<vscode.QuickPickItem>{
            label: Strings.CreateNewIOSAppMenuLabel,
            description: "",
            target: CommandNames.CreateApp.IOS
        });
        createAppOptions.push(<vscode.QuickPickItem>{
            label: Strings.CreateNewAppsForBothMenuLabel,
            description: "",
            target: CommandNames.CreateApp.Both
        });
        return createAppOptions;
    }

    public static getQuickPickItemsForAppsList(appsList: models.AppResponse[]) {
        return appsList.map((app: models.AppResponse) => {
            return {
                label: `${app.name} (${app.os})`,
                description: app.owner.type,
                target: `${app.name}`
            };
        });
    }

    public static getQuickPickItemsForOrgList(orgList: models.ListOKResponseItem[], myself: Profile | null): CustomQuickPickItem[] {
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
}
