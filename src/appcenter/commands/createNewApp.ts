import AppCenterAppBuilder from "../../appCenterAppBuilder";
import { Constants } from "../../constants";
import { AppCenterUrlBuilder } from "../../helpers/appCenterUrlBuilder";
import { CommandParams, CreatedAppFromAppCenter, UserOrOrganizationItem } from '../../helpers/interfaces';
import { Utils } from "../../helpers/utils";
import { IButtonMessageItem, VsCodeUtils } from '../../helpers/vsCodeUtils';
import { Strings } from '../../strings';
import { CreateAppCommand } from "./createAppCommand";

export enum CreateNewAppOption {
    Android,
    IOS,
    Both
}

export class CreateNewApp extends CreateAppCommand {

    private userOrOrg: UserOrOrganizationItem;

    constructor(params: CommandParams, private _option: CreateNewAppOption = CreateNewAppOption.Both) {
        super(params);
    }

    public async run(): Promise<boolean | void> {
        if (!await super.run()) {
            return false;
        }

        const appNameFromPackage = Utils.parseJsonFile(this.rootPath + "/package.json", "").name;

        let ideaName: string | null = null;
        while (ideaName == null) {
            ideaName = await this.getIdeaName(appNameFromPackage);
        }

        if (ideaName.length === 0) {
            return;
        }

        this.userOrOrg = await this.getOrg();
        if (this.userOrOrg == null) {
            return;
        }

        const appCenterAppBuilder = new AppCenterAppBuilder(ideaName, this.userOrOrg, "", this.client, this.logger);
        await appCenterAppBuilder.createApps(this._option);
        const createdApps: CreatedAppFromAppCenter[] = appCenterAppBuilder.getCreatedApps();
        if (!createdApps) {
            return;
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
