import { VSTSGitRepository, VSTSProject } from '../../../api/vsts/types';
import { VSTSProvider } from '../../../api/vsts/vstsProvider';
import Auth from '../../../auth/auth';
import AppCenterAppBuilder from '../../../createApp/appCenterAppBuilder';
import AppCenterAppCreator from '../../../createApp/appCenterAppCreator';
import AppCenterConfig from '../../../data/appCenterConfig';
import { CommandParams, CreatedAppFromAppCenter, Deployment, QuickPickAppItem, VstsProfile } from '../../../helpers/interfaces';
import { SettingsHelper } from '../../../helpers/settingsHelper';
import { cpUtils } from '../../../helpers/utils/cpUtils';
import { FSUtils } from '../../../helpers/utils/fsUtils';
import { GitUtils } from '../../../helpers/utils/gitUtils';
import { Validators } from '../../../helpers/utils/validators';
import CodePushLinker from '../../../link/codePushLinker';
import { AppCenterOS, Constants } from '../../resources/constants';
import { Strings } from '../../resources/strings';
import { CreateAppCommand } from '../createAppCommand';
import { LoginToVsts } from '../settings';
import { VsCodeUI, IButtonMessageItem } from '../../ui/vscodeUI';
import { Utils } from '../../../helpers/utils/utils';
import { LogStrings } from '../../resources/logStrings';
import { Messages } from '../../resources/messages';
import { CreateNewAppOption } from './createNewApp';
// tslint:disable-next-line:no-var-requires
const GitUrlParse = require("git-url-parse");

export default class Start extends CreateAppCommand {

    private repositoryURL: string;
    constructor(params: CommandParams) {
        super(params);
    }

