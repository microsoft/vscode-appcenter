import { Command } from "../command";
import Login from "../login";

export default class LoginToAnotherAccount extends Command {
    public async run(): Promise<boolean | void> {
        if (!await super.run()) {
            return false;
        }

        return await new Login(this.manager, this.logger).runNoClient();
    }
}
