const { React, ReactDOM } = BdApi;
const { useCallback, useState, useEffect } = React;

import { getLibrary } from "src/library";
import { createListeners, StreamEvents } from "src/stream/events/events";
import { ViewerConnectionEvent } from "src/stream/socket";
import { saveSettings } from "../settings";
import { isRunning, startCapture, stopCapture } from "../stream/capture";
import { random } from "../utils";
import css from "./button.css";

const id = "nitedani-stream-toggle";
const buttonClass = "nitedani-stream-toggle-button";
const userAreaSelector = "section[aria-label='User area']";
const streamAreaSelector = "button[aria-label='Share Your Screen']";
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
  position: "relative",
};

let injectedStyle = false;
let currentLocation = "";
let observerSubscription: NodeJS.Timer | null = null;

const isMounted = () => document.querySelector("#" + id);

const Component = () => {
  const { DiscordModules, Toasts } = getLibrary();
  const [running, setRunning] = useState(isRunning());
  const [viewers, setViewers] = useState(0);

  useEffect(() => {
    const listeners = createListeners([
      {
        event: "viewer_connected",
        listener: (event: ViewerConnectionEvent) => {
          setViewers(event.viewerCount);
        },
      },
      {
        event: "viewer_disconnected",
        listener: (event: ViewerConnectionEvent) => {
          setViewers(event.viewerCount);
        },
      },
    ]);
    listeners.start();

    return () => {
      listeners.stop();
    };
  }, []);

  const handleStreamStart = useCallback(() => {
    const settings = saveSettings((state) => ({
      ...state,
      // lock this setting
      private: true,
      stream_id: random(),
    }));

    startCapture();
    setRunning(true);

    DiscordModules.ElectronModule.copy(
      `${settings.server_url.replace("/api", "")}/stream/${settings.stream_id}`
    );

    Toasts.success("Stream URL copied to clipboard");
  }, []);

  const handleStreamStop = useCallback(() => {
    stopCapture();
    setRunning(false);
    setViewers(0);
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
            <div>Stop</div>
            <div
              style={{
                position: "absolute",
                right: 12,
                color: viewers
                  ? "var(--text-positive)"
                  : "var(--header-secondary)",
              }}
            >
              {viewers} watching
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const getContainerElement = () => {
  const userArea = document.querySelector(userAreaSelector);
  if (userArea) {
    const streamArea = userArea.querySelector(streamAreaSelector);
    if (streamArea) {
      const containerElement = streamArea.parentElement?.parentElement;
      if (containerElement) {
        return { containerElement, location: "stream" };
      }
    }
    return { containerElement: userArea, location: "user" };
  }
};

export const mountButton = async () => {
  const { DOMTools, Toasts } = getLibrary();

  if (!injectedStyle) {
    injectedStyle = true;
    DOMTools.addStyle(buttonClass, css);
    DOMTools.addStyle("nitedani-toast", Toasts.CSS);
  }

  const mount = async () => {
    const currentEl = isMounted();
    if (currentEl && currentLocation === "stream") {
      return;
    }
    const e = getContainerElement();
    if (!e || (currentEl && e.location === "user")) {
      return;
    }
    const { containerElement, location } = e;
    currentLocation = location;

    const container = document.createElement("div");
    if (location === "user") {
      container.style.borderBottom =
        "1px solid var(--background-modifier-accent)";
      container.style.padding = "8px";
    }
    container.id = id;
    if (currentEl) {
      currentEl.remove();
    }
    ReactDOM.render(React.createElement(Component, {}), container);
    containerElement.lastChild!.before(container);
  };

  observerSubscription ??= setInterval(() => {
    if (isMounted() && currentLocation === "stream") return;
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
  const { DOMTools } = getLibrary();
  DOMTools.removeStyle(buttonClass);
  DOMTools.removeStyle("nitedani-toast");
  injectedStyle = false;
  currentLocation = "";
};
