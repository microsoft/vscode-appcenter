import AppCenterPortalMenu from "../appcenter/commands/appCenterPortalMenu";
import GetCurrentApp from "../appcenter/commands/getCurrentApp";
import Login from "../appcenter/commands/login";
import SetCurrentApp from "../appcenter/commands/setCurrentApp";
import ShowMenu from "../appcenter/commands/showMenu";
import Start from "../appcenter/commands/start";
import WhoAmI from "../appcenter/commands/whoami";
import { ExtensionManager } from "../extensionManager";
import { ConsoleLogger } from "../log/consoleLogger";
import { ILogger } from "../log/logHelper";

export default class AppCenterCommandHandler {

    constructor(private manager: ExtensionManager, private logger: ILogger = new ConsoleLogger()) { }

    public async AppCenterPortalMenu(): Promise<void> {
        await new AppCenterPortalMenu(this.manager, this.logger).run();
    }

    public async WhoAmI(): Promise<void> {
        await new WhoAmI(this.manager, this.logger).runNoClient();
    }

    public async Login(): Promise<void> {
        await new Login(this.manager, this.logger).runNoClient();
    }

    public async ShowMenu(): Promise<void> {
        await new ShowMenu(this.manager, this.logger).runNoClient();
    }

    public async Start(): Promise<void> {
        await new Start(this.manager, this.logger).run();
    }

    public async GetCurrentApp(): Promise<void> {
        await new GetCurrentApp(this.manager, this.logger).runNoClient();
    }

    public async SetCurrentApp(): Promise<void> {
        await new SetCurrentApp(this.manager, this.logger).run();
    }
}
