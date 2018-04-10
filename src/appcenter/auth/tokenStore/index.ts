import * as fs from "fs";
import * as path from "path";
import { Constants } from "../../../constants";
import { Utils } from "../../../helpers/utils";
import { createFileTokenStore } from "./fileTokenStore";
import { TokenStore } from "./tokenStore";

export * from "./tokenStore";

type Stores = {
  appCenter: TokenStore,
  vsts: TokenStore
};

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

const stores: Stores = {
  appCenter: createFileTokenStore(getTokenFilePath(Constants.AppCenterTokenFileName)),
  vsts: createFileTokenStore(getTokenFilePath(Constants.VstsTokenFileName))
};
export const tokenStores = stores;
