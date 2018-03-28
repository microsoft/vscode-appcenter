import { ILogger } from '../log/logHelper';
import { cpUtils } from "./cpUtils";
// tslint:disable-next-line:no-var-requires
const git = require('simple-git/promise');

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
            logger.error(`failed: ${e.message}`);
        }
    }

    public static async GitRemoveRemote(remoteName: string, logger: ILogger, workingDirectory: string): Promise<boolean> {
        try {
            await git(workingDirectory).removeRemote(remoteName);
            return true;
        } catch (e) {
            logger.error(`Failed to get remote list: ${e.message}`);
            return false;
        }
    }

    public static async GitGetRemoteName(logger: ILogger, workingDirectory: string): Promise<string[]> {
        try {
            const remote: string[] = await git(workingDirectory).getRemotes();
            return remote;
        } catch (e) {
            logger.error(`Failed to get remote name: ${e.message}`);
            return [];
        }
    }

    public static async GitGetRemoteUrl(logger: ILogger, workingDirectory: string): Promise<string> {
        try {
            const remote: string = await git(workingDirectory).listRemote(['--get-url']);
            return remote;
        } catch (e) {
            logger.error(`Failed to get remote list: ${e.message}`);
            return "";
        }
    }

    public static async GitCloneIntoExistingDir(logger: ILogger, workingDirectory: string, remoteRepo: string): Promise<boolean> {
        try {
            const gitrepo = git(workingDirectory);
            await gitrepo.init();
            await gitrepo.addRemote(this.gitDefaultRemoteName, remoteRepo);
            await gitrepo.fetch();
            await gitrepo.checkout(['-t', 'origin/master']);
        } catch (e) {
            logger.error(`Failed to clone into exiting repository: ${e.message}`);
            return false;
        }
        return true;
    }

    public static async ConfigureRepoAndPush(remoteRepo: string, branch: string, logger: ILogger, workingDirectory: string): Promise<boolean> {
        try {
            const gitrepo = git(workingDirectory);
            await gitrepo.add('./*');
            await gitrepo.commit(this.gitFirstCommitName);
            await gitrepo.removeRemote(this.gitDefaultRemoteName);
            await gitrepo.addRemote(this.gitDefaultRemoteName, remoteRepo);
            await gitrepo.push(this.gitDefaultRemoteName, branch);
            logger.info(`Successfully pushed changes to remote repository: ${remoteRepo} branchname: ${branch}`);
        } catch (e) {
            logger.error(`Failed to congigure/push to remote repository: ${e.message}`);
            return false;
        }
        return true;
    }
}
