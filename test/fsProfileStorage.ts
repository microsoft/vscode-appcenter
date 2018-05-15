import should = require('should');
import sinon = require('sinon');

import FsProfileStorage from '../src/data/fsProfileStorage';
import { ConsoleLogger } from '../src/extension/log/consoleLogger';
import { VstsProfile } from '../src/helpers/interfaces';
import { FSUtils } from '../src/helpers/utils/fsUtils';

describe('FsProfileStorage', function () {

  let path;
  let fs;
  let sandbox: sinon.SinonSandbox;
  const fakeFilePath = "./file.json";
  const mockFilePath = "./mock/profilesMock.json";
  const mockFilePathMalformedDuplicateUserIds = "./mock/profilesMockMalformedUserIds.json";

  before(() => {
    sandbox = sinon.sandbox.create();
    path = require("path");
    fs = require('fs');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#init', () => {
    let profiles: VstsProfile[];
    let vstsProfileStorage: FsProfileStorage<VstsProfile>;

    before(() => {
      profiles = require(mockFilePath);
    });

    after(() => {
      // Delete the file created during testing.
      const absolutePath = path.resolve("test/" + fakeFilePath);
      fs.unlinkSync(absolutePath);
    });

    it('should create empty storage', async () => {
      const absolutePath = path.resolve("test/" + fakeFilePath);
      vstsProfileStorage = new FsProfileStorage(absolutePath, new ConsoleLogger());
      await vstsProfileStorage.init();
      const existsStorage: boolean = await FSUtils.exists(absolutePath);
      should.equal(existsStorage, true);
    });

    it('should load profiles', async () => {
      const absolutePath = path.resolve("test/" + mockFilePath);
      vstsProfileStorage = new FsProfileStorage(absolutePath, new ConsoleLogger());
      await vstsProfileStorage.init();
      const expectedActiveProfile = profiles.filter(profile => profile.isActive)[0];
      const activeProfile = vstsProfileStorage.activeProfile;
      should.deepEqual(activeProfile, expectedActiveProfile);
    });
  });

  describe('#save', () => {
    let vstsProfileStorage: FsProfileStorage<VstsProfile>;
    let profiles: VstsProfile[];
    const fakeProfile: VstsProfile = {
      userId: "fake",
      userName: "123",
      displayName: "123",
      isActive: true,
      tenantName: ""
    };
    let saveProfilesStub: sinon.stub;

    before(() => {
      profiles = require(mockFilePath);
    });

    beforeEach(async () => {
      const absolutePath = path.resolve("test/" + mockFilePath);
      vstsProfileStorage = new FsProfileStorage(absolutePath, new ConsoleLogger());
      saveProfilesStub = sandbox.stub(vstsProfileStorage, 'saveProfiles');
      saveProfilesStub.resolves();
      await vstsProfileStorage.init();
    });

    after(() => {
      sandbox.restore();
    });

    it('should make profile active', async () => {
      await vstsProfileStorage.save(fakeProfile);
      const activeProfile = vstsProfileStorage.activeProfile;
      should.deepEqual(activeProfile, fakeProfile);
      saveProfilesStub.calledOnce.should.be.true();
    });

    it('should preserve active state on re-login', async () => {
      const deleteSpy: sinon.spy = sandbox.spy(vstsProfileStorage, "delete");
      const currentActiveProfile = profiles.filter(profile => profile.isActive)[0];
      await vstsProfileStorage.save(currentActiveProfile);
      deleteSpy.calledOnce.should.be.true();
      const activeProfile = vstsProfileStorage.activeProfile;
      should.deepEqual(activeProfile, currentActiveProfile);
      saveProfilesStub.calledTwice.should.be.true();
    });
  });

  describe('#delete', () => {
    let vstsProfileStorage: FsProfileStorage<VstsProfile>;
    let profiles: VstsProfile[];
    let saveProfilesStub: sinon.stub;

    before(() => {
      profiles = require(mockFilePath);
    });

    beforeEach(async () => {
      const absolutePath = path.resolve("test/" + mockFilePath);
      vstsProfileStorage = new FsProfileStorage(absolutePath, new ConsoleLogger());
      saveProfilesStub = sandbox.stub(vstsProfileStorage, 'saveProfiles');
      saveProfilesStub.resolves();
      await vstsProfileStorage.init();
    });

    after(() => {
      sandbox.restore();
    });

    it('should delete active profile', async () => {
      const activeProfile = profiles.filter(profile => profile.isActive)[0];
      const deletedProfile = await vstsProfileStorage.delete(activeProfile.userId);
      const currentActiveProfile = vstsProfileStorage.activeProfile;
      should.deepEqual(currentActiveProfile, null);
      should.deepEqual(deletedProfile, activeProfile);
      saveProfilesStub.calledOnce.should.be.true();
    });

    it('should delete non-active profile and preserve the active one', async () => {
      const nonActiveProfile = profiles.filter(profile => !profile.isActive)[0];
      const activeProfile = profiles.filter(profile => profile.isActive)[0];
      const deletedProfile = await vstsProfileStorage.delete(nonActiveProfile.userId);
      const currentActiveProfile = vstsProfileStorage.activeProfile;
      should.deepEqual(activeProfile, currentActiveProfile);
      should.deepEqual(deletedProfile, nonActiveProfile);
      saveProfilesStub.calledOnce.should.be.true();
    });

    it('should not delete the profile thats not exist', async () => {
      const deletedProfile = await vstsProfileStorage.delete("fakeUserId");
      should.equal(deletedProfile, null);
      saveProfilesStub.called.should.be.false();
    });
  });

  describe('#get', () => {
    let vstsProfileStorage: FsProfileStorage<VstsProfile>;
    let profiles: VstsProfile[];
    let malformedProfiles: VstsProfile[];

    before(() => {
      profiles = require(mockFilePath);
      malformedProfiles = require(mockFilePathMalformedDuplicateUserIds);
    });

    beforeEach(async () => {
      const absolutePath = path.resolve("test/" + mockFilePath);
      vstsProfileStorage = new FsProfileStorage(absolutePath, new ConsoleLogger());
      await vstsProfileStorage.init();
    });

    after(() => {
      sandbox.restore();
    });

    it('should return null if profile not found', async () => {
      const foundProfile = await vstsProfileStorage.get("fakeUserId");
      should.deepEqual(foundProfile, null);
    });

    it('should throw if more than one profile found', async () => {
      const absolutePath = path.resolve("test/" + mockFilePathMalformedDuplicateUserIds);
      vstsProfileStorage = new FsProfileStorage(absolutePath, new ConsoleLogger());
      await vstsProfileStorage.init();
      const duplicateProfile: VstsProfile = malformedProfiles[0];
      return new Promise(function (resolve, reject) {
        vstsProfileStorage.get(duplicateProfile.userId).catch(error => {
          should.exist(error);
          resolve();
        }).then(() => {
          reject("the function should throw");
        });
      });
    });

    it('should return valid profile', async () => {
      const profile = profiles[0];
      const foundProfile = await vstsProfileStorage.get(profile.userId);
      should.deepEqual(foundProfile, profile);
    });
  });

  describe('#list', () => {
    let vstsProfileStorage: FsProfileStorage<VstsProfile>;
    let profiles: VstsProfile[];

    before(() => {
      profiles = require(mockFilePath);
    });

    beforeEach(async () => {
      const absolutePath = path.resolve("test/" + mockFilePath);
      vstsProfileStorage = new FsProfileStorage(absolutePath, new ConsoleLogger());
      await vstsProfileStorage.init();
    });

    after(() => {
      sandbox.restore();
    });

    it('should list profiles', async () => {
      const listedProfiles: VstsProfile[] = await vstsProfileStorage.list();
      should.deepEqual(listedProfiles, profiles);
    });
  });
});
