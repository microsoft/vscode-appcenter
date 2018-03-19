"use strict";

export class Constants {
    public static ExtensionName: string = "appcenter";
    public static DefaulAPIEndPoint: string = "https://api.appcenter.ms";
    public static DefaultLoginEndPoint: string = "https://appcenter.ms/cli-login";
}

export class CommandNames {
    public static CommandPrefix: string = Constants.ExtensionName + ".";
    public static WhoAmI: string = CommandNames.CommandPrefix + "whoami";
    public static Login: string = CommandNames.CommandPrefix + "login";
    public static Logout: string = CommandNames.CommandPrefix + "logout";
}

export enum MessageTypes {
    Error = 0,
    Warn = 1,
    Info = 2
}

export enum AppCenterLoginType {
    Interactive,
    Token
}
