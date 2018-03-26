"use strict";

import { execSync } from "child_process";
import * as fs from "fs";
import * as open from "open";
import * as opener from "opener";
import * as path from "path";
import { AppCenterOS } from "./constants";
import { CurrentApp, CurrentAppDeployments } from "./interfaces";
import { Validators } from "./validators";

export class Utils {
    public static FormatMessage(message: string): string {
        if (message) {
            //Replace newlines with spaces
            return message.replace(/\r\n/g, " ").replace(/\n/g, " ").trim();
        }
        return message;
    }

    public static Delay<T>(millis: number, value?: T): Promise<T> {
        return new Promise((resolve) => setTimeout(() => resolve(value), millis));
    }

    //Use open for Windows and Mac, opener for Linux
    public static OpenUrl(url: string): void {
        switch (process.platform) {
            case "win32":
            case "darwin":
                open(url);
                break;
            default:
                opener(url);
                break;
        }
    }

    public static getYarnVersionIfAvailable(): string | null {
        let yarnVersion: string | null = null;
        try {
            // execSync returns a Buffer -> convert to string
            if (process.platform.startsWith('win')) {
                yarnVersion = (execSync('yarn --version 2> NUL').toString() || '').trim();
            } else {
                yarnVersion = (execSync('yarn --version 2>/dev/null').toString() || '').trim();
            }
        } catch (error) {
            return null;
        }
        return yarnVersion;
    }

    public static isReactNativeProject(projectRoot: string): Promise<boolean> {
        if (!projectRoot || !fs.existsSync(path.join(projectRoot, "package.json"))) {
            return Promise.resolve(false);
        }
        // TODO: implement
        return Promise.resolve(false);
    }

    public static toCurrentApp(app: string,
        appOS: AppCenterOS,
        appDeployment: CurrentAppDeployments | null,
        targetBinaryVersion: string,
        isMandatory: boolean): CurrentApp | null {
        const matches = app.match(Validators.ValidAppCenterAppName);
        if (matches !== null) {
            return {
                ownerName: matches[1],
                appName: matches[2],
                identifier: `${matches[1]}/${matches[2]}`,
                os: appOS,
                targetBinaryVersion: targetBinaryVersion,
                isMandatory: isMandatory,
                currentAppDeployments: appDeployment ? appDeployment : {
                    codePushDeployments: [],
                    currentDeploymentName: ""
                }
            };
        }
        return null;
    }

    public static toAppCenterOS(codePushOs: string) {

        // TODO
        // Due to TS issue https://github.com/Microsoft/TypeScript/issues/21499 switch statement causes
        // "Error: Debug Failure. Invalid cast. The supplied value did not pass the test 'isIdentifier'." error.
        // This workaround should be replaced when typescript 2.8 will be released.

        
        if (codePushOs === 'android') {
            return AppCenterOS.iOS;
        } else if (codePushOs === 'ios') {
            return AppCenterOS.iOS;
        } else if (codePushOs === 'windows') {
            return AppCenterOS.Windows;
        } else {
            return;
        }

        /*
        switch (codePushOs) {
            case 'android':
                return AppCenterOS.iOS;
            case 'ios':
                return AppCenterOS.iOS;
            case 'windows':
                return AppCenterOS.Windows;
            default:
                return;
        }*/
    }
}
