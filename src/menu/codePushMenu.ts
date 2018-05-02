import * as CodePush from "../appcenter/commands/codepush";
import { AppCenterDistributionTabs, CommandNames } from "../constants";
import { AppCenterUrlBuilder } from "../helpers/appCenterUrlBuilder";
import { CommandParams, CurrentApp, MenuItem } from "../helpers/interfaces";
import { Utils } from "../helpers/utils";
import { ILogger } from "../log/logHelper";
import { Menu, MenuItems } from "./menu";

export class CodePushMenu extends Menu {

    constructor(private currentApp: CurrentApp, rootPath: string, logger: ILogger, params: CommandParams) {
        super(rootPath, logger, params);
    }

    private hasCodePushDeployments(): boolean {
        return this.currentApp.currentAppDeployments && this.currentApp.currentAppDeployments.codePushDeployments && this.currentApp.currentAppDeployments.codePushDeployments.length > 0;
    }

    protected getMenuItems(): MenuItem[] {
        const menuItems: MenuItem[] = [];

        menuItems.push(MenuItems.LinkCodePush);

        if (this.currentApp) {
            menuItems.push(MenuItems.OpenCodePush);

            if (this.hasCodePushDeployments()) {
                menuItems.push(MenuItems.ReleaseReact(this.currentApp));
                menuItems.push(MenuItems.SetCurrentDeployment(this.currentApp));
                menuItems.push(MenuItems.SetTargetBinaryVersion(this.currentApp));
                menuItems.push(MenuItems.SwitchMandatory(this.currentApp));
            }
        }
        return menuItems;
    }

    protected handleMenuSelection(menuItem: MenuItem): Promise<void> {
        switch (menuItem.command) {
            case (CommandNames.CodePush.SetCurrentDeployment):
                new CodePush.SetCurrentDeployment(this._params).run();
                break;

            case (CommandNames.CodePush.ReleaseReact):
                new CodePush.ReleaseReact(this._params).run();
                break;

            case (CommandNames.CodePush.SetTargetBinaryVersion):
                new CodePush.SetTargetBinaryVersion(this._params).run();
                break;

            case (CommandNames.CodePush.SwitchMandatoryPropForRelease):
                new CodePush.SwitchMandatoryPropForRelease(this._params).run();
                break;

            case (CommandNames.CodePush.LinkCodePush):
                new CodePush.LinkCodePush(this._params).run();
                break;

            case (AppCenterDistributionTabs.CodePush):
                Utils.OpenUrl(AppCenterUrlBuilder.GetAppCenterDistributeTabLinkByTabName(this.currentApp.ownerName, this.currentApp.appName, AppCenterDistributionTabs.CodePush, this.currentApp.type !== "user"));
                break;

            default:
                // Ideally shouldn't be there :)
                this.logger.error("Unknown App Center menu command");
                break;
        }
        return void 0;
    }
}
