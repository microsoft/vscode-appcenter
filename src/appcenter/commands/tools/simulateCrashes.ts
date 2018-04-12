import { Command } from '../command';

export default class SimulateCrashes extends Command {

    public async runNoClient(): Promise<boolean | void> {
        if (!await super.runNoClient()) {
            return false;
        }
    }
}
