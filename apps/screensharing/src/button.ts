import { DiscordModules, DOMTools } from "bdlib/src/modules";
import { isRunning, startCapture, stopCapture } from "./capture";
import { saveSettings } from "./settings";
import { random, waitForSelector } from "./utils";

const id = "nitedani-stream-toggle";
const buttonContainerSelector = "section[aria-label='User area']";
const isMounted = () => document.querySelector("#" + id);

let observerSubscription: any = null;
let buttonEl: HTMLButtonElement | null = null;

export const mountButton = async () => {
  const el = await waitForSelector(buttonContainerSelector);
  const running = isRunning();
  if (isMounted()) {
    return;
  }
  buttonEl = document.createElement("button");
  buttonEl.innerText = running ? "Stop" : "Start";
  buttonEl.id = id;
  buttonEl.addEventListener("click", () => {
    if (running) {
      stopCapture();
      buttonEl!.innerText = "Start";
    } else {
      const settings = saveSettings((state) => ({
        ...state,
        stream_id: random(),
      }));

      startCapture();

      DiscordModules.ElectronModule.copy(
        `${settings.server_url.replace("/api", "")}/stream/${
          settings.stream_id
        }`
      );

      BdApi.showToast("Stream URL copied to clipboard");
      buttonEl!.innerText = "Stop";
    }
  });
  el.appendChild(buttonEl);

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
