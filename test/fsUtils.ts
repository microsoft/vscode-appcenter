import { FSUtils } from '../src/helpers/utils/fsUtils';

describe('Utils', function () {
    let path;
    let fs;
    const pathToCreateEmptyFolder = "test/mock/empty-dir";
    const pathToNonEmptyDir = "test/mock/non-empty-dir";
    const dirWithIgnoredFilesPath = "test/mock/empty-dir-with-ignored-files";
    const dirWithIgnoredVscodePath = "test/mock/empty-dir-with-ignored-vscode";

    before(() => {
        path = require("path");
        fs = require("fs");
        try {
            fs.mkdirSync(path.resolve(pathToCreateEmptyFolder));
        } catch (e) { }
    });

    describe('#IsEmptyDirectoryToStartNewProject', () => {

        it('should recognize an empty directory to start new project', async () => {
            const isEmpty = FSUtils.IsEmptyDirectoryToStartNewProject(path.resolve(pathToCreateEmptyFolder));
            isEmpty.should.be.true();
        });

        it('should recognize a non-empty directory', async () => {
            const isEmpty = FSUtils.IsEmptyDirectoryToStartNewProject(path.resolve(pathToNonEmptyDir));
            isEmpty.should.be.false();
        });

        it('should ignore .vscode and .git', async () => {
            try {
                fs.mkdirSync(path.resolve(dirWithIgnoredFilesPath, ".git"));
            } catch (e) { }
            const isEmpty = FSUtils.IsEmptyDirectoryToStartNewProject(path.resolve(dirWithIgnoredFilesPath));
            isEmpty.should.be.true();
        });
    });

    describe('#IsEmptyDirectory', () => {

        it('should recognize an empty directory', async () => {
            const isEmpty = FSUtils.IsEmptyDirectory(path.resolve(pathToCreateEmptyFolder));
            isEmpty.should.be.true();
        });

        it('should recognize a non-empty directory', async () => {
            const isEmpty = FSUtils.IsEmptyDirectory(path.resolve(pathToNonEmptyDir));
            isEmpty.should.be.false();
        });

        it('should ignore .vscode', async () => {
            const isEmpty = FSUtils.IsEmptyDirectory(path.resolve(dirWithIgnoredVscodePath));
            isEmpty.should.be.true();
        });
    });

    describe('#exists', () => {
        const pathToExistingFile = "test/mock/file.json";
        const pathToNotExistingFile = "test/mock/file-1.json";

        it('should return true if file exists', async () => {
            const exists = await FSUtils.exists(path.resolve(pathToExistingFile));
            exists.should.be.true();
        });

        it('should return false if file does not exist', async () => {
            const exists = await FSUtils.exists(path.resolve(pathToNotExistingFile));
            exists.should.be.false();
        });
    });
});
