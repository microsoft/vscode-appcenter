import * as path from "path";
import AppCenterUITestRunner from "./appCenterUITestRunner";

export class AndroidTestRunner extends AppCenterUITestRunner {

    protected getAssetsFolder(): string {
        return "android/app/src/main/assets";
    }

    protected getAdditionalArgs(): string[] {
        return ["--app-path", "app/build/outputs/apk/app-debug.apk"];
    }

    protected getAbsoluteBuildDirectoryPath(): string {
        return path.join(this.nativeAppDirectory, 'app/build');
    }

    protected getRelativeBuildBinaryDirectoryPath(): string {
        return "app/build/outputs/apk";
    }

    protected getTestFrameworkName(): string {
        return "espresso";
    }

    protected async buildAppForTest(): Promise<boolean> {
        await this.spawnProcess("gradlew", ["assembleDebug"]);
        return this.spawnProcess("gradlew", ["assembleDebugAndroidTest"]);
    }
}
