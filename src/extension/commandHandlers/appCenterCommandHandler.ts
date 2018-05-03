import * as General from "../commands/general";
import BaseCommandHandler from "./baseCommandHandler";

export default class AppCenterCommandHandler extends BaseCommandHandler {
    public async AppCenterPortalMenu(): Promise<void> {
        await new General.AppCenterPortal(this.getCommandParams()).run();
    }

    public async WhoAmI(): Promise<void> {
        await new General.WhoAmI(this.getCommandParams()).runNoClient();
    }

    public async Login(): Promise<void> {
        await new General.Login(this.getCommandParams()).runNoClient();
    }

    public async ShowMenu(): Promise<void> {
        await new General.ShowMenu(this.getCommandParams()).runNoClient();
    }

    public async Start(): Promise<void> {
        await new General.Start(this.getCommandParams()).run();
    }

    public async GetCurrentApp(): Promise<void> {
        await new General.GetCurrentApp(this.getCommandParams()).runNoClient();
    }

    public async SetCurrentApp(): Promise<void> {
        await new General.SetCurrentApp(this.getCommandParams()).run();
    }

    public async SimulateCrashes(): Promise<void> {
        await new General.SimulateCrashes(this.getCommandParams()).run();
    }

    public async InstallSDK(): Promise<void> {
        await new General.LinkAppCenter(this.getCommandParams()).run();
    }

    public async CreateNewApp(): Promise<void> {
        await new General.CreateNewApp(this.getCommandParams()).run();
    }
}
