import AppCenterAppBuilder from "../../../createApp/appCenterAppBuilder";
import { AppCenterUrlBuilder } from "../../../helpers/appCenterUrlBuilder";
import { CommandParams, CreatedAppFromAppCenter, QuickPickAppItem } from "../../../helpers/interfaces";
import { Utils } from "../../../helpers/utils/utils";
import { Strings } from "../../resources/strings";
import { CreateAppCommand } from "../createAppCommand";
import { CommandNames } from "../../resources/constants";
import * as Menu from "../../menu/menu";
import { VsCodeUI, IButtonMessageItem } from "../../ui/vscodeUI";
import { Messages } from "../../resources/messages";

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
            VsCodeUI.ShowWarningMessage(Messages.NotReactProjectWarning);
            return;
        }

        const appNameFromPackage = Utils.parseJsonFile(this.rootPath + "/package.json", "").name;

        let projectName: string | null = null;

        // projectName is null if user has entered invalid name. We will give him a chance to correct it instead of
        // forcing to do the process again.
        while (projectName == null) {
            projectName = await this.getProjectName(option, appNameFromPackage, false); // Just creating an AppCenter app here - no need to treat it like a new project.
        }
        // Length is 0 if user cancelled prompt.
        if (projectName.length === 0) {
            return;
        }

        this.userOrOrg = await this.getOrg();
        if (this.userOrOrg == null) {
            return;
        }

        const appCenterAppBuilder = new AppCenterAppBuilder(projectName, this.userOrOrg, "", this.client, this.logger);
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

        const selected: QuickPickAppItem = await VsCodeUI.showQuickPick(appCenterPortalTabOptions, Strings.CreateAppHint);

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
            VsCodeUI.ShowErrorMessage(Messages.FailedToCreateAppInAppCenter);
            return;
        }
        await this.setCurrentApp(apps[0]);
        const messageItems: IButtonMessageItem[] = [];
        const appUrl = AppCenterUrlBuilder.GetAppCenterAppLink(this.userOrOrg.name, apps[0].appName, this.userOrOrg.isOrganization);
        messageItems.push({
            title: Strings.AppCreatedBtnLabel,
            url: appUrl
        });
        VsCodeUI.ShowInfoMessage(Messages.AppCreatedMessage(apps[0].appName, true), ...messageItems);
    }
}
