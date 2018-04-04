import { ExtensionManager } from "../extensionManager";
import { ILogger } from "../log/logHelper";
import { ConsoleLogger } from "../log/consoleLogger";
import * as CodePush from "../appcenter/commands/codepush";

export default class CodePushCommandHandler {

    constructor(private manager: ExtensionManager, private logger: ILogger = new ConsoleLogger()) { }

    public async ShowMenu(): Promise<void> {
        await new CodePush.ShowMenu(this.manager, this.logger).runNoClient();
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
        await new CodePush.SetTargetBinaryVersion(this.manager, this.logger).runNoClient();
    }
}
