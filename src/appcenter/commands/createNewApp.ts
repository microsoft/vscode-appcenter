import { CommandParams } from '../../helpers/interfaces';
import { Command } from './command';

export enum CreateNewAppOption {
    Android,
    IOS,
    Both
}

export class CreateNewApp extends Command {

    constructor(params: CommandParams, private _option: CreateNewAppOption) {
        super(params);
    }

    public async run(): Promise<boolean | void> {
        if (!await super.run()) {
            return false;
        }

        switch (this._option) {
            case CreateNewAppOption.Android: return await this.createAndroidApp();
            case CreateNewAppOption.IOS: return await this.createIosApp();
            case CreateNewAppOption.Both: return await this.createBothApps();
            default: return false;
        }
    }

    private createAndroidApp(): Promise<boolean> {
        return Promise.resolve(true);
    }

    private createIosApp(): Promise<boolean> {
        return Promise.resolve(true);
    }

    private createBothApps(): Promise<boolean> {
        return Promise.resolve(true);
    }
}
