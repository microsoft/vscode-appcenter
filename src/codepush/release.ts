import { AppCenterClient, models } from "../api/appcenter";
import { ILogger, LogLevel } from "../extension/log/logHelper";
import { ICodePushReleaseParams } from "../helpers/interfaces";
import { SettingsHelper } from "../helpers/settingsHelper";
import { CommandResult, ErrorCodes, failure, success } from "./commandResult";
import { appCenterCodePushRelease } from "./release-strategy/appcenterCodePushRelease";
import { legacyCodePushRelease } from "./release-strategy/legacyCodePushRelease";
import { LogStrings } from "../extension/resources/logStrings";

// Use old service endpoint unless we will fix issue with 1MB payload limitation for new one
const useLegacyCodePushServer: boolean = SettingsHelper.getLegacyCodePushServiceEnabled();

export default class CodePushRelease {
    public static exec(client: AppCenterClient, params: ICodePushReleaseParams, logger: ILogger): Promise<CommandResult> {
        return ((): Promise<CodePushRelease | void> => {
            if (useLegacyCodePushServer) {
                return legacyCodePushRelease(params, <string>params.token, SettingsHelper.getLegacyCodePushEndpoint());
            } else {
                return appCenterCodePushRelease(client, params);
            }
        })().then((result: models.CodePushRelease) => {
            return success(result);
        }).catch((error) => {
            if (error && error.reposnse && error.response.statusCode === 409) {
                logger.log(error.response.body, LogLevel.Error);
                return failure(ErrorCodes.Exception, error.response.body);
            }

            logger.log(LogStrings.CodePushError, LogLevel.Error);
            if (typeof error === "string") {
                return failure(ErrorCodes.Exception, error);
            } else {
                return failure(ErrorCodes.Exception, LogStrings.CodePushError);
            }
        });
    }
}
