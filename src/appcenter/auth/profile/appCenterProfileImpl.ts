import { CurrentApp, AppCenterProfile } from "../../../helpers/interfaces";
export { Profile } from "../../../helpers/interfaces";

export default class AppCenterProfileImpl implements AppCenterProfile {
    public userId: string;
    public userName: string;
    public displayName: string;
    public email: string;
    public currentApp?: CurrentApp;
    public isActive: boolean;

    // tslint:disable-next-line:no-any
    constructor(fileContents: any) {
        this.userId = fileContents.userId || fileContents.id;
        this.userName = fileContents.userName || fileContents.name;
        this.displayName = fileContents.displayName;
        this.email = fileContents.email;
        this.currentApp = fileContents.currentApp;
        this.isActive = fileContents.isActive;
    }
}
