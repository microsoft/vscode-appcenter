import Auth from "./auth";
import { VstsProfile, VstsLoginCredentials } from "../../helpers/interfaces";

/*
  NOTE: This is not a real profile yet.
*/
class VstsProfileImpl implements VstsProfile {
    public userId: string;
    public userName: string;
    public displayName: string;
    public isActive: boolean;

    // tslint:disable-next-line:no-any
    constructor(credentials: VstsLoginCredentials) {
        this.userId = credentials.userName;
        this.userName = credentials.userName;
        this.displayName = credentials.userName;
        this.isActive = false;
    }
}

export default class VstsAuth extends Auth<VstsProfile, VstsLoginCredentials>{

    protected async getUserInfo(loginCredentials: VstsLoginCredentials): Promise<VstsProfile> {
        return new VstsProfileImpl(loginCredentials);
    }
}