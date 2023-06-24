import { statusBar, WATCH_OFF, WATCH_ON } from "./statusBar";
import { Worker } from "worker_threads";
import * as url from "url";
import * as path from "path";
import { TextDocument } from "vscode";
import { onMessage } from "./worker";
// const worker = new Worker(
//   url.pathToFileURL(path.join(__dirname, "./worker.js"))
// );

export const ACTION_TYPE = {
  UPDATE_REACT_DECLARATION: "update_react_declaration",
};
export const updateReactDeclaration = async (e: TextDocument) => {
  if (statusBar.text === WATCH_ON) {
    const message = {
      type: ACTION_TYPE.UPDATE_REACT_DECLARATION,
      payload: {
        status: statusBar.text,
        rawText: e.getText(),
        fileName: e.fileName,
      },
    };
    console.info(`message:`,message)
    await onMessage(message);

    // worker.postMessage(message);
  }
};
