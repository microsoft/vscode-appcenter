import * as Settings from "../appcenter/commands/settings";
import { ExtensionManager } from "../extensionManager";
import { ConsoleLogger } from "../log/consoleLogger";
import { ILogger } from "../log/logHelper";

export default class SettingsCommandHandler {

    constructor(private manager: ExtensionManager, private logger: ILogger = new ConsoleLogger()) { }

    public async ShowMenu(): Promise<void> {
        await new Settings.ShowMenu(this.manager, this.logger).run();
    }

    public async LoginToAnotherAccount(): Promise<void> {
        await new Settings.LoginToAnotherAccount(this.manager, this.logger).run();
    }

    public async SwitchAccount(): Promise<void> {
        await new Settings.SwitchAccount(this.manager, this.logger).runNoClient();
    }

    public async Logout(): Promise<void> {
        await new Settings.Logout(this.manager, this.logger).runNoClient();
    }
}
