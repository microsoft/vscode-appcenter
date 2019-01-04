CODE_TESTS_PATH=./integrationTest
CODE_TESTS_WORKSPACE=./integrationTest/reactNativeApp
sudo npm i npm@latest -g
sudo npm install
sudo npm install -g gulp-cli
sudo npm install -g vsce
sudo npm run vscode:prepublish
rm -rf $NVM_DIR
sudo npm run integrationTest