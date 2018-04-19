import * as vscode from "vscode";
import * as path from "path";
import { CurrentApp } from "./helpers/interfaces";
import { ILogger } from "./log/logHelper";
import { Strings } from "./strings";
import { ReactNativePlatformDirectory } from "./constants";
import { ChildProcess } from "./helpers/childProcess";
import { Utils } from "./helpers/utils";
import { CustomQuickPickItem } from "./helpers/vsCodeUtils";
import { models, AppCenterClient } from "./appcenter/apis";
import { DeviceConfiguration } from "./appcenter/apis/generated/models";
//import { FSUtils } from "./helpers/fsUtils";
//const rimraf = FSUtils.rimraf;

export interface TestRunnerOptions {
    app: CurrentApp,
    logger: ILogger,
    client: AppCenterClient,
    platformDir: ReactNativePlatformDirectory,
    appDirPath: string
}

export default abstract class AppCenterUITestRunner {
    protected nativeAppDirectory: string;
    protected stdoutListener: (chunk: Buffer | string) => void;
    protected stderrListener: (chunk: Buffer | string) => void;

    public constructor(protected options: TestRunnerOptions) {
        this.stdoutListener = (chunk: Buffer | string) => {
            this.options.logger.info(chunk as string);
        };

        this.stderrListener = (chunk: Buffer | string) => {
            this.options.logger.error(chunk as string);
        };

        this.nativeAppDirectory = path.join(options.appDirPath, options.platformDir);
    }

    public async runUITests(async: boolean): Promise<boolean> {
        return await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.VSCodeProgressLoadingTitle }, async p => {
            p.report({ message: Strings.FetchingDevicesStatusBarMessage });
            const options: CustomQuickPickItem[] = await this.getDevicesList(this.options.app);
            const selectedDevice: CustomQuickPickItem = await vscode.window.showQuickPick(options, { placeHolder: Strings.SelectTestDeviceTitlePlaceholder });
            if (!selectedDevice) {
                return false;
            }

            const shortDeviceId = await this.selectDevice(this.options.app, selectedDevice.target);

            p.report({ message: Strings.CleaningBuildStatusBarMessage });
            //await rimraf(this.getAbsoluteBuildDirectoryPath());

            p.report({ message: Strings.MakingBuildStatusBarMessage });
            //if (!await this.buildAppForTest()) {
            //    return false;
            //}

            p.report({ message: Strings.UploadingAndRunningTestsStatusBarMessage });
            const args = [
                "test",
                "run",
                this.getTestFrameworkName(),
                "--app",
                `${this.options.app.ownerName}/${this.options.app.appName}`,
                "--devices",
                shortDeviceId,
                "--test-series",
                `master`,
                "--locale",
                `en_US`,
                "--build-dir",
                this.getRelativeBuildBinaryDirectoryPath()
            ];

            if (async) {
                args.push("--async");
            }
            return await this.spawnProcess("appcenter", args);
        });
    }

    private async getDevicesList(app: CurrentApp): Promise<CustomQuickPickItem[]> {
        const configs: models.DeviceConfiguration[] = await this.options.client.test.getDeviceConfigurations(app.ownerName, app.appName);
        return configs.map((config: DeviceConfiguration) => <CustomQuickPickItem>{
            label: `${config.name}`,
            description: `${config.osName}`,
            target: config.id
        });
    }

    private async selectDevice(app: CurrentApp, deviceId: string): Promise<string> {
        const deviceSelection: any = await this.options.client.test.createDeviceSelection(app.ownerName, app.appName, [deviceId]);
        return deviceSelection.shortId;
    }

    protected async spawnProcess(command: string, args: string[]): Promise<boolean> {
        try {
            await ChildProcess.spawn(command, args, {
                cwd: this.nativeAppDirectory,
                stdoutListener: this.stdoutListener,
                stderrListener: this.stderrListener
            });
        } catch (e) {
            this.options.logger.error(e.message, e, true);
            return false;
        }
        return true;
    }

    abstract buildAppForTest(): Promise<boolean>;

    abstract getTestFrameworkName(): string;

    abstract getRelativeBuildBinaryDirectoryPath(): string

    abstract getAbsoluteBuildDirectoryPath(): string;
}

export class IOSTestRunner extends AppCenterUITestRunner {

    getAbsoluteBuildDirectoryPath(): string {
        return path.join(this.nativeAppDirectory, 'DerivedData');
    }
    getRelativeBuildBinaryDirectoryPath(): string {
        return "DerivedData/Build/Products/Release-iphoneos";
    }

    getTestFrameworkName(): string {
        return "xcuitest";
    }

    async buildAppForTest(): Promise<boolean> {
        const appName = Utils.getAppName(this.options.appDirPath);
        const args = [
            "xcodebuild",
            "build-for-testing",
            "-configuration",
            "Release",
            "-workspace",
            path.join(this.nativeAppDirectory, `${appName}.xcworkspace`),
            "-sdk",
            "iphoneos",
            "-scheme",
            appName,
            "-derivedDataPath",
            "DerivedData"
        ];

        return await this.spawnProcess("xcrun", args);
    }
}