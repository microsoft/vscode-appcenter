
import should = require('should');
import sinon = require('sinon');
import FsProfileStorage from '../src/helpers/fsProfileStorage';
import { FSUtils } from '../src/helpers/fsUtils';
import { VstsProfile } from '../src/helpers/interfaces';
import { ConsoleLogger } from '../src/log/consoleLogger';

describe('FileStore', function () {

  const path = require("path");
  let sandbox: sinon.SinonSandbox;

  before(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#init', () => {
    const fakeFilePath = "./file.json";
    const mockFilePath = "./mock/profilesMock.json";
    const mockFilePathMalformed = "./mock/profilesMockMalformed.json";
    let profiles: VstsProfile[];
    let vstsProfileStorage: FsProfileStorage<VstsProfile>;

    before(() => {
      profiles = require(mockFilePath);
    });

    it('should create empty storage', async () => {
      const absolutePath = path.resolve("test/" + fakeFilePath);
      vstsProfileStorage = new FsProfileStorage(absolutePath, new ConsoleLogger());
      vstsProfileStorage.init();
      const existsStorage: boolean = await FSUtils.exists(absolutePath);
      should.equal(existsStorage, true);
    });

    it('should return active profile', async () => {
      const absolutePath = path.resolve("test/" + mockFilePath);
      vstsProfileStorage = new FsProfileStorage(absolutePath, new ConsoleLogger());
      await vstsProfileStorage.init();
      const expectedActiveProfile = profiles.filter(profile => profile.isActive)[0];
      const activeProfile = vstsProfileStorage.activeProfile;
      should.deepEqual(activeProfile, expectedActiveProfile);
    });

    it('should throw error if more than one active profile', async () => {
      const absolutePath = path.resolve("test/" + mockFilePathMalformed);
      vstsProfileStorage = new FsProfileStorage(absolutePath, new ConsoleLogger());
      return new Promise(function (resolve, reject) {
        vstsProfileStorage.init().catch(error => {
          should.exist(error);
          resolve();
        }).then(() => { 
          reject("the function should throw");
        });
      });
    });
  });

  describe('#save', () => {
    const mockFilePath = "./mock/profilesMock.json";
    let vstsProfileStorage: FsProfileStorage<VstsProfile>;
    let profiles: VstsProfile[];
    const fakeProfile: VstsProfile = {
      userId: "fake",
      userName: "123",
      displayName: "123",
      isActive: true,
      tenantName: ""
    };

    before(() => {
      profiles = require(mockFilePath);
    });

    beforeEach(async () => {
      const absolutePath = path.resolve("test/" + mockFilePath);
      vstsProfileStorage = new FsProfileStorage(absolutePath, new ConsoleLogger());
      sandbox.stub(vstsProfileStorage, 'saveProfiles');
      await vstsProfileStorage.init();
    });

    after(() => {
      sandbox.restore();
    });

    it('should return active profile', async () => {
      await vstsProfileStorage.save(fakeProfile);
      const activeProfile = vstsProfileStorage.activeProfile;
      should.deepEqual(activeProfile, fakeProfile);
    });

    it('should preserve active state on re-login', async () => {
      const deleteSpy: sinon.spy = sandbox.spy(vstsProfileStorage, "delete");
      const currentActiveProfile = profiles.filter(profile => profile.isActive)[0];
      await vstsProfileStorage.save(currentActiveProfile);
      deleteSpy.calledOnce.should.be.true();
      const activeProfile = vstsProfileStorage.activeProfile;
      should.deepEqual(activeProfile, currentActiveProfile);
    });
  });
});
