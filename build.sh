CODE_TESTS_PATH=$(Build.Repository.LocalPath)/integrationTest
CODE_TESTS_WORKSPACE=$(Build.Repository.LocalPath)/integrationTest/reactNativeApp
echo $CODE_TESTS_WORKSPACE
npm i npm@latest -g
npm install
npm install -g gulp-cli
npm install -g vsce
npm run vscode:prepublish
rm -rf $NVM_DIR
sudo npm run integrationTest --loglevel verbose