import { Command } from "../command";

export default class SwitchVstsAccount extends Command {
    public async runNoClient(): Promise<boolean | void> {
        if (!await super.runNoClient()) {
            return false;
        }

        return true;

        //todo implement
    }
}
