"use strict";

import * as fs from "fs";
import * as path from "path";
import * as open from "open";
import * as opener from "opener";

export class Utils {

    public static FormatMessage(message: string): string {
        if (message) {
            //Replace newlines with spaces
            return message.replace(/\r\n/g, " ").replace(/\n/g, " ").trim();
        }
        return message;
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
}