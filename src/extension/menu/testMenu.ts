import { CommandParams, MenuQuickPickItem } from "../../helpers/interfaces";
import * as Test from "../commands/test";
import { CommandNames } from "../resources/constants";
import { Menu, MenuItems } from "./menu";

export class TestMenu extends Menu {

    constructor(params: CommandParams) {
        super(params);
    }

    protected getMenuItems(): MenuQuickPickItem[] {
        const menuItems: MenuQuickPickItem[] = [];
        menuItems.push(MenuItems.RunUITests);
        menuItems.push(MenuItems.RunUITestsAsync);
        menuItems.push(MenuItems.ViewTestResults);
        return menuItems;
    }

    protected handleMenuSelection(menuItem: MenuQuickPickItem): Promise<void> {
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
