import * as fs from "fs";
import * as mkdirp from "mkdirp";
import * as path from "path";
import { ILogger } from "../extension/log/logHelper";
import { LogStrings } from "../extension/resources/logStrings";
// tslint:disable-next-line:no-var-requires
const jsxml = require("node-jsxml");
// tslint:disable-next-line:no-var-requires
const plist = require('plist');

export default class AppCenterConfig {

    private parsedInfoConfigPlist: any;
    private parsedInfoMainPlist: any;
    private androidAppCenterConfig: any;
    private androidStringResources: any;

    constructor(private configPlistPath: string, private mainPlistPath: string, private pathToAndroidConfig: string, private pathToAndroidStringResources: string, private logger: ILogger) {
        try {
            this.logger.debug(LogStrings.ReadContents(configPlistPath));
            const plistContents = fs.readFileSync(configPlistPath, 'utf8');
            this.parsedInfoConfigPlist = plist.parse(plistContents);
        } catch (e) {
            this.logger.error(`${LogStrings.CouldNotRead("AppCenter-Config.plist")} ${e.message}`);
            this.parsedInfoConfigPlist = plist.parse(plist.build({}));
        }

        try {
            this.logger.debug(LogStrings.ReadContents(mainPlistPath));
            const plistContents = fs.readFileSync(mainPlistPath, 'utf8');
            this.parsedInfoMainPlist = plist.parse(plistContents);
        } catch (e) {
            this.logger.error(`${LogStrings.CouldNotRead("Info.plist")} ${e.message}`);
            this.parsedInfoMainPlist = plist.parse(plist.build({}));
        }

        try {
            this.logger.debug(LogStrings.ReadContents(pathToAndroidConfig));
            this.androidAppCenterConfig = {};
            const fileContent: string | Buffer = fs.readFileSync(pathToAndroidConfig, 'utf-8');
            this.androidAppCenterConfig = JSON.parse(fileContent);
        } catch (e) {
            this.logger.error(`${LogStrings.CouldNotRead("appcenter-config.json")} ${e.message}`);
        }

        try {
            this.logger.debug(LogStrings.ReadContents(pathToAndroidStringResources));
            const data = fs.readFileSync(pathToAndroidStringResources, { encoding: "utf8" });
            const xml = new jsxml.XML(data);
            this.androidStringResources = xml;
        } catch (e) {
            this.logger.error(`${LogStrings.CouldNotRead("strings.xml")} ${e.message}`);
        }
    }

    public setAndroidStringResourcesDeploymentKey(codePushDeploymentKey: string) {
        this.androidStringResources.child(0).setValue(codePushDeploymentKey);
    }

    public saveAndroidStringResources(): boolean {
        const xml = this.androidStringResources.toString();

        try {
            fs.writeFileSync(this.pathToAndroidStringResources, xml);
        } catch (e) {
            this.logger.error(LogStrings.CouldNotSave(this.pathToAndroidStringResources));
            return false;
        }
        this.logger.debug(LogStrings.SavedCodePushDeploymentKey(this.pathToAndroidStringResources));
        return true;
    }

    public getConfigPlistValueByKey(key: string): string {
        return this.parsedInfoConfigPlist[key];
    }

    public setConfigPlistValueByKey(key: string, value: string) {
        this.parsedInfoConfigPlist[key] = value;
    }

    public deleteConfigPlistValueByKey(key: string) {
        delete this.parsedInfoConfigPlist[key];
    }

    public saveConfigPlist(): boolean {
        const plistContents = plist.build(this.parsedInfoConfigPlist);
        try {
            fs.writeFileSync(this.configPlistPath, plistContents);
        } catch (e) {
            this.logger.error(LogStrings.CouldNotSave(this.configPlistPath));
            return false;
        }
        this.logger.debug(LogStrings.SavedAppSecret(this.configPlistPath));
        return true;
    }

    public getMainPlistValueByKey(key: string): string {
        return this.parsedInfoMainPlist[key];
    }

    public setMainPlistValueByKey(key: string, value: string) {
        this.parsedInfoMainPlist[key] = value;
    }

    public saveMainPlist(): boolean {
        const plistContents = plist.build(this.parsedInfoMainPlist);
        try {
            fs.writeFileSync(this.mainPlistPath, plistContents);
        } catch (e) {
            this.logger.error(LogStrings.CouldNotSave(this.mainPlistPath));
            return false;
        }
        this.logger.debug(LogStrings.SavedCodePushDeploymentKey(this.mainPlistPath));
        return true;
    }

    public getAndroidAppCenterConfigValueByKey(key: string): string {
        return this.androidAppCenterConfig[key];
    }

    public setAndroidAppCenterConfigValueByKey(key: string, value: string) {
        this.androidAppCenterConfig[key] = value;
    }

    public deleteAndroidAppCenterConfigValueByKey(key: string) {
        delete this.androidAppCenterConfig[key];
    }

    public saveAndroidAppCenterConfig(): boolean {
        try {
            mkdirp.sync(path.dirname(this.pathToAndroidConfig));
        } catch (e) {
            this.logger.error(LogStrings.CouldNotSave(this.pathToAndroidConfig));
            return false;
        }
        fs.writeFileSync(this.pathToAndroidConfig, JSON.stringify(this.androidAppCenterConfig, null, 4));
        this.logger.debug(LogStrings.SavedAppSecret(this.pathToAndroidConfig));
        return true;
    }
}
