import { CommandParams, CurrentApp } from "../../../helpers/interfaces";
import { AndroidTestRunner } from "../../../tests/androidTestRunner";
import { TestRunnerOptions } from '../../../tests/appCenterUITestRunner';
import { IOSTestRunner } from "../../../tests/iOSTestRunner";
import { AppCenterOS, ReactNativePlatformDirectory } from '../../resources/constants';
import { ReactNativeAppCommand } from '../reactNativeAppCommand';

export default class RunUITests extends ReactNativeAppCommand {

    private async: boolean = false;

    constructor(params: CommandParams, private _app: CurrentApp = null) {
        super(params);
    }

    public set runAsynchronously(value: boolean) {
        this.async = value;
    }

    public async run(): Promise<boolean | void> {
        if (!await super.run()) {
            return;
        }
        if (!this._app) {
            const app: CurrentApp | null = await this.getCurrentApp();
            if (!app) {
                return false;
            }
            this._app = app;
        }

        let testRunner;
        const isIOSplatform: boolean = this._app.os.toLowerCase() === AppCenterOS.iOS.toLowerCase();
        const platformDir = isIOSplatform ? ReactNativePlatformDirectory.IOS : ReactNativePlatformDirectory.Android;
        const testRunnerOptions: TestRunnerOptions = {
            app: this._app,
            client: this.client,
            logger: this.logger,
            platformDir: platformDir,
            appDirPath: this.manager.projectRootPath,
            profile: await this.appCenterProfile
        };

        if (isIOSplatform) {
            testRunner = new IOSTestRunner(testRunnerOptions);
        } else {
            testRunner = new AndroidTestRunner(testRunnerOptions);
        }

        return testRunner.runUITests(this.async);
    }
}
