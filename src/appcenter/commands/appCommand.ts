import { Command } from "./command";
import { DefaultApp, Profile, CurrentAppDeployments } from "../../helpers/interfaces";
import { AppCenterOS } from "../../helpers/constants";
import { Utils } from "../../helpers/utils";
import { VsCodeUtils } from "../../helpers/vsCodeUtils";
import { Strings } from "../../helpers/strings";

export class AppCommand extends Command {
    protected getDefaultApp(): Promise<DefaultApp | null> {
        return this.Profile.then((profile: Profile | null) => {
            if (profile && profile.defaultApp) {
                return profile.defaultApp;
            }
            return null;
        });
    }

    protected saveCurrentApp(
        projectRootPath: string,
        currentAppName: string,
        appOS: AppCenterOS,
        currentAppDeployments: CurrentAppDeployments | null,
        targetBinaryVersion: string,
        isMandatory: boolean): Promise<DefaultApp | null> {
        const defaultApp = Utils.toDefaultApp(currentAppName, appOS, currentAppDeployments, targetBinaryVersion, isMandatory);
        if (!defaultApp) {
            VsCodeUtils.ShowWarningMessage(Strings.InvalidCurrentAppNameMsg);
            return Promise.resolve(null);
        }

        return this.Profile.then((profile: Profile | null) => {
            if (profile) {
                profile.defaultApp = defaultApp;
                profile.save(projectRootPath);
                return Promise.resolve(defaultApp);
            } else {
                // No profile - not logged in?
                VsCodeUtils.ShowWarningMessage(Strings.UserIsNotLoggedInMsg);
                return Promise.resolve(null);
            }
        });
    }
}
