import { Settings } from "bdlib/src/ui";
import { random } from "./utils";

const defaults = {
  stream_id: random(),
  private: true,
  remote_enabled: false,
  direct_connect: true,
  bitrate: 10485760,
  resolution: "1920x1080",
  framerate: 60,
  encoder: "nvenc",
  threads: 4,
  server_url: "http://0.tunnelr.co:4000/api",
};

export const saveSettings = (
  newState:
    | ((oldSettings: typeof defaults) => Partial<typeof defaults>)
    | Partial<typeof defaults>
) => {
  BdApi.setData(
    "Screensharing",
    "settings",
    typeof newState === "function"
      ? newState(getSettings())
      : { ...defaults, ...newState }
  );

  return getSettings();
};

export const getSettings = (): typeof defaults => {
  const data = BdApi.getData("Screensharing", "settings");
  return { ...defaults, ...data };
};

export const getSettingsPanel = () => {
  const settings = getSettings();
  return Settings.SettingPanel.build(
    () => saveSettings(settings),
    new Settings.Textbox("Resolution", "", settings.resolution, (e) => {
      settings.resolution = e;
    }),
    new Settings.Textbox(
      "Bitrate(Mbit)",
      "",
      String(settings.bitrate / 1024 / 1024),
      (e) => {
        settings.bitrate = Number(e) * 1024 * 1024;
      }
    ),
    new Settings.Textbox("Framerate", "", String(settings.framerate), (e) => {
      settings.framerate = Number(e);
    }),
    new Settings.Switch("Remote control", "", settings.remote_enabled, (e) => {
      settings.remote_enabled = e;
    }),
    new Settings.Switch("Peer to peer", "", settings.direct_connect, (e) => {
      settings.direct_connect = e;
    }),
    new Settings.RadioGroup(
      "Encoder",
      "",
      settings.encoder,
      [
        { name: "NVENC", value: "nvenc" },
        { name: "OpenH264", value: "h264" },
        {
          name: "VP8",
          value: "vp8",
        },
      ],
      (e) => {
        settings.encoder = e;
      }
    )
  );
};
