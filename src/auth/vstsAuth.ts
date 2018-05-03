import { VstsLoginInfo, VstsProfile } from "../helpers/interfaces";
import Auth from "./auth";

class VstsProfileImpl implements VstsProfile {
    public userId: string;
    public userName: string;
    public displayName: string;
    public isActive: boolean;
    public tenantName: string;

    constructor(loginInfo: VstsLoginInfo) {
        this.userId = `${loginInfo.tenantName}/${loginInfo.userName}`;
        this.userName = loginInfo.userName;
        this.displayName = loginInfo.userName;
        this.isActive = false;
        this.tenantName = loginInfo.tenantName;
    }
}

export default class VstsAuth extends Auth<VstsProfile> {

    protected async getUserInfo(loginInfo: VstsLoginInfo): Promise<VstsProfile> {
        return new VstsProfileImpl(loginInfo);
    }
}
