import * as CodePush from "../appcenter/commands/codepush";
import BaseCommandHandler from "./baseCommandHandler";

export default class CodePushCommandHandler extends BaseCommandHandler {
    public async ShowMenu(): Promise<void> {
        await new CodePush.ShowMenu(this.getCommandParams()).runNoClient();
    }

    public async SetCurrentDeployment(): Promise<void> {
        await new CodePush.SetCurrentDeployment(this.getCommandParams()).runNoClient();
    }

    public async ReleaseReact(): Promise<void> {
        await new CodePush.ReleaseReact(this.getCommandParams()).run();
    }

    public async SwitchMandatoryPropForRelease(): Promise<void> {
        await new CodePush.SwitchMandatoryPropForRelease(this.getCommandParams()).runNoClient();
    }

    public async SetTargetBinaryVersion(): Promise<void> {
        await new CodePush.SetTargetBinaryVersion(this.getCommandParams()).runNoClient();
    }
}
