/**
* @name BetterScreensharing
* @version "0.0.17"
*/
/*@cc_on
@if (@_jscript)
	
// Offer to self-install for clueless users that try to run this directly.
var shell = WScript.CreateObject("WScript.Shell");
var fs = new ActiveXObject("Scripting.FileSystemObject");
var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
var pathSelf = WScript.ScriptFullName;
// Put the user at ease by addressing them in the first person
shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
  shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
} else if (!fs.FolderExists(pathPlugins)) {
  shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
  fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
  // Show the user where to put plugins in the future
  shell.Exec("explorer " + pathPlugins);
  shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
}
WScript.Quit();

@else@*/
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ src)
});

;// CONCATENATED MODULE: ./src/library.ts
let library = null;
const setLibrary = (lib)=>{
    library = lib;
};
const getLibrary = ()=>{
    return library;
};

;// CONCATENATED MODULE: external "child_process"
const external_child_process_namespaceObject = require("child_process");
;// CONCATENATED MODULE: external "path"
const external_path_namespaceObject = require("path");
;// CONCATENATED MODULE: ./src/paths.ts


const captureBinFolder = (0,external_path_namespaceObject.join)(__dirname, "screen-capture");
const captureBinExePath = (0,external_path_namespaceObject.join)(captureBinFolder, "main.exe");
const captureVersionPath = (0,external_path_namespaceObject.join)(captureBinFolder, "version.txt");
const captureSfxPath = (0,external_path_namespaceObject.join)(__dirname, "capture-win64.sfx.exe");
const configPath = (0,external_path_namespaceObject.join)(__dirname, "BetterScreensharing.config.json");
const gstreamerDllPath = (0,external_path_namespaceObject.join)(captureBinFolder, "dll");
const gstreamerPluginsPath = (0,external_path_namespaceObject.join)(captureBinFolder, "plugins");

;// CONCATENATED MODULE: ./src/capture.ts


let cp = null;
const startCapture = ()=>{
    cp = (0,external_child_process_namespaceObject.spawn)(captureBinExePath, [
        configPath
    ], {
        env: {
            PATH: `${process.env.PATH};${gstreamerDllPath}`,
            GST_PLUGIN_PATH_1_0: gstreamerPluginsPath,
            GO_ENV: "release"
        }
    });
    cp.stdout?.on("data", (data)=>{
        console.log(data.toString());
    });
    cp.stderr?.on("data", (data)=>{
        console.log(data.toString());
    });
    cp.once("exit", (code)=>{
        console.log("capture client exited", code);
    });
};
const stopCapture = ()=>{
    if (cp) {
        cp.kill("SIGTERM");
        cp = null;
    }
};
const isRunning = ()=>{
    return !!cp;
};

;// CONCATENATED MODULE: external "stream"
const external_stream_namespaceObject = require("stream");
;// CONCATENATED MODULE: external "util"
const external_util_namespaceObject = require("util");
;// CONCATENATED MODULE: ./src/utils.ts


const random = ()=>Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
const waitForSelector = async (selector)=>new Promise((resolve)=>{
        const interval = setInterval(()=>{
            const el = document.querySelector(selector);
            if (el) {
                clearInterval(interval);
                resolve(el);
            }
        }, 100);
    });
const pipe = (0,external_util_namespaceObject.promisify)(external_stream_namespaceObject.pipeline);

;// CONCATENATED MODULE: ./src/settings.ts


const defaults = {
    stream_id: random(),
    private: true,
    remote_enabled: false,
    direct_connect: true,
    bitrate: 5242880,
    resolution: "1920x1080",
    framerate: 45,
    encoder: "vp8",
    threads: 4,
    server_url: "https://stream.0.tunnelr.co/api"
};
const saveSettings = (newState)=>{
    BdApi.setData("BetterScreensharing", "settings", typeof newState === "function" ? newState(getSettings()) : {
        ...defaults,
        ...newState
    });
    return getSettings();
};
const getSettings = ()=>{
    const data = BdApi.getData("BetterScreensharing", "settings");
    return {
        ...defaults,
        ...data
    };
};
const getSettingsPanel = ()=>{
    const Library = getLibrary();
    const { Settings  } = Library;
    const settings = getSettings();
    return Settings.SettingPanel.build(()=>saveSettings(settings), new Settings.Textbox("Resolution", "", settings.resolution, (e)=>{
        settings.resolution = e;
    }), new Settings.Textbox("Bitrate(Mbit)", "", String(settings.bitrate / 1024 / 1024), (e)=>{
        settings.bitrate = Number(e) * 1024 * 1024;
    }), new Settings.Textbox("Framerate", "", String(settings.framerate), (e)=>{
        settings.framerate = Number(e);
    }), new Settings.Switch("Remote control", "", settings.remote_enabled, (e)=>{
        settings.remote_enabled = e;
    }), new Settings.Switch("Peer to peer", "", settings.direct_connect, (e)=>{
        settings.direct_connect = e;
    }), new Settings.RadioGroup("Encoder", "", settings.encoder, [
        {
            name: "NVENC",
            value: "nvenc"
        },
        {
            name: "OpenH264",
            value: "h264"
        },
        {
            name: "VP8",
            value: "vp8"
        }, 
    ], (e)=>{
        settings.encoder = e;
    }));
};

