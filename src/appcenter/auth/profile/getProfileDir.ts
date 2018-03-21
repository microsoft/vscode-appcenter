import * as path from "path";

export const profileDirName = ".vscode";
export const profileFile = "appcenter.json";

export function getProfileDir(projectRootPath: string): string {
    return path.join(projectRootPath, profileDirName);
}
