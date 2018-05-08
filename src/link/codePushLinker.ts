import AppCenterAppCreator from '../createApp/appCenterAppCreator';
import { ILogger } from '../extension/log/logHelper';
import { AppCenterOS } from '../extension/resources/constants';
import { Deployment, LinkableApp, ReactNativeLinkInputValue } from '../helpers/interfaces';
import { cpUtils } from '../helpers/utils/cpUtils';
import { VsCodeUI } from '../extension/ui/vscodeUI';
import { Messages } from '../extension/resources/messages';

export default class CodePushLinker {

    private useRNPM: boolean = false;

    constructor(private appCenterAppCreator: AppCenterAppCreator, private logger: ILogger, private rootPath: string) {
     }

    public async createCodePushDeployments(apps: LinkableApp[], ownerName: string): Promise<Deployment[] | null> {
        if (!apps || apps.length === 0) {
            return null;
        }
        const deployments: Deployment[] = [];
        await VsCodeUI.showProgress(async progress => {
            progress.report({ message: Messages.CreatingCodePushDeploymentsProgressMessage });
            for (let index = 0; index < apps.length; index++) {
                const app: LinkableApp = apps[index];
                const deployment: Deployment = await this.appCenterAppCreator.createCodePushDeployment(app.appName, ownerName);
                if (!deployment) {
                    continue;
                }
                app.os.toLowerCase() === AppCenterOS.iOS.toLowerCase() ? deployment.os = AppCenterOS.iOS : deployment.os = AppCenterOS.Android;
                deployments.push(deployment);
            }
        });
        return deployments;
    }

    public async installCodePush(): Promise<boolean> {
        const installCodePushCmd: string = "npm i react-native-code-push --save";
        const installRNPMCmd: string = "npm i -g rnpm";
        return await VsCodeUI.showProgress(async () => {
            try {
                await cpUtils.executeCommand(this.logger, true, this.rootPath, installCodePushCmd);
                const isLowerThan027: boolean = await this.isReactNativeLowerThan027(this.rootPath);
                if (isLowerThan027) {
                    try {
                        await cpUtils.executeCommand(this.logger, true, this.rootPath, installRNPMCmd);
                    } catch (error) {
                        this.logger.error(`Failed to run ${installRNPMCmd}`);
                        return false;
                    }
                    this.useRNPM = true;
                }
                return true;
            } catch (error) {
                this.logger.error(`Failed to run ${installCodePushCmd}`);
                return false;
            }
        }, Messages.InstallCodePushProgressMessage);
    }

    private async isReactNativeLowerThan027(rootPath: string): Promise<boolean> {
        const version = await cpUtils.executeCommand(this.logger, true, rootPath, "npm view react-native version");
        const versionNumber: number = Number.parseFloat(version);
        return versionNumber < 0.27;
    }

    public async linkCodePush(deployments: Deployment[]): Promise<boolean> {
        const self = this;
        const cmd = this.useRNPM ? "rnpm" : "react-native";
        const iosStagingDeploymentKey = this.findDeploymentKeyFor(AppCenterOS.iOS, deployments);
        const androidStagingDeploymentKey = this.findDeploymentKeyFor(AppCenterOS.Android, deployments);
        if (!iosStagingDeploymentKey && !androidStagingDeploymentKey) {
            self.logger.error('Deployment keys are missing.');
            return Promise.resolve(false);
        }
        return await VsCodeUI.showProgress(async (progress) => {
            progress.report({ message: Messages.LinkCodePushProgressMessage });
            const inputValues: ReactNativeLinkInputValue[] = [
                {
                    label: "deployment key for Android",
                    input: androidStagingDeploymentKey,
                    sent: false
                },
                {
                    label: "deployment key for iOS",
                    input: iosStagingDeploymentKey,
                    sent: false
                }
            ];
            try {
                await cpUtils.executeCommand(this.logger, true, this.rootPath, `${cmd} link react-native-code-push`, inputValues);
                return true;
            } catch (err) {
                this.logger.error(err);
                return false;
            }
        });
    }

    private findDeploymentKeyFor(os: AppCenterOS, deployments: Deployment[]): string {
        const filteredDeployments: Deployment[] = deployments.filter((deployment) => {
            return deployment.os.toLowerCase() === os.toLowerCase();
        });
        if (filteredDeployments.length === 0) {
            return "";
        }
        return filteredDeployments[0].key || "";
    }
}
