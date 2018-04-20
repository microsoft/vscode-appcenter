import * as os from 'os';
import * as vscode from 'vscode';
import * as Test from '.';
import { CommandNames } from "../../../constants";
import { CommandParams, CurrentApp } from "../../../helpers/interfaces";
import { CustomQuickPickItem } from "../../../helpers/vsCodeUtils";
import { Strings } from "../../../strings";
import { ReactNativeAppCommand } from '../reactNativeAppCommand';

export default class ShowMenu extends ReactNativeAppCommand {
    private _params: CommandParams;
    constructor(params: CommandParams) {
        super(params);
        this._params = params;
    }

    public async runNoClient(): Promise<boolean | void> {
        if (!await super.runNoClient()) {
            return false;
        }

        const currentApp: CurrentApp | null = await this.getCurrentApp();
        if (!currentApp) {
            return false;
        }

        const menuOptions: CustomQuickPickItem[] = [];
        // For now running tests supported only for iOS platform
        if (os.platform() === 'darwin') {
            menuOptions.push(<CustomQuickPickItem>{
                label: Strings.RunUITestsMenuLabel,
                description: "",
                target: CommandNames.Test.RunUITests
            });
            menuOptions.push(<CustomQuickPickItem>{
                label: Strings.RunUITestsAsyncMenuLabel,
                description: "",
                target: CommandNames.Test.RunUITestsAsync
            });
        }
        menuOptions.push(<CustomQuickPickItem>{
            label: Strings.ViewUITestResultOnPortalenuLabel,
            description: "",
            target: CommandNames.Test.ViewResults
        });

        return this.showQuickPick(menuOptions);
    }

    private async showQuickPick(menuOptions: CustomQuickPickItem[]): Promise<void> {
        const selected: CustomQuickPickItem = await vscode.window.showQuickPick(menuOptions, { placeHolder: Strings.MenuTitlePlaceholder });
        if (!selected) {
            return;
        }

        switch (selected.target) {
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
    }
}
