import { window } from "vscode";
import { statusBar, WATCH_OFF, WATCH_ON } from "./statusBar";
export const switchWatching = () => {
  switch (statusBar.text) {
    case WATCH_ON: {
      statusBar.text = WATCH_OFF;
      break;
    }

    case WATCH_OFF: {
      statusBar.text = WATCH_ON;
      break;
    }
  }
};
