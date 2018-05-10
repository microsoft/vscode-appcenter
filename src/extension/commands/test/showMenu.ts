import { CommandParams, CurrentApp } from "../../../helpers/interfaces";
import { TestMenu } from "../../menu/testMenu";
import { ReactNativeAppCommand } from '../reactNativeAppCommand';

export default class ShowMenu extends ReactNativeAppCommand {
    constructor(params: CommandParams, private _app: CurrentApp = null) {
        super(params);
    }

    public async runNoClient(): Promise<boolean | void> {
        if (!await super.runNoClient()) {
            return false;
        }
        if (!this._app) {
            const currentApp: CurrentApp | null = await this.getCurrentApp();
            if (!currentApp) {
                return false;
            }
            this._app = currentApp;
        }
        return new TestMenu(this._params, this._app).show();
    }
}
