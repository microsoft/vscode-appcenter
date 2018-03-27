import { Constants } from '../../helpers/constants';
import { Utils } from '../../helpers/utils';
import { ReactNativeAppCommand } from './reactNativeAppCommand';

export default class OpenAppCenterPortal extends ReactNativeAppCommand {
    public async runNoClient(): Promise<boolean | void> {
        if (!await super.runNoClient()) {
            return false;
        }
        Utils.OpenUrl(Constants.AppCenterPortalURL);
        return true;
    }
}
