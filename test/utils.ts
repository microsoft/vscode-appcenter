import should = require('should');
import sinon = require('sinon');
import { Utils } from '../src/helpers/utils/utils';

describe('Utils', function () {
    let sandbox: sinon.SinonSandbox;

    before(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('#Format', () => {

        it('should remove the newlines from the message', async () => {
            const messageBeforeFormatting = `Test message!
New line here.`;
            const messageAfterFormatting = "Test message! New line here.";
            const afterMessage = Utils.FormatMessage(messageBeforeFormatting);
            afterMessage.should.equal(messageAfterFormatting);
        });

        it('should ellipsize ios-postfix apps to 10', async () => {
            const longNameWithPostfix = "LongAppNameLongLong-ios";
            const ellipsizedName = "LongAppNam... (iOS)";
            const ellipsize = Utils.FormatAppName(longNameWithPostfix);
            ellipsize.should.equal(ellipsizedName);
        });

        it('should ellipsize android-postfix apps to 10', async () => {
            const longNameWithPostfix = "LongAppNameLongLong-android";
            const ellipsizedName = "LongAppNam... (android)";
            const ellipsize = Utils.FormatAppName(longNameWithPostfix);
            ellipsize.should.equal(ellipsizedName);
        });

        it('should ellipsize apps with no postfix to 15', async () => {
            const longNameWithPostfix = "LongAppNameLongLong";
            const ellipsizedName = "LongAppNameLong...";
            const ellipsize = Utils.FormatAppName(longNameWithPostfix);
            ellipsize.should.equal(ellipsizedName);
        });
    });

    describe('#ParseJsonFile', () => {
        const jsonFilePath = "./mock/file.json";
        const malformedJsonFilePath = "./mock/malformed.json";
        let path;

        before(() => {
            path = require("path");
        });

        it('should read and convert json file properly', async () => {
            const file = Utils.parseJsonFile(path.resolve("test/" + jsonFilePath));
            file.should.not.be.null;
            file.property.should.equal("value");
        });

        it('should fail to read malformed file', async () => {
            return new Promise(function (resolve, reject) {
                try {
                    Utils.parseJsonFile(path.resolve("test/" + malformedJsonFilePath));
                } catch (e) {
                    should.exist(e);
                    resolve();
                }
                reject("the function should throw");
            });
        });
    });

    describe('#getAppName', () => {
        let path;
        const root = "./test/mock";

        before(() => {
            path = require("path");
        });

        it('should read app name from package.json', async () => {
            const file = Utils.getAppName(path.resolve(root));
            file.should.equal("app_name");
        });
    });
});
