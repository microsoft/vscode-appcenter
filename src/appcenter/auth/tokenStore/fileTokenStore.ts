//
// file-token-store - implementation of token store that stores the data in
// a JSON encoded file on dist.
//
// This doesn't secure the data in any way, relies on the directory having
// proper security settings.
//

import * as fs from "fs";
import { toPairs } from "lodash";
import * as rx from "rx-lite";
import { TokenEntry, TokenKeyType, TokenStore, TokenValueType } from "../tokenStore/tokenStore";

export class FileTokenStore implements TokenStore {
    private filePath: string;
    private tokenStoreCache: { [key: string]: TokenValueType } | null;

    constructor(filePath: string) {
      this.filePath = filePath;
      this.tokenStoreCache = null;
    }

    public getStoreFilePath(): string {
      return this.filePath;
    }

    public list(): rx.Observable<TokenEntry> {
      this.loadTokenStoreCache();
      return rx.Observable.from(toPairs(this.tokenStoreCache)).map(pair => ({ key: pair[0], accessToken: pair[1]}));
    }

    public get(key: TokenKeyType): Promise<TokenEntry | null> {
      this.loadTokenStoreCache();
      let token;
      if (this.tokenStoreCache) {
         token = this.tokenStoreCache[key];
      }
      if (!token) {
        return Promise.resolve(null);
      }
      return Promise.resolve({key: key, accessToken: token});
    }

    public set(key: TokenKeyType, value: TokenValueType): Promise<void> {
      this.loadTokenStoreCache();
      if (this.tokenStoreCache) {
        this.tokenStoreCache[key] = value;
      }
      this.writeTokenStoreCache();
      return Promise.resolve(void 0);
    }

    public remove(key: TokenKeyType): Promise<void> {
      this.loadTokenStoreCache();
      if (this.tokenStoreCache) {
        delete this.tokenStoreCache[key];
      }
      this.writeTokenStoreCache();
      return Promise.resolve(void 0);
    }

    private loadTokenStoreCache(): void {
      if (!this.tokenStoreCache) {
        try {
          this.tokenStoreCache = JSON.parse(fs.readFileSync(this.filePath, "utf8"));
        } catch (err) {
          // No token cache file, creating new empty cache
          this.tokenStoreCache = {};
        }
      }
    }

    private writeTokenStoreCache(): void {
      fs.writeFileSync(this.filePath,  JSON.stringify(this.tokenStoreCache, null, "\t"));
    }
  }

export function createFileTokenStore(pathName: string): TokenStore {
    return new FileTokenStore(pathName);
}
