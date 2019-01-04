CODE_TESTS_PATH=./integrationTest
CODE_TESTS_WORKSPACE=./integrationTest/reactNativeApp

nvm -h
nvm use v8.11.3
npm install
npm install -g gulp-cli
npm install -g vsce
npm run vscode:prepublish
npm run integrationTest