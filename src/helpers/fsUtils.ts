import * as fs from "fs";

export class FSUtils {
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

    public static IsEmptyDirectoryToStartNewIdea(dirName: string) {
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
                } else if (err.code === 'ENOENT') {
                    resolve(false);
                } else {
                    reject(err);
                }
            });
        });
    }
}