    public async run(): Promise<void> {
        super.run();
        this.logger.info(LogStrings.BuildingProject);

        if (!FSUtils.IsEmptyDirectoryToStartNewProject(this.rootPath)) {
            VsCodeUI.ShowWarningMessage(Messages.DirectoryIsNotEmptyForNewProjectWarning);
            this.logger.error(Messages.DirectoryIsNotEmptyForNewProjectWarning);
            return;
        }

        if (!await GitUtils.IsGitInstalled(this.rootPath)) {
            VsCodeUI.ShowWarningMessage(Messages.GitIsNotInstalledWarning);
            return;
        }

        let projectName: string | null = null;
        while (projectName == null) {
            projectName = await this.getProjectName(CreateNewAppOption.Both);
        }
        if (projectName.length === 0) {
            return;
        }

        // For empty directory we create new VSTS repository
        // For empty git directory (either created with git clone or git init) we just need to be sure that remoteUrl is valid
        if (!await GitUtils.IsGitRepo(this.logger, this.rootPath)) {

            let vstsProfile: VstsProfile | null = await this.vstsAuth.activeProfile;
            let loggedIn: boolean | void;
            if (!vstsProfile) {
                loggedIn = await new LoginToVsts(
                    {
                        manager: this.manager,
                        appCenterAuth: this.appCenterAuth,
                        vstsAuth: this.vstsAuth
                    }
                ).runNoClient();
            } else {
                loggedIn = true;
            }
            vstsProfile = await this.vstsAuth.activeProfile;
            if (!vstsProfile || !loggedIn) {
                this.logger.error(LogStrings.FailedToGetVSTSProfile);
                return;
            }

            const tenantName: string = vstsProfile.tenantName; //"msmobilecenter";

            const accessToken: string = await Auth.accessTokenFor(vstsProfile);

            const userName: string = vstsProfile.userName;

            const vsts = new VSTSProvider({
                tenantName: tenantName,
                accessToken: accessToken,
                userName: userName
            }, this.logger);

            const vstsProject: VSTSProject | null = await this.selectVstsProject(vsts);
            if (!vstsProject) {
                this.logger.error(LogStrings.FailedToGetVSTSProject);
                return;
            }

            const vstsGitRepo: VSTSGitRepository | null = await vsts.CreateGitRepository(vstsProject.id, projectName);
            if (!vstsGitRepo) {
                this.logger.error(LogStrings.FailedToCreateVSTSRepo);
                VsCodeUI.ShowErrorMessage(Messages.FailedToCreateVSTSGitrepository);
                return;
            }

            this.repositoryURL = vstsGitRepo.remoteUrl;
            await GitUtils.GitInit(this.logger, this.rootPath);
        } else if (!await this.getGitRemoteUrl(this.rootPath)) {
            VsCodeUI.ShowErrorMessage(Messages.FailedToProvideRepositoryNameMsg);
            return;
        }

        if (!await this.ensureRemoteAdded(Constants.GitDefaultRemoteName, this.repositoryURL, this.rootPath)) {
            VsCodeUI.ShowErrorMessage(Messages.FailedToAddRemoteRepositoryMsg);
            return;
        }

        if (!await this.ensureRemoteAdded(Constants.AppCenterSampleGitRemoteName, SettingsHelper.getAppCenterDemoAppGitRepo(), this.rootPath)) {
            VsCodeUI.ShowErrorMessage(Messages.FailedToAddRemoteRepositoryMsg);
            return;
        }

        if (!await this.pullAppCenterSampleApp(this.rootPath)) {
            VsCodeUI.ShowErrorMessage(Messages.FailedToCreateRNProjectMsg);
            return;
        }

        const userOrOrgItem = await this.getOrg();
        if (userOrOrgItem == null) {
            return;
        }
        this.userOrOrg = userOrOrgItem;

        const appCenterAppBuilder = new AppCenterAppBuilder(projectName, userOrOrgItem, this.repositoryURL, this.client, this.logger);
        this.logger.info(LogStrings.CreatingAppsInAppCenter);
        await appCenterAppBuilder.createApps();
        const createdApps: CreatedAppFromAppCenter[] = appCenterAppBuilder.getCreatedApps();

        if (!this.appsCreated(createdApps)) {
            this.logger.error(LogStrings.FailedCreateAppsInAppCenter);
            VsCodeUI.ShowErrorMessage(Messages.FailedToCreateAppInAppCenter);
            return;
        }

        const appCenterConfig = Utils.createAppCenterConfigFrom(Constants.AppCenterSampleAppName, this.rootPath, this.logger);

        this.logger.info(LogStrings.ConfiguringAppCenterSDK);
        if (!this.updateAppSecretKeys(createdApps, appCenterConfig)) {
            this.logger.error(LogStrings.FailedToUpdateAppSecret);
        }

        this.logger.info(LogStrings.CreatingCodePushDeployments);

        const appCenterAppCreator: AppCenterAppCreator = new AppCenterAppCreator(this.client, this.logger);
        const codePushLinker: CodePushLinker = new CodePushLinker(appCenterAppCreator, this.logger, this.rootPath);
        const codePushDeployments: Deployment[] | null = await codePushLinker.createCodePushDeployments(createdApps, <string>userOrOrgItem.name);

        if (codePushDeployments && codePushDeployments.length > 0) {
            if (!await this.updateCodePushDeploymentKeys(codePushDeployments, appCenterConfig)) {
                this.logger.error(LogStrings.FailedToCreateDeploymentKeys);
            }
        } else {
            VsCodeUI.ShowErrorMessage(Messages.FailedToCreateDeployments);
            return;
        }

        // We need to push changes before we configure/start build in AppCenter
        if (!await this.pushToDefaultRemoteRepo(this.rootPath)) {
            VsCodeUI.ShowErrorMessage(Messages.FailedToPushChangesToRemoteRepoMsg(this.repositoryURL));
            return;
        }

        // We can run npm install in parralel while doing other stuff for appcenter
        this.runNPMInstall();
        this.runPodUpdate();
        const done = await appCenterAppBuilder.startProcess();
        if (!done) {
            VsCodeUI.ShowErrorMessage(Messages.FailedToCreateAppInAppCenter);
        } else {
            const successMessage: string = `
--------------------------------------------------------
    Apps Created:
        ${AppCenterAppBuilder.getAndroidAppName(projectName)}
        ${AppCenterAppBuilder.getiOSAppName(projectName)}
--------------------------------------------------------`;
            this.logger.info(successMessage);

            this.pickApp(appCenterAppBuilder.getCreatedApps());
        }
    }

    private async runPodUpdate(): Promise<boolean> {
        try {
            const podUpdateCmd: string = "pod install";
            this.logger.debug(LogStrings.InstallingPods);
            await cpUtils.executeCommand(this.logger, true, `${this.rootPath}/ios`, podUpdateCmd);
            this.logger.debug(LogStrings.PodsInstalledMessage);
            return true;
        } catch (error) {
            this.logger.error(LogStrings.FailedToInstallPods);

            const messageItems: IButtonMessageItem[] = [];
            messageItems.push({
                title: Strings.PodInstallBtnLabel,
                url: "https://cocoapods.org"
            });
            VsCodeUI.ShowInfoMessage(Messages.PodsNotInstalledMessage, ...messageItems);
            return false;
        }
    }

