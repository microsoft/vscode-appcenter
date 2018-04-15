import fetch = require('node-fetch');
import uuid = require('uuid');
import { Progress } from 'vscode';
import { CurrentApp } from '../../helpers/interfaces';
import { ConsoleLogger } from '../../log/consoleLogger';
import { ILogger } from '../../log/logHelper';
import { Strings } from '../../strings';
import { HTTP_METHODS } from '../../vsts/types';
import { CrashLogSchema } from './crashLogSchema';

export class CrashGenerator {
    private _appSecret: string;

    constructor(currentApp: CurrentApp, private _baseUrl: string, private logger: ILogger = new ConsoleLogger(), private _progress: Progress<{ message?: string; }> = null) {
        this._appSecret = currentApp.appSecret;
    }

    public generateCrashes(): Promise<void> {
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

        return this.sendCrashes(installId, sessionLogContainer).then(() => {
            return this.sendCrashes(installId, crashLogContainer);
        }).then(() => {
            return Promise.resolve();
        }).catch(() => {
            return Promise.reject(void 0);
        });
    }

    private async sendCrashes(installId: string, body: object): Promise<void> {
        try {
            this._progress.report({ message: Strings.SimulateCrashesSendMessage });
            const url: string = `${this._baseUrl}?api-version=1.0`;
            const requestInfo = this.getRequestInfo(HTTP_METHODS.POST, body, installId);

            const response = await fetch(url, requestInfo);
            const responseBody = await response.text();

            if (response.status !== 200) {
                throw new Error(responseBody);
            }
            return response;
        } catch (e) {
            this.logger.error("Failed to send crashes information. " + (e && e.message) || "");
            return Promise.reject(void 0);
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
