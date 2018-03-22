import * as fs from "fs";

export class FSUtils {
    public static GetDirectoryContent(dirName: string) {
        return fs.readdirSync(dirName);
    }

    public static IsNewDirectoryForProject(dirName: string) {
        let dirContent: string[] | null = null;
        dirContent = fs.readdirSync(dirName);

        const ignoredItems = [".vscode", ".git"];
        const filteredDir = dirContent && dirContent.filter((item: string) => {
            return ignoredItems.indexOf(item) === -1;
        });
        const dirExistAndEmpty = filteredDir && filteredDir.length === 0;
        return dirExistAndEmpty;
    }
}
