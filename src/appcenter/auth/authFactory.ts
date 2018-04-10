import { AuthProvider } from "../../constants";
import FsProfileStorage from "../../helpers/fsProfileStorage";
import { AppCenterProfile, VstsProfile } from "../../helpers/interfaces";
import { Utils } from "../../helpers/utils";
import { ILogger } from "../../log/logHelper";
import AppCenterAuth from "./appCenterAuth";
import Auth from "./auth";
import VstsAuth from "./vstsAuth";

export class AuthFactory {
    public static async getAuth(authType: AuthProvider, logger: ILogger): Promise<Auth<VstsProfile | AppCenterProfile>> {
        switch (authType) {
            case AuthProvider.Vsts:
                const vstsProfileStorage: FsProfileStorage<AppCenterProfile> =
                    new FsProfileStorage(Utils.getVstsProfileFileName(), logger);
                let vstsAuth: Auth<VstsProfile>;
                vstsAuth = new VstsAuth(vstsProfileStorage, logger);
                await vstsAuth.initialize();
                return vstsAuth;
            case AuthProvider.AppCenter:
                const appcenterProfileStorage: FsProfileStorage<AppCenterProfile> =
                    new FsProfileStorage(Utils.getAppCenterProfileFileName(), logger);
                let appCenterAuth: Auth<AppCenterProfile>;
                appCenterAuth = new AppCenterAuth(appcenterProfileStorage, logger);
                await appCenterAuth.initialize();
                return appCenterAuth;
            default:
                throw new Error("Unknown auth type");
        }
    }
}
