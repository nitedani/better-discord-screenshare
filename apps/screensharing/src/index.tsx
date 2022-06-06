const React = BdApi.React;
const { useState } = React;
import axios from "axios";
import { Library } from "bdlib";
import { ChildProcess, execFileSync, spawn } from "child_process";
import { createWriteStream } from "fs";
import { join } from "path";
import { pipeline } from "stream";
import { promisify } from "util";
axios.defaults.adapter = require("axios/lib/adapters/http");
const {
  Settings,
  ReactComponents,
  DOMTools,
  DiscordModules: { ElectronModule },
} = Library;

const random = () =>
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);
const StreamToggleComponent = () => {
  const [running, setRunning] = useState(false);

  return <div>works</div>;
};

const config = {
  info: {
    name: "Screen sharing",
    authors: [
      {
        name: "nitedani",
        discord_id: "",
        github_username: "nitedani",
      },
    ],
    version: "0.0.1",
    description: "Screen sharing",
    github: "",
    github_raw: "",
  },
  changelog: [{ title: "First", items: ["First"] }],
};

const pipe = promisify(pipeline);
const BasePlugin = Library.Structs.Plugin(config);

const captureBinFolder = join(__dirname, "screen-capture");
const captureBinExePath = join(captureBinFolder, "main.exe");
const captureSfxPath = join(__dirname, "capture-win64.sfx.exe");
const configPath = join(__dirname, "Screensharing.config.json");

const buttonContainerSelector = "section[aria-label='User area']";

const waitForSelector = async (selector: string) =>
  new Promise<HTMLElement>((resolve) => {
    const interval = setInterval(() => {
      const el = document.querySelector(selector) as HTMLElement;
      if (el) {
        clearInterval(interval);
        resolve(el);
      }
    }, 100);
  });

export default class ExamplePlugin extends BasePlugin {
  settings = {
    stream_id: random(),
    private: true,
    remote_enabled: false,
    direct_connect: true,
    bitrate: 15388600,
    resolution: "1920x1080",
    framerate: 90,
    encoder: "nvenc",
    threads: 4,
    server_url: "http://0.tunnelr.co:4000/api",
  };

  downloaded = false;

  observerSubscription: any;

  cp: ChildProcess | null = null;

  buttonEl: HTMLButtonElement | null = null;

  startCapture() {
    this.cp = spawn(captureBinExePath, [configPath], {
      env: {
        PATH: `${process.env.PATH};${join(captureBinFolder, "dll")}`,
        GST_PLUGIN_PATH_1_0: join(captureBinFolder, "plugins"),
        GO_ENV: "release",
      },
    });

    this.cp.stdout?.on("data", (data) => {
      console.log(data.toString());
    });
    this.cp.stderr?.on("data", (data) => {
      console.log(data.toString());
    });

    this.cp.once("exit", (code) => {
      console.log("exit", code);
    });
  }

  stopCapture() {
    if (this.cp) {
      this.cp.kill("SIGTERM");
      this.cp = null;
    }
  }

  mountButton(parent: HTMLElement) {
    const id = "nitedani-stream-toggle";
    const mounted = document.querySelector("#" + id);
    if (mounted) {
      return;
    }
    this.buttonEl = document.createElement("button");
    this.buttonEl.innerText = this.cp ? "Stop" : "Start";
    this.buttonEl.id = id;
    this.buttonEl.addEventListener("click", () => {
      if (this.cp) {
        this.stopCapture();

        this.buttonEl!.innerText = "Start";
      } else {
        // long random id
        this.settings.stream_id = random();
        this.saveSettings()
        this.startCapture();
        ElectronModule.copy(
          `${this.settings.server_url.replace("/api", "")}/stream/${
            this.settings.stream_id
          }`
        );
        BdApi.showToast("Stream URL copied to clipboard");
        this.buttonEl!.innerText = "Stop";
      }
    });
    parent.appendChild(this.buttonEl);
  }

  unmountButton() {
    const id = "nitedani-stream-toggle";
    const mounted = document.querySelector("#" + id);
    if (!mounted) {
      return;
    }
    mounted.remove();
  }

  async onStart() {
    this.stopCapture();
    // const installed = existsSync(captureBinExePath);
    // if (!installed) {
    if (!this.downloaded) {
      const stream = await axios({
        method: "get",
        url: "https://github.com/nitedani/gstreamer-go-wrtc-remote/releases/download/0.2.3-alpha/capture-win64.sfx.exe",
        responseType: "stream",
      }).then((res) => res.data);

      await pipe(stream, createWriteStream(captureSfxPath));
      execFileSync(captureSfxPath);
      this.downloaded = true;
    }

    const el = await waitForSelector(buttonContainerSelector);
    this.mountButton(el);

    this.observerSubscription = DOMTools.observer.subscribeToQuerySelector(
      async () => {
        const el = await waitForSelector(buttonContainerSelector);
        this.mountButton(el);
      },
      buttonContainerSelector,
      null,
      true
    );
  }

  async onStop() {
    if (this.observerSubscription) {
      DOMTools.observer.unsubscribe(this.observerSubscription);
    }
    this.stopCapture();
    this.unmountButton();
  }

  getSettingsPanel() {
    return Settings.SettingPanel.build(
      (state) => this.saveSettings(state),
      /*
      new Settings.Textbox("Stream ID", "", this.settings.stream_id, (e) => {
        this.settings.stream_id = e;
      }),
      new Settings.Textbox("Server URL", "", this.settings.server_url, (e) => {
        this.settings.server_url = e;
      }),
      */
      new Settings.Textbox("Resolution", "", this.settings.resolution, (e) => {
        this.settings.resolution = e;
      }),
      new Settings.Textbox(
        "Bitrate",
        "",
        String(this.settings.bitrate),
        (e) => {
          this.settings.bitrate = Number(e);
        }
      ),
      new Settings.Textbox(
        "Framerate",
        "",
        String(this.settings.framerate),
        (e) => {
          this.settings.framerate = Number(e);
        }
      ),
      new Settings.Switch(
        "Remote control",
        "",
        this.settings.remote_enabled,
        (e) => {
          this.settings.remote_enabled = e;
        }
      ),
      new Settings.Switch(
        "Peer to peer",
        "",
        this.settings.direct_connect,
        (e) => {
          this.settings.direct_connect = e;
        }
      ),
      new Settings.RadioGroup(
        "Encoder",
        "",
        this.settings.encoder,
        [
          { name: "NVENC", value: "nvenc" },
          { name: "OpenH264", value: "h264" },
          {
            name: "VP8",
            value: "vp8",
          },
        ],
        (e) => {
          this.settings.encoder = e;
        }
      )
    );
  }
}
