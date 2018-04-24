import { Command } from '../command';

export default class LinkCodePush extends Command {

    public async run(): Promise<void> {
        if (!await super.run()) {
            return;
        }
    }
}
