"use strict";

import { ILogger, LogLevel } from "./logHelper";

export class NullLogger implements ILogger {
    public log (message: string, level: LogLevel | undefined) {}
    public info (message: string) {}
    public warning (message: string) {}
    public error (errorMessage: string, error?: Error | undefined, stack?: boolean | undefined) {}
    public debug (message: string) {}
    public logStream (data: String | Buffer, stream?: NodeJS.WritableStream | undefined) {}
}
