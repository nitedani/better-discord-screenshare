import { pipeline } from "stream";
import { promisify } from "util";

export const random = () =>
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);

export const waitForSelector = async (selector: string) =>
  new Promise<HTMLElement>((resolve) => {
    const interval = setInterval(() => {
      const el = document.querySelector(selector) as HTMLElement;
      if (el) {
        clearInterval(interval);
        resolve(el);
      }
    }, 100);
  });

export const pipe = promisify(pipeline);
