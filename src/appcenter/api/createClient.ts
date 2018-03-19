// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.

import { Profile } from "../auth/profile/profile";
import AppCenterClient from "../lib/appCenterNodeClient/index";
import { AppCenterClientCredentials } from "./appCenterClientCredentials";

// tslint:disable-next-line:interface-name
export interface AppCenterClientFactory {
    fromToken(token: string, endpoint: string): AppCenterClient;
    fromProfile(user: Profile, endpoint: string): AppCenterClient | null;
}

export function createAppCenterClient(): AppCenterClientFactory {
    return {
      fromToken(token: string, endpoint: string): AppCenterClient {
        return new AppCenterClient(new AppCenterClientCredentials(Promise.resolve(<any>token)), endpoint);
      },
      fromProfile(user: Profile, endpoint): AppCenterClient | null {
        if (!user) {
          return null;
        }
        return new AppCenterClient(new AppCenterClientCredentials(Promise.resolve(user.accessToken)), endpoint);
      }
    };
}
