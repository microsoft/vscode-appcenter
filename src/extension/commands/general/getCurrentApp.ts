import { CommandParams, CurrentApp } from "../../../helpers/interfaces";
import { Strings } from "../../resources/strings";
import { ReactNativeAppCommand } from "../reactNativeAppCommand";
import { VsCodeUI } from "../../ui/vscodeUI";

export default class GetCurrentApp extends ReactNativeAppCommand {

    constructor(params: CommandParams) {
        super(params);
    }

    public async runNoClient(): Promise<void> {
        if (!await super.runNoClient()) {
            return;
        }

        return this.getCurrentApp().then((app: CurrentApp | null) => {
            if (app) {
                VsCodeUI.ShowInfoMessage(Strings.YourCurrentAppMsg(app.identifier));
            } else {
                VsCodeUI.ShowInfoMessage(Strings.NoCurrentAppSetMsg);
            }
        });
    }
}
