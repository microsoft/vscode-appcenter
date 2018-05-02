import AppCenterPortalMenu from "../appcenter/commands/appCenterPortalMenu";
import GetCurrentApp from "../appcenter/commands/getCurrentApp";
import LinkAppCenter from "../appcenter/commands/linkAppCenter";
import Login from "../appcenter/commands/login";
import SetCurrentApp from "../appcenter/commands/setCurrentApp";
import ShowMenu from "../appcenter/commands/showMenu";
import SimulateCrashes from "../appcenter/commands/simulateCrashes";
import Start from "../appcenter/commands/start";
import WhoAmI from "../appcenter/commands/whoami";
import BaseCommandHandler from "./baseCommandHandler";

export default class AppCenterCommandHandler extends BaseCommandHandler {
    public async AppCenterPortalMenu(): Promise<void> {
        await new AppCenterPortalMenu(this.getCommandParams()).run();
    }

    public async WhoAmI(): Promise<void> {
        await new WhoAmI(this.getCommandParams()).runNoClient();
    }

    public async Login(): Promise<void> {
        await new Login(this.getCommandParams()).runNoClient();
    }

    public async ShowMenu(): Promise<void> {
        await new ShowMenu(this.getCommandParams()).runNoClient();
    }

    public async Start(): Promise<void> {
        await new Start(this.getCommandParams()).run();
    }

    public async GetCurrentApp(): Promise<void> {
        await new GetCurrentApp(this.getCommandParams()).runNoClient();
    }

    public async SetCurrentApp(): Promise<void> {
        await new SetCurrentApp(this.getCommandParams()).run();
    }

    public async SimulateCrashes(): Promise<void> {
        await new SimulateCrashes(this.getCommandParams()).run();
    }

    public async InstallSDK(): Promise<void> {
        await new LinkAppCenter(this.getCommandParams()).run();
    }
}
