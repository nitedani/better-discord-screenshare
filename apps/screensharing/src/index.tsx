import { mountButton, unmountButton } from "./button";
import { stopCapture } from "./capture";
import { getSettingsPanel } from "./settings";
import { updateCapture } from "./update";
import { version } from "../package.json";
import { Plugin } from "bdlib/src/structs";

const config = {
  info: {
    name: "Screen sharing",
    authors: [
      {
        name: "nitedani",
        discord_id: "148196158357897216",
        github_username: "nitedani",
      },
    ],
    version,
    description: "Screen sharing",
    github: "https://github.com/nitedani/better-discord-screenshare",
    github_raw:
      "https://raw.githubusercontent.com/nitedani/better-discord-screenshare/main/apps/screensharing/dist/Screensharing.plugin.js",
  },
  // changelog: [{ title: "First", items: ["First"] }],
};

const BasePlugin = Plugin(config);

export default class ScreensharingPlugin extends BasePlugin {
  async onStart() {
    stopCapture();
    updateCapture();
    mountButton();
  }

  async onStop() {
    stopCapture();
    unmountButton();
  }

  getSettingsPanel() {
    return getSettingsPanel();
  }
}
