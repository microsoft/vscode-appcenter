import * as vscode from "vscode";
import AppCenterAppBuilder from "../../appCenterAppBuilder";
import AppCenterAppCreator from "../../appCenterAppCreator";
import { ExtensionManager } from "../../extensionManager";
import { AppCenterOS } from "../../helpers/constants";
import { cpUtils } from "../../helpers/cpUtils";
import { FSUtils } from "../../helpers/fsUtils";
import { GitUtils } from "../../helpers/gitUtils";
import { CreatedAppFromAppCenter, Deployment, UserOrOrganizationItem } from "../../helpers/interfaces";
import { SettingsHelper } from "../../helpers/settingsHelper";
import { Strings } from "../../helpers/strings";
import { Utils } from "../../helpers/utils";
import { Validators } from "../../helpers/validators";
import { CustomQuickPickItem, VsCodeUtils } from "../../helpers/vsCodeUtils";
import { ILogger } from "../../log/logHelper";
import { Profile } from "../auth/profile/profile";
import { ListOKResponseItem } from "../lib/app-center-node-client/models";
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

        if (!await this.isGitInstalled(rootPath)) {
            VsCodeUtils.ShowErrorMessage(Strings.GitIsNotInstalledMsg);
            return;
        }

        vscode.window.showInputBox({ prompt: Strings.PleaseEnterIdeaName, ignoreFocusOut: true })
        .then(async ideaName => {
            if (!ideaName) {
                VsCodeUtils.ShowErrorMessage(Strings.NoIdeaNameSelectedMsg);
                return;
            }

            if (!Validators.ValidateProjectName(ideaName)) {
                VsCodeUtils.ShowErrorMessage(Strings.IdeaNameIsNotValidMsg);
                return;
            }

            if (!await this.getTargetRepositoryUrl(rootPath)) {
                VsCodeUtils.ShowErrorMessage(Strings.FailedToProvideRepositoryNameMsg);
                return;
            }

            if (!await this.removeRemoteIfExist(rootPath)) {
                VsCodeUtils.ShowErrorMessage(Strings.FailedToRemoveRemoteRepositoryMsg);
                return;
            }

            if (!await this.cloneSampleRNProject(rootPath)) {
                VsCodeUtils.ShowErrorMessage(Strings.FailedToCreateRNProjectMsg);
                return;
            }

            const userOrOrgQuickPickItems: CustomQuickPickItem[] = await this.getUserOrOrganizationItems();
            vscode.window.showQuickPick(userOrOrgQuickPickItems, { placeHolder: Strings.PleaseSelectCurrentAppOrgMsg })
            .then(async (selectedQuickPickItem: CustomQuickPickItem) => {
                if (selectedQuickPickItem) {
                    const userOrOrgItem: UserOrOrganizationItem | null = this.getSelectedUserOrOrgItem(selectedQuickPickItem, userOrOrgQuickPickItems);
                    if (!userOrOrgItem) {
                        VsCodeUtils.ShowErrorMessage(Strings.FailedToGetSelectedUserOrOrganizationMsg);
                        return;
                    }

                    const appCenterAppBuilder = new AppCenterAppBuilder(<string>ideaName, userOrOrgItem, this.repositoryURL, this.client, this.logger);
                    await appCenterAppBuilder.createApps();
                    const createdApps: CreatedAppFromAppCenter[] = appCenterAppBuilder.getCreatedApps();
                    if (!await this.updateAppSecretKeys(createdApps)) {
                        this.logger.error("Failed to update app secret keys!");
                    }

                    const codePushDeployments: Deployment[] | null = await this.createCodePushDeployments(createdApps, <string>userOrOrgItem.name);
                    if (codePushDeployments && codePushDeployments.length > 0) {
                        if (!await this.updateCodePushDeploymentKeys(codePushDeployments)) {
                            this.logger.error("Failed to update code push deployment keys!");
                        }
                    }

                    // We need to push changes before we configure build in AppCenter
                    if (!await this.ConfigureRepoAndPush(rootPath)) {
                        VsCodeUtils.ShowErrorMessage(Strings.FailedToPushChangesToRemoteRepoMsg(this.repositoryURL));
                        return;
                    }

                    const done = await appCenterAppBuilder.startProcess();
                    if (!done) {
                        VsCodeUtils.ShowErrorMessage(Strings.FailedToCreateAppInAppCenter);
                        return;
                    }

                    await this.runNPMInstall();
                }
            });
        });
    }

    private getSelectedUserOrOrgItem(selected: CustomQuickPickItem, allItems: CustomQuickPickItem[]): UserOrOrganizationItem | null {
        let userOrOrgItem: UserOrOrganizationItem;
        const selectedUserOrOrgs: CustomQuickPickItem[] = allItems.filter(item => item.target === selected.target);
        if (selectedUserOrOrgs && selectedUserOrOrgs.length === 1) {
            userOrOrgItem = {
                name: selectedUserOrOrgs[0].target,
                displayName: selectedUserOrOrgs[0].label,
                isOrganization: selectedUserOrOrgs[0].description !== Strings.UserMenuDescriptionLabel
            };
            return userOrOrgItem;
        } else {
            return null;
        }
    }

    private async getUserOrOrganizationItems(): Promise<CustomQuickPickItem[]> {
        let items: CustomQuickPickItem[] = [];
        await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.VSCodeProgressLoadingTitle}, p => {
            p.report({message: Strings.LoadingStatusBarMessage });
            return this.client.account.organizations.list().then((orgList: ListOKResponseItem[]) => {
                const organizations: ListOKResponseItem[] = orgList;
                return organizations;
            });
            }).then(async (orgList: ListOKResponseItem[]) => {
            const options: CustomQuickPickItem[] = orgList.map(item => {
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
            }
            items = options;
        });
        return items;
    }

    private async runNPMInstall() {
        try {
            const installNodeModulesCmd: string = "npm i";
            await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.VSCodeProgressLoadingTitle}, async p => {
                p.report({message: Strings.RunNPMInstallStatusBarMessage });
                await cpUtils.executeCommand(this.logger, this.manager.projectRootPath, installNodeModulesCmd);
                VsCodeUtils.ShowInfoMessage(Strings.NodeModulesInstalledMessage);
            });
            return true;
        } catch (error) {
            this.logger.error("Failed to run npm install");
            return false;
        }
    }

    private async updateAppSecretKeys(apps: CreatedAppFromAppCenter[]): Promise<boolean> {
        if (!apps || apps.length === 0) {
            return false;
        }
        apps.forEach(async (app: CreatedAppFromAppCenter) => {
            if (!app) {
                return;
            }
            console.log(`App name: ${app.name}, secret: ${app.appSecret}`);
            //TODO: UPDATE APP SECRET
        });
        return true;
    }

    private async updateCodePushDeploymentKeys(deployments: Deployment[]): Promise<boolean> {
        if (!deployments || deployments.length === 0) {
            return false;
        }
        deployments.forEach(async (deployment: Deployment) => {
            if (!deployment) {
                return;
            }
            console.log(`Deployment name: ${deployment.name}, secret: ${deployment.key}, OS: ${deployment.os}`);
            //TODO: UPDATE DEPLOYMENT KEY
        });
        return true;
    }

    private async createCodePushDeployments(apps: CreatedAppFromAppCenter[], ownerName: string): Promise<Deployment[] | null> {
        if (!apps || apps.length === 0) {
            return null;
        }

        const deployments: Deployment[] = [];
        await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.VSCodeProgressLoadingTitle}, async p => {
            p.report({message: Strings.CreatingCodePushDeploymentsStatusBarMessage });
            const appCenterAppCreator: AppCenterAppCreator = new AppCenterAppCreator(this.client, this.logger);
            for (let index = 0; index < apps.length; index++) {
                const app: CreatedAppFromAppCenter = apps[index];
                const deployment: Deployment = await appCenterAppCreator.createCodePushDeployment(app.name, ownerName);
                app.os.toLowerCase() === AppCenterOS.iOS.toLowerCase() ? deployment.os = AppCenterOS.iOS : deployment.os = AppCenterOS.Android;
                deployments.push(deployment);
            }
        });
        return deployments;
    }

    private async isGitInstalled(_rootPath: string): Promise<boolean> {
        return await GitUtils.IsGitInstalled(_rootPath);
    }

    private async removeRemoteIfExist(_rootPath: string): Promise<boolean> {
        // We should save and remove remote because we will add another remote to clone project
        const remotes: string[] = await GitUtils.GitGetRemoteName(this.logger, _rootPath);
        if (remotes && remotes.length > 0) {
            remotes.forEach(async (val: any) => {
                return await GitUtils.GitRemoveRemote(val.name, this.logger, _rootPath);
            });
            return true;
        }
        return true;
    }

    private async getTargetRepositoryUrl(_rootPath: string): Promise<boolean> {
        const remoteUrl = await GitUtils.GitGetRemoteUrl(this.logger, _rootPath);
        if (!remoteUrl) {
            await vscode.window.showInputBox({ prompt: Strings.PleaseEnterNewRepositoryUrl, ignoreFocusOut: true })
            .then(repositoryURL => {
                if (!repositoryURL || !Validators.ValidGitName(repositoryURL)) {
                    VsCodeUtils.ShowErrorMessage(Strings.FailedToProvideRepositoryNameMsg);
                    return false;
                }
                this.repositoryURL = Utils.removeNewLinesFromString(repositoryURL);
                return true;
            });
            return true;
        } else {
            this.repositoryURL = Utils.removeNewLinesFromString(remoteUrl);
            return true;
        }
    }

    private async cloneSampleRNProject(_rootPath: string): Promise<boolean> {
        let created: boolean = false;
        await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.VSCodeProgressLoadingTitle}, async p => {
            p.report({message: Strings.CreateRNProjectStatusBarMessage });
            created = await GitUtils.GitCloneIntoExistingDir(this.logger, _rootPath, SettingsHelper.getAppCenterDemoAppGitRepo());
        });
        return created;
    }

    private async ConfigureRepoAndPush(_rootPath: string): Promise<boolean> {
        let pushed: boolean = false;
        await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.VSCodeProgressLoadingTitle}, async p => {
            p.report({message: Strings.PushToRemoteRepoStatusBarMessage });
            pushed = await GitUtils.ConfigureRepoAndPush(this.repositoryURL, SettingsHelper.defaultBranchName(), this.logger, _rootPath);
         });
        return pushed;
    }
}
