import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { createFileTokenStore } from "./fileTokenStore";
import { TokenStore } from "./tokenStore";

export * from "./tokenStore";
export const tokenFile = "VSCodeAppCenterTokens.json";

let store: TokenStore;

const tokenDirName: string = ".vscode-appcenter";

function getTokenDirParent(): string {
  if (os.platform() === "win32") {
    return process.env.AppData;
  } else {
    return os.homedir();
  }
}

function getTokenDir(): string {
    return path.join(getTokenDirParent(), tokenDirName);
}

// Currently only support file-base token store
const tokenFilePath = path.join(getTokenDir(), tokenFile);
if (!fs.existsSync(tokenFilePath)) {
    if (!fs.existsSync(getTokenDir())) {
        fs.mkdirSync(getTokenDir());
    }
    fs.writeFileSync(tokenFilePath, /* create empty */ "");
}
store = createFileTokenStore(tokenFilePath);
export const tokenStore = store;
