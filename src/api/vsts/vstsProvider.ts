import { ConsoleLogger } from "../../extension/log/consoleLogger";
import { ILogger } from "../../extension/log/logHelper";
import { Config, HTTP_METHODS, VSTSGitRepository, VSTSProject } from "./types";
import { Messages } from "../../extension/resources/messages";
import { LogStrings } from "../../extension/resources/logStrings";
// tslint:disable-next-line:no-var-requires
const btoa = require('btoa');
// tslint:disable-next-line:no-var-requires
const fetch = require('node-fetch');

export class VSTSProvider {

    private _apiVersion: string = "1.0";
    private _baseUrl: string;
    private _accessToken: string;

    constructor(private configuration: Config, private logger: ILogger = new ConsoleLogger()) {
        this._baseUrl = `https://${this.configuration.tenantName}.visualstudio.com/DefaultCollection/`;
        this._accessToken = btoa(`${this.configuration.userName}:${this.configuration.accessToken}`);
    }

    public async TestVstsConnection(): Promise<boolean> {
        const url: string = `${this._baseUrl}_apis/accounts?api-version=${this._apiVersion}`;
        const requestInfo = this.getRequestInfo(HTTP_METHODS.GET);
        const res = await fetch(url, requestInfo);
        if (res.status === 203 || res.status === 401) {
            return false;
        }
        return true;
    }

    public async GetAllProjects(): Promise<VSTSProject[] | null> {
        try {
            const url: string = `${this._baseUrl}_apis/projects?api-version=${this._apiVersion}`;
            const requestInfo = this.getRequestInfo(HTTP_METHODS.GET);
            const res = await fetch(url, requestInfo);
            if (res.status === 203 || res.status === 401) {
                throw new Error(Messages.VstsCredsNotValidWarning);
            }
            const response = await res.json();
            return <VSTSProject[]>response.value;
        } catch (e) {
            this.logger.error(`${LogStrings.FailedToGetVSTSProjectList}. ${e && e.message || ""}`);
            return null;
        }
    }

    public async CreateGitRepository(projectId: string, gitRepoName: string): Promise<VSTSGitRepository | null> {
        try {
            const url: string = `${this._baseUrl}_apis/git/repositories?api-version=${this._apiVersion}`;
            const body: any = {
                name: gitRepoName,
                project: {
                    id: projectId
                }
            };
            const requestInfo = this.getRequestInfo(HTTP_METHODS.POST, body);
            const res = await fetch(url, requestInfo);
            const response = await res.json();
            if (response.errorCode !== undefined) {
                throw new Error(response.message);
            }
            return <VSTSGitRepository>response;
        } catch (e) {
            this.logger.error(`${LogStrings.FailedToGetVSTSReposList} ${(e && e.message) || ""}`);
            return null;
        }
    }

    public async GetAllRepositoriesForProject(projectName: string): Promise<VSTSGitRepository[] | null> {
        try {
            const url: string = `${this._baseUrl}${projectName}/_apis/git/repositories?api-version=${this._apiVersion}`;
            const requestInfo = this.getRequestInfo(HTTP_METHODS.GET);
            const res = await fetch(url, requestInfo);
            const response = await res.json();
            return <VSTSGitRepository[]>response.value;
        } catch (e) {
            this.logger.error(`${LogStrings.FailedToGetVSTSReposList} ${(e && e.message) || ""}`);
            return null;
        }
    }

    private getRequestInfo(method: HTTP_METHODS, body: any = null) {
        if (body) {
            return { method: method, headers: { Authorization: `BASIC ${this._accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify(body) };
        }
        return { method: method, headers: { Authorization: `BASIC ${this._accessToken}`, "Content-Type": "application/json" } };
    }
}
