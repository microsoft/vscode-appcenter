import { ILogger } from "../../extension/log/logHelper";
import { Constants } from "../../extension/resources/constants";
import { cpUtils } from "./cpUtils";
import { LogStrings } from "../../extension/resources/logStrings";
// tslint:disable-next-line:no-var-requires
const git = require('simple-git/promise');

export class GitUtils {
    private static gitCommand: string = 'git';
    private static gitFirstCommitName: string = 'Configure App Center apps';

    public static async IsGitInstalled(workingDirectory: string): Promise<boolean> {
        try {
            await cpUtils.executeCommand(undefined, true, workingDirectory, this.gitCommand, [], true, {}, '--version');
            return true;
        } catch (error) {
            return false;
        }
    }

    public static async IsGitRepo(logger: ILogger, workingDirectory: string): Promise<boolean> {
        try {
            const result: boolean = await git(workingDirectory).checkIsRepo();
            return result;
        } catch (e) {
            logger.error(`failed: ${e.message}`);
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
            logger.error(`${LogStrings.FailedToRemoveRemote(remoteName)}: ${e.message}`);
            return false;
        }
    }

    public static async GitAddRemote(remoteName: string, remoteUrl: string, logger: ILogger, workingDirectory: string): Promise<boolean> {
        try {
            const gitrepo = git(workingDirectory);
            await gitrepo.addRemote(remoteName, remoteUrl);
            return true;
        } catch (e) {
            logger.error(`${LogStrings.FailedToAddRemote(remoteName)}: ${e.message}`);
            return false;
        }
    }

    public static async GitGetRemoteName(logger: ILogger, workingDirectory: string): Promise<string[]> {
        try {
            const remote: string[] = await git(workingDirectory).getRemotes();
            return remote;
        } catch (e) {
            logger.error(`${LogStrings.FailedToGetRemote("name")}: ${e.message}`);
            return [];
        }
    }

    public static async GitGetRemoteUrl(logger: ILogger, workingDirectory: string): Promise<string> {
        try {
            const remote: string = await git(workingDirectory).listRemote(['--get-url']);
            return remote;
        } catch (e) {
            logger.error(`${LogStrings.FailedToGetRemote("url")}: ${e.message}`);
            return "";
        }
    }

    public static async GitPullFromRemoteUrl(remoteRepo: string, branch: string, logger: ILogger, workingDirectory: string): Promise<boolean> {
        try {
            await git(workingDirectory).pull(remoteRepo, branch, {'--rebase': 'true', '--squash': null});
            return true;
        } catch (e) {
            logger.error(`${LogStrings.FailedToPullRemote(remoteRepo)}: ${e.message}`);
            return false;
        }
    }

    public static async GitPushToRemoteUrl(remoteRepoName: string, branch: string, logger: ILogger, workingDirectory: string): Promise<boolean> {
        try {
            const gitrepo = git(workingDirectory);
            await gitrepo.add('./*');
            await gitrepo.commit(this.gitFirstCommitName);
            await gitrepo.push(remoteRepoName, branch);
            logger.debug(LogStrings.SuccessfullyPushedTo(remoteRepoName, branch));
            return true;
        } catch (e) {
            logger.error(`${LogStrings.FailedToPushTo(remoteRepoName)}: ${e.message}`);
            return false;
        }
    }

    public static async GitCloneIntoExistingDir(logger: ILogger, workingDirectory: string, remoteRepo: string): Promise<boolean> {
        try {
            const gitrepo = git(workingDirectory);
            await gitrepo.init();
            await gitrepo.addRemote(Constants.GitDefaultRemoteName, remoteRepo);
            await gitrepo.fetch();
            await gitrepo.checkout(['-t', 'origin/master']);
        } catch (e) {
            logger.error(`${LogStrings.FailedToClone}: "${e.message}"`);
            return false;
        }
        return true;
    }

    public static async ConfigureRepoAndPush(remoteRepo: string, branch: string, logger: ILogger, workingDirectory: string): Promise<boolean> {
        try {
            const gitrepo = git(workingDirectory);
            await gitrepo.add('./*');
            await gitrepo.commit(this.gitFirstCommitName);
            await gitrepo.removeRemote(Constants.GitDefaultRemoteName);
            await gitrepo.addRemote(Constants.GitDefaultRemoteName);
            await gitrepo.push(Constants.GitDefaultRemoteName, branch);
            logger.debug(LogStrings.SuccessfullyPushedTo(remoteRepo, branch));
        } catch (e) {
            logger.error(`${LogStrings.FailedToPushTo(remoteRepo)}: ${e.message}`);
            return false;
        }
        return true;
    }
}
