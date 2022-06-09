const { React, ReactDOM } = BdApi;
const { useCallback, useState } = React;

import { getLibrary } from "src/library";
import { isRunning, startCapture, stopCapture } from "../capture";
import { saveSettings } from "../settings";
import { random } from "../utils";
import css from "./button.css";

const id = "nitedani-stream-toggle";
// parent parent of the selector
const buttonContainerSelector =
  "section[aria-label='User area'] button[aria-label='Share Your Screen']";

const isMounted = () => document.querySelector("#" + id);
let observerSubscription: NodeJS.Timer | null = null;
const buttonStyle: React.CSSProperties = {
  height: 32,
  backgroundColor: "var(--background-primary)",
  color: "var(--interactive-active)",
  fontSize: 14,
  transition: "background-color .17s ease,color .17s ease",
  padding: "0px 16px",
  fontWeight: 500,
  borderRadius: 3,
  cursor: "pointer",
  width: 0,
  flexGrow: 1,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};
const buttonClass = "nitedani-stream-toggle-button";

let injectedStyle = false;

const Component = () => {
  const Library = getLibrary();
  const { DiscordModules, Toasts } = Library!;
  const [, setNumber] = useState(0);
  const rerender = useCallback(() => setNumber((n) => n + 1), []);
  const running = isRunning();
  const handleStreamStart = useCallback(() => {
    const settings = saveSettings((state) => ({
      ...state,
      stream_id: random(),
    }));

    startCapture();

    DiscordModules.ElectronModule.copy(
      `${settings.server_url.replace("/api", "")}/stream/${settings.stream_id}`
    );

    Toasts.success("Stream URL copied to clipboard");
    rerender();
  }, []);

  const handleStreamStop = useCallback(() => {
    stopCapture();
    rerender();
  }, []);

  const handleOpenSettings = useCallback(() => {
    BdApi.Plugins.get(
      "BetterScreensharing.plugin.js"
    )!.instance.showSettingsModal();
  }, []);

  return (
    <div
      style={{
        height: 32,
        color: "#ececec",
        display: "flex",
        gap: 8,
        alignItems: "center",
        paddingTop: 4,
        marginBottom: 4,
      }}
    >
      {!running && (
        <>
          <div
            onClick={handleStreamStart}
            className={buttonClass}
            style={{
              ...buttonStyle,
              backgroundColor:
                "hsl(139,calc(var(--saturation-factor, 1)*47.3%),43.9%)",
              color: "#fff",
            }}
          >
            Stream
          </div>
          <div
            onClick={handleOpenSettings}
            className={buttonClass}
            style={buttonStyle}
          >
            Settings
          </div>
        </>
      )}
      {running && (
        <>
          <div
            onClick={handleStreamStop}
            className={buttonClass}
            style={buttonStyle}
          >
            Stop
          </div>
        </>
      )}
    </div>
  );
};

export const mountButton = async () => {
  const Library = getLibrary();
  const { DOMTools, Toasts } = Library!;

  if (!injectedStyle) {
    injectedStyle = true;
    DOMTools.addStyle(buttonClass, css);
    DOMTools.addStyle("toast", Toasts.CSS);
  }

  const mount = async () => {
    const container = document.createElement("div");
    container.id = id;
    const el = document.querySelector(buttonContainerSelector);
    const el2 = el?.parentElement?.parentElement;
    if (!el2) {
      return;
    }
    if (isMounted()) {
      return;
    }
    ReactDOM.render(React.createElement(Component, {}), container);
    el2.lastChild!.before(container);
  };

  observerSubscription ??= setInterval(() => {
    if (isMounted()) return;
    mount();
  }, 100);
};

export const unmountButton = () => {
  if (observerSubscription) {
    clearInterval(observerSubscription);
    observerSubscription = null;
  }
  const el = isMounted();
  if (!el) {
    return;
  }
  el.remove();
};