    private async runNPMInstall(): Promise<boolean> {
        try {
            const installNodeModulesCmd: string = "npm i";
            this.logger.debug(LogStrings.RunningNpmI);
            await cpUtils.executeCommand(this.logger, true, this.rootPath, installNodeModulesCmd);
            this.logger.debug(LogStrings.NodeModulesInstalledMessage);
            return true;
        } catch (error) {
            this.logger.error(LogStrings.FailedNpmI);
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
        this.logger.debug(LogStrings.SettingAppSecrets);
        apps.forEach((app: CreatedAppFromAppCenter) => {
            if (!app || !app.appSecret) {
                return saved;
            }

            this.logger.debug(LogStrings.SecretsInfo(app.appName, app.appSecret));

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
        this.logger.info(LogStrings.SettingDeploymentKeys);
        deployments.forEach(async (deployment: Deployment) => {
            if (!deployment || !deployment.os || !deployment.key) {
                return saved;
            }
            this.logger.debug(LogStrings.DeploymentInfo(deployment.name, deployment.key, deployment.os));

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

    private async getGitRemoteUrl(_rootPath: string): Promise<boolean> {
        const remoteUrl = await GitUtils.GitGetRemoteUrl(this.logger, _rootPath);
        if (!remoteUrl) {
            const repositoryURL: string = await VsCodeUI.showInput(Strings.PleaseEnterNewRepositoryUrlHint);
            if (!repositoryURL || !Validators.ValidGitName(repositoryURL)) {
                return false;
            }
            this.repositoryURL = GitUrlParse(repositoryURL.trim()).toString("https");
            return true;
        } else {
            const repoName = GitUrlParse(remoteUrl.trim()).toString("https");
            if (!repoName) {
                return false;
            }
            this.repositoryURL = repoName;
            return true;
        }
    }

    private async pullAppCenterSampleApp(_rootPath: string): Promise<boolean> {
        let created: boolean = false;
        this.logger.debug(LogStrings.PullingSample);
        await VsCodeUI.showProgress(async progress => {
            progress.report({ message: Messages.CreateRNProjectProgressMessage });
            created = await GitUtils.GitPullFromRemoteUrl(Constants.AppCenterSampleGitRemoteName, Constants.AppCenterSampleGitRemoteDefaultBranchName, this.logger, _rootPath);
        });
        return created;
    }

    private async ensureRemoteAdded(remoteName: string, remoteUrl: string, _rootPath: string): Promise<boolean> {
        const remoteNames: string[] = await GitUtils.GitGetRemoteName(this.logger, _rootPath);
        if (remoteNames && remoteNames.length > 0) {
            let alreadyExist: boolean = false;
            remoteNames.forEach((remote: any) => {
                if (remote.name.trim() === remoteName) {
                    alreadyExist = true;
                }
            });
            if (!alreadyExist) {
                return await GitUtils.GitAddRemote(remoteName, remoteUrl, this.logger, _rootPath);
            } else {
                return true;
            }
        } else {
            return await GitUtils.GitAddRemote(remoteName, remoteUrl, this.logger, _rootPath);
        }
    }

    private async pushToDefaultRemoteRepo(_rootPath: string): Promise<boolean> {
        let pushed: boolean = false;
        this.logger.debug(LogStrings.PushingChangesTo(this.repositoryURL));
        await VsCodeUI.showProgress(async progress => {
            progress.report({ message: Messages.PushToRemoteRepoProgressMessage });
            pushed = await GitUtils.GitPushToRemoteUrl(Constants.GitDefaultRemoteName, SettingsHelper.defaultBranchName(), this.logger, _rootPath);
        });
        return pushed;
    }

    private async selectVstsProject(vstsProvider: VSTSProvider): Promise<VSTSProject | null> {
        let projectList: VSTSProject[] | null = [];
        let vstsProject: VSTSProject | null = null;
        await VsCodeUI.showProgress(async progress => {
            progress.report({ message: Messages.LoadingVSTSProjectsProgressMessage });
            projectList = await vstsProvider.GetAllProjects();
        });
        if (projectList) {
            projectList = projectList.sort((a, b): any => {
                if (a.name && b.name) {
                    const nameA = a.name.toUpperCase();
                    const nameB = b.name.toUpperCase();
                    if (nameA < nameB) {
                        return -1;
                    }
                    if (nameA > nameB) {
                        return 1;
                    }
                    return 0; // sort alphabetically
                } else {
                    return 0;
                }
            });
            const options: QuickPickAppItem[] = projectList.map((project: VSTSProject) => {
                return {
                    label: `${project.name}`,
                    description: "",
                    target: `${project.id}`
                };
            });
            const selected: QuickPickAppItem = await VsCodeUI.showQuickPick(options, Strings.ProvideVSTSProjectPromptHint);
            if (!selected) {
                this.logger.debug('User cancel selection of vsts project');
                return null;
            }
            if (projectList) {
                const selectedProj: VSTSProject[] = projectList.filter(proj => proj.id === selected.target);
                if (selectedProj && selectedProj.length > 0) {
                    vstsProject = selectedProj[0];
                }
            }
        }

        if (vstsProject) {
            return vstsProject;
        }
        return null;
    }
}
