import * as path from "path";
import * as vscode from "vscode";
import AppCenterAppBuilder from "../../appCenterAppBuilder";
import AppCenterAppCreator from "../../appCenterAppCreator";
import AppCenterConfig from "../../appCenterConfig";
import { ExtensionManager } from "../../extensionManager";
import { AppCenterOS, Constants } from "../../helpers/constants";
import { cpUtils } from "../../helpers/cpUtils";
import { FSUtils } from "../../helpers/fsUtils";
import { GitUtils } from "../../helpers/gitUtils";
import { CreatedAppFromAppCenter, Deployment, QuickPickAppItem, UserOrOrganizationItem } from "../../helpers/interfaces";
import { SettingsHelper } from "../../helpers/settingsHelper";
import { Strings } from "../../helpers/strings";
import { Utils } from "../../helpers/utils";
import { Validators } from "../../helpers/validators";
import { CustomQuickPickItem, VsCodeUtils } from "../../helpers/vsCodeUtils";
import { ILogger } from "../../log/logHelper";
import { VSTSGitRepository, VSTSProject } from "../../vsts/types";
import { VSTSProvider } from "../../vsts/vstsProvider";
import { Profile } from "../auth/profile/profile";
import { ListOKResponseItem } from "../lib/app-center-node-client/models";
import { Command } from "./command";
// tslint:disable-next-line:no-var-requires
const GitUrlParse = require("git-url-parse");

export default class Start extends Command {

    private repositoryURL: string;
    constructor(manager: ExtensionManager, logger: ILogger) {
        super(manager, logger);
    }

