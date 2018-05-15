import sinon = require('sinon');
import { ConsoleLogger } from '../src/extension/log/consoleLogger';
import { CurrentApp } from '../src/helpers/interfaces';
import { ILogger } from '../src/extension/log/logHelper';
import { CrashGenerator } from '../src/crashes/crashGenerator';

describe('CrashGenerator', function () {

    let sandbox: sinon.SinonSandbox;
    let crashGenerator: CrashGenerator;

    const mockApp: CurrentApp = {
        appName: "app",
        os: "android",
        ownerName: "owner",
        identifier: "id",
        targetBinaryVersion: "1.2",
        isMandatory: false,
        type: "user",
        currentAppDeployments: null,
        appSecret: "secret"
    };

    before(() => {
        sandbox = sinon.sandbox.create();
        const loggerStub: ILogger = sandbox.stub(ConsoleLogger.prototype);
        crashGenerator = new CrashGenerator(mockApp, "", loggerStub);
    });

    after(() => {
        sandbox.restore();
    });

    describe('#generateCrashes', () => {
        let sendStub: sinon.stub;

        before(() => {
            sendStub = sandbox.stub(crashGenerator, 'sendCrashes');
            sendStub.resolves();
        });

        after(() => {
            sandbox.restore();
        });

        it('should generate and send crashes', async () => {
            await crashGenerator.generateCrashes();
            sendStub.callCount.should.equal(2);
        });
    });
});
