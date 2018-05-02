import * as Test from "../appcenter/commands/test";
import { AppCenterOS, CommandNames } from "../constants";
import { CommandParams, MenuItem } from "../helpers/interfaces";
import { ILogger } from "../log/logHelper";
import { Menu, MenuItems } from "./menu";

export class TestMenu extends Menu {

    constructor(private appOS: string, rootPath: string, logger: ILogger, params: CommandParams) {
        super(rootPath, logger, params);
    }

    protected getMenuItems(): MenuItem[] {
        const menuItems: MenuItem[] = [];
        // For now running tests supported only for iOS platform
        if (this.appOS.toLowerCase() === AppCenterOS.iOS.toLowerCase()) {
            menuItems.push(MenuItems.RunUITests);
            menuItems.push(MenuItems.RunUITestsAsync);
        }
        menuItems.push(MenuItems.ViewTestResults);
        return menuItems;
    }

    protected handleMenuSelection(menuItem: MenuItem): Promise<void> {
        switch (menuItem.command) {
            case (CommandNames.Test.RunUITests):
                const runUiTests = new Test.RunUITests(this._params);
                runUiTests.runAsynchronously = false;
                runUiTests.run();
                break;
            case (CommandNames.Test.RunUITestsAsync):
                const runUiTestsAsync = new Test.RunUITests(this._params);
                runUiTestsAsync.runAsynchronously = true;
                runUiTestsAsync.run();
                break;
            case (CommandNames.Test.ViewResults):
                new Test.ViewResults(this._params).runNoClient();
                break;
            default:
                // Ideally shouldn't be there :)
                this.logger.error("Unknown AppCenter menu command");
                break;
        }
        return void 0;
    }
}
