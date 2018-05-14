import should = require('should');
import * as vscode from 'vscode';
import { CommandNames } from '../src/extension/resources/constants';

describe("Extension Tests", function () {

    describe('#registerAppCenterCommands', function () {

        it('should register all commands', async function () {
            const requiredCommands = [
                CommandNames.AppCenterPortal,
                CommandNames.WhoAmI,
                CommandNames.Login,
                CommandNames.ShowMenu,
                CommandNames.Start,
                CommandNames.GetCurrentApp,
                CommandNames.SetCurrentApp,
                CommandNames.SimulateCrashes,
                CommandNames.InstallSDK,
                CommandNames.CreateNewApp,
                CommandNames.Settings.LoginToAnotherAccount,
                CommandNames.Settings.SwitchAccount,
                CommandNames.Settings.Logout,
                CommandNames.Settings.LoginVsts,
                CommandNames.Settings.SwitchAccountVsts,
                CommandNames.Settings.LogoutVsts,
                CommandNames.Settings.ShowStatusBar,
                CommandNames.Settings.HideStatusBar,
                CommandNames.CodePush.SetCurrentDeployment,
                CommandNames.CodePush.ReleaseReact,
                CommandNames.CodePush.SwitchMandatoryPropForRelease,
                CommandNames.CodePush.SetTargetBinaryVersion,
                CommandNames.CodePush.LinkCodePush,
                CommandNames.Test.ShowMenu,
                CommandNames.Test.RunUITests,
                CommandNames.Test.RunUITestsAsync,
                CommandNames.Test.ViewResults
            ];

            const registeredCommands = new Set(await vscode.commands.getCommands(true));

            for (const requiredCommand of requiredCommands) {
                should.equal(registeredCommands.has(requiredCommand), true);
            }
        });
    });
});
