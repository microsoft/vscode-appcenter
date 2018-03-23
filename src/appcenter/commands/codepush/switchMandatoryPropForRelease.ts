import { ExtensionManager } from "../../../extensionManager";
import { ILogger } from "../../../log/logHelper";
import { Command } from "../command";

export default class SwitchMandatoryPropForRelease extends Command {
    constructor(manager: ExtensionManager, logger: ILogger) {
        super(manager, logger);
    }
}
