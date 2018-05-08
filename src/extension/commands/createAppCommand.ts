import { models } from "../../api/appcenter";
import AppCenterAppBuilder from "../../createApp/appCenterAppBuilder";
import { AppCenterUrlBuilder } from "../../helpers/appCenterUrlBuilder";
import { CreatedAppFromAppCenter, Profile, QuickPickAppItem, UserOrOrganizationItem } from '../../helpers/interfaces';
import { Utils } from "../../helpers/utils/utils";
import { Validators } from "../../helpers/utils/validators";
import * as Menu from "../menu/menu";
import { Constants } from "../resources/constants";
import { Strings } from "../resources/strings";
import { Command } from './command';
import { CreateNewAppOption } from "./general/createNewApp";
import { CustomQuickPickItem, VsCodeUI, IButtonMessageItem } from "../ui/vscodeUI";

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
        await VsCodeUI.showProgress(progress => {
            progress.report({ message: Strings.LoadingStatusBarMessage });
            return this.client.organizations.list().then((orgList: models.ListOKResponseItem[]) => {
                const organizations: models.ListOKResponseItem[] = orgList;
                return organizations.sort(sortOrganizations);
            });
        }).then(async (orgList: models.ListOKResponseItem[]) => {
            const myself: Profile | null = await this.appCenterProfile;
            items = Menu.getQuickPickItemsForOrgList(orgList, myself);
        });
        return items;
    }

    protected async appAlreadyExistInAppCenter(ideaName: string): Promise<boolean> {
        let exist: boolean = false;
        this.logger.debug(`Checkig if idea name "${ideaName}" is not already used before...`);
        await VsCodeUI.showProgress(async progress => {
            progress.report({ message: Strings.CheckIfAppsExistLoadingMessage });
            let apps: models.AppResponse[];
            apps = await this.client.apps.list();
            exist = apps.some(item => {
                return (item.name === ideaName);
            });
        });
        return exist;
    }

    protected async getIdeaName(option: CreateNewAppOption, appNameFromPackage: string = ""): Promise<string | null> {
        const ideaName = await VsCodeUI.showInput(Strings.PleaseEnterIdeaName, appNameFromPackage);
        if (ideaName.length === 0) {
            VsCodeUI.ShowErrorMessage(Strings.IdeaNameIsNotValidMsg);
            return null;
        }

        if (!ideaName) {
            return "";
        }

        if (!Validators.ValidateProjectName(ideaName)) {
            VsCodeUI.ShowErrorMessage(Strings.IdeaNameIsNotValidMsg);
            return null;
        }
        if (option === CreateNewAppOption.Android || option === CreateNewAppOption.Both) {
            if (await this.appAlreadyExistInAppCenter(AppCenterAppBuilder.getAndroidAppName(ideaName))) {
                VsCodeUI.ShowErrorMessage(Strings.FailedToCreateAppAlreadyExistInAppCenter);
                return null;
            }
        }
        if (option === CreateNewAppOption.IOS || option === CreateNewAppOption.Both) {
            if (await this.appAlreadyExistInAppCenter(AppCenterAppBuilder.getiOSAppName(ideaName))) {
                VsCodeUI.ShowErrorMessage(Strings.FailedToCreateAppAlreadyExistInAppCenter);
                return null;
            }
        }
        return ideaName;
    }

    protected async getOrg(): Promise<UserOrOrganizationItem | null> {
        const userOrOrgQuickPickItems: CustomQuickPickItem[] = await this.getUserOrOrganizationItems();
        const selectedQuickPickItem: CustomQuickPickItem = await VsCodeUI.showQuickPick(userOrOrgQuickPickItems, Strings.PleaseSelectCurrentAppOrgMsg);
        if (selectedQuickPickItem) {
            const userOrOrgItem: UserOrOrganizationItem | null = Menu.getSelectedUserOrOrgItem(selectedQuickPickItem, userOrOrgQuickPickItems);
            if (!userOrOrgItem) {
                VsCodeUI.ShowErrorMessage(Strings.FailedToGetSelectedUserOrOrganizationMsg);
                return null;
            }
            return userOrOrgItem;
        } else {
            return null;
        }
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
            VsCodeUI.ShowErrorMessage(Strings.FailedToCreateAppInAppCenter);
            return false;
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

        VsCodeUI.ShowInfoMessage(Strings.AppCreatedMsg(apps[0].appName, false, apps[1].appName), ...messageItems);

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
        const selected: QuickPickAppItem = await VsCodeUI.showQuickPick(options, Strings.ChooseAppToBeSet);
        if (selected) {
            await this.setCurrentApp(apps[+selected.target]);
            const messageItems: IButtonMessageItem[] = [];
            const appUrl = AppCenterUrlBuilder.GetAppCenterAppLink(this.userOrOrg.name, apps[+selected.target].appName, this.userOrOrg.isOrganization);
            messageItems.push({
                title: Strings.AppCreatedBtnLabel,
                url: appUrl
            });
            return VsCodeUI.ShowInfoMessage(Strings.AppCreatedMsg(apps[+selected.target].appName), ...messageItems);
        } else {
            return false;
        }
    }

}
