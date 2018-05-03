//
// Filter to add command telemetry headers for requests.
//

import { WebResource } from "ms-rest";
import { Readable, Writable } from "stream";

// tslint:disable-next-line:no-var-requires
const requestPipeline = require("ms-rest/lib/requestPipeline");

export function telemetryFilter(_commandName: string, _telemetryIsEnabled: boolean) : {(resource: WebResource, next: any, callback: any): any} {
  return (_resource: WebResource, _next: any, _callback: any): any => {
    return requestPipeline.interimStream((_input: Readable, _output: Writable) => {
        //TODO: check if we need telemetry
    });
  };
}
