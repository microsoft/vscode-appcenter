import { CommandParams, CurrentApp } from "../../../helpers/interfaces";
import { ReactNativeAppCommand } from "../reactNativeAppCommand";
import { VsCodeUI } from "../../ui/vscodeUI";
import { Messages } from "../../resources/messages";

export default class GetCurrentApp extends ReactNativeAppCommand {

    constructor(params: CommandParams) {
        super(params);
        this.checkForReact = false;
    }

    public async runNoClient(): Promise<void> {
        if (!await super.runNoClient()) {
            return;
        }

        const app: CurrentApp | null = await this.getCurrentApp();
        if (app) {
            VsCodeUI.ShowInfoMessage(Messages.YourCurrentAppMessage(app.identifier));
        } else {
            VsCodeUI.ShowWarningMessage(Messages.NoCurrentAppSetWarning);
        }
    }
}
