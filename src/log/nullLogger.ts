import { ILogger, LogLevel } from "./logHelper";

export class NullLogger implements ILogger {
    public log (_message: string, _level: LogLevel | undefined) {}
    public info (_message: string) {}
    public warning (_message: string) {}
    public error (_errorMessage: string, _error?: Error | undefined, _stack?: boolean | undefined) {}
    public debug (_message: string) {}
    public logStream (_data: String | Buffer, _stream?: NodeJS.WritableStream | undefined) {}
}
