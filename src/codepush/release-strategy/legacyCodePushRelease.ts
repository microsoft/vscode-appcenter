import { models } from "../../api/appcenter";
import { ICodePushReleaseParams } from "../../helpers/interfaces";
import LegacyCodePushServiceClient, { PackageInfo } from "./legacyCodePushService";

export function legacyCodePushRelease(params: ICodePushReleaseParams, token: string, serverUrl: string): Promise<models.CodePushRelease> {
    const releaseData: PackageInfo = {
        description: params.description,
        isDisabled: params.isDisabled,
        isMandatory: params.isMandatory,
        rollout: params.rollout,
        appVersion: params.appVersion
    };

    return new LegacyCodePushServiceClient(token, params.app, serverUrl)
        .release(params.deploymentName, params.updatedContentZipPath, releaseData);
}
