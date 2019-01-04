CODE_TESTS_PATH=./integrationTest
CODE_TESTS_WORKSPACE=./integrationTest/reactNativeApp

cd /usr/local/Cellar/node@8/
ls
$ npm config delete prefix 
$ npm config set prefix /usr/local/Cellar/node@8/8.11.3
npm install
npm install -g gulp-cli
npm install -g vsce
npm run vscode:prepublish
npm run integrationTest