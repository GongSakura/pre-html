import { StatusBarAlignment, StatusBarItem, window } from "vscode";

const name = "prehtml";
export const WATCH_ON =  "$(eye-watch) "+name;
export const WATCH_OFF = "$(eye-closed) "+name;
export const statusBar: StatusBarItem = window.createStatusBarItem(
  StatusBarAlignment.Right,
  -1
);

statusBar.name = name;
statusBar.text = WATCH_OFF;
