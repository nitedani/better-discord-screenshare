import { ChildProcess, spawn } from "child_process";
import {
  captureBinExePath,
  configPath,
  gstreamerDllPath,
  gstreamerPluginsPath,
} from "./paths";

let cp: ChildProcess | null = null;

export const startCapture = () => {
  cp = spawn(captureBinExePath, [configPath], {
    env: {
      PATH: `${process.env.PATH};${gstreamerDllPath}`,
      GST_PLUGIN_PATH_1_0: gstreamerPluginsPath,
      GO_ENV: "release",
    },
  });

  cp.stdout?.on("data", (data) => {
    console.log(data.toString());
  });
  cp.stderr?.on("data", (data) => {
    console.log(data.toString());
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
};

export const isRunning = () => {
  return !!cp;
};
