import * as vscode from "vscode";
import AppCenterAppBuilder from "../../appCenterAppBuilder";
import { ExtensionManager } from "../../extensionManager";
import { FSUtils } from "../../helpers/fsUtils";
import { GitUtils } from "../../helpers/gitUtils";
import { SettingsHelper } from "../../helpers/settingsHelper";
import { Strings } from "../../helpers/strings";
import { Validators } from "../../helpers/validators";
import { VsCodeUtils } from "../../helpers/vsCodeUtils";
import { ILogger } from "../../log/logHelper";
import ReactNativeProjectCreator from "../../reactNativeProjectCreator";
import { models } from "../api";
import { Profile } from "../auth/profile/profile";
import { Command } from "./command";

export default class Start extends Command {

    private repositoryURL: string;
    constructor(manager: ExtensionManager, logger: ILogger) {
        super(manager, logger);
    }

    public async run(): Promise<void> {
        super.run();
        const rootPath = <string>this.manager.projectRootPath;
        if (!FSUtils.IsNewDirectoryForProject(rootPath)) {
            VsCodeUtils.ShowErrorMessage(Strings.DirectoryIsNotEmptyForNewIdea);
            this.logger.error(Strings.DirectoryIsNotEmptyForNewIdea);
            return;
        }
        vscode.window.showInputBox({ prompt: Strings.PleaseEnterIdeaName, ignoreFocusOut: true })
        .then(async ideaName => {
            if (!ideaName) {
                VsCodeUtils.ShowErrorMessage(Strings.NoIdeaNameSelectedMsg);
                return;
            }

            //TODO: Validate if name is unique! Or probably if already created do nothing?
            if (!Validators.ValidateProjectName(ideaName)) {
                VsCodeUtils.ShowErrorMessage(Strings.IdeaNameIsNotValidMsg);
                return;
            }

            if (!await this.createRNProject(ideaName, rootPath)) {
                VsCodeUtils.ShowErrorMessage(Strings.FailedToCreateRNProjectMsg);
                return;
            }

            vscode.window.showInputBox({ prompt: Strings.PleaseEnterNewRepositoryUrl, ignoreFocusOut: true })
            .then(async repositoryURL => {
                if (!repositoryURL || !Validators.ValidGitName(repositoryURL)) {
                    VsCodeUtils.ShowErrorMessage(Strings.FailedToProvideRepositoryNameMsg);
                    return;
                }
                this.repositoryURL = repositoryURL;

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

                            const done = new AppCenterAppBuilder(ideaName, selectedUserOrOrg, this.repositoryURL, SettingsHelper.defaultBranchName(), this.client, this.logger)
                                .withIOSApp(SettingsHelper.createIOSAppInAppCenter())
                                .withAndroidApp(SettingsHelper.createAndroidAppInAppCenter())
                                .withBetaTestersDistributionGroup(SettingsHelper.createTestersDistributionGroupInAppCenter())
                                .withConnectedRepositoryToBuildService(SettingsHelper.connectRepoToBuildService())
                                .withBranchConfigurationCreatedAndBuildKickOff(SettingsHelper.configureBranchAndStartNewBuild())
                                .create();

                            if (!done) {
                                this.logger.error("Failed to create App in AppCenter");
                                return;
                            }

                            await this.linkProjectToAppCenter();
                            await this.linkProjectToCP();

                            if (!await this.ConfigureRepoAndPush()) {
                                VsCodeUtils.ShowErrorMessage(Strings.FailedToPushChangesToRemoteRepoMsg(this.repositoryURL));
                                return;
                            }
                        }
                    });
                });
            });
        });
    }

    private async linkProjectToCP(): Promise<boolean> {
        return true;
    }

    private async linkProjectToAppCenter(): Promise<boolean> {
        return true;
    }

    private async createRNProject(ideaName: string, rootPath: string): Promise<boolean> {
        let created: boolean = false;
        if (!await GitUtils.IsGitInstalled(rootPath)) {
            VsCodeUtils.ShowErrorMessage(Strings.GitIsNotInstalledMsg);
            return created;
        }
        await GitUtils.GitInit(this.logger, rootPath);
        await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.VSCodeProgressLoadingTitle}, async p => {
                p.report({message: Strings.CreateRNProjectStatusBarMessage });
                created = await new ReactNativeProjectCreator(this.logger).createProject(ideaName, rootPath);
        });
        return created;
    }

    private async ConfigureRepoAndPush(): Promise<boolean> {
        return GitUtils.ConfigureRepoAndPush(this.repositoryURL, SettingsHelper.defaultBranchName(), this.logger, <string>this.manager.projectRootPath);
    }
}
