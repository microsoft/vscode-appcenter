CODE_TESTS_PATH=./integrationTest
CODE_TESTS_WORKSPACE=./integrationTest/reactNativeApp

cd /usr/local
ls
$ npm config delete prefix 
$ npm config set prefix /usr/local/versions/node/v6.11.1
npm install
npm install -g gulp-cli
npm install -g vsce
npm run vscode:prepublish
npm run integrationTest