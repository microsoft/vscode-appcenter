CODE_TESTS_PATH=./integrationTest
CODE_TESTS_WORKSPACE=./integrationTest/reactNativeApp
npm i npm@latest -g
 npm cache clean -f

 npm install -g n

sudo n 8.11.3

sudo npm install
sudo npm install -g gulp-cli
sudo npm install -g vsce
npm run vscode:prepublish
node -v
npm run integrationTest