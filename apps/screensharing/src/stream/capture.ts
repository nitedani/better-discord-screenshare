import { ChildProcess, spawn } from "child_process";
import {
  captureBinExePath,
  configPath,
  gstreamerDllPath,
  gstreamerPluginsPath,
} from "../paths";
import { connectSocket, disconnectSocket } from "./socket";

let cp: ChildProcess | null = null;

export const startCapture = () => {
  cp = spawn(captureBinExePath, [configPath], {
    env: {
      PATH: `${process.env.PATH};${gstreamerDllPath}`,
      GST_PLUGIN_PATH_1_0: gstreamerPluginsPath,
      GO_ENV: "release",
    },
  });

  cp.stdout?.on("data", (data: Buffer) => {
    console.log(data.toString());
  });

  cp.stderr?.on("data", (data) => {
    const str = data.toString();
    console.log(str);

    if (str.includes("Connected to signaling server")) {
      connectSocket();
    }
  });

  cp.once("exit", (code) => {
    console.log("capture client exited", code);
  });
};

export const stopCapture = () => {
  if (cp) {
    cp.kill("SIGTERM");
    cp = null;
  }
  disconnectSocket();
};

export const isRunning = () => {
  return !!cp;
};
