import { ILogger } from '../log/logHelper';
import { cpUtils } from "./cpUtils";
// tslint:disable-next-line:no-var-requires
const git = require('simple-git');

export class GitUtils {
    private static gitCommand: string = 'git';
    private static gitDefaultRemoteName: string = 'origin';
    private static gitFirstCommitName: string = 'First commit';

    public static async IsGitInstalled(workingDirectory: string): Promise<boolean> {
        try {
            await cpUtils.executeCommand(undefined, workingDirectory, this.gitCommand, '--version');
            return true;
        } catch (error) {
            return false;
        }
    }

    public static async GitInit(logger: ILogger, workingDirectory: string): Promise<void> {
        try {
            await git(workingDirectory).init();
        } catch (e) {
            logger.error('failed: ', e.message);
         }
    }

    public static async ConfigureRepoAndPush(remoteRepo: string, branch: string, logger: ILogger, workingDirectory: string): Promise<boolean> {
        try {
            await git(workingDirectory)
                    .init()
                    .add('./*')
                    .commit(this.gitFirstCommitName)
                    .addRemote(this.gitDefaultRemoteName, remoteRepo)
                    .push(this.gitDefaultRemoteName, branch);
                    logger.info(`Successfully pushed changes to repomte repo ${remoteRepo} branchname: ${branch}`);
        } catch (e) {
            logger.error('failed: ', e.message);
            return false;
         }
        return true;
    }
}
