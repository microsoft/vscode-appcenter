import * as vscode from "vscode";
import AppCenterAppBuilder from "../../appCenterAppBuilder";
import { ExtensionManager } from "../../extensionManager";
import { FSUtils } from "../../helpers/fsUtils";
import { GitUtils } from "../../helpers/gitUtils";
import ReactNativeProjectCreator from "../../helpers/reactNativeProjectCreator";
import { SettingsHelper } from "../../helpers/settingsHelper";
import { Strings } from "../../helpers/strings";
import { Utils } from "../../helpers/utils";
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
                    p.report({message: Strings.LoadingStatusBarMessage });
                    return this.client.account.organizations.list().then((orgList: models.ListOKResponseItem[]) => {
                        const organizations: models.ListOKResponseItem[] = orgList;
                        return organizations;
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
                    .then(async (selected: {label: string, description: string, target: string}) => {
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
                            const rootPath = <string>this.manager.projectRootPath;
                            let dirContent: string[] | null = null;
                            let rnProjectIsCreatedAndLinked: boolean = false;

                            try {
                                dirContent = FSUtils.GetDirectoryContent(rootPath);
                            } catch (e) {
                                this.logger.error(e.message);
                            }

                            const ignoredItems = [".vscode, .git"];
                            const filteredDir = dirContent && dirContent.filter(item => {
                                ignoredItems.indexOf(item) === -1;
                            });
                            const dirExistAndEmpty = filteredDir && filteredDir.length === 0;

                            if (dirExistAndEmpty) {
                                if (await GitUtils.IsGitInstalled(rootPath)) {
                                    await GitUtils.GitInit(this.logger, rootPath);

                                    return await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.VSCodeProgressLoadingTitle}, p => {
                                        p.report({message: Strings.CreateRNProjectStatusBarMessage });
                                        return new ReactNativeProjectCreator(this.logger).createProject(ideaName, rootPath);
                                      })
                                      .then((rnAppCreated: boolean) => {
                                        if (!rnAppCreated) {
                                            VsCodeUtils.ShowErrorMessage(Strings.FailedToCreateRNProjectMsg);
                                        } else {
                                            // Wooo Hoo if we are here than project was created and linked!
                                            rnProjectIsCreatedAndLinked = true;
                                            VsCodeUtils.ShowInfoMessage("RN project was created!");
                                        }
                                      });
                                } else {
                                    VsCodeUtils.ShowErrorMessage(Strings.GitIsNotInstalledMsg);
                                }
                            } else if (Utils.isReactNativeProject(rootPath)) {
                                // TODO: Do magic with linking AppCenter and CodePush if we have already RN Project!
                                // and finally consider we are good :)
                                rnProjectIsCreatedAndLinked = true;
                            } else {
                                VsCodeUtils.ShowErrorMessage(Strings.NotRNProjectMsg);
                            }

                            rnProjectIsCreatedAndLinked = false; // For now false and do not go any further while I'm testing
                            if (rnProjectIsCreatedAndLinked) {
                                // TODO: Get repo name here and push changes!
                                // 1. Get repo name
                                // 2. Push changes
                                // 3. Do AppCenter Logic...
                                const repoUrl: string = 'https://github.com/max-mironov/RNCPIssue637.git'; // TODO: ok for now hardcoded, later take it from earlier created
                                const defaultBranchName: string = SettingsHelper.defaultBranchName();

                                const appCenterAppBuilder = new AppCenterAppBuilder(ideaName, selectedUserOrOrg, repoUrl, defaultBranchName, this.client, this.logger);
                                appCenterAppBuilder
                                    .withIOSApp(SettingsHelper.createIOSAppInAppCenter())
                                    .withAndroidApp(SettingsHelper.createAndroidAppInAppCenter())
                                    .withBetaTestersDistributionGroup(SettingsHelper.createTestersDistributionGroupInAppCenter())
                                    .withConnectedRepositoryToBuildService(SettingsHelper.connectRepoToBuildService())
                                    .withBranchConfigurationCreatedAndBuildKickOff(SettingsHelper.configureBranchAndStartNewBuild())
                                    .create();
                            }
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
