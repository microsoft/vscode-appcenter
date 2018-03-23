import { AppCenterOS } from "../../helpers/constants";
import { CurrentApp, CurrentAppDeployments, Profile } from "../../helpers/interfaces";
import { Strings } from "../../helpers/strings";
import { Utils } from "../../helpers/utils";
import { VsCodeUtils } from "../../helpers/vsCodeUtils";
import { Command } from "./command";

export class AppCommand extends Command {
    protected getCurrentApp(): Promise<CurrentApp | null> {
        return this.Profile.then((profile: Profile | null) => {
            if (profile && profile.currentApp) {
                return profile.currentApp;
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
        isMandatory: boolean): Promise<CurrentApp | null> {
        const defaultApp = Utils.toCurrentApp(currentAppName, appOS, currentAppDeployments, targetBinaryVersion, isMandatory);
        if (!defaultApp) {
            VsCodeUtils.ShowWarningMessage(Strings.InvalidCurrentAppNameMsg);
            return Promise.resolve(null);
        }

        return this.Profile.then((profile: Profile | null) => {
            if (profile) {
                profile.currentApp = defaultApp;
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
