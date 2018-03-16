"use strict";

export class Constants {
    static ExtensionName: string = "appcenter";
}

export class CommandNames {
    static CommandPrefix: string = Constants.ExtensionName + ".";
    static WhoAmI: string = CommandNames.CommandPrefix + "WhoAmI";
}

export enum MessageTypes {
    Error = 0,
    Warn = 1,
    Info = 2
}