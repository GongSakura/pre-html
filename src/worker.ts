import { parentPort } from "worker_threads";
import { ACTION_TYPE } from "./action";
import { updateReactDeclaration } from "./core";

export const onMessage = async ({
  type,
  payload,
}: {
  type: string;
  payload: any;
}) => {
  switch (type) {
    case ACTION_TYPE.UPDATE_REACT_DECLARATION:
      const errorMessage = await updateReactDeclaration(payload);
      break;
  }
};

parentPort?.on("message", onMessage);
