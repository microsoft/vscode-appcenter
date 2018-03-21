import * as fs from "fs";
import { ICodePushReleaseParams } from "../../../helpers/interfaces";
import { AppCenterClient } from "../../api/index";

export function appCenterCodePushRelease(client: AppCenterClient, params: ICodePushReleaseParams): Promise<void> {
    const app = params.app;
    return client.codepush.codePushDeploymentReleases.create(
        app.appName,
        params.deploymentName,
        app.ownerName,
        <string>params.appVersion,
        {
            packageProperty: fs.createReadStream(params.updatedContentZipPath),
            deploymentName: params.deploymentName,
            description: params.description,
            disabled: params.isDisabled,
            mandatory: params.isMandatory,
            noDuplicateReleaseError: false, // TODO: remove it, not needed to send to server
            rollout: params.rollout
        }
    );
}
