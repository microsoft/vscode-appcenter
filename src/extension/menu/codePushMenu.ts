import { AppCenterUrlBuilder } from "../../helpers/appCenterUrlBuilder";
import { CommandParams, CurrentApp, MenuQuickPickItem } from "../../helpers/interfaces";
import { Utils } from "../../helpers/utils/utils";
import * as CodePush from "../commands/codepush";
import { AppCenterDistributionTabs, CommandNames } from "../resources/constants";
import { Menu, MenuItems } from "./menu";

export class CodePushMenu extends Menu {

    constructor(private currentApp: CurrentApp, params: CommandParams, private notCurrentApp: boolean = false) {
        super(params);
    }

    private hasCodePushDeployments(): boolean {
        return this.currentApp.currentAppDeployments && this.currentApp.currentAppDeployments.codePushDeployments && this.currentApp.currentAppDeployments.codePushDeployments.length > 0;
    }

    protected getMenuItems(): MenuQuickPickItem[] {
        const menuItems: MenuQuickPickItem[] = [];

        menuItems.push(MenuItems.LinkCodePush);

        if (this.currentApp) {
            menuItems.push(MenuItems.OpenCodePush);

            if (this.hasCodePushDeployments() && this.isCodePushProject()) {
                menuItems.push(MenuItems.ReleaseReact(this.currentApp));
                if (!this.notCurrentApp) {
                    menuItems.push(MenuItems.SetCurrentDeployment(this.currentApp));
                    menuItems.push(MenuItems.SetTargetBinaryVersion(this.currentApp));
                    menuItems.push(MenuItems.SwitchMandatory(this.currentApp));
                }
            }
        }
        return menuItems;
    }

    protected handleMenuSelection(menuItem: MenuQuickPickItem): Promise<void> {
        switch (menuItem.command) {
            case (CommandNames.CodePush.SetCurrentDeployment):
                new CodePush.SetCurrentDeployment(this._params).run();
                break;

            case (CommandNames.CodePush.ReleaseReact):
                new CodePush.ReleaseReact(this._params, this.currentApp).run();
                break;

            case (CommandNames.CodePush.SetTargetBinaryVersion):
                new CodePush.SetTargetBinaryVersion(this._params).run();
                break;

            case (CommandNames.CodePush.SwitchMandatoryPropForRelease):
                new CodePush.SwitchMandatoryPropForRelease(this._params).run();
                break;

            case (CommandNames.CodePush.LinkCodePush):
                new CodePush.LinkCodePush(this._params, this.currentApp).run();
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