    public async run(): Promise<void> {
        super.run();
        this.logger.info("Running AppCenter Start New Idea command...");
        const rootPath = <string>this.manager.projectRootPath;

        if (!FSUtils.IsEmptyGitInitializedDirectory(rootPath)) {
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

            // For empty directory we create new VSTS repository
            // For empty git directory (either created by git clone or git init) we just need to be sure that remoteUrl is valid
            const useVSTSWorkflow = FSUtils.IsEmptyDirectory(rootPath);
            if (useVSTSWorkflow) {

                // 1. Need VSTS TenatnName if not provided
                const tenantName: string = "msmobilecenter";
                // 2. Need userName + accessToken if not provided
                const accessToken: string = "";
                // 3. Need use name
                const userName: string = "";

                const vsts = new VSTSProvider({
                    tenantName: tenantName,
                    accessToken: accessToken,
                    userName: userName
                }, this.logger);

                const vstsProject: VSTSProject | null = await this.selectVstsProject(vsts);
                if (!vstsProject) {
                    this.logger.error("Failed to get VSTS Projects");
                    VsCodeUtils.ShowErrorMessage("Failed to get VSTS Projects");
                    return;
                }

                const vstsGitRepo: VSTSGitRepository | null = await vsts.CreateGitRepository(vstsProject.id, ideaName);
                if (!vstsGitRepo) {
                    this.logger.error("Failed to create VSTS git repo");
                    VsCodeUtils.ShowErrorMessage("Failed to create VSTS git repo");
                    return;
                }
                this.repositoryURL = vstsGitRepo.remoteUrl;
                await GitUtils.GitInit(this.logger, rootPath);
                await GitUtils.GitAddRemote(Constants.GitDefaultRemoteName, this.repositoryURL, this.logger, rootPath);
            } else if (!await this.getGitRemoteUrl(rootPath)) {
                VsCodeUtils.ShowErrorMessage(Strings.FailedToProvideRepositoryNameMsg);
                return;
            }

            if (!await this.addRemoteUrlForSampleApp(rootPath)) {
                VsCodeUtils.ShowErrorMessage(Strings.FailedToAddRemoteRepositoryMsg);
                return;
            }

            if (!await this.pullAppCenterSampleApp(rootPath)) {
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

                    if (!this.appsCreated(createdApps)) {
                        return;
                    }

                    const pathToAppCenterConfigPlist: string = path.join(rootPath, "ios", "AppCenterSample", "AppCenter-Config.plist");
                    const pathToMainPlist: string = path.join(rootPath, "ios", "AppCenterSample", "Info.plist");
                    const pathToAndroidConfig: string = path.join(rootPath, "android", "app", "src", "main", "assets", "appcenter-config.json");
                    const pathToAndroidStringResources: string = path.join(rootPath, "android", "app", "src", "main", "res", "values", "strings.xml");
                    const appCenterConfig = new AppCenterConfig(pathToAppCenterConfigPlist, pathToMainPlist, pathToAndroidConfig, pathToAndroidStringResources, this.logger);

                    if (!this.updateAppSecretKeys(createdApps, appCenterConfig)) {
                        this.logger.error("Failed to update app secret keys!");
                    }

                    const codePushDeployments: Deployment[] | null = await this.createCodePushDeployments(createdApps, <string>userOrOrgItem.name);
                    if (codePushDeployments && codePushDeployments.length > 0) {
                        if (!await this.updateCodePushDeploymentKeys(codePushDeployments, appCenterConfig)) {
                            this.logger.error("Failed to update code push deployment keys!");
                        }
                    }

                    // We need to push changes before we configure/start build in AppCenter
                    if (!await this.pushToExistingRemoteRepo(rootPath)) {
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
        this.logger.info("Getting user/organization items...");
        await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.VSCodeProgressLoadingTitle}, p => {
            p.report({message: Strings.LoadingStatusBarMessage });
            return this.client.account.organizations.list().then((orgList: ListOKResponseItem[]) => {
                const organizations: ListOKResponseItem[] = orgList;
                return organizations.sort((a, b): any => {
                    if (a.name && b.name) {
                        return a.name < b.name; // sort alphabetically
                    } else {
                        return false;
                    }
                });
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
            this.logger.info("Running npm install...");
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

    private appsCreated(apps: CreatedAppFromAppCenter[]): boolean {
        if (!apps || apps.length === 0) {
            return false;
        }
        if (apps.length === 2) { // iOS and Android apps
            if (typeof apps[0] === "boolean" && <boolean>!apps[0]) {
                return false;
            }
            if (typeof apps[1] === "boolean" && <boolean>!apps[1]) {
                return false;
            }
        }
        return true;
    }

    private updateAppSecretKeys(apps: CreatedAppFromAppCenter[], appCenterConfig: AppCenterConfig): boolean {
        let saved: boolean = false;
        if (!apps || apps.length === 0) {
            return saved;
        }
        this.logger.info("Updating app secrets...");
        apps.forEach((app: CreatedAppFromAppCenter) => {
            if (!app || !app.appSecret) {
                return saved;
            }

            this.logger.info(`App name: ${app.name}, secret: ${app.appSecret}`);

            if (app.os.toLowerCase() === AppCenterOS.iOS.toLowerCase()) {
                appCenterConfig.setConfigPlistValueByKey(Constants.IOSAppSecretKey, app.appSecret);
                saved = appCenterConfig.saveConfigPlist();
            }

            if (app.os.toLowerCase() === AppCenterOS.Android.toLowerCase()) {
                appCenterConfig.setAndroidAppCenterConfigValueByKey(Constants.AndroidAppSecretKey, app.appSecret);
                saved = appCenterConfig.saveAndroidAppCenterConfig();
            }
            return saved;
        });
        return saved;
    }

    private async updateCodePushDeploymentKeys(deployments: Deployment[], appCenterConfig: AppCenterConfig): Promise<boolean> {
        let saved: boolean = false;
        if (!deployments || deployments.length === 0) {
            return saved;
        }
        this.logger.info("Updating CodePush Deployment Keys...");
        deployments.forEach(async (deployment: Deployment) => {
            if (!deployment || !deployment.os || !deployment.key) {
                return saved;
            }
            this.logger.info(`Deployment name: ${deployment.name}, secret: ${deployment.key}, OS: ${deployment.os}`);

            if (deployment.os.toLowerCase() === AppCenterOS.iOS.toLowerCase()) {
                appCenterConfig.setMainPlistValueByKey(Constants.IOSCodePushDeploymentKey, deployment.key);
                saved = appCenterConfig.saveMainPlist();
            }

            if (deployment.os.toLowerCase() === AppCenterOS.Android.toLowerCase()) {
                appCenterConfig.setAndroidStringResourcesDeploymentKey(deployment.key);
                saved = appCenterConfig.saveAndroidStringResources();
            }
            return saved;
        });
        return saved;
    }

    private async createCodePushDeployments(apps: CreatedAppFromAppCenter[], ownerName: string): Promise<Deployment[] | null> {
        if (!apps || apps.length === 0) {
            return null;
        }
        this.logger.info("Creating CodePush deployments...");
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
        this.logger.info("Checking if git is installed...");
        return await GitUtils.IsGitInstalled(_rootPath);
    }

    private async addRemoteUrlForSampleApp(_rootPath: string): Promise<boolean> {
        this.logger.info("Adding remote url to pul data for sample app");
        return await GitUtils.GitAddRemote(Constants.AppCenterSampleGitRemoteName, SettingsHelper.getAppCenterDemoAppGitRepo(), this.logger, _rootPath);
    }

    private async getGitRemoteUrl(_rootPath: string): Promise<boolean> {
        const remoteUrl = await GitUtils.GitGetRemoteUrl(this.logger, _rootPath);
        if (!remoteUrl) {
            await vscode.window.showInputBox({ prompt: Strings.PleaseEnterNewRepositoryUrl, ignoreFocusOut: true })
            .then(repositoryURL => {
                if (!repositoryURL || !Validators.ValidGitName(repositoryURL)) {
                    VsCodeUtils.ShowErrorMessage(Strings.FailedToProvideRepositoryNameMsg);
                    return false;
                }
                this.repositoryURL = GitUrlParse(Utils.removeNewLinesFromString(repositoryURL)).toString("https");
                return true;
            });
            return true;
        } else {
            this.repositoryURL = GitUrlParse(Utils.removeNewLinesFromString(remoteUrl)).toString("https");
            return true;
        }
    }

    private async pullAppCenterSampleApp(_rootPath: string): Promise<boolean> {
        let created: boolean = false;
        this.logger.info("Pull AppCenter sample app into current directory...");
        await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.VSCodeProgressLoadingTitle}, async p => {
            p.report({message: Strings.CreateRNProjectStatusBarMessage });
            created = await GitUtils.GitPullFromRemoteUrl(Constants.AppCenterSampleGitRemoteName, Constants.AppCenterSampleGitRemoteDefaultBranchName, this.logger, _rootPath);
        });
        return created;
    }

    private async pushToExistingRemoteRepo(_rootPath: string): Promise<boolean> {
        let pushed: boolean = false;
        this.logger.info(`Pushing changes to ${this.repositoryURL}...`);
        await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.VSCodeProgressLoadingTitle}, async p => {
            p.report({message: Strings.PushToRemoteRepoStatusBarMessage });
            pushed = await GitUtils.GitPushToRemoteUrl(this.repositoryURL, SettingsHelper.defaultBranchName(), this.logger, _rootPath);
         });
        return pushed;
    }

    private async selectVstsProject(vstsProvider: VSTSProvider): Promise<VSTSProject | null> {
        let projectList: VSTSProject[] | null = [];
        let vstsProject: VSTSProject | null = null;
        await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.VSCodeProgressLoadingTitle}, async p => {
            p.report({message: "Loading VSTS projects for you..." });
            projectList = await vstsProvider.GetAllProjects();
        });
        if (projectList) {
            const options: QuickPickAppItem[] = projectList.map((project: VSTSProject) => {
                return {
                    label: `${project.name}`,
                    description: "",
                    target: `${project.id}`
                };
            });
            await vscode.window.showQuickPick(options, { placeHolder: Strings.ProvideCurrentAppPromptMsg })
            .then(async (selected: QuickPickAppItem) => {
                if (!selected) {
                    this.logger.info('User cancel selection of vsts project');
                    return null;
                }
                if (projectList) {
                    const selectedProj: VSTSProject[] = projectList.filter(proj => proj.id === selected.target);
                    if (selectedProj && selectedProj.length > 0) {
                        vstsProject = selectedProj[0];
                    }
                }
                return null;
            });
        }

        if (vstsProject) {
            return vstsProject;
        }
        return null;
    }
}
