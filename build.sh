CODE_TESTS_PATH=./integrationTest
CODE_TESTS_WORKSPACE=./integrationTest/reactNativeApp
npm i npm@latest -g
npm install
npm install -g gulp-cli
npm install -g vsce
npm run vscode:prepublish
rm -rf $NVM_DIR

npm cache clean -f 
npm install -g n
sudo n stable
sudo npm run integrationTest