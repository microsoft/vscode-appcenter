
import mock = require('mock-fs');
import fs = require('fs');
import jsxml = require('node-jsxml');
import plist = require('plist');
import should = require('should');
import sinon = require('sinon');
import { Utils } from '../src/helpers/utils/utils';
import AppCenterConfig from '../src/data/appCenterConfig';
import { ILogger } from '../src/extension/log/logHelper';
import { ConsoleLogger } from '../src/extension/log/consoleLogger';

describe('AppCenterConfig', function () {
    let appCenterConfig: AppCenterConfig;
    let sandbox;
    const appName: string = "appName";
    let androidStringsPath: string;
    let pathToAppCenterConfigPlist: string;
    let pathToMainPlist: string;
    let pathToAndroidConfig: string;

    before(() => {
        mock({
            "android/app/src/main/res/values": {
                'strings.xml': '<?xml version="1.0" encoding="utf-8"?><resources><string name="name"></string></resources>'
            },
            "android/app/src/assets": {
                'appcenter-config.json' : ""
            },
            "ios/appName/" : {
                "AppCenter-Config.plist" : '<?xml version="1.0" encoding="UTF-8"?>',
                "Info.plist" : '<?xml version="1.0" encoding="UTF-8"?>'
            }
        });
        androidStringsPath = "android/app/src/main/res/values/strings.xml";
        pathToAppCenterConfigPlist = `ios/${appName}/AppCenter-Config.plist`;
        pathToMainPlist = `ios/${appName}/Info.plist`;
        pathToAndroidConfig = "android/app/src/main/assets/appcenter-config.json";
        sandbox = sinon.sandbox.create();
        const loggerStub: ILogger = sandbox.stub(ConsoleLogger.prototype);
        appCenterConfig = Utils.createAppCenterConfigFrom(appName, '', loggerStub);
    });

    after(() => {
        sandbox.restore();
        mock.restore();
    });

    describe('#setAndroidStringResourcesDeploymentKey', () => {
        it('should set the deployment key', async () => {
            const depKey = "key";
            appCenterConfig.setAndroidStringResourcesDeploymentKey(depKey);
            appCenterConfig.saveAndroidStringResources();
            const data = fs.readFileSync(androidStringsPath, { encoding: "utf8" });
            const xml = new jsxml.XML(data);
            xml.child(0).getValue().should.equal(depKey);
        });
    });

    describe('#configPlistValue', () => {
        it('should set and get config plist value', async () => {
            const key = "key";
            const value = "value";
            appCenterConfig.setConfigPlistValueByKey(key, value);
            appCenterConfig.saveConfigPlist();
            const newValue = appCenterConfig.getConfigPlistValueByKey(key);
            newValue.should.equal(value);
            const data = fs.readFileSync(pathToAppCenterConfigPlist, { encoding: "utf8" });
            const parsedInfoConfigPlist = plist.parse(data);
            parsedInfoConfigPlist.hasOwnProperty(key).should.be.true();
            parsedInfoConfigPlist.key.should.equal(value);
        });

        it('should delete config plist value', async () => {
            const key = "key";
            const value = "value";
            appCenterConfig.setConfigPlistValueByKey(key, value);
            appCenterConfig.saveConfigPlist();
            appCenterConfig.deleteConfigPlistValueByKey(key);
            appCenterConfig.saveConfigPlist();
            const newValue = appCenterConfig.getConfigPlistValueByKey(key);
            should.equal(newValue, undefined);
            const data = fs.readFileSync(pathToAppCenterConfigPlist, { encoding: "utf8" });
            const parsedInfoConfigPlist = plist.parse(data);
            parsedInfoConfigPlist.hasOwnProperty(key).should.be.false();
        });
    });

    describe('#androidconfigValue', () => {
        it('should set and get android config value', async () => {
            const key = "key";
            const value = "value";
            appCenterConfig.setAndroidAppCenterConfigValueByKey(key, value);
            appCenterConfig.saveAndroidAppCenterConfig();
            const newValue = appCenterConfig.getAndroidAppCenterConfigValueByKey(key);
            newValue.should.equal(value);
            const data = fs.readFileSync(pathToAndroidConfig, { encoding: "utf8" });
            const parsedAndroidConfig = JSON.parse(data);
            parsedAndroidConfig.hasOwnProperty(key).should.be.true();
            parsedAndroidConfig.key.should.equal(value);
        });

        it('should delete android config value', async () => {
            const key = "key";
            const value = "value";
            appCenterConfig.setAndroidAppCenterConfigValueByKey(key, value);
            appCenterConfig.saveAndroidAppCenterConfig();
            appCenterConfig.deleteAndroidAppCenterConfigValueByKey(key);
            appCenterConfig.saveAndroidAppCenterConfig();
            const newValue = appCenterConfig.getAndroidAppCenterConfigValueByKey(key);
            should.equal(newValue, undefined);
            const data = fs.readFileSync(pathToAndroidConfig, { encoding: "utf8" });
            const parsedAndroidConfig = JSON.parse(data);
            parsedAndroidConfig.hasOwnProperty(key).should.be.false();
        });
    });

    describe('#mainPlistValue', () => {
        it('should set and get main plist value', async () => {
            const key = "key";
            const value = "value";
            appCenterConfig.setMainPlistValueByKey(key, value);
            appCenterConfig.saveMainPlist();
            const newValue = appCenterConfig.getMainPlistValueByKey(key);
            newValue.should.equal(value);
            const data = fs.readFileSync(pathToMainPlist, { encoding: "utf8" });
            const parsedMainPlist = plist.parse(data);
            parsedMainPlist.hasOwnProperty(key).should.be.true();
            parsedMainPlist.key.should.equal(value);
        });
    });
});
