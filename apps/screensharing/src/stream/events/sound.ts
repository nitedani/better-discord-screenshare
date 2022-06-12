import { ViewerConnectionEvent } from "../socket";
import { Listener } from "./events";

export const soundEventListeners: Listener[] = [
  {
    event: "viewer_connected",
    listener: (_event: ViewerConnectionEvent) => {
      try {
        BdApi.findModuleByProps("playSound").playSound("stream_user_joined", 1);
      } catch (error) {
        console.error("Error playing sound", error);
      }
    },
  },
  {
    event: "viewer_disconnected",
    listener: (_event: ViewerConnectionEvent) => {
      try {
        BdApi.findModuleByProps("playSound").playSound("stream_user_left", 1);
      } catch (error) {
        console.error("Error playing sound", error);
      }
    },
  },
];
