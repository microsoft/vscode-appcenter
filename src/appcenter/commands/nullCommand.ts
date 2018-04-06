import { ExtensionManager } from "../../extensionManager";
import { ILogger } from "../../log/logHelper";
import { Command } from "./command";

// For testing, command that do literally nothing
export default class NullCommand extends Command {

    constructor(manager: ExtensionManager, logger: ILogger) {
        super(manager, logger);
    }

    public async runNoClient(): Promise<void> {
        super.runNoClient();
        this.logger.info("Null cmd executed!");
    }
}
