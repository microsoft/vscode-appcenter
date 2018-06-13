//
// Filter to add command telemetry headers for requests.
//

import { WebResource } from "ms-rest";
import { Readable, Writable } from "stream";
import { Constants } from "../../extension/resources/constants";

// tslint:disable:no-var-requires
const requestPipeline = require("ms-rest/lib/requestPipeline");
const uuid = require("uuid");

const sessionId: string = uuid.v4();

export function telemetryFilter(): { (resource: WebResource, next: any, callback: any): any } {
    return (resource: WebResource, next: any, callback: any): any => {
        return requestPipeline.interimStream((input: Readable, output: Writable) => {
            input.pause();
            resource.headers["internal-request-source"] = Constants.TelemetrySource;
            resource.headers["diagnostic-context"] = sessionId;
            const nextStream = next(resource, callback);
            (resource.pipeInput(input, nextStream) as any as Readable).pipe(output);
            input.resume();
        });
    };
}
