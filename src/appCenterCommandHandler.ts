import Login from "./appcenter/commands/login";
import Logout from "./appcenter/commands/logout";
import ShowMenu from "./appcenter/commands/showMenu";
import Start from "./appcenter/commands/start";
import WhoAmI from "./appcenter/commands/whoami";
import { ExtensionManager } from "./extensionManager";
import { ConsoleLogger } from "./log/consoleLogger";
import { ILogger } from "./log/logHelper";

"use strict";

export class AppCenterCommandHandler {

    constructor(private manager: ExtensionManager, private logger: ILogger = new ConsoleLogger()) {}

    public async WhoAmI(): Promise<void> {
        await new WhoAmI(this.manager, this.logger).runNoClient();
    }

    public async Login(): Promise<void> {
        await new Login(this.manager, this.logger).runNoClient();
    }

    public async Logout(): Promise<void> {
        await new Logout(this.manager, this.logger).runNoClient();
    }

    public async ShowMenu(): Promise<void> {
        await new ShowMenu(this.manager, this.logger).runNoClient();
    }

    public async Start(): Promise<void> {
        await new Start(this.manager, this.logger).run();
    }
}
