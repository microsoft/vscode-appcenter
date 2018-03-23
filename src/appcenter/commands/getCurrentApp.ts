import { Command } from "./command";
import { ExtensionManager } from "../../extensionManager";
import { ILogger } from "../../log/logHelper";
import { DefaultApp } from "../../helpers/interfaces";
import { VsCodeUtils } from "../../helpers/vsCodeUtils";
import { Strings } from "../../helpers/strings";

export default class GetCurrentApp extends Command {

    constructor(manager: ExtensionManager, logger: ILogger) {
        super(manager, logger);
    }

    public async runNoClient(): Promise<void> {
        if (!await super.runNoClient()) {
            return;
        }

        return this.getDefaultApp().then((app: DefaultApp | null) => {
            if (app) {
                VsCodeUtils.ShowInfoMessage(Strings.YourCurrentAppMsg(app.identifier));
            } else {
                VsCodeUtils.ShowInfoMessage(Strings.NoCurrentAppSetMsg);
            }
        });
    }
}