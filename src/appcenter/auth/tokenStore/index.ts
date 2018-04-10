import * as fs from "fs";
import * as path from "path";
import { Constants } from "../../../constants";
import { Utils } from "../../../helpers/utils";
import { createFileTokenStore } from "./fileTokenStore";
import { TokenStore } from "./tokenStore";

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

store = createFileTokenStore(getTokenFilePath(Constants.AppCenterTokenFileName));
export const tokenStore = store;
