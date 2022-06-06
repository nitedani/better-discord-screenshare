const { React, ReactDOM } = BdApi;
const { useCallback, useState } = React;
import { DiscordModules, DOMTools } from "bdlib/src/modules";
import { isRunning, startCapture, stopCapture } from "../capture";
import { saveSettings } from "../settings";
import { random, waitForSelector } from "../utils";

const id = "nitedani-stream-toggle";
const buttonContainerSelector = "section[aria-label='User area']";
const isMounted = () => document.querySelector("#" + id);

let observerSubscription: any = null;
let buttonEl: HTMLButtonElement | null = null;

const buttonStyle: React.CSSProperties = {
  backgroundColor: "var(--background-primary)",
  color: "var(--interactive-active)",
  fontSize: 14,
  transition: "background-color .17s ease,color .17s ease",
  padding: "8px 16px",
  fontWeight: 500,
  borderRadius: 3,
  cursor: "pointer",
  width: 0,
  flexGrow: 1,
  textAlign: "center",
};
const buttonClass = "nitedani-stream-toggle-button";

import css from "./button.css";
DOMTools.addStyle(buttonClass, css);
const Component = () => {
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

    BdApi.showToast("Stream URL copied to clipboard");
    rerender();
  }, []);

  const handleStreamStop = useCallback(() => {
    stopCapture();
    rerender();
  }, []);

  const handleOpenSettings = useCallback(() => {
    BdApi.Plugins.get("Screensharing.plugin.js")!.instance.showSettingsModal();
  }, []);

  return (
    <div
      style={{
        height: 50,
        //backgroundColor: "red",
        color: "#ececec",
        display: "flex",
        gap: 12,
        alignItems: "center",
        padding: "0 8px",
        borderBottom: "1px solid var(--background-modifier-accent)",
      }}
    >
      {!running && (
        <>
          <div
            onClick={handleStreamStart}
            className={buttonClass}
            style={buttonStyle}
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
  const container = document.createElement("div");
  container.id = id;
  const el = await waitForSelector(buttonContainerSelector);
  const running = isRunning();
  if (isMounted()) {
    return;
  }
 
  buttonEl = document.createElement("button");
  buttonEl.innerText = running ? "Stop" : "Start";
  buttonEl.addEventListener("click", () => {
    if (running) {
      stopCapture();
      buttonEl!.innerText = "Start";
    } else {
      buttonEl!.innerText = "Stop";
    }
  });

  ReactDOM.render(React.createElement(Component, {}), container);
  el.prepend(container);

  observerSubscription ??= DOMTools.observer.subscribeToQuerySelector(
    () => mountButton(),
    buttonContainerSelector,
    null,
    true
  );
};

export const unmountButton = () => {
  if (observerSubscription) {
    DOMTools.observer.unsubscribe(observerSubscription);
  }
  const el = isMounted();
  if (!el) {
    return;
  }
  el.remove();
};
