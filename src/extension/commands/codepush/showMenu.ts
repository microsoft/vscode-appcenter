import { CommandParams, CurrentApp } from "../../../helpers/interfaces";
import { CodePushMenu } from "../../menu/codePushMenu";
import { RNCPAppCommand } from './rncpAppCommand';

/* Internal command */
export default class ShowMenu extends RNCPAppCommand {

    constructor(params: CommandParams, private _app: CurrentApp = null) {
        super(params);
        this.checkForCodePush = false;
    }

    public async run(): Promise<boolean | void> {
        if (!await super.run()) {
            return false;
        }

        const notCurrentApp: boolean = !!this._app;
        if (!this._app) {
            const currentApp: CurrentApp | null = await this.getCurrentApp(true);
            if (!currentApp) {
                return false;
            }
            this._app = currentApp;
        }
        return new CodePushMenu(this._app, this._params, notCurrentApp).show();
    }
}
