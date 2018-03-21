import { Command } from "./command";
import { ExtensionManager } from "../../extensionManager";
import { ILogger } from "../../log/logHelper";

export default class SetCurrentApp extends Command {

    constructor(manager: ExtensionManager, logger: ILogger) {
        super(manager, logger);
    }

    public async runNoClient(): Promise<void> {
        super.runNoClient();
    }
}