;// CONCATENATED MODULE: ./src/button/button.css
const button_namespaceObject = "button[aria-label=\"Share Your Screen\"]:hover,\n.nitedani-stream-toggle-button:hover {\n  background-color: var(--background-secondary) !important;\n}\n\nbutton[aria-label=\"Share Your Screen\"] {\n  background-color: var(--background-primary) !important;\n}\n";
;// CONCATENATED MODULE: ./src/button/button.tsx
const { React , ReactDOM  } = BdApi;
const { useCallback , useState  } = React;





const id = "nitedani-stream-toggle";
// parent parent of the selector
const buttonContainerSelector = "section[aria-label='User area'] button[aria-label='Share Your Screen']";
const isMounted = ()=>document.querySelector("#" + id);
let observerSubscription = null;
const buttonStyle = {
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
    alignItems: "center"
};
const buttonClass = "nitedani-stream-toggle-button";
let injectedStyle = false;
const Component = ()=>{
    const Library = getLibrary();
    const { DiscordModules , Toasts  } = Library;
    const [, setNumber] = useState(0);
    const rerender = useCallback(()=>setNumber((n)=>n + 1), []);
    const running = isRunning();
    const handleStreamStart = useCallback(()=>{
        const settings = saveSettings((state)=>({
                ...state,
                stream_id: random()
            }));
        startCapture();
        DiscordModules.ElectronModule.copy(`${settings.server_url.replace("/api", "")}/stream/${settings.stream_id}`);
        Toasts.success("Stream URL copied to clipboard");
        rerender();
    }, []);
    const handleStreamStop = useCallback(()=>{
        stopCapture();
        rerender();
    }, []);
    const handleOpenSettings = useCallback(()=>{
        BdApi.Plugins.get("BetterScreensharing.plugin.js").instance.showSettingsModal();
    }, []);
    return /*#__PURE__*/ React.createElement("div", {
        style: {
            height: 32,
            color: "#ececec",
            display: "flex",
            gap: 8,
            alignItems: "center",
            paddingTop: 4,
            marginBottom: 4
        }
    }, !running && /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement("div", {
        onClick: handleStreamStart,
        className: buttonClass,
        style: {
            ...buttonStyle,
            backgroundColor: "hsl(139,calc(var(--saturation-factor, 1)*47.3%),43.9%)",
            color: "#fff"
        }
    }, "Stream"), /*#__PURE__*/ React.createElement("div", {
        onClick: handleOpenSettings,
        className: buttonClass,
        style: buttonStyle
    }, "Settings")), running && /*#__PURE__*/ React.createElement(React.Fragment, null, /*#__PURE__*/ React.createElement("div", {
        onClick: handleStreamStop,
        className: buttonClass,
        style: buttonStyle
    }, "Stop")));
};
const mountButton = async ()=>{
    const Library = getLibrary();
    const { DOMTools , Toasts  } = Library;
    if (!injectedStyle) {
        injectedStyle = true;
        DOMTools.addStyle(buttonClass, button_namespaceObject);
        DOMTools.addStyle("toast", Toasts.CSS);
    }
    const mount = async ()=>{
        if (isMounted()) {
            return;
        }
        const container = document.createElement("div");
        container.id = id;
        const el = document.querySelector(buttonContainerSelector);
        const el2 = el?.parentElement?.parentElement;
        if (!el2) {
            return;
        }
        ReactDOM.render(React.createElement(Component, {}), container);
        el2.lastChild.before(container);
    };
    observerSubscription ??= setInterval(()=>{
        if (isMounted()) return;
        mount();
    }, 100);
};
const unmountButton = ()=>{
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

;// CONCATENATED MODULE: external "fs"
const external_fs_namespaceObject = require("fs");
;// CONCATENATED MODULE: external "fs/promises"
const promises_namespaceObject = require("fs/promises");
;// CONCATENATED MODULE: ./src/update.ts






let isUpdating = false;
const checkCaptureLatestVersion = async ()=>{
    const request = require("request");
    const url = "https://github.com/nitedani/gstreamer-go-wrtc-remote/releases/latest";
    const res = await (0,external_util_namespaceObject.promisify)(request.head)({
        url,
        followRedirect: false
    });
    const location = res.headers["location"];
    return location.split("/").pop();
};
const updateCapture = async ()=>{
    const request = require("request");
    if (isUpdating) {
        return;
    }
    isUpdating = true;
    try {
        const latestCaptureVersion = await checkCaptureLatestVersion();
        const installedVersion = (0,external_fs_namespaceObject.existsSync)(captureVersionPath) && (0,external_fs_namespaceObject.readFileSync)(captureVersionPath).toString("utf8");
        if (!installedVersion || installedVersion !== latestCaptureVersion) {
            console.log(`https://github.com/nitedani/gstreamer-go-wrtc-remote/releases/download/${latestCaptureVersion}/capture-win64.sfx.exe`);
            try {
                await (0,promises_namespaceObject.rmdir)(captureBinFolder, {
                    recursive: true
                });
            } catch (error) {
                console.error(error);
            }
            await pipe(request(`https://github.com/nitedani/gstreamer-go-wrtc-remote/releases/download/${latestCaptureVersion}/capture-win64.sfx.exe`), (0,external_fs_namespaceObject.createWriteStream)(captureSfxPath));
            (0,external_child_process_namespaceObject.execFileSync)(captureSfxPath);
            (0,external_fs_namespaceObject.writeFileSync)(captureVersionPath, latestCaptureVersion);
        }
    } catch (error) {
        console.error(error);
    } finally{
        isUpdating = false;
    }
};

;// CONCATENATED MODULE: ./package.json
const package_namespaceObject = {"i8":"0.0.17"};
;// CONCATENATED MODULE: ./src/index.tsx






const config = {
    info: {
        name: "BetterScreensharing",
        authors: [
            {
                name: "nitedani",
                discord_id: "148196158357897216",
                github_username: "nitedani"
            }, 
        ],
        version: package_namespaceObject.i8,
        description: "BetterScreensharing",
        github: "https://github.com/nitedani/better-discord-screenshare",
        github_raw: "https://raw.githubusercontent.com/nitedani/better-discord-screenshare/main/apps/screensharing/dist/BetterScreensharing.plugin.js"
    }
};
const createClass = ()=>{
    if (window.hasOwnProperty("ZeresPluginLibrary")) {
        const [BasePlugin, Library] = window.ZeresPluginLibrary.buildPlugin(config);
        setLibrary(Library);
        return class BetterScreensharing extends BasePlugin {
            async onStart() {
                stopCapture();
                updateCapture();
                mountButton();
            }
            async onStop() {
                stopCapture();
                unmountButton();
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
            return config.info.authors.map((a)=>a.name).join(", ");
        }
        getDescription() {
            return `${config.info.description}. __**ZeresPluginLibrary was not found! This plugin will not work!**__`;
        }
        getVersion() {
            return config.info.version;
        }
        load() {
            BdApi.showConfirmationModal("Library plugin is needed", [
                `The library plugin needed for ${config.info.name} is missing. Please click Download to install it.`, 
            ], {
                confirmText: "Download",
                cancelText: "Cancel",
                onConfirm: ()=>{
                    const req = require;
                    req("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body)=>{
                        if (error) return req("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                        await new Promise((r)=>req("fs").writeFile(req("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                        const wait = ()=>new Promise((r)=>setTimeout(r, 150));
                        await wait();
                        BdApi.Plugins.enable("ZeresPluginLibrary");
                        await wait();
                        BdApi.Plugins.reload("BetterScreensharing.plugin.js");
                        await wait();
                        BdApi.Plugins.enable("BetterScreensharing");
                    });
                }
            });
        }
        start() {}
        stop() {}
    };
};
/* harmony default export */ const src = (createClass());

module.exports["default"] = __webpack_exports__["default"];
/******/ })()
;
/*@end@*/