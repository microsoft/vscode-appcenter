import * as path from "path";
import { Utils } from "../helpers/utils/utils";
import AppCenterUITestRunner from "./appCenterUITestRunner";

export class IOSTestRunner extends AppCenterUITestRunner {

    protected getBundleName(): string {
        return "main.jsbundle";
    }

    protected getBundleOutputDir(): string {
        return `${this.getRelativeBuildBinaryDirectoryPath()}/${this.getBundleName()}`;
    }

    protected getAssetsFolder(): string {
        return `./ios/${Utils.getAppName(this.options.appDirPath)}`;
    }

    protected getAdditionalArgs(): string[] {
        return [];
    }

    protected getAbsoluteBuildDirectoryPath(): string {
        return path.join(this.nativeAppDirectory, 'DerivedData');
    }

    protected getRelativeBuildBinaryDirectoryPath(): string {
        return "DerivedData/Build/Products/Release-iphoneos";
    }

    protected getTestFrameworkName(): string {
        return "xcuitest";
    }

    protected async buildAppForTest(): Promise<boolean> {
        const appName = Utils.getAppName(this.options.appDirPath);
        const args = [
            "xcodebuild",
            "build-for-testing",
            "-configuration",
            "Release",
            "-workspace",
            path.join(this.nativeAppDirectory, `${appName}.xcworkspace`),
            "-sdk",
            "iphoneos",
            "-scheme",
            appName,
            "-derivedDataPath",
            "DerivedData"
        ];

        return this.spawnProcess("xcrun", args);
    }
}
