"use strict";

export class Constants {
    public static ExtensionName: string = "appcenter";
    public static DefaulAPIEndPoint: string = "https://api.appcenter.ms";
    public static DefaultLoginEndPoint: string = "https://appcenter.ms/cli-login";
}

export class CommandNames {
    public static CommandPrefix: string = Constants.ExtensionName + ".";
    public static WhoAmI: string = CommandNames.CommandPrefix + "whoami";
}

export enum MessageTypes {
    Error = 0,
    Warn = 1,
    Info = 2
}
