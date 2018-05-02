import { AppCenterProfile } from '../../helpers/interfaces';
import { GeneralMenu } from '../../menu/generalMenu';
import { Command } from './command';

export default class ShowMenu extends Command {

    public async runNoClient(): Promise<void> {
        super.runNoClient();

        return this.appCenterProfile.then((profile: AppCenterProfile | null) => {
            return new GeneralMenu(profile, this.rootPath, this.logger, this._params).show();
        });
    }
}
