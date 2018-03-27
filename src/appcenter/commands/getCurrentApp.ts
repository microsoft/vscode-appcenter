import { ExtensionManager } from "../../extensionManager";
import { CurrentApp } from "../../helpers/interfaces";
import { Strings } from "../../helpers/strings";
import { VsCodeUtils } from "../../helpers/vsCodeUtils";
import { ILogger } from "../../log/logHelper";
import { ReactNativeAppCommand } from './reactNativeAppCommand';

export default class GetCurrentApp extends ReactNativeAppCommand {

    constructor(manager: ExtensionManager, logger: ILogger) {
        super(manager, logger);
    }

    public async runNoClient(): Promise<void> {
        if (!await super.runNoClient()) {
            return;
        }

        return this.getCurrentApp().then((app: CurrentApp | null) => {
            if (app) {
                VsCodeUtils.ShowInfoMessage(Strings.YourCurrentAppMsg(app.identifier));
            } else {
                VsCodeUtils.ShowInfoMessage(Strings.NoCurrentAppSetMsg);
            }
        });
    }
}
