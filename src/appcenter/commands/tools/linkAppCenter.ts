import { Command } from '../command';

export default class LinkAppCenter extends Command {

    public async run(): Promise<void> {
        if (!await super.run()) {
            return;
        }
    }
}
