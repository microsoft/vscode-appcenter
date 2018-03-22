import * as cp from 'child_process';
import * as os from 'os';
import { ILogger } from '../log/logHelper';

export namespace cpUtils {
    export async function executeCommand(logger: ILogger | undefined, workingDirectory: string | undefined, command: string, ...args: string[]): Promise<string> {
        let cmdOutput: string = '';
        let cmdOutputIncludingStderr: string = '';
        workingDirectory = workingDirectory || os.tmpdir();
        const formattedArgs: string = args.join(' ');
        await new Promise((resolve: () => void, reject: (e: Error) => void): void => {
            const options: cp.SpawnOptions = {
                cwd: workingDirectory,
                shell: true
            };
            const childProc: cp.ChildProcess = cp.spawn(command, args, options);

            if (logger) {
                logger.info(`runningCommand', 'Running command: "${command} ${formattedArgs}"...`);
            }

            childProc.stdout.on('data', (data: string | Buffer) => {
                data = data.toString();
                cmdOutput = cmdOutput.concat(data);
                cmdOutputIncludingStderr = cmdOutputIncludingStderr.concat(data);
                if (logger) {
                    logger.info(data);
                }
            });

            childProc.stderr.on('data', (data: string | Buffer) => {
                data = data.toString();
                cmdOutputIncludingStderr = cmdOutputIncludingStderr.concat(data);
                if (logger) {
                    logger.info(data);
                }
            });

            childProc.on('error', reject);
            childProc.on('close', (code: number) => {
                if (code !== 0) {
                    reject(new Error(`AppCenter.commandError', 'Command "${command} ${formattedArgs}" failed with exit code "${code}":${os.EOL}${cmdOutputIncludingStderr}`));
                } else {
                    if (logger) {
                        logger.info(`finishedRunningCommand', 'Finished running command: "${command} ${formattedArgs}".`);
                    }
                    resolve();
                }
            });
        });

        return cmdOutput;
    }
}
