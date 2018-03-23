import Login from "./appcenter/commands/login";
import Logout from "./appcenter/commands/logout";
import ShowMenu from "./appcenter/commands/showMenu";
import Start from "./appcenter/commands/start";
import WhoAmI from "./appcenter/commands/whoami";
import GetCurrentApp from "./appcenter/commands/getCurrentApp";
import SetCurrentApp from "./appcenter/commands/setCurrentApp";
import * as CodePush from "./appcenter/commands/codepush";
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

    public async GetCurrentApp(): Promise<void> {
        await new GetCurrentApp(this.manager, this.logger).runNoClient();
    }

    public async SetCurrentApp(): Promise<void> {
        await new SetCurrentApp(this.manager, this.logger).run();
    }

    public async SetCurrentDeployment(): Promise<void> {
        await new CodePush.SetCurrentDeployment(this.manager, this.logger).runNoClient();
    }

    public async ReleaseReact(): Promise<void> {
        await new CodePush.ReleaseReact(this.manager, this.logger).run();
    }

    public async SwitchMandatoryPropForRelease(): Promise<void> {
        await new CodePush.SwitchMandatoryPropForRelease(this.manager, this.logger).runNoClient();
    }
    
    public async SetTargetBinaryVersion(): Promise<void> {
        await new CodePush.SetTargetBinaryVersion(this.manager, this.logger).run();
    }
}
