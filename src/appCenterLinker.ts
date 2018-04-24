
import * as vscode from 'vscode';
import { AppCenterOS } from './constants';
import { cpUtils } from './helpers/cpUtils';
import nexpect = require("./helpers/nexpect");
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

    public async linkAppCenter(appSecret: string, os: AppCenterOS): Promise<boolean> {
        const isReactNative047: boolean = await this.isReactNative047();
        if (isReactNative047) {} else {}
        const self = this;
        const iosAppSecret = os === AppCenterOS.iOS ? appSecret : "";
        const androidAppSecret = os === AppCenterOS.Android ? appSecret : "";
        const linkCmd: string = `react-native link`;
        return await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.LinkAppCenterTitle }, async () => {
            return new Promise<boolean>((resolve) => {
                nexpect.spawn(linkCmd, { cwd: this.rootPath })
                    .wait("What secret does your Android app use? [None]")
                    .sendline(androidAppSecret)
                    .wait("What secret does your Android app use? [None]")
                    .sendline(iosAppSecret)
                    .wait("For the Android app, should user tracking be enabled automatically? (Use arrow keys)")
                    .sendline()
                    .wait("For the iOS app, should user tracking be enabled automatically? (Use arrow keys)")
                    .sendline()
                    .wait("For the Android app, should crashes be sent automatically or processed in JavaScript before being sent? (Use arrow keys)")
                    .sendline()
                    .wait("For the iOS app, should crashes be sent automatically or processed in JavaScript before being sent? (Use arrow keys)")
                    .sendline()
                    .run(function (err) {
                        if (!err) {
                            resolve(true);
                        } else {
                            self.logger.error(`Failed to link App Center: ${err}`);
                            resolve(false);
                        }
                    });
            });
        });
    }
}
