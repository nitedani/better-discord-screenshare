import EventEmitter from "events";

export interface Listener {
  event: string;
  listener: (...args: any[]) => void;
}

export const StreamEvents = new EventEmitter();

export const createListeners = (listeners: Listener[]) => {
  return {
    start() {
      for (const { event, listener } of listeners) {
        StreamEvents.on(event, listener);
      }
    },
    stop() {
      for (const { event, listener } of listeners) {
        StreamEvents.removeListener(event, listener);
      }
    },
  };
};
