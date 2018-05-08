import * as vscode from "vscode";
import AppCenterAppBuilder from "../../../createApp/appCenterAppBuilder";
import { AppCenterUrlBuilder } from "../../../helpers/appCenterUrlBuilder";
import { CommandParams, CreatedAppFromAppCenter, QuickPickAppItem } from "../../../helpers/interfaces";
import { Utils } from "../../../helpers/utils/utils";
import { IButtonMessageItem, VsCodeUtils } from "../../../helpers/utils/vsCodeUtils";
import { Strings } from "../../resources/strings";
import { CreateAppCommand } from "../createAppCommand";
import { CommandNames } from "../../resources/constants";
import * as Menu from "../../menu/menu";

export enum CreateNewAppOption {
    Android,
    IOS,
    Both
}

export default class CreateNewApp extends CreateAppCommand {

    constructor(params: CommandParams) {
        super(params);
    }

    public async run(): Promise<boolean | void> {
        if (!await super.run()) {
            return false;
        }

        const option: CreateNewAppOption = await this.showCreateAppOptions();
        if (option === null) {
            return;
        }

        if (!Utils.isReactNativeProject(this.logger, this.rootPath, false)) {
            VsCodeUtils.ShowErrorMessage(Strings.NotReactProjectMsg);
            return;
        }

        const appNameFromPackage = Utils.parseJsonFile(this.rootPath + "/package.json", "").name;

        let ideaName: string | null = null;

        // ideaName is null if user has entered invalid name. We will give him a chance to correct it instead of
        // forcing to do the process again.
        while (ideaName == null) {
            ideaName = await this.getIdeaName(option, appNameFromPackage);
        }

        // Length is 0 if user cancelled prompt.
        if (ideaName.length === 0) {
            return;
        }

        this.userOrOrg = await this.getOrg();
        if (this.userOrOrg == null) {
            return;
        }

        const appCenterAppBuilder = new AppCenterAppBuilder(ideaName, this.userOrOrg, "", this.client, this.logger);
        await appCenterAppBuilder.createApps(option);
        const createdApps: CreatedAppFromAppCenter[] = appCenterAppBuilder.getCreatedApps();
        if (!createdApps) {
            return;
        }

        switch (option) {
            case CreateNewAppOption.IOS:
            case CreateNewAppOption.Android: {
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

    protected async showCreateAppOptions(): Promise<CreateNewAppOption> {
        const appCenterPortalTabOptions: QuickPickAppItem[] = Menu.getCreateAppOptions();

        const selected: QuickPickAppItem = await vscode.window.showQuickPick(appCenterPortalTabOptions, { placeHolder: Strings.CreateAppPlaceholder } );

        if (!selected) {
            this.logger.debug('User cancel selection of create app tab');
            return null;
        }

        switch (selected.target) {
            case (CommandNames.CreateApp.IOS):
                return CreateNewAppOption.IOS;
            case (CommandNames.CreateApp.Android):
                return CreateNewAppOption.Android;
            case (CommandNames.CreateApp.Both):
                return CreateNewAppOption.Both;
            default:
                // Ideally shouldn't be there :)
                this.logger.error("Unknown create app option");
                return null;
        }
    }

    private async appCreated(apps: CreatedAppFromAppCenter[]) {
        if (apps.length < 1) {
            VsCodeUtils.ShowErrorMessage(Strings.FailedToCreateAppInAppCenter);
            return;
        }
        await this.setCurrentApp(apps[0]);
        const messageItems: IButtonMessageItem[] = [];
        const appUrl = AppCenterUrlBuilder.GetAppCenterAppLink(this.userOrOrg.name, apps[0].appName, this.userOrOrg.isOrganization);
        messageItems.push({
            title: Strings.AppCreatedBtnLabel,
            url: appUrl
        });
        VsCodeUtils.ShowInfoMessage(Strings.AppCreatedMsg(apps[0].appName, true), ...messageItems);
    }
}
