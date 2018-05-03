import { CommandParams, CurrentApp } from "../../../helpers/interfaces";
import { TestMenu } from "../../menu/testMenu";
import { ReactNativeAppCommand } from '../reactNativeAppCommand';

export default class ShowMenu extends ReactNativeAppCommand {
    constructor(params: CommandParams) {
        super(params);
    }

    public async runNoClient(): Promise<boolean | void> {
        if (!await super.runNoClient()) {
            return false;
        }
        const currentApp: CurrentApp | null = await this.getCurrentApp();
        if (!currentApp) {
            return false;
        }
        return new TestMenu(currentApp.os, this._params).show();
    }
}
