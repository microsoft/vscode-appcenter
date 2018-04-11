import * as fs from "fs";
import { ICodePushReleaseParams } from "../../../helpers/interfaces";
import { AppCenterClient } from "../../apis";

export async function appCenterCodePushRelease(client: AppCenterClient, params: ICodePushReleaseParams): Promise<void> {
    const app = params.app;
    await client.codePushDeploymentReleases.create(
        params.deploymentName,
        app.ownerName,
        app.appName,
        <string>params.appVersion,
        {
            packageProperty: fs.createReadStream(params.updatedContentZipPath),
            deploymentName1: params.deploymentName,
            description: params.description,
            disabled: params.isDisabled,
            mandatory: params.isMandatory,
            noDuplicateReleaseError: false, // TODO: remove it, not needed to send to server
            rollout: params.rollout
        }
    );
}
