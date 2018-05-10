import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import { Constants } from "../../extension/resources/constants";
import { Utils } from "../../helpers/utils/utils";
import { createFileTokenStore } from "./fileTokenStore";
import { TokenStore } from "./tokenStore";
import { createWinTokenStore } from "./win32/win-token-store";
import { createOsxTokenStore } from "./osx/osx-token-store";

export * from "./tokenStore";

let store: TokenStore;

function getTokenDir(): string {
  return path.join(Utils.getUserDir(), Constants.TokenDir);
}

// Currently only support file-base token store
const getTokenFilePath = (tokenFile: string) => {
  const tokenFilePath = path.join(getTokenDir(), tokenFile);
  if (!fs.existsSync(tokenFilePath)) {
    if (!fs.existsSync(getTokenDir())) {
      fs.mkdirSync(getTokenDir());
    }
    fs.writeFileSync(tokenFilePath, /* create empty */ "");
  }
  return tokenFilePath;
};

if (os.platform() === "win32") {
  store = createWinTokenStore();
} else if (os.platform() === "darwin") {
  store = createOsxTokenStore();
} else {
  store = createFileTokenStore(getTokenFilePath(Constants.AppCenterTokenFileName));
}
export const tokenStore = store;
export const fileTokenStore = createFileTokenStore(getTokenFilePath(Constants.AppCenterTokenFileName));
