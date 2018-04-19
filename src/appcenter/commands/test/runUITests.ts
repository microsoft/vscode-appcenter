import { CommandParams, CurrentApp } from "../../../helpers/interfaces";
import { ReactNativeAppCommand } from '../reactNativeAppCommand';
import { IOSTestRunner } from "../../../appCenterUITestRunner";
import { ReactNativePlatformDirectory } from "../../../constants";

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

        const testRunner = new IOSTestRunner({
            app: app,
            client: this.client,
            logger: this.logger,
            platformDir: ReactNativePlatformDirectory.IOS,
            appDirPath: this.manager.projectRootPath
        })

        return await testRunner.runUITests(this.async);
    }
}