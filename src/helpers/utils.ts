"use strict";

import { execSync } from "child_process";
import * as fs from "fs";
import * as open from "open";
import * as opener from "opener";
import * as path from "path";

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
    public static OpenUrl(url: string) : void {
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
}
