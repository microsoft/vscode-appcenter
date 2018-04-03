export interface Config {
    userName: string;
    accessToken?: string;
    tenantName: string;
    projectName?: string;
    teamName?: string;
    teamNames?: any[];
    urlName?: string;
}

export interface VSTSProject {
    description?: string;
    id: string;
    name: string;
    revision: number;
    state: string;
    url: string;
    visibility: string;
}

export interface VSTSGitRepository {
    id: string;
    name: string;
    project: VSTSProject;
    remoteUrl: string;
    sshUrl: string;
    url: string;
}

export enum HTTP_METHODS {
    GET = "GET",
    PUT = "PUT",
    DELETE = "DELETE",
    POST = "POST",
    PATCH = "PATCH"
}
