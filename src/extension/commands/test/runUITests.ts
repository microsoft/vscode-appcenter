import { CommandParams, CurrentApp } from "../../../helpers/interfaces";
import { VsCodeUtils } from '../../../helpers/utils/vsCodeUtils';
import { IOSTestRunner } from '../../../tests/appCenterUITestRunner';
import { AppCenterOS, ReactNativePlatformDirectory } from '../../resources/constants';
import { Strings } from '../../resources/strings';
import { ReactNativeAppCommand } from '../reactNativeAppCommand';

export default class RunUITests extends ReactNativeAppCommand {

    private async: boolean = false;

    constructor(params: CommandParams) {
        super(params);
    }

    public set runAsynchronously(value: boolean) {
        this.async = value;
    }

    public async run(): Promise<boolean | void> {
        if (!await super.run()) {
            return;
        }

        const app: CurrentApp | null = await this.getCurrentApp();
        if (!app) {
            return false;
        }

        // Only iOS is supported for now
        if (app.os.toLowerCase() !== AppCenterOS.iOS.toLowerCase()) {
            VsCodeUtils.ShowWarningMessage(Strings.OnlyIOSError);
            return false;
        }

        const testRunner = new IOSTestRunner({
            app: app,
            client: this.client,
            logger: this.logger,
            platformDir: ReactNativePlatformDirectory.IOS,
            appDirPath: this.manager.projectRootPath,
            profile: await this.appCenterProfile
        });

        return testRunner.runUITests(this.async);
    }
}
