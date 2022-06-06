import { execFileSync } from "child_process";
import { createWriteStream, existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { promisify } from "util";
import { captureSfxPath, captureVersionPath } from "./paths";
import { pipe } from "./utils";

const request = __non_webpack_require__("request");

let isUpdating = false;

export const checkCaptureLatestVersion = async () => {
  const url =
    "https://github.com/nitedani/gstreamer-go-wrtc-remote/releases/latest";
  const res = await promisify(request.head)({ url, followRedirect: false });

  console.log(res.headers);

  const location = res.headers["location"];
  return location.split("/").pop()!;
};

export const updateCapture = async () => {
  if (isUpdating) {
    return;
  }
  isUpdating = true;

  try {
    const latestCaptureVersion = await checkCaptureLatestVersion();
    const installedVersion =
      existsSync(captureVersionPath) &&
      readFileSync(captureVersionPath).toString("utf8");

    if (!installedVersion || installedVersion !== latestCaptureVersion) {
      console.log(
        `https://github.com/nitedani/gstreamer-go-wrtc-remote/releases/download/${latestCaptureVersion}/capture-win64.sfx.exe`
      );

      await pipe(
        request(
          `https://github.com/nitedani/gstreamer-go-wrtc-remote/releases/download/${latestCaptureVersion}/capture-win64.sfx.exe`
        ),
        createWriteStream(captureSfxPath)
      );
      execFileSync(captureSfxPath);
      writeFileSync(captureVersionPath, latestCaptureVersion);
    }
  } catch (error) {
    console.error(error);
  } finally {
    isUpdating = false;
  }
};
