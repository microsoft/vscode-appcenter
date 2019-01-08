CODE_TESTS_PATH=$SYSTEM_BUILDPATH/integrationTest
CODE_TESTS_WORKSPACE=$SYSTEM_BUILDPATH/integrationTest/reactNativeApp
npm i npm@latest -g
npm install
npm install -g gulp-cli
npm install -g vsce
npm run vscode:prepublish
rm -rf $NVM_DIR
npm install -g node@latest
node -v
sudo npm run integrationTest --loglevel verbose