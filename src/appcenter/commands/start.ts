import * as vscode from "vscode";
import { ExtensionManager } from "../../extensionManager";
import { Strings } from "../../helpers/strings";
import { VsCodeUtils } from "../../helpers/vsCodeUtils";
import { ILogger } from "../../log/logHelper";
import { models } from "../api";
import { Profile } from "../auth/profile/profile";
import { Command } from "./command";

export default class Start extends Command {

    constructor(manager: ExtensionManager, logger: ILogger) {
        super(manager, logger);
    }

    public async run(): Promise<void> {
        super.run();

        vscode.window.showInputBox({ prompt: Strings.PleaseEnterIdeaName, ignoreFocusOut: true })
        .then(ideaName => {
            if (ideaName) {
                vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: "Loading..."}, p => {
                    return new Promise((resolve) => {
                        p.report({message: Strings.LoadingStatusBarMessage });
                        this.client.account.organizations.list().then((orgList: models.ListOKResponseItem[]) => {
                            const organizations: models.ListOKResponseItem[] = orgList;
                            resolve(organizations);
                        });
                    });
                }).then(async (orgList: models.ListOKResponseItem[]) => {
                    const options = orgList.map(item => {
                        return {
                            label: `${item.displayName} (${item.name})`,
                            description: "",
                            target: item.name
                        };
                    });
                    const myself: Profile | null = await this.Profile;
                    if (myself) {
                        options.splice( orgList.length, 0, {
                            label: `${myself.displayName}`,
                            description: "",
                            target: myself.userName
                        });
                    }
                    vscode.window.showQuickPick(options, { placeHolder: Strings.PleaseSelectCurrentAppOrgMsg })
                    .then((selected: {label: string, description: string, target: string}) => {
                        if (selected) {
                            const selectedOrgs: models.ListOKResponseItem[] = orgList.filter(item => item.name === selected.target);
                            if (selectedOrgs && selectedOrgs.length === 1) {
                                const selectedOrg: models.ListOKResponseItem = selectedOrgs[0];
                                VsCodeUtils.ShowInfoMessage(`You selected ${selectedOrg.displayName}`);
                            }
                        }
                    });
                });
            } else {
                VsCodeUtils.ShowInfoMessage("Please select an idea NAME!");
            }
        });
        return Promise.resolve(void 0);
    }
}
