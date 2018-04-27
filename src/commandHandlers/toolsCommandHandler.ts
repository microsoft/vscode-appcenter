import * as Tools from "../appcenter/commands/tools";
import BaseCommandHandler from "./baseCommandHandler";

export default class TolsCommandHandler extends BaseCommandHandler {
    public async showMenu(): Promise<void> {
        await new Tools.ShowMenu(this.getCommandParams()).runNoClient();
    }

    public async linkAppCenter(): Promise<void> {
        const cmd = new Tools.LinkAppCenter(this.getCommandParams());
        await cmd.run();
    }
}
