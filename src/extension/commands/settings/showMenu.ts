import { CommandParams } from "../../../helpers/interfaces";
import { SettingsMenu } from "../../menu/settingsMenu";
import { Command } from '../command';

/* Internal command */
export default class ShowMenu extends Command {

    private _params: CommandParams;
    constructor(params: CommandParams) {
        super(params);
        this._params = params;
    }

    public async run(): Promise<boolean | void> {
        if (!await super.run()) {
            return false;
        }

        const profiles = await this.appCenterAuth.getProfiles();
        const vstsProfiles = await this.vstsAuth.getProfiles();
        return new SettingsMenu(profiles.length, vstsProfiles.length, this._params).show();
    }
}
