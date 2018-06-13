import { IncomingMessage } from "http";

import { AppCenterClientCredentials } from "./appcenter-client-credentials";
import AppCenterClient = require("./generated/appCenterClient");
import { userAgentFilter } from "./user-agent-filter";

// tslint:disable-next-line:no-var-requires
const BasicAuthenticationCredentials = require("ms-rest").BasicAuthenticationCredentials;
import { ServiceCallback, ServiceError, WebResource } from "ms-rest";

import Auth from "../../auth/auth";
import { ErrorCodes } from "../../codepush/commandResult";
import { Profile } from "../../helpers/interfaces";
import { telemetryFilter } from "./telemetry-filter";
import { SettingsHelper } from "../../helpers/settingsHelper";

export interface AppCenterClientFactory {
  fromUserNameAndPassword(userName: string, password: string, endpoint: string): AppCenterClient;
  fromToken(token: string | Promise<string> | (() => Promise<string>), endpoint: string): AppCenterClient;
  fromProfile(user: Profile, endpoint: string): AppCenterClient | null;
}

export function createAppCenterClient(): AppCenterClientFactory {
    function createClientOptions(): any {
        const filters = [userAgentFilter];

        if (SettingsHelper.isTelemetryEnabled()) {
            filters.push(telemetryFilter());
        }

        return {
            filters: filters
        };
    }

  return {
    fromUserNameAndPassword(userName: string, password: string, endpoint: string): AppCenterClient {
      return new AppCenterClient(new BasicAuthenticationCredentials(userName, password), endpoint, createClientOptions());
    },

    fromToken(token: string | Promise<string> | (() => Promise<string>), endpoint: string): AppCenterClient {
      let tokenFunc: () => Promise<string>;

      if (typeof token === "string") {
        tokenFunc = () => Promise.resolve(token as string);
      } else if (typeof token === "object") {
        tokenFunc = () => token as Promise<string>;
      } else {
        tokenFunc = token;
      }
      return new AppCenterClient(new AppCenterClientCredentials(tokenFunc), endpoint, createClientOptions());
    },

    fromProfile(user: Profile, endpoint: string): AppCenterClient | null {
      if (!user) {
        return null;
      }
      return new AppCenterClient(new AppCenterClientCredentials(() => Auth.accessTokenFor(user)), endpoint, createClientOptions());
    }
  };
}

// Helper function to wrap client calls into promises while maintaining some type safety.
export function clientCall<T>(action: {(cb: ServiceCallback<any>): void}): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    action((err: Error, result: T) => {
      if (err) { reject(err); } else { resolve(result); }
    });
  });
}

//
// Response type for clientRequest<T> - returns both parsed result and the HTTP response.
//
export interface ClientResponse<T> {
  result: T;
  response: IncomingMessage;
}

export async function handleHttpError(error: any, check404: boolean,
    messageDefault: string, message404: string = `404 Error received from api`, message401: string = `401 Error received from api`): Promise<void> {
  if (check404 && error.statusCode === 404) {
    throw failure(ErrorCodes.InvalidParameter, message404);
  }

  if (error.statusCode === 401) {
    throw failure(ErrorCodes.NotLoggedIn, message401);
  } else {
    throw failure(ErrorCodes.Exception, messageDefault);
  }
}

// Helper function to wrap client calls into pormises and returning both HTTP response and parsed result
export function clientRequest<T>(action: {(cb: ServiceCallback<any>): void}): Promise<ClientResponse<T>> {
  return new Promise<ClientResponse<T>>((resolve, reject) => {
    action((err: Error | ServiceError, result: T, _request: WebResource, response: IncomingMessage) => {
      if (err) { reject(err); } else {
        resolve({ result, response});
      }
    });
  });
}

// Used when there's a failure otherwise
export function failure(errorCode: number, errorMessage: string): any {
  return {
    succeeded: false,
    errorCode,
    errorMessage
  };
}
