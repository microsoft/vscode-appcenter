import { ExtensionManager } from "./extensionManager";
import { ConsoleLogger } from "./log/consoleLogger";
import { ILogger, LogLevel } from "./log/logHelper";

"use strict";

export class AppCenterCommandHandler {
    private _manager: ExtensionManager;

    constructor(manager: ExtensionManager, private logger: ILogger = new ConsoleLogger()) {
        this._manager = manager;
    }

    public WhoAmI(): void {
        this.logger.log("Call whoami", LogLevel.Info);
        this._manager.DisplayInfoMessage('Hello World!');
    }
}
