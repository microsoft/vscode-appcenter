import { ExtensionManager } from "../extensionManager";
import { ILogger } from "../log/logHelper";
import { ConsoleLogger } from "../log/consoleLogger";
import * as Settings from "../appcenter/commands/settings";

export default class SettingsCommandHandler {

    constructor(private manager: ExtensionManager, private logger: ILogger = new ConsoleLogger()) { }

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
