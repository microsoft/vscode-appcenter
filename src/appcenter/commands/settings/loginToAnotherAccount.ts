import { Command } from "../command";

export default class LoginToAnotherAccount extends Command {
    public async run(): Promise<boolean | void> {
        if (!await super.run()) {
            return false;
        }

        return true;

        //todo implement
    }
}
