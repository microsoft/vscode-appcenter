import { commands, MessageItem, QuickPickItem, StatusBarAlignment, StatusBarItem, window } from "vscode";
import { models } from "../appcenter/api";
import { Constants, MessageTypes } from "./constants";
import { Utils } from "./utils";

"use strict";

export class BaseQuickPickItem implements QuickPickItem {
    public label: string;
    public description: string;
    public id: string;
}

export class CustomQuickPickItem {
    public label: string;
    public description: string;
    public target: string | undefined;
}

export class WorkItemQueryQuickPickItem extends BaseQuickPickItem {
    public wiql: string;
}

//Any changes to ButtonMessageItem must be reflected in IButtonMessageItem
export class ButtonMessageItem implements MessageItem, IButtonMessageItem {
    public title: string;
    public url?: string;
    public command?: string;
    public telemetryId?: string;
}

export class VsCodeUtils {

    public static getQuickPickItemsForAppsList(appsList: models.AppResponse[]) {
        return appsList.map((app: models.AppResponse) => {
            return {
                label: `${app.name} (${app.os})`,
                description: app.owner.type,
                target: `${app.name}`
            };
        });
    }

    public static getStatusBarItem(): StatusBarItem {
        return window.createStatusBarItem(StatusBarAlignment.Left, 12);
    }

    public static async setStatusBar(statusBar: StatusBarItem, text: string, tooltip: string, commandOnClick?: string): Promise<void> {
        if (statusBar !== undefined) {
            statusBar.command = commandOnClick; // undefined clears the command
            statusBar.text = text;
            statusBar.tooltip = tooltip;
            statusBar.color = Constants.AppCenterCodePushStatusBarColor;
            statusBar.show();
        }
        return Promise.resolve(void 0);
    }

    public static async ShowErrorMessage(message: string, ...urlMessageItem: IButtonMessageItem[]): Promise<IButtonMessageItem> {
        return this.showMessage(message, MessageTypes.Error, ...urlMessageItem);
    }

    public static async ShowInfoMessage(message: string, ...urlMessageItem: IButtonMessageItem[]): Promise<IButtonMessageItem> {
        return this.showMessage(message, MessageTypes.Info, ...urlMessageItem);
    }

    public static async ShowWarningMessage(message: string): Promise<IButtonMessageItem> {
        return this.showMessage(message, MessageTypes.Warn);
    }

    //We have a single method to display either simple messages (with no options) or messages
    //that have multiple buttons that can run commands, open URLs, send telemetry, etc.
    private static async showMessage(message: string, type: MessageTypes, ...urlMessageItem: IButtonMessageItem[]): Promise<IButtonMessageItem> {
        //The following "cast" allows us to pass our own type around (and not reference "vscode" via an import)
        const messageItems: ButtonMessageItem[] = <ButtonMessageItem[]>urlMessageItem;
        const messageToDisplay: string = `(${Constants.ExtensionName}) ${Utils.FormatMessage(message)}`;

        //Use the typescript spread operator to pass the rest parameter to showErrorMessage
        let chosenItem: IButtonMessageItem | undefined;
        switch (type) {
            case MessageTypes.Error:
                chosenItem = await window.showErrorMessage(messageToDisplay, ...messageItems);
                break;
            case MessageTypes.Info:
                chosenItem = await window.showInformationMessage(messageToDisplay, ...messageItems);
                break;
            case MessageTypes.Warn:
                chosenItem = await window.showWarningMessage(messageToDisplay, ...messageItems);
                break;
            default:
                break;
        }

        if (chosenItem) {
            if (chosenItem.url) {
                Utils.OpenUrl(chosenItem.url);
            }
            if (chosenItem.command) {
                commands.executeCommand<void>(chosenItem.command);
            }
        }
        return <IButtonMessageItem>chosenItem;
    }
}

export interface IButtonMessageItem {
    title: string;
    url?: string;
    command?: string;
    telemetryId?: string;
}
