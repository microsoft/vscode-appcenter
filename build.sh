CODE_TESTS_PATH=$SYSTEM_BUILDPATH/test
CODE_TESTS_WORKSPACE=$SYSTEM_BUILDPATH/test/reactNativeApp
npm i npm@latest -g
npm install
npm install -g gulp-cli
npm install -g vsce
npm run vscode:prepublish
rm -rf $NVM_DIR
sudo npm run integrationTest --loglevel verbose