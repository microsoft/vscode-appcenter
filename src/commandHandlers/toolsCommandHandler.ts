import * as Tools from "../appcenter/commands/tools";
import BaseCommandHandler from "./baseCommandHandler";

export default class TolsCommandHandler extends BaseCommandHandler {
    public async showMenu(): Promise<void> {
        await new Tools.ShowTools(this.getCommandParams()).runNoClient();
    }

    public async simulateCrashes(): Promise<void> {
        const cmd = new Tools.SimulateCrashes(this.getCommandParams());
        await cmd.run();
    }
}
