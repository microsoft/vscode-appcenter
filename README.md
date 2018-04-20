# VSCode App Center Tools &middot; [![Build Status](https://msmobilecenter.visualstudio.com/_apis/public/build/definitions/d7809725-8fd7-4b76-8022-ebb8720603f6/2854/badge)](https://msmobilecenter.visualstudio.com/Patricks%20Sandbox/_build/index?definitionId=2854)
This extension provides a development support for App Center projects. 

_NOTE: Currently it supports only React-Native based apps._

## Getting Started
* [Install VS Code](https://code.visualstudio.com).
* Install the extension
* If you haven't already, please also install:
    * react-native-cli
    * git


## How it works
There are several possible scenarios of using this extension:

1. You would like to start development from scratch with the new application already linked and configured to [AppCenter](https://appcenter.ms):
    * You clone new empty repository on your machine with `git clone new-repo-name` and `cd new-repo-name` and open this folder in VS Code.
    * You login to the appcenter from the App Center StatusBar

        ![Login to Appcenter](images/appcenter-login.png)
    * After logging in click the App Center StatusBar to show App Center Menu options. 

        ![AppCenter Menu](images/appcenter-start-new-idea.png)
    * You will be prompted to enter idea name and select user or organization where you would like to create app in App Center
        * App Center sample app will be cloned into the repository you have provided (it will also have preconfigured App Center Analytics/Crashes/CodePush stuff)
        * Two react-native apps (for iOS and Android) will be created in App Center (`ideaname-ios` and `ideaname-android`)
        * CodePush deployments will be created for every app
        * App will be linked with corresponding iOS/Android secret keys and CodePush deployment keys
        * Changes will be pushed to your remote repository
        * New Testers Distribution Group will be created for every new app in App Center, app will be connected to your GH repository `master` branch and new build will be started 
    * You will be notified when finished and also we will automatically run `npm install` for you

2. You would like to link an existing react-native application to App Center. 
    You will see a "Set Current App" option, when logged in.
    You can either choose an app from App Center or choose it to be created for you.
    When you pick "Create an App Center app" option, several options are available:
    * Create an app for Android
    * Create an app for iOS
    * Create apps for both platforms
    If you choose one of the first two, the app will be created and automatically set as current. If you choose to create two apps, you will have to pick one of them as current when a prompt is shown.

    When the app is linked to App Center, several new options appear in the menu:
    * Build
    * Test
    * Distribute
    * Crashes
    * Analytics
    They all open the corresponding App Center tabs for the applicaiton. "Distribute" also contains CodePush stuff.

3. You would like to open already existing react-native application with CodePush installed. When logged in, the following App Center Menu options should be avaliable under "Distribute > CodePush":
    * Set current app for CodePush
    * Change current Deployment
    * Change target binary verson 
    * Change if release should be mandatory
    * Make new CodePush release



## Contributing
There are a couple of ways you can contribute to this repo:

- **Ideas, feature requests and bugs**: We are open to all ideas and we want to get rid of bugs! Use the Issues section to either report a new issue, provide your ideas or contribute to existing threads.
- **Documentation**: Found a typo or strangely worded sentences? Submit a PR!
- **Code**: Contribute bug fixes, features or design changes.

## Legal
Before we can accept your pull request you will need to sign a **Contribution License Agreement**. All you need to do is to submit a pull request, then the PR will get appropriately labelled (e.g. `cla-required`, `cla-norequired`, `cla-signed`, `cla-already-signed`). If you already signed the agreement we will continue with reviewing the PR, otherwise system will tell you how you can sign the CLA. Once you sign the CLA all future PR's will be labeled as `cla-signed`.

## Code of conduct
This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## License
[MIT](LICENSE.md)
