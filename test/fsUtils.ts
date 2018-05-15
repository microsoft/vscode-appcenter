import mock = require('mock-fs');
import { FSUtils } from '../src/helpers/utils/fsUtils';

describe('FsUtils', function () {
    const pathToCreateEmptyFolder = "test/mock/empty-dir";
    const pathToNonEmptyDir = "test/mock/non-empty-dir";
    const dirWithIgnoredFilesPath = "test/mock/empty-dir-with-ignored-files";
    const dirWithIgnoredVscodePath = "test/mock/empty-dir-with-ignored-vscode";

    before(() => {

        mock({
            "test/mock/non-empty-dir": {
                'some-file.txt': 'file content here'
            },
            "test/mock/empty-dir-with-ignored-files": {
                '.vscode': {},
                '.git': {}
            },
            "test/mock/empty-dir-with-ignored-vscode": {
                '.vscode': {}
            },
            "test/mock/empty-dir": {}
        });
    });

    after(() => {
        mock.restore();
    });

    describe('#IsEmptyDirectoryToStartNewProject', () => {

        it('should return true if directory is empty', async () => {
            const isEmpty = FSUtils.IsEmptyDirectoryToStartNewProject(pathToCreateEmptyFolder);
            isEmpty.should.be.true();
        });

        it('should return false if directory is not empty', async () => {
            const isEmpty = FSUtils.IsEmptyDirectoryToStartNewProject(pathToNonEmptyDir);
            isEmpty.should.be.false();
        });

        it('should return true if directory is empty but has .vscode and .git folders', async () => {
            const isEmpty = FSUtils.IsEmptyDirectoryToStartNewProject(dirWithIgnoredFilesPath);
            isEmpty.should.be.true();
        });
    });

    describe('#IsEmptyDirectory', () => {

        it('should return true if directory is empty', async () => {
            const isEmpty = FSUtils.IsEmptyDirectory(pathToCreateEmptyFolder);
            isEmpty.should.be.true();
        });

        it('should return false if directory is not empty', async () => {
            const isEmpty = FSUtils.IsEmptyDirectory(pathToNonEmptyDir);
            isEmpty.should.be.false();
        });

        it('should return true if directory is empty but has .vscode folder', async () => {
            const isEmpty = FSUtils.IsEmptyDirectory(dirWithIgnoredVscodePath);
            isEmpty.should.be.true();
        });
    });

    describe('#exists', () => {
        const pathToNotExistingFile = "test/mock/file-1.json";

        it('should return true if file exists', async () => {
            const exists = await FSUtils.exists(pathToNonEmptyDir + "/some-file.txt");
            exists.should.be.true();
        });

        it('should return false if file does not exist', async () => {
            const exists = await FSUtils.exists(pathToNotExistingFile);
            exists.should.be.false();
        });
    });
});
