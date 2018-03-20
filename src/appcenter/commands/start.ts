import * as vscode from "vscode";
import AppCenterAppBuilder from "../../appCenterAppBuilder";
import { ExtensionManager } from "../../extensionManager";
import { SettingsHelper } from "../../helpers/settingsHelper";
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
                //TODO: Validate if name is unique! Or probably if already created do nothing?

                vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.VSCodeProgressLoadingTitle}, p => {
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
                            description: Strings.OrganizationMenuDescriptionLabel,
                            target: item.name
                        };
                    });
                    const myself: Profile | null = await this.Profile;
                    if (myself) {
                        // Insert user at the very 1st position
                        options.splice( 0, 0, {
                            label: `${myself.displayName}`,
                            description: Strings.UserMenuDescriptionLabel,
                            target: myself.userName
                        });
                    } else {
                        throw new Error("Profile is undefined!");
                    }
                    vscode.window.showQuickPick(options, { placeHolder: Strings.PleaseSelectCurrentAppOrgMsg })
                    .then((selected: {label: string, description: string, target: string}) => {
                        if (selected) {
                            const selectedUserOrOrgs: models.ListOKResponseItem[] = orgList.filter(item => item.name === selected.target);
                            let selectedUserOrOrg: models.ListOKResponseItem;
                            if (selectedUserOrOrgs && selectedUserOrOrgs.length === 1) {
                                selectedUserOrOrg = selectedUserOrOrgs[0];
                            } else {
                                selectedUserOrOrg = {
                                    displayName: myself.displayName,
                                    name: myself.userName,
                                    origin: undefined
                                };
                            }

                            const repoUrl: string = 'https://github.com/max-mironov/rntestextension.git'; // TODO: ok for now hardcoded, later take it from earlier created
                            const defaultBranchName: string = SettingsHelper.defaultBranchName();

                            const appCenterAppBuilder = new AppCenterAppBuilder(ideaName, selectedUserOrOrg, repoUrl, defaultBranchName, this.client, this.logger);
                            appCenterAppBuilder
                                .withIOSApp(SettingsHelper.createIOSAppInAppCenter())
                                .withAndroidApp(SettingsHelper.createAndroidAppInAppCenter())
                                .withBetaTestersDistributionGroup(SettingsHelper.createTestersDistributionGroupInAppCenter())
                                .withConnectedRepositoryToBuildService(SettingsHelper.connectRepoToBuildService())
                                .withBranchConfigurationCreatedAndBuildKickOff(SettingsHelper.configureBranchAndStartNewBuild())
                                .create();

                            VsCodeUtils.ShowInfoMessage(`You selected ${selectedUserOrOrg.displayName}`);
                        }
                    });
                });
            } else {
                VsCodeUtils.ShowInfoMessage(Strings.NoIdeaNameSelectedMsg);
            }
        });
        return Promise.resolve(void 0);
    }
}
