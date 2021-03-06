import { mountButton, unmountButton } from "./button/button";
import { stopCapture } from "./stream/capture";
import { getSettingsPanel } from "./settings";
import { updateCapture } from "./stream/update";
import { setLibrary } from "./library";
//@ts-ignore
import { version } from "../package.json";
import { createListeners } from "./stream/events/events";
import { soundEventListeners } from "./stream/events/sound";

const config = {
  info: {
    name: "BetterScreensharing",
    authors: [
      {
        name: "nitedani",
        discord_id: "148196158357897216",
        github_username: "nitedani",
      },
    ],
    version,
    description: "BetterScreensharing",
    github: "https://github.com/nitedani/better-discord-screenshare",
    github_raw:
      "https://raw.githubusercontent.com/nitedani/better-discord-screenshare/main/apps/screensharing/dist/BetterScreensharing.plugin.js",
  },
  // changelog: [{ title: "First", items: ["First"] }],
};

const createClass = () => {
  if (window.hasOwnProperty("ZeresPluginLibrary")) {
    const [BasePlugin, Library] = window.ZeresPluginLibrary.buildPlugin(config);
    setLibrary(Library);
    const listeners = createListeners(soundEventListeners);

    return class BetterScreensharing extends BasePlugin {
      async onStart() {
        // shouldn't do anything in this case
        stopCapture();
        // download new binary
        updateCapture();
        mountButton();
        listeners.start();
      }

      async onStop() {
        stopCapture();
        unmountButton();
        listeners.stop();
      }

      getSettingsPanel() {
        return getSettingsPanel();
      }
    };
  }

  return class {
    getName() {
      return config.info.name;
    }
    getAuthor() {
      return config.info.authors.map((a) => a.name).join(", ");
    }
    getDescription() {
      return `${config.info.description}. __**ZeresPluginLibrary was not found! This plugin will not work!**__`;
    }
    getVersion() {
      return config.info.version;
    }
    load() {
      BdApi.showConfirmationModal(
        "Library plugin is needed",
        [
          `The library plugin needed for ${config.info.name} is missing. Please click Download to install it.`,
        ],
        {
          confirmText: "Download",
          cancelText: "Cancel",
          onConfirm: () => {
            const req = __non_webpack_require__;
            req("request").get(
              "https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js",
              async (error, response, body) => {
                if (error)
                  return req("electron").shell.openExternal(
                    "https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js"
                  );
                await new Promise((r) =>
                  req("fs").writeFile(
                    req("path").join(
                      BdApi.Plugins.folder,
                      "0PluginLibrary.plugin.js"
                    ),
                    body,
                    r
                  )
                );
                const wait = () => new Promise((r) => setTimeout(r, 150));
                await wait();
                BdApi.Plugins.enable("ZeresPluginLibrary");
                await wait();
                BdApi.Plugins.reload("BetterScreensharing.plugin.js");
                await wait();
                BdApi.Plugins.enable("BetterScreensharing");
              }
            );
          },
        }
      );
    }
    start() {}
    stop() {}
  };
};

export default createClass();
