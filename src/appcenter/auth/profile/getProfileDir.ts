import * as os from "os";
import * as path from "path";

export const profileDirName: string = ".vscode-appcenter";
export const profileFile = "VSCodeAppCenterProfile.json";

function getProfileDirParent(): string {
    if (os.platform() === "win32") {
      return process.env.AppData;
    } else {
      return os.homedir();
    }
  }

export function getProfileDir(): string {
    return path.join(getProfileDirParent(), profileDirName);
}
