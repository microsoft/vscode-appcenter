import * as vscode from 'vscode';
import { AppCenterOS } from '../../constants';
import { AppCenterProfile, CurrentApp, CurrentAppDeployments } from '../../helpers/interfaces';
import { Utils } from '../../helpers/utils';
import { VsCodeUtils } from '../../helpers/vsCodeUtils';
import { Strings } from '../../strings';
import { Command } from './command';

export class ReactNativeAppCommand extends Command {
    public async runNoClient(): Promise<boolean | void> {
        if (!await super.runNoClient()) {
            return false;
        }
        if (!Utils.isReactNativeProject(this.manager.projectRootPath, true)) {
            return false;
        }
        return true;
    }

    public async run(): Promise<boolean | void> {
        if (!await super.run()) {
            return false;
        }
        if (!Utils.isReactNativeProject(this.manager.projectRootPath, true)) {
            return false;
        }
        return true;
    }

    protected getCurrentApp(): Promise<CurrentApp | null> {
        return this.appCenterProfile.then((profile: AppCenterProfile | null) => {
            if (profile && profile.currentApp) {
                return profile.currentApp;
            }
            return null;
        });
    }

    protected saveCurrentApp(
        currentAppName: string,
        appOS: AppCenterOS,
        currentAppDeployments: CurrentAppDeployments | null,
        targetBinaryVersion: string,
        type: string,
        isMandatory: boolean): Promise<CurrentApp | null> {
        const currentApp = Utils.toCurrentApp(currentAppName, appOS, currentAppDeployments, targetBinaryVersion, type, isMandatory);
        if (!currentApp) {
            VsCodeUtils.ShowWarningMessage(Strings.InvalidCurrentAppNameMsg);
            return Promise.resolve(null);
        }

        return this.appCenterProfile.then((profile: AppCenterProfile | null) => {
            if (profile) {
                profile.currentApp = currentApp;
                return this.manager.auth.updateProfile(profile).then(() => {
                    return currentApp;
                });
            } else {
                // No profile - not logged in?
                VsCodeUtils.ShowWarningMessage(Strings.UserIsNotLoggedInMsg);
                return Promise.resolve(null);
            }
        });
    }

    public showProgress(title: string, fnc: () => Promise<any>): Thenable<void> {
        return vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: title }, fnc);
    }
}
