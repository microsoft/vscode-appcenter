import * as Test from "../commands/test";
import BaseCommandHandler from "./baseCommandHandler";

export default class TestCommandHandler extends BaseCommandHandler {
    public async showMenu(): Promise<void> {
        await new Test.ShowMenu(this.getCommandParams()).runNoClient();
    }

    public async runUITests(): Promise<void> {
        const cmd = new Test.RunUITests(this.getCommandParams());
        cmd.runAsynchronously = false;
        await cmd.run();
    }

    public async runUITestsAsync(): Promise<void> {
        const cmd = new Test.RunUITests(this.getCommandParams());
        cmd.runAsynchronously = true;
        await cmd.run();
    }

    public async viewResults(): Promise<void> {
        await new Test.ViewResults(this.getCommandParams()).runNoClient();
    }
}
