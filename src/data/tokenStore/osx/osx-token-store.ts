// Token store implementation over OSX keychain

//
// Access to the OSX keychain - list, add, get password, remove
//
import * as _ from "lodash";
import * as rx from "rx-lite";
import * as childProcess from "child_process";
import * as from from "from2";
import * as split from "split2";
import * as through from "through2";

import { TokenStore, TokenEntry, TokenKeyType, TokenValueType } from "../tokenStore";
import { createOsxSecurityParsingStream, OsxSecurityParsingStream } from "./osx-keychain-parser";

const securityPath = "/usr/bin/security";
const serviceName = "appcenter-extension";

export class OsxTokenStore implements TokenStore {
  public list(): rx.Observable<TokenEntry> {

    return rx.Observable.create((observer: rx.Observer<TokenEntry>) => {
      const securityProcess = childProcess.spawn(securityPath, ["dump-keychain"]);

      const securityStream = securityProcess.stdout
        .pipe(split())
        .pipe(through(function (line: Buffer, _enc: any, done: Function) {
          done(null, line.toString().replace(/\\134/g, "\\"));
        }))
        .pipe(new OsxSecurityParsingStream());

      securityStream.on("data", (data: any) => {
        if (data.svce !== serviceName) {
          return;
        }

        const key: TokenKeyType = data.acct;
        // Have to get specific token to get tokens, but we have ids
        const accessToken: TokenValueType = {
          id: data.gena,
          token: null
        };
        observer.next({ key, accessToken });
      });
      securityStream.on("end", (err: Error) => {
        if (err) { observer.error(err); } else { observer.complete(); }
      });
    });
  }

  public get(key: TokenKeyType, _useOldName: boolean = false): Promise<TokenEntry> {
    const args = [
      "find-generic-password",
      "-a", key,
      "-s", serviceName,
      "-g"
    ];

    return new Promise<TokenEntry>((resolve, reject) => {
      resolve = _.once(resolve);
      reject = _.once(reject);

      childProcess.execFile(securityPath, args, (err: Error, stdout: string, stderr: string) => {
        if (err) { return reject(err); }
        const match = /^password: (?:0x[0-9A-F]+. )?"(.*)"$/m.exec(stderr);
        if (match) {
          const accessToken = match[1].replace(/\\134/g, "\\");

          // Parse the rest of the information from stdout to get user & token ID
          const parsed = from([stdout])
            .pipe(createOsxSecurityParsingStream());
          parsed.on("data", (data: any) => {
            resolve({
              key: data.acct,
              accessToken: {
                id: data.gena,
                token: accessToken
              }
            });
          });
          parsed.on("error", (err: Error) => {
            reject(err);
          });
        } else {
          reject(new Error("Password in incorrect format"));
        }
      });
    });
  }

  public set(key: TokenKeyType, value: TokenValueType): Promise<void> {
    const args = [
      "add-generic-password",
      "-a", key,
      "-D", "appcenter extension password",
      "-s", serviceName,
      "-w", value.token,
      "-U"
    ];

    if (value.id) { args.push("-G", value.id); }

    return new Promise<void>((resolve, reject) => {
      childProcess.execFile(securityPath, args, function (err, _stdout, stderr) {
        if (err) {
          return reject(new Error("Could not add password to keychain: " + stderr));
        }
        return resolve();
      });
    });
  }

  public remove(key: TokenKeyType): Promise<void> {
    const args = [
      "delete-generic-password",
      "-a", key,
      "-s", serviceName
    ];

    return new Promise<void>((resolve, reject) => {
      childProcess.execFile(securityPath, args, function (err, _stdout, stderr) {
        if (err) {
          return reject(new Error("Could not remove account from keychain, " + stderr));
        }
        return resolve();
      });
    });
  }
}

export function createOsxTokenStore(): TokenStore {
  return new OsxTokenStore();
}
