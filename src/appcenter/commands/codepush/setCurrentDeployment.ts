import { ExtensionManager } from "../../../extensionManager";
import { ILogger } from "../../../log/logHelper";
import { Command } from "../command";

export default class SetCurrentDeployment extends Command {
    constructor(manager: ExtensionManager, logger: ILogger) {
        super(manager, logger);
    }
}
