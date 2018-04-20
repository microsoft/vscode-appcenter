import * as path from "path";
import * as vscode from "vscode";
import { AppCenterClient, models } from "./appcenter/apis";
import { DeviceConfiguration } from "./appcenter/apis/generated/models";
import { ReactNativePlatformDirectory } from "./constants";
import { cpUtils } from "./helpers/cpUtils";
import { DeviceConfigurationSort } from "./helpers/deviceConfigurationSort";
import { FSUtils } from "./helpers/fsUtils";
import { CurrentApp } from "./helpers/interfaces";
import { Utils } from "./helpers/utils";
import { CustomQuickPickItem, VsCodeUtils } from "./helpers/vsCodeUtils";
import { ILogger } from "./log/logHelper";
import { Strings } from "./strings";
const rimraf = FSUtils.rimraf;

export interface TestRunnerOptions {
    app: CurrentApp;
    logger: ILogger;
    client: AppCenterClient;
    platformDir: ReactNativePlatformDirectory;
    appDirPath: string;
}

export default abstract class AppCenterUITestRunner {
    protected nativeAppDirectory: string;

    public constructor(protected options: TestRunnerOptions) {
        this.nativeAppDirectory = path.join(options.appDirPath, options.platformDir);
    }

    public async runUITests(async: boolean): Promise<boolean> {

        return await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.VSCodeProgressLoadingTitle }, async p => {
            p.report({ message: Strings.CheckingAppCenterCli });
            if (!await Utils.packageInstalledGlobally("appcenter-cli")) {
                VsCodeUtils.ShowErrorMessage(Strings.packageIsNotInstalledGlobally("appcenter-cli"));
                return false;
            }

            p.report({ message: Strings.FetchingDevicesStatusBarMessage });
            const options: CustomQuickPickItem[] = await this.getDevicesList(this.options.app);
            const selectedDevice: CustomQuickPickItem = await vscode.window.showQuickPick(options, { placeHolder: Strings.SelectTestDeviceTitlePlaceholder });
            if (!selectedDevice) {
                return false;
            }

            const shortDeviceId = await this.selectDevice(this.options.app, selectedDevice.target);

            p.report({ message: Strings.CleaningBuildStatusBarMessage });
            await rimraf(this.getAbsoluteBuildDirectoryPath());

            p.report({ message: Strings.PreparingBuildStatusBarMessage });
            if (!await this.buildAppForTest()) {
                return false;
            }

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
                `"master"`, // IMPORTANT: this parameter should be quoted otherwise tests on a portal will fail to start!
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
        let configs: models.DeviceConfiguration[] = await this.options.client.test.getDeviceConfigurations(app.ownerName, app.appName);
        // Sort devices list like it was done on AppCenter Portal
        configs = configs.sort(DeviceConfigurationSort.compare);
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
            await cpUtils.executeCommand(this.options.logger, false, this.nativeAppDirectory, command, ...args);
        } catch (e) {
            this.options.logger.error(e.message, e, true);
            return false;
        }
        return true;
    }

    protected abstract async buildAppForTest(): Promise<boolean>;

    protected abstract getTestFrameworkName(): string;

    protected abstract getRelativeBuildBinaryDirectoryPath(): string;

    protected abstract getAbsoluteBuildDirectoryPath(): string;
}

export class IOSTestRunner extends AppCenterUITestRunner {

    protected getAbsoluteBuildDirectoryPath(): string {
        return path.join(this.nativeAppDirectory, 'DerivedData');
    }

    protected getRelativeBuildBinaryDirectoryPath(): string {
        return "DerivedData/Build/Products/Release-iphoneos";
    }

    protected getTestFrameworkName(): string {
        return "xcuitest";
    }

    protected async buildAppForTest(): Promise<boolean> {
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
