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
import { CustomQuickPickItem, VsCodeUI, IButtonMessageItem } from "../ui/vscodeUI";
import { LogStrings } from "../resources/logStrings";
import { Messages } from "../resources/messages";

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
        this.logger.debug(LogStrings.GettingUserOrOrg);
        const orgList: models.ListOKResponseItem[] = await VsCodeUI.showProgress(async progress => {
            progress.report({ message: Messages.LoadingStatusBarProgressMessage });
            const orgList: models.ListOKResponseItem[] = await this.client.organizations.list();
            const organizations: models.ListOKResponseItem[] = orgList;
            return organizations.sort(sortOrganizations);
        });
        const myself: Profile | null = await this.appCenterProfile;
        items = Menu.getQuickPickItemsForOrgList(orgList, myself);
        return items;
    }

    protected async appAlreadyExistInAppCenter(projectName: string): Promise<boolean> {
        let exist: boolean = false;
        this.logger.debug(LogStrings.CheckingProjectName(projectName));
        await VsCodeUI.showProgress(async progress => {
            progress.report({ message: Messages.CheckIfAppsExistProgressMessage });
            let apps: models.AppResponse[];
            apps = await this.client.apps.list();
            exist = apps.some(item => {
                return (item.name === AppCenterAppBuilder.getiOSAppName(projectName) || item.name === AppCenterAppBuilder.getAndroidAppName(projectName));
            });
        });
        return exist;
    }

    protected async getIdeaName(appNameFromPackage: string = ""): Promise<string | null> {
        const projectName = await VsCodeUI.showInput(Strings.PleaseEnterIdeaNameHint, appNameFromPackage);
        if (projectName.length === 0) {
            VsCodeUI.ShowWarningMessage(Messages.IdeaNameIsNotValidWarning);
            return null;
        }

        if (!projectName) {
            return "";
        }

        if (!Validators.ValidateProjectName(projectName)) {
            VsCodeUI.ShowErrorMessage(Messages.IdeaNameIsNotValidWarning);
            return null;
        }

        if (await this.appAlreadyExistInAppCenter(projectName)) {
            VsCodeUI.ShowWarningMessage(Messages.AppAlreadyExistInAppCenterWarning);
            return null;
        }
        return projectName;
    }

    protected async getOrg(): Promise<UserOrOrganizationItem | null> {
        const userOrOrgQuickPickItems: CustomQuickPickItem[] = await this.getUserOrOrganizationItems();
        const selectedQuickPickItem: CustomQuickPickItem = await VsCodeUI.showQuickPick(userOrOrgQuickPickItems, Strings.PleaseSelectCurrentAppOrgHint);
        if (selectedQuickPickItem) {
            const userOrOrgItem: UserOrOrganizationItem | null = Menu.getSelectedUserOrOrgItem(selectedQuickPickItem, userOrOrgQuickPickItems);
            if (!userOrOrgItem) {
                VsCodeUI.ShowErrorMessage(Messages.FailedToGetSelectedUserOrOrganizationMsg);
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
            VsCodeUI.ShowErrorMessage(Messages.FailedToCreateAppInAppCenter);
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

        VsCodeUI.ShowInfoMessage(Messages.AppCreatedMessage(apps[0].appName, false, apps[1].appName), ...messageItems);

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
        const selected: QuickPickAppItem = await VsCodeUI.showQuickPick(options, Strings.ChooseAppToBeSetHint);
        if (selected) {
            await this.setCurrentApp(apps[+selected.target]);
            const messageItems: IButtonMessageItem[] = [];
            const appUrl = AppCenterUrlBuilder.GetAppCenterAppLink(this.userOrOrg.name, apps[+selected.target].appName, this.userOrOrg.isOrganization);
            messageItems.push({
                title: Strings.AppCreatedBtnLabel,
                url: appUrl
            });
            return VsCodeUI.ShowInfoMessage(Messages.AppCreatedMessage(apps[+selected.target].appName), ...messageItems);
        } else {
            return false;
        }
    }

}
