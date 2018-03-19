import { ExtensionManager } from "../../extensionManager";
import { VsCodeUtils } from "../../helpers/vsCodeUtils";
import { ILogger } from "../../log/logHelper";
import { Command } from "./command";

export default class Start extends Command {

    constructor(manager: ExtensionManager, logger: ILogger) {
        super(manager, logger);
    }

    public async run(): Promise<void> {
        super.run();

        VsCodeUtils.ShowInfoMessage("Please start an idea HERE!");
        return Promise.resolve(void 0);
    }
}
