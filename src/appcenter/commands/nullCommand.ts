import { CommandParams } from "../../helpers/interfaces";
import { Command } from "./command";

// For testing, command that do literally nothing
export default class NullCommand extends Command {

    constructor(params: CommandParams) {
        super(params);
    }

    public async runNoClient(): Promise<void> {
        super.runNoClient();
        this.logger.info("Null cmd executed!");
    }
}
