import { join } from "path";

export {
  captureBinExePath,
  captureVersionPath,
  captureSfxPath,
  configPath,
  gstreamerDllPath,
  gstreamerPluginsPath,
  captureBinFolder,
};

const captureBinFolder = join(__dirname, "screen-capture");
const captureBinExePath = join(captureBinFolder, "main.exe");
const captureVersionPath = join(captureBinFolder, "version.txt");
const captureSfxPath = join(__dirname, "capture-win64.sfx.exe");
const configPath = join(__dirname, "Screensharing.config.json");
const gstreamerDllPath = join(captureBinFolder, "dll");
const gstreamerPluginsPath = join(captureBinFolder, "plugins");
