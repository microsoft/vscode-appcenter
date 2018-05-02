import { AppCenteAppType } from '../../../constants';
import { CommandParams, CurrentApp } from '../../../helpers/interfaces';
import { AppCenterPortalMenu } from '../../../menu/appCenterPortalMenu';
import { models } from '../../apis';
import { ReactNativeAppCommand } from '../reactNativeAppCommand';

/* Internal command */
export default class ShowMenu extends ReactNativeAppCommand {

    constructor(params: CommandParams, private selectedApp: models.AppResponse | undefined) {
        super(params);
    }

    public async run(): Promise<boolean | void> {
        if (!await super.run()) {
            return false;
        }

        let isOrg: boolean;
        let appName: string;
        let ownerName: string;

        if (this.selectedApp) {
            isOrg = this.selectedApp.owner.type.toLowerCase() === AppCenteAppType.Org.toLowerCase();
            appName = this.selectedApp.name;
            ownerName = this.selectedApp.owner.name;
        } else {
            const currentApp: CurrentApp | null = await this.getCurrentApp();
            if (currentApp) {
                isOrg = currentApp.type.toLowerCase() === AppCenteAppType.Org.toLowerCase();
                appName = currentApp.appName;
                ownerName = currentApp.ownerName;
            } else {
                this.logger.error("Current app is undefiend");
                throw new Error("Current app is undefined");
            }
        }

        return new AppCenterPortalMenu(isOrg, appName, ownerName, this.rootPath, this.logger, this._params).show();
    }
}
