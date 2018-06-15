import * as cp from 'child_process';
import * as os from 'os';
import { ILogger } from '../../extension/log/logHelper';
import { ReactNativeLinkInputValue } from '../interfaces';

export class SpawnError extends Error {
    public exitCode: number;
    public result: string;
}

export namespace cpUtils {
    export async function executeCommand(logger: ILogger | undefined, logErrorsOnly: boolean = false, workingDirectory: string | undefined, command: string, inputValues: ReactNativeLinkInputValue[] = [], exposeArgs: boolean = true, environment: any = {}, ...args: string[]): Promise<string> {
        let cmdOutput: string = '';
        let cmdOutputIncludingStderr: string = '';
        workingDirectory = workingDirectory || os.tmpdir();
        const formattedArgs: string = exposeArgs ? args.join(' ') : "";
        await new Promise((resolve: () => void, reject: (e: Error) => void): void => {
            const options: cp.SpawnOptions = {
                cwd: workingDirectory,
                shell: true,
                env: { ...process.env, ...environment }
            };
            const childProc: cp.ChildProcess = cp.spawn(command, args, options);

            if (logger && !logErrorsOnly) {
                logger.info(`runningCommand', 'Running command: "${command} ${formattedArgs}"...`);
            }

            childProc.stdout.on('data', (data: string | Buffer) => {
                data = data.toString();
                cmdOutput = cmdOutput.concat(data);
                cmdOutputIncludingStderr = cmdOutputIncludingStderr.concat(data);
                if (logger && !logErrorsOnly) {
                    logger.info(data);
                }
                if (inputValues.length > 0) {
                    let sentResponse: boolean;
                    const lines = data.split('\n').filter(function (line) { return line.length > 0; });
                    for (const line of lines) {
                        const filtered = inputValues.filter((inputValue) => {
                            return line.indexOf(inputValue.label) > 0;
                        });
                        if (filtered.length > 0 && !filtered[0].sent) {
                            sentResponse = true;
                            childProc.stdin.write(filtered[0].input + "\n");
                            inputValues[inputValues.indexOf(filtered[0])].sent = true;
                        }
                    }
                    if (!sentResponse) {
                        childProc.stdin.write("\n");
                    }
                }
            });

            childProc.stderr.on('data', (data: string | Buffer) => {
                data = data.toString();
                cmdOutputIncludingStderr = cmdOutputIncludingStderr.concat(data);
                if (logger && !logErrorsOnly) {
                    logger.info(data);
                }
            });

            childProc.on('error', (e) => {
                reject(e);
            });

            childProc.on('close', (code: number) => {
                if (code !== 0) {
                    const errMsg: string = `AppCenter.commandError', 'Command "${command} ${formattedArgs}" failed with exit code "${code}":${os.EOL}${cmdOutputIncludingStderr}`;
                    if (logger) {
                        logger.error(errMsg);
                    }
                    const error = new SpawnError(errMsg);
                    error.exitCode = code;
                    error.result = cmdOutput;
                    reject(error);
                } else {
                    if (logger && !logErrorsOnly) {
                        logger.info(`finishedRunningCommand', 'Finished running command: "${command} ${formattedArgs}".`);
                    }
                    resolve();
                }
            });
        });

        return cmdOutput;
    }
}
