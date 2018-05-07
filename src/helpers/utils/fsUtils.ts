import * as fs from "fs";
import * as rimraf from "rimraf";

export class FSUtils {

    private static readonly FileDoesNotExist = 'ENOENT';

    public static GetDirectoryContent(dirName: string) {
        return fs.readdirSync(dirName);
    }

    public static IsEmptyDirectory(dirName: string) {
        let dirContent: string[] | null = null;
        dirContent = fs.readdirSync(dirName);
        const ignoredItems = [".vscode"];
        const filteredDir = dirContent && dirContent.filter((item: string) => {
            return ignoredItems.indexOf(item) === -1;
        });
        const dirExistAndEmpty = filteredDir && filteredDir.length === 0;
        return dirExistAndEmpty;
    }

    public static IsEmptyDirectoryToStartNewProject(dirName: string) {
        let dirContent: string[] | null = null;
        dirContent = fs.readdirSync(dirName);

        const ignoredItems = [".vscode", ".git"];
        const filteredDir = dirContent && dirContent.filter((item: string) => {
            return ignoredItems.indexOf(item) === -1;
        });
        const dirExistAndEmpty = filteredDir && filteredDir.length === 0;
        return dirExistAndEmpty;
    }

    public static readFile(fileName: string): Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readFile(fileName, "utf8", (err, data) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    }

    public static writeFile(fileName: string, data: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.writeFile(fileName, data, "utf8", (err) => {
                if (err) {
                    reject(err);
                }
                resolve(void 0);
            });
        });
    }

    public static exists(fileName: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            fs.stat(fileName, function (err) {
                if (err == null) {
                    resolve(true);
                } else if (err.code === FSUtils.FileDoesNotExist) {
                    resolve(false);
                } else {
                    reject(err);
                }
            });
        });
    }
    public static rimraf(path: string, options?: rimraf.Options): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!options) {
                options = {};
            }
            rimraf(path, options, (error: Error) => {
                if (error) {
                    reject(error);
                }
                resolve(void 0);
            });
        });
    }
}
