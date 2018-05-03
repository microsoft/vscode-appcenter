import { AppCenterProfile, CommandParams } from "../../../helpers/interfaces";
import { GeneralMenu } from "../../menu/generalMenu";
import { Command } from "../command";

export default class ShowMenu extends Command {

    private _params: CommandParams;
    constructor(params: CommandParams) {
        super(params);
        this._params = params;
    }

    public async runNoClient(): Promise<void> {
        super.runNoClient();

        const profile: AppCenterProfile | null = await this.appCenterProfile;
        return new GeneralMenu(profile, this._params).show();
    }
}
