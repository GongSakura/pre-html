import * as vscode from "vscode";
import { statusBar } from "./statusBar";
import { switchWatching } from "./commands";
import { updateReactDeclaration } from "./action";
export function activate(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage("activvvvvvvate 🔥");

  // register commend
  context.subscriptions.push(
    vscode.commands.registerCommand("prehtml.switchWatching", switchWatching)
  );

  // listen file save event
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(updateReactDeclaration)
  );
  statusBar.command = "prehtml.switchWatching";
  statusBar.show();
}

export function deactivate() {}
