npm i npm@latest -g
npm install
npm install -g gulp-cli
npm install -g vsce
npm run vscode:prepublish
rm -rf $NVM_DIR
node node_modules/vscode/bin/test
#sudo npm run integrationTest --loglevel verbose --extensionTestsPath $CODE_TESTS_PATH