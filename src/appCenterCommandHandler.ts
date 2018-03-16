import { ExtensionManager } from "./extensionManager";
import { ILogger } from "./log/logHelper";
import { ConsoleLogger } from "./log/consoleLogger";

"use strict";

export class AppCenterCommandHandler  {
    private _manager: ExtensionManager;

    constructor(manager: ExtensionManager, private logger: ILogger = new ConsoleLogger()) {
        this._manager = manager;
    }

    public WhoAmI(): void {
        this._manager.DisplayInfoMessage("Hello World!");
    }
}