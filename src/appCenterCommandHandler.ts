import { ExtensionManager } from "./extensionManager";

"use strict";

export class AppCenterCommandHandler  {
    private _manager: ExtensionManager;

    constructor(manager: ExtensionManager) {
        this._manager = manager;
    }

    public WhoAmI(): void {
        this._manager.DisplayInfoMessage("Hello World!");
    }
}