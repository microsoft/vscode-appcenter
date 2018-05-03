import { CommandParams } from "../../../helpers/interfaces";
import { Command } from "../command";
import Login from "../general/login";

export default class LoginToAnotherAccount extends Command {
    public async run(): Promise<boolean | void> {
        if (!await super.run()) {
            return false;
        }
        const params: CommandParams = {
            manager: this.manager,
            appCenterAuth: this.appCenterAuth,
            vstsAuth: this.vstsAuth
        };
        return await new Login(params).runNoClient();
    }
}
