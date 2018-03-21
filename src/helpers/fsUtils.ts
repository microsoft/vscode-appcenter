import * as fs from "fs";

export class FSUtils {
    public static GetDirectoryContent(dirName: string) {
        return fs.readdirSync(dirName);
    }
}
