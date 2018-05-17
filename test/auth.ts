import sinon = require('sinon');
import os = require('os');
import { ConsoleLogger } from '../src/extension/log/consoleLogger';
import { VstsProfile, VstsLoginInfo } from '../src/helpers/interfaces';
import VstsAuth from '../src/auth/vstsAuth';
import { ILogger } from '../src/extension/log/logHelper';
import { TokenEntry, TokenStore } from '../src/data/tokenStore/tokenStore';
import FsProfileStorage from '../src/data/fsProfileStorage';
import { Utils } from '../src/helpers/utils/utils';
import { OsxTokenStore } from '../src/data/tokenStore/osx/osx-token-store';
import { WinTokenStore } from '../src/data/tokenStore/win32/win-token-store';
import { FileTokenStore } from '../src/data/tokenStore/fileTokenStore';

describe('Auth', function () {

    let sandbox: sinon.SinonSandbox;
    let vstsAuth: VstsAuth;
    let vstsProfileStorage: FsProfileStorage<VstsProfile>;
    const mockToken = "token";
    const mockTenant = "tenant";
    const mockUser = "user";
    const mockId = "id";
    let stubPrototype: TokenStore;

    before(async () => {
        sandbox = sinon.sandbox.create();
        const loggerStub: ILogger = sandbox.stub(ConsoleLogger.prototype);
        vstsProfileStorage = new FsProfileStorage(Utils.getVstsProfileFileName(), loggerStub);
        vstsAuth = new VstsAuth(vstsProfileStorage, loggerStub);
        stubPrototype = os.platform() === 'win32' ? WinTokenStore.prototype : os.platform() === 'darwin' ? OsxTokenStore.prototype : FileTokenStore.prototype;
        await vstsAuth.initialize();
    });

    after(() => {
        sandbox.restore();
    });

    describe('#doLogin', () => {
        let getUserInfoStub: sinon.stub;
        let setTokenStub: sinon.stub;
        let removeTokenStub: sinon.stub;
        let saveStub: sinon.stub;
        const vstsLoginInfo: VstsLoginInfo = {
            token: mockToken,
            tenantName: mockTenant,
            userName: mockUser
        };

        const mockProfile: VstsProfile = {
            userId: mockId,
            userName: mockUser,
            displayName: "name",
            isActive: true,
            tenantName: mockTenant
        };

        before(() => {
            getUserInfoStub = sandbox.stub(vstsAuth, 'getUserInfo');
            getUserInfoStub.resolves(mockProfile);

            setTokenStub = sandbox.stub(stubPrototype, 'set');
            setTokenStub.withArgs(getUserInfoStub.userId, { token: mockToken }).resolves();

            removeTokenStub = sandbox.stub(stubPrototype, 'remove');
            removeTokenStub.withArgs(mockId).resolves();

            saveStub = sandbox.stub(vstsProfileStorage, "save");
        });

        after(() => {
            sandbox.restore();
        });

        it('should save profile and token for profile userId', async () => {
            const profile = await vstsAuth.doLogin(vstsLoginInfo);
            profile.should.deepEqual(mockProfile);
            removeTokenStub.withArgs(mockId).calledOnce.should.be.true();
            saveStub.withArgs(profile).calledOnce.should.be.true();
        });
    });

    describe('#doLogout', () => {
        let removeTokenStub: sinon.stub;
        let saveStub: sinon.stub;
        let deleteStub: sinon.stub;
        let listStub: sinon.stub;

        const mockProfile1: VstsProfile = {
            userId: mockId,
            userName: mockUser,
            displayName: "name",
            isActive: true,
            tenantName: mockTenant
        };

        const mockProfile2: VstsProfile = {
            userId: "fake",
            userName: mockUser,
            displayName: "name",
            isActive: true,
            tenantName: mockTenant
        };
        const profiles: VstsProfile[] = [mockProfile1, mockProfile2];
        before(() => {

            saveStub = sandbox.stub(vstsProfileStorage, "save");
            deleteStub = sandbox.stub(vstsProfileStorage, "delete");
            deleteStub.resolves();
            listStub = sandbox.stub(vstsProfileStorage, "list");
            listStub.resolves(profiles);
            sandbox.stub(vstsProfileStorage, "activeProfile").get(() => { return null; });
            removeTokenStub = sandbox.stub(stubPrototype, 'remove');
            removeTokenStub.withArgs(mockId).resolves();
        });

        after(() => {
            sandbox.restore();
        });

        it('should remove profile and token for profile userId', async () => {
            await vstsAuth.doLogout(mockId);
            removeTokenStub.withArgs(mockId).calledOnce.should.be.true();
            deleteStub.withArgs(mockId).calledOnce.should.be.true();
            saveStub.withArgs(profiles[0]).calledOnce.should.be.true();
        });
    });

    describe('#accessTokenFor', () => {
        let getTokenStub: sinon.stub;

        const mockProfile: VstsProfile = {
            userId: mockId,
            userName: mockUser,
            displayName: "name",
            isActive: true,
            tenantName: mockTenant
        };

        before(() => {
            getTokenStub = sandbox.stub(stubPrototype, 'get');
            getTokenStub.withArgs(mockId).resolves(<TokenEntry>{
                key: mockId,
                accessToken: {
                    token: mockToken
                }
            });
        });

        after(() => {
            sandbox.restore();
        });

        it('should get access token for user', async () => {
            const token = await VstsAuth.accessTokenFor(mockProfile);
            token.should.equal(mockToken);
        });
    });
});
