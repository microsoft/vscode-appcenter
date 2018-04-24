
import * as vscode from 'vscode';
import AppCenterAppCreator from './appCenterAppCreator';
import { AppCenterOS } from './constants';
import { cpUtils } from './helpers/cpUtils';
import { Deployment, LinkableApp } from './helpers/interfaces';
import nexpect = require("./helpers/nexpect");
import { ILogger } from './log/logHelper';
import { Strings } from './strings';

export default class CodePushLinker {

    private useRNPM: boolean = false;

    constructor(private appCenterAppCreator: AppCenterAppCreator, private logger: ILogger, private rootPath: string) { }

    public async createCodePushDeployments(apps: LinkableApp[], ownerName: string): Promise<Deployment[] | null> {
        if (!apps || apps.length === 0) {
            return null;
        }
        const deployments: Deployment[] = [];
        await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.VSCodeProgressLoadingTitle }, async p => {
            p.report({ message: Strings.CreatingCodePushDeploymentsStatusBarMessage });
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
        return await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.InstallCodePushTitle }, async () => {
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
        });
    }

    private async isReactNativeLowerThan027(rootPath: string): Promise<boolean> {
        const version = await cpUtils.executeCommand(this.logger, true, rootPath, "npm view react-native version");
        const versionNumber: number = Number.parseFloat(version);
        return versionNumber < 0.27;
    }

    public async linkCodePush(deployments: Deployment[]): Promise<boolean> {
        const self = this;
        const iosStagingDeploymentKey = this.findDeploymentKeyFor(AppCenterOS.iOS, deployments);
        const androidStagingDeploymentKey = this.findDeploymentKeyFor(AppCenterOS.Android, deployments);
        const linkCmd: string = this.useRNPM ? `rnpm link react-native-code-push` : `react-native link react-native-code-push`;
        if (!iosStagingDeploymentKey && !androidStagingDeploymentKey) {
            self.logger.error('Deployment keys are missing.');
            return Promise.resolve(false);
        }
        return await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: Strings.LinkCodePushTitle }, async () => {
            return await new Promise<boolean>(async (resolve) => {
                nexpect.spawn(linkCmd, { cwd: this.rootPath })
                    .wait("What is your CodePush deployment key for Android (hit <ENTER> to ignore)")
                    .sendline(androidStagingDeploymentKey)
                    .wait("What is your CodePush deployment key for iOS (hit <ENTER> to ignore)")
                    .sendline(iosStagingDeploymentKey)
                    .run(function (err) {
                        if (!err) {
                            resolve(true);
                        } else {
                            self.logger.error(`Failed to link Code Push: ${err}`);
                            resolve(false);
                        }
                    });
            });
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
