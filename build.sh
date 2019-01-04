CODE_TESTS_PATH=./integrationTest
CODE_TESTS_WORKSPACE=./integrationTest/reactNativeApp
npm i npm@latest -g
npm install
npm install -g gulp-cli
npm install -g vsce
npm run vscode:prepublish
brew uninstall nvm
rm -rf $NVM_DIR
npm run integrationTest