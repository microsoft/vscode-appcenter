import { ILogger } from '../log/logHelper';
import { cpUtils } from "./cpUtils";

export class GitUtils {
    private static gitCommand: string = 'git';

    public static async IsGitInstalled(workingDirectory: string): Promise<boolean> {
        try {
            await cpUtils.executeCommand(undefined, workingDirectory, this.gitCommand, '--version');
            return true;
        } catch (error) {
            return false;
        }
    }

    public static async GitInit(logger: ILogger, workingDirectory: string): Promise<void> {
        await cpUtils.executeCommand(logger, workingDirectory, this.gitCommand, 'init');
    }
}
