import * as vscode from 'vscode';
import { Constants } from '../../helpers/constants';
import { ReactNativeAppCommand } from './reactNativeAppCommand';

export default class OpenAppCenterPortal extends ReactNativeAppCommand {
    public async runNoClient(): Promise<boolean | void> {
        if (!await super.runNoClient()) {
            return false;
        }
        vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(Constants.AppCenterPortalURL));
        return true;
    }
}