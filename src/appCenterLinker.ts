import * as vscode from 'vscode';
import { AppCenterOS } from './constants';
import { cpUtils } from './helpers/cpUtils';
import { CurrentApp, ReactNativeLinkInputValue } from './helpers/interfaces';
import { ILogger } from './log/logHelper';
import { Strings } from './strings';

export default class AppCenterLinker {

    constructor(private logger: ILogger, private rootPath: string) { }

    public async installAppcenter(): Promise<boolean> {
        const installAppCenterCmd: string = "npm i appcenter appcenter-analytics appcenter-crashes --save";
        return await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.InstallAppCenterTitle }, async () => {
            try {
                await cpUtils.executeCommand(this.logger, true, this.rootPath, installAppCenterCmd);
                return true;
            } catch (error) {
                this.logger.error(`Failed to run ${installAppCenterCmd}`);
                return false;
            }
        });
    }

    private async isReactNative047(): Promise<boolean> {
        const version = await cpUtils.executeCommand(this.logger, true, this.rootPath, "npm view react-native version");
        const versionNumber: number = Number.parseFloat(version);
        return versionNumber === 0.47;
    }

    public async linkAppCenter(apps: CurrentApp[]): Promise<boolean> {
        const iosAppSecret = this.findSecretFor(AppCenterOS.iOS, apps);
        const androidAppSecret = this.findSecretFor(AppCenterOS.Android, apps);
        return await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: "" }, async () => {
            const isReactNative047: boolean = await this.isReactNative047();
            if (isReactNative047) { } else { }

            const inputValues: ReactNativeLinkInputValue[] = [
                {
                    label: "secret does your Android app use",
                    input: androidAppSecret,
                    sent: false
                },
                {
                    label: "secret does your iOS app use",
                    input: iosAppSecret,
                    sent: false
                }
            ];
            try {
                await cpUtils.executeCommand(this.logger, false, this.rootPath, `react-native link appcenter`, inputValues);

                await cpUtils.executeCommand(this.logger, false, this.rootPath, `react-native link appcenter-analytics`, inputValues);
                await cpUtils.executeCommand(this.logger, false, this.rootPath, `react-native link appcenter-crashes`, inputValues);

                return true;
            } catch (err) {
                this.logger.error(err);
                return false;
            }
        });
    }

    private findSecretFor(os: AppCenterOS, apps: CurrentApp[]): string {
        const filteredApps: CurrentApp[] = apps.filter((app) => {
            return app.os.toLowerCase() === os.toLowerCase();
        });
        if (filteredApps.length === 0) {
            return "";
        }
        return filteredApps[0].appSecret || "";
    }
}
