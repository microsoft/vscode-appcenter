import fetch = require('node-fetch');
import uuid = require('uuid');
import { HTTP_METHODS } from '../api/vsts/types';
import { ConsoleLogger } from '../extension/log/consoleLogger';
import { ILogger } from '../extension/log/logHelper';
import { CurrentApp } from '../helpers/interfaces';
import { CrashLogSchema } from './crashLogSchema';
import { LogStrings } from '../extension/resources/logStrings';

export class CrashGenerator {
    private _appSecret: string;

    constructor(currentApp: CurrentApp, private _baseUrl: string, private logger: ILogger = new ConsoleLogger()) {
        this._appSecret = currentApp.appSecret;
    }

    public async generateCrashes(): Promise<void> {
        const crashTime = Date.now();
        const crashDate = new Date(crashTime).toISOString();
        const sessionId: string = uuid.v4();
        const crashId: string = uuid.v4();
        const installId: string = uuid.v4();

        const crashLog: CrashLogSchema = require('./log.json');

        delete crashLog.appId;
        delete crashLog.installId;
        crashLog.type = 'managedError';
        crashLog.sid = sessionId;
        crashLog.id = crashId;
        crashLog.crashTimestamp = crashDate;
        crashLog.ingestTimestamp = crashDate;
        crashLog.installId = installId;
        crashLog.timestamp = crashDate;

        const session = {
            type: 'startSession',
            toffset: crashTime,
            sid: sessionId,
            device: crashLog.device
        };

        const sessionLogContainer = { Logs: [session] };
        const crashLogContainer = { Logs: [crashLog] };
        try {
            await this.sendCrashes(installId, sessionLogContainer);
            await this.sendCrashes(installId, crashLogContainer);
            return;
        } catch (error) {
            throw new Error(error);
        }
    }

    private async sendCrashes(installId: string, body: object): Promise<void> {
        try {
            const url: string = `${this._baseUrl}?api-version=1.0`;
            const requestInfo = this.getRequestInfo(HTTP_METHODS.POST, body, installId);

            const response = await fetch(url, requestInfo);
            const responseBody = await response.text();

            if (response.status !== 200) {
                throw new Error(responseBody);
            }
            return response;
        } catch (e) {
            this.logger.error(LogStrings.FailedToSendCrashes + (e && e.message) || "");
            throw new Error(e);
        }
    }

    private getRequestInfo(method: HTTP_METHODS, body: object, installId: string) {
        const headers = {
            'Install-ID': installId,
            'App-Secret': this._appSecret
        };
        const requestOptions = {
            method: method,
            headers: headers,
            useQuerystring: true,
            json: true,
            body: JSON.stringify(body)
        };
        return requestOptions;
    }
}
