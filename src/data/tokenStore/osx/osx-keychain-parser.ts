//
// Parser for the output of the security(1) command line.
//

import * as Pumpify from "pumpify";
import * as split from "split2";
import * as stream from "stream";

//
// Regular expressions that match the various fields in the input
//

// Fields at the root - not attributes
const rootFieldRe = /^([^: \t]+):(?: (?:"([^"]+)")|(.*))?$/;

// Attribute values, this gets a little more complicated
// tslint:disable-next-line:no-regex-spaces
const attrRe = /^    (?:(0x[0-9a-fA-F]+) |"([a-z]{4})")<[^>]+>=(?:(<NULL>)|"([^"]+)"|(0x[0-9a-fA-F]+)(?:  "([^"]+)")|(.*)?)/;

//
// Stream based parser for the OSX security(1) program output.
// Implements a simple state machine. States are:
//
//   0 - Waiting for the initial "keychain" string.
//   1 - Waiting for the "attributes" string. adds any properties to the
//       current entry object being parsed while waiting.
//   2 - reading attributes. Continues adding the attributes to the
//       current entry object until we hit either a non-indented line
//       or end. At which point we emit.
//

export class OsxSecurityParsingStream extends stream.Transform {
  private currentEntry: any;
  private inAttributes: boolean;

  constructor() {
    super({objectMode: true});
    this.currentEntry = null;
    this.inAttributes = false;
  }

  public _transform(chunk: any, _encoding: string, callback: {(err?: Error): void}): void {
    const line = chunk.toString();

    const rootMatch = line.match(rootFieldRe);
    if (rootMatch) {
      this.processRootLine(rootMatch[1], rootMatch[2] || rootMatch[3]);
    } else {
      const attrMatch = line.match(attrRe);
      if (attrMatch) {
        // Did we match a four-char named field? We don't care about hex fields
        if (attrMatch[2]) {
          // We skip nulls, and grab text rather than hex encoded versions of value
          const value = attrMatch[6] || attrMatch[4];
          if (value) {
            this.processAttributeLine(attrMatch[2], value);
          }
        }
      }
    }
    callback();
  }

  public _flush(callback: {(err?: Error): void}): void {
    this.emitCurrentEntry();
    callback();
  }

  public emitCurrentEntry(): void {
    if (this.currentEntry) {
      this.push(this.currentEntry);
      this.currentEntry = null;
    }
  }

  public processRootLine(key: string, value: string): void {
    if (this.inAttributes) {
      this.emitCurrentEntry();
      this.inAttributes = false;
    }
    if (key === "attributes") {
      this.inAttributes = true;
    } else {
      this.currentEntry = this.currentEntry || {};
      this.currentEntry[key] = value;
    }
  }

  public processAttributeLine(key: string, value: string): void  {
    this.currentEntry[key] = value;
  }
}

export function createOsxSecurityParsingStream(): NodeJS.ReadWriteStream {
  return new Pumpify.obj(split(), new OsxSecurityParsingStream());
}
