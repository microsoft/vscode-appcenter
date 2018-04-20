import * as childProcess from "child_process";

export interface SpawnOptions extends childProcess.SpawnOptions {
    stdoutListener?: (chunk: Buffer | string) => void,
    stderrListener?: (chunk: Buffer | string) => void
}

export class SpawnError extends Error {
    exitCode: number;
}

export class ChildProcess {

    public static spawn(command: string, args: string[] = [], options?: SpawnOptions): Promise<void> {
        return new Promise((resolve, reject) => {
            const process = childProcess.spawn(command, args, options);

            if (options.stdoutListener) {
                process.stdout.on("data", options.stdoutListener);
            }

            if (options.stderrListener) {
                process.stderr.on("data", options.stderrListener);
            }
            process.on("close", (exitCode: number) => {
                if (exitCode) {
                    let error = new SpawnError(`"${command}" command exited with code ${exitCode}.`);
                    error.exitCode = exitCode;
                    reject(error);
                }
                resolve();
            });
        });
    }
}