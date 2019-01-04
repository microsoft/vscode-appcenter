CODE_TESTS_PATH=./integrationTest
CODE_TESTS_WORKSPACE=./integrationTest/reactNativeApp

 npm cache clean -f

 npm install -g n

sudo n 8.11.3
unset npm_config_prefix
sudo npm install
sudo npm install -g gulp-cli
sudo npm install -g vsce
npm run vscode:prepublish
npm run integrationTest