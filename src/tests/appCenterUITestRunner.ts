import * as path from "path";
import * as vscode from "vscode";
import { AppCenterClient, models } from "../api/appcenter";
import { DeviceConfiguration } from "../api/appcenter/generated/models";
import Auth from "../auth/auth";
import { fileUtils } from "../codepush/codepush-sdk/src";
import { ILogger } from "../extension/log/logHelper";
import { AppCenterOS, ReactNativePlatformDirectory } from "../extension/resources/constants";
import { Strings } from "../extension/resources/strings";
import { CurrentApp, Profile } from "../helpers/interfaces";
import { cpUtils } from "../helpers/utils/cpUtils";
import { FSUtils } from "../helpers/utils/fsUtils";
import { Utils } from "../helpers/utils/utils";
import { BaseQuickPickItem, VsCodeUtils } from "../helpers/utils/vsCodeUtils";
import { DeviceConfigurationSort } from "./deviceConfigurationSort";
const rimraf = FSUtils.rimraf;

export interface TestRunnerOptions {
    app: CurrentApp;
    logger: ILogger;
    client: AppCenterClient;
    platformDir: ReactNativePlatformDirectory;
    appDirPath: string;
    profile: Profile;
}

enum TestDeviceType {
    Device = 0,
    DeviceSet = 1
}

class TestQuickPickItem extends BaseQuickPickItem {
    public type: TestDeviceType;
}

export default abstract class AppCenterUITestRunner {
    protected nativeAppDirectory: string;

    public constructor(protected options: TestRunnerOptions) {
        this.nativeAppDirectory = path.join(options.appDirPath, options.platformDir);
    }

    public async runUITests(async: boolean): Promise<boolean> {

        return vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.VSCodeProgressLoadingTitle }, async p => {
            p.report({ message: Strings.CheckingAppCenterCli });
            if (!await Utils.packageInstalledGlobally("appcenter-cli")) {
                VsCodeUtils.ShowErrorMessage(Strings.packageIsNotInstalledGlobally("appcenter-cli"));
                return false;
            }

            p.report({ message: Strings.FetchingDevicesStatusBarMessage });
            const devices: TestQuickPickItem[] = await this.getDevicesList(this.options.app);
            const deviceSets: TestQuickPickItem[] = await this.getDeviceSetsList(this.options.app);
            devices.unshift(...deviceSets);
            const selectedDevice: TestQuickPickItem = await vscode.window.showQuickPick(devices, { placeHolder: Strings.SelectTestDeviceTitlePlaceholder });
            if (!selectedDevice) {
                return false;
            }

            let shortDeviceId: string;
            if (selectedDevice.type === TestDeviceType.Device) {
                shortDeviceId = await this.selectDevice(this.options.app, selectedDevice.id);
            } else {
                shortDeviceId = `${this.options.app.ownerName}/${selectedDevice.label}`;
            }

            p.report({ message: Strings.CleaningBuildStatusBarMessage });
            await rimraf(this.getAbsoluteBuildDirectoryPath());

            if (this.options.app.os.toLowerCase() === AppCenterOS.Android.toLowerCase()) {
                p.report({ message: Strings.MakingBundleStatusBarMessage });
                if (!await this.makeBundle()) {
                    return false;
                }
            }

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
                this.getRelativeBuildBinaryDirectoryPath(),
                "--token",
                await Auth.accessTokenFor(this.options.profile)
            ];

            if (async) {
                args.push("--async");
            }

            const additionalArgs: string[] = this.getAdditionalArgs();

            if (additionalArgs.length) {
                args.push(...additionalArgs);
            }
            return this.spawnProcess("appcenter", args);
        });
    }

    private async getDevicesList(app: CurrentApp): Promise<TestQuickPickItem[]> {
        let configs: models.DeviceConfiguration[] = await this.options.client.test.getDeviceConfigurations(app.ownerName, app.appName);
        // Sort devices list like it was done on AppCenter Portal
        configs = configs.sort(DeviceConfigurationSort.compare);
        return configs.map((config: DeviceConfiguration) => <TestQuickPickItem>{
            label: `${config.name}`,
            description: `${config.osName}`,
            id: config.id,
            type: TestDeviceType.Device
        });
    }

    private sortDeviceSets(a: models.DeviceSet, b: models.DeviceSet): number {
        if (a.name > b.name) {
            return 1;
        }
        if (a.name < b.name) {
            return -1;
        }
        return 0;
    }

    private async getDeviceSetsList(app: CurrentApp): Promise<TestQuickPickItem[]> {
        let configs: models.DeviceSet[] = await this.options.client.test.listDeviceSetsOfOwner(app.ownerName, app.appName);
        // Sort devices list like it was done on AppCenter Portal
        configs = configs.sort(this.sortDeviceSets);
        return configs.map((config: models.DeviceSet) => <TestQuickPickItem>{
            label: `${config.name}`,
            description: Strings.DeviceSetsDescription(config.owner.type),
            id: config.id,
            type: TestDeviceType.DeviceSet
        });
    }

    private async selectDevice(app: CurrentApp, deviceId: string): Promise<string> {
        const deviceSelection: any = await this.options.client.test.createDeviceSelection(app.ownerName, app.appName, [deviceId]);
        return deviceSelection.shortId;
    }

    protected async spawnProcess(command: string, args: string[], dir?: string): Promise<boolean> {
        try {
            await cpUtils.executeCommand(this.options.logger, false, dir || this.nativeAppDirectory, command, [], false, ...args);
        } catch (e) {
            this.options.logger.error(e.message, e, true);
            return false;
        }
        return true;
    }

    protected abstract async buildAppForTest(): Promise<boolean>;

    protected makeBundle(): Promise<boolean> {
        const args = [
            "bundle",
            "--assets-dest", this.getAssetsFolder(),
            "--bundle-output", this.getBundleOutputDir(),
            "--dev", "true",
            "--entry-file", this.getDefautEntryFileName(),
            "--platform", this.getAppOsString()
        ];

        return this.spawnProcess("react-native", args, this.options.appDirPath);
    }

    private getDefautEntryFileName(): string {
        const entryFilePath: string = path.join(this.options.appDirPath, `index.${this.getAppOsString()}.js`);
        if (fileUtils.fileDoesNotExistOrIsDirectory(entryFilePath)) {
            return "index.js";
        } else {
            return `index.${this.getAppOsString()}.js`;
        }
    }

    private getAppOsString(): string {
        return this.options.app.os.toLowerCase();
    }

    protected abstract getBundleName(): string;

    protected abstract getAssetsFolder(): string;

    protected abstract getBundleOutputDir(): string;

    protected abstract getTestFrameworkName(): string;

    protected abstract getRelativeBuildBinaryDirectoryPath(): string;

    protected abstract getAbsoluteBuildDirectoryPath(): string;

    protected abstract getAdditionalArgs(): string[];
}
