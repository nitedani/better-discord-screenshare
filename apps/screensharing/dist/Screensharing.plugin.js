/**
* @name screensharing
* @version "0.0.3"
*/
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
  "default": () => (/* binding */ ScreensharingPlugin)
});

;// CONCATENATED MODULE: ../../packages/bdlib/src/modules/logger.ts
/** 
 * Simple logger for the lib and plugins.
 * 
 * @module Logger
 */ /* eslint-disable no-console */ /**
 * List of logging types.
 */ const LogTypes = {
    /** Alias for error */ err: "error",
    error: "error",
    /** Alias for debug */ dbg: "debug",
    debug: "debug",
    log: "log",
    warn: "warn",
    info: "info"
};
class logger_Logger {
    /**
     * Logs an error using a collapsed error group with stacktrace.
     * 
     * @param {string} module - Name of the calling module.
     * @param {string} message - Message or error to have logged.
     * @param {Error} error - Error object to log with the message.
     */ static stacktrace(module, message, error) {
        console.error(`%c[${module}]%c ${message}\n\n%c`, "color: #3a71c1; font-weight: 700;", "color: red; font-weight: 700;", "color: red;", error);
    }
    /**
     * Logs using error formatting. For logging an actual error object consider {@link module:Logger.stacktrace}
     * 
     * @param {string} module - Name of the calling module.
     * @param {string} message - Messages to have logged.
     */ static err(module, ...message) {
        logger_Logger._log(module, message, "error");
    }
    /**
     * Logs a warning message.
     * 
     * @param {string} module - Name of the calling module.
     * @param {...any} message - Messages to have logged.
     */ static warn(module, ...message) {
        logger_Logger._log(module, message, "warn");
    }
    /**
     * Logs an informational message.
     * 
     * @param {string} module - Name of the calling module.
     * @param {...any} message - Messages to have logged.
     */ static info(module, ...message) {
        logger_Logger._log(module, message, "info");
    }
    /**
     * Logs used for debugging purposes.
     * 
     * @param {string} module - Name of the calling module.
     * @param {...any} message - Messages to have logged.
     */ static debug(module, ...message) {
        logger_Logger._log(module, message, "debug");
    }
    /**
     * Logs used for basic loggin.
     * 
     * @param {string} module - Name of the calling module.
     * @param {...any} message - Messages to have logged.
     */ static log(module, ...message) {
        logger_Logger._log(module, message);
    }
    /**
     * Logs strings using different console levels and a module label.
     * 
     * @param {string} module - Name of the calling module.
     * @param {any|Array<any>} message - Messages to have logged.
     * @param {module:Logger.LogTypes} type - Type of log to use in console.
     */ static _log(module, message, type = "log") {
        type = logger_Logger.parseType(type);
        if (!Array.isArray(message)) message = [
            message
        ];
        console[type](`%c[${module}]%c`, "color: #3a71c1; font-weight: 700;", "", ...message);
    }
    static parseType(type) {
        return LogTypes.hasOwnProperty(type) ? LogTypes[type] : "log";
    }
};

;// CONCATENATED MODULE: ../../packages/bdlib/src/modules/utilities.ts
//@ts-nocheck
/**
 * Random set of utilities that didn't fit elsewhere.
 * @module Utilities
 */ 
class utilities_Utilities {
    /**
   * Stably sorts arrays since `.sort()` has issues.
   * @param {Array} list - array to sort
   * @param {function} comparator - comparator to sort by
   */ static stableSort(list, comparator) {
        const entries = Array(list.length);
        // wrap values with initial indices
        for(let index = 0; index < list.length; index++){
            entries[index] = [
                index,
                list[index]
            ];
        }
        // sort with fallback based on initial indices
        entries.sort((function(a, b) {
            const comparison = Number(this(a[1], b[1]));
            return comparison || a[0] - b[0];
        }).bind(comparator));
        // re-map original array to stable sorted values
        for(let index1 = 0; index1 < list.length; index1++){
            list[index1] = entries[index1][1];
        }
    }
    /**
   * Generates an automatically memoizing version of an object.
   * @param {Object} object - object to memoize
   * @returns {Proxy} the proxy to the object that memoizes properties
   */ static memoizeObject(object) {
        const proxy = new Proxy(object, {
            get: function(obj, mod) {
                if (!obj.hasOwnProperty(mod)) return undefined;
                if (Object.getOwnPropertyDescriptor(obj, mod).get) {
                    const value = obj[mod];
                    delete obj[mod];
                    obj[mod] = value;
                }
                return obj[mod];
            },
            set: function(obj, mod, value) {
                if (obj.hasOwnProperty(mod)) return logger_Logger.err("MemoizedObject", "Trying to overwrite existing property");
                obj[mod] = value;
                return obj[mod];
            }
        });
        Object.defineProperty(proxy, "hasOwnProperty", {
            value: function(prop) {
                return this[prop] !== undefined;
            }
        });
        return proxy;
    }
    /**
   * Wraps the method in a `try..catch` block.
   * @param {callable} method - method to wrap
   * @param {string} description - description of method
   * @returns {callable} wrapped version of method
   */ static suppressErrors(method, description) {
        return (...params)=>{
            try {
                return method(...params);
            } catch (e) {
                logger_Logger.err("Suppression", "Error occurred in " + description, e);
            }
        };
    }
    /**
   * This only exists because Samo relied on lodash being there... fuck lodash.
   * @param {*} anything - whatever you want
   */ static isNil(anything) {
        return anything == null;
    }
    /**
   * Format template strings with placeholders (`${placeholder}`) into full strings.
   * Quick example: `Utilities.formatString("Hello, ${user}", {user: "Zerebos"})`
   * would return "Hello, Zerebos".
   * @param {string} string - string to format
   * @param {object} values - object literal of placeholders to replacements
   * @returns {string} the properly formatted string
   */ static formatTString(string, values) {
        for(const val in values){
            let replacement = values[val];
            if (Array.isArray(replacement)) replacement = JSON.stringify(replacement);
            if (typeof replacement === "object" && replacement !== null) replacement = replacement.toString();
            string = string.replace(new RegExp(`\\$\\{${val}\\}`, "g"), replacement);
        }
        return string;
    }
    /**
   * Format strings with placeholders (`{{placeholder}}`) into full strings.
   * Quick example: `Utilities.formatString("Hello, {{user}}", {user: "Zerebos"})`
   * would return "Hello, Zerebos".
   * @param {string} string - string to format
   * @param {object} values - object literal of placeholders to replacements
   * @returns {string} the properly formatted string
   */ static formatString(string, values) {
        for(const val in values){
            let replacement = values[val];
            if (Array.isArray(replacement)) replacement = JSON.stringify(replacement);
            if (typeof replacement === "object" && replacement !== null) replacement = replacement.toString();
            string = string.replace(new RegExp(`{{${val}}}`, "g"), replacement);
        }
        return string;
    }
    /**
   * Finds a value, subobject, or array from a tree that matches a specific filter. Great for patching render functions.
   * @param {object} tree React tree to look through. Can be a rendered object or an internal instance.
   * @param {callable} searchFilter Filter function to check subobjects against.
   */ static findInReactTree(tree, searchFilter) {
        return this.findInTree(tree, searchFilter, {
            walkable: [
                "props",
                "children",
                "child",
                "sibling"
            ]
        });
    }
    /**
   * Finds a value, subobject, or array from a tree that matches a specific filter.
   * @param {object} tree Tree that should be walked
   * @param {callable} searchFilter Filter to check against each object and subobject
   * @param {object} options Additional options to customize the search
   * @param {Array<string>|null} [options.walkable=null] Array of strings to use as keys that are allowed to be walked on. Null value indicates all keys are walkable
   * @param {Array<string>} [options.ignore=[]] Array of strings to use as keys to exclude from the search, most helpful when `walkable = null`.
   */ static findInTree(tree, searchFilter, { walkable =null , ignore =[]  } = {}) {
        if (typeof searchFilter === "string") {
            if (tree.hasOwnProperty(searchFilter)) return tree[searchFilter];
        } else if (searchFilter(tree)) {
            return tree;
        }
        if (typeof tree !== "object" || tree == null) return undefined;
        let tempReturn;
        if (Array.isArray(tree)) {
            for (const value of tree){
                tempReturn = this.findInTree(value, searchFilter, {
                    walkable,
                    ignore
                });
                if (typeof tempReturn != "undefined") return tempReturn;
            }
        } else {
            const toWalk = walkable == null ? Object.keys(tree) : walkable;
            for (const key of toWalk){
                if (!tree.hasOwnProperty(key) || ignore.includes(key)) continue;
                tempReturn = this.findInTree(tree[key], searchFilter, {
                    walkable,
                    ignore
                });
                if (typeof tempReturn != "undefined") return tempReturn;
            }
        }
        return tempReturn;
    }
    /**
   * Gets a nested property (if it exists) safely. Path should be something like `prop.prop2.prop3`.
   * Numbers can be used for arrays as well like `prop.prop2.array.0.id`.
   * @param {Object} obj - object to get nested property of
   * @param {string} path - representation of the property to obtain
   */ static getNestedProp(obj, path) {
        return path.split(".").reduce(function(ob, prop) {
            return ob && ob[prop];
        }, obj);
    }
    /**
   * Builds a classname string from any number of arguments. This includes arrays and objects.
   * When given an array all values from the array are added to the list.
   * When given an object they keys are added as the classnames if the value is truthy.
   * Copyright (c) 2018 Jed Watson https://github.com/JedWatson/classnames MIT License
   * @param {...Any} argument - anything that should be used to add classnames.
   */ static className() {
        const classes = [];
        const hasOwn = {}.hasOwnProperty;
        for(let i = 0; i < arguments.length; i++){
            const arg = arguments[i];
            if (!arg) continue;
            const argType = typeof arg;
            if (argType === "string" || argType === "number") {
                classes.push(arg);
            } else if (Array.isArray(arg) && arg.length) {
                const inner = this.classNames.apply(null, arg);
                if (inner) {
                    classes.push(inner);
                }
            } else if (argType === "object") {
                for(const key in arg){
                    if (hasOwn.call(arg, key) && arg[key]) {
                        classes.push(key);
                    }
                }
            }
        }
        return classes.join(" ");
    }
    /**
   * Safely adds to the prototype of an existing object by checking if the
   * property exists on the prototype.
   * @param {object} object - Object whose prototype to extend
   * @param {string} prop - Name of the prototype property to add
   * @param {callable} func - Function to run
   */ static addToPrototype(object, prop, func) {
        if (!object.prototype) return;
        if (object.prototype[prop]) return;
        return object.prototype[prop] = func;
    }
    /**
   * Deep extends an object with a set of other objects. Objects later in the list
   * of `extenders` have priority, that is to say if one sets a key to be a primitive,
   * it will be overwritten with the next one with the same key. If it is an object,
   * and the keys match, the object is extended. This happens recursively.
   * @param {object} extendee - Object to be extended
   * @param {...object} extenders - Objects to extend with
   * @returns {object} - A reference to `extendee`
   */ static extend(extendee, ...extenders) {
        for(let i = 0; i < extenders.length; i++){
            for(const key in extenders[i]){
                if (extenders[i].hasOwnProperty(key)) {
                    if (Array.isArray(extendee[key]) && Array.isArray(extenders[i][key])) this.extend(extendee[key], extenders[i][key]);
                    else if (typeof extendee[key] === "object" && typeof extenders[i][key] === "object") this.extend(extendee[key], extenders[i][key]);
                    else if (Array.isArray(extenders[i][key])) extendee[key] = [], this.extend(extendee[key], extenders[i][key]); // eslint-disable-line no-sequences
                    else if (typeof extenders[i][key] === "object") extendee[key] = {}, this.extend(extendee[key], extenders[i][key]); // eslint-disable-line no-sequences
                    else extendee[key] = extenders[i][key];
                }
            }
        }
        return extendee;
    }
    /* Code below comes from our work on BDv2:
   * https://github.com/JsSucks/BetterDiscordApp/blob/master/common/modules/utils.js
   */ /**
   * Clones an object and all it's properties.
   * @param {Any} value The value to clone
   * @return {Any} The cloned value
   */ static deepclone(value) {
        if (typeof value === "object") {
            if (Array.isArray(value)) return value.map((i)=>this.deepclone(i));
            const clone = Object.assign({}, value);
            for(const key in clone){
                clone[key] = this.deepclone(clone[key]);
            }
            return clone;
        }
        return value;
    }
    /**
   * Freezes an object and all it's properties.
   * @param {Any} object The object to freeze
   * @param {Function} exclude A function to filter object that shouldn't be frozen
   */ static deepfreeze(object, exclude) {
        if (exclude && exclude(object)) return;
        if (typeof object === "object" && object !== null) {
            const properties = Object.getOwnPropertyNames(object);
            for (const property of properties){
                this.deepfreeze(object[property], exclude);
            }
            Object.freeze(object);
        }
        return object;
    }
    /**
   * Removes an item from an array. This differs from Array.prototype.filter as it mutates the original array instead of creating a new one.
   * @param {Array} array The array to filter
   * @param {Any} item The item to remove from the array
   * @return {Array}
   */ static removeFromArray(array, item, filter) {
        let index;
        while((index = filter ? array.findIndex(item) : array.indexOf(item)) > -1)array.splice(index, 1);
        return array;
    }
    /**
   * Returns a function, that, as long as it continues to be invoked, will not
   * be triggered. The function will be called after it stops being called for
   * N milliseconds.
   *
   * Adapted from the version by David Walsh (https://davidwalsh.name/javascript-debounce-function)
   *
   * @param {function} executor
   * @param {number} delay
   */ static debounce(executor, delay) {
        let timeout;
        return function(...args) {
            const callback = ()=>{
                timeout = null;
                Reflect.apply(executor, null, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(callback, delay);
        };
    }
    /**
   * Loads data through BetterDiscord's API.
   * @param {string} name - name for the file (usually plugin name)
   * @param {string} key - which key the data is saved under
   * @param {object} defaultData - default data to populate the object with
   * @returns {object} the combined saved and default data
   */ static loadData(name, key, defaultData) {
        const defaults = this.deepclone(defaultData);
        try {
            return this.extend(defaults ? defaults : {}, BdApi.getData(name, key));
        } catch (err) {
            logger_Logger.err(name, "Unable to load data: ", err);
        }
        return defaults;
    }
    /**
   * Saves data through BetterDiscord's API.
   * @param {string} name - name for the file (usually plugin name)
   * @param {string} key - which key the data should be saved under
   * @param {object} data - data to save
   */ static saveData(name, key, data) {
        try {
            BdApi.setData(name, key, data);
        } catch (err) {
            logger_Logger.err(name, "Unable to save data: ", err);
        }
    }
    /**
   * Loads settings through BetterDiscord's API.
   * @param {string} name - name for the file (usually plugin name)
   * @param {object} defaultData - default data to populate the object with
   * @returns {object} the combined saved and default settings
   */ static loadSettings(name, defaultSettings) {
        return this.loadData(name, "settings", defaultSettings);
    }
    /**
   * Saves settings through BetterDiscord's API.
   * @param {string} name - name for the file (usually plugin name)
   * @param {object} data - settings to save
   */ static saveSettings(name, data) {
        this.saveData(name, "settings", data);
    }
};

;// CONCATENATED MODULE: ../../packages/bdlib/src/modules/discordmodules.ts
//@ts-nocheck
/**
 * A large list of known and useful webpack modules internal to Discord.
 * Click the source link down below to view more info. Otherwise, if you
 * have the library installed or have a plugin using this library,
 * do `Object.keys(ZLibrary.DiscordModules)` in console for a list of modules.
 * @module DiscordModules
 */ 

/* harmony default export */ const discordmodules = (utilities_Utilities.memoizeObject({
    get React () {
        return webpackmodules_WebpackModules.getByProps("createElement", "cloneElement");
    },
    get ReactDOM () {
        return webpackmodules_WebpackModules.getByProps("render", "findDOMNode");
    },
    get Events () {
        return webpackmodules_WebpackModules.getByPrototypes("setMaxListeners", "emit");
    },
    /* Guild Info, Stores, and Utilities */ get GuildStore () {
        return webpackmodules_WebpackModules.getByProps("getGuild");
    },
    get SortedGuildStore () {
        return webpackmodules_WebpackModules.getByProps("getSortedGuilds");
    },
    get SelectedGuildStore () {
        return webpackmodules_WebpackModules.getByProps("getLastSelectedGuildId");
    },
    get GuildSync () {
        return webpackmodules_WebpackModules.getByProps("getSyncedGuilds");
    },
    get GuildInfo () {
        return webpackmodules_WebpackModules.getByProps("getAcronym");
    },
    get GuildChannelsStore () {
        return webpackmodules_WebpackModules.getByProps("getChannels", "getDefaultChannel");
    },
    get GuildMemberStore () {
        return webpackmodules_WebpackModules.getByProps("getMember");
    },
    get MemberCountStore () {
        return webpackmodules_WebpackModules.getByProps("getMemberCounts");
    },
    get GuildEmojiStore () {
        return webpackmodules_WebpackModules.getByProps("getEmojis");
    },
    get GuildActions () {
        return webpackmodules_WebpackModules.getByProps("requestMembers");
    },
    get GuildPermissions () {
        return webpackmodules_WebpackModules.getByProps("getGuildPermissions");
    },
    /* Channel Store & Actions */ get ChannelStore () {
        return webpackmodules_WebpackModules.getByProps("getChannel", "getDMFromUserId");
    },
    get SelectedChannelStore () {
        return webpackmodules_WebpackModules.getByProps("getLastSelectedChannelId");
    },
    get ChannelActions () {
        return webpackmodules_WebpackModules.getByProps("selectChannel");
    },
    get PrivateChannelActions () {
        return webpackmodules_WebpackModules.getByProps("openPrivateChannel");
    },
    /* Current User Info, State and Settings */ get UserInfoStore () {
        return webpackmodules_WebpackModules.getByProps("getSessionId");
    },
    get UserSettingsStore () {
        return webpackmodules_WebpackModules.getByProps("guildPositions");
    },
    get StreamerModeStore () {
        return webpackmodules_WebpackModules.getByProps("hidePersonalInformation");
    },
    get UserSettingsUpdater () {
        return webpackmodules_WebpackModules.getByProps("updateRemoteSettings");
    },
    get OnlineWatcher () {
        return webpackmodules_WebpackModules.getByProps("isOnline");
    },
    get CurrentUserIdle () {
        return webpackmodules_WebpackModules.getByProps("isIdle");
    },
    get RelationshipStore () {
        return webpackmodules_WebpackModules.getByProps("isBlocked", "getFriendIDs");
    },
    get RelationshipManager () {
        return webpackmodules_WebpackModules.getByProps("addRelationship");
    },
    get MentionStore () {
        return webpackmodules_WebpackModules.getByProps("getMentions");
    },
    /* User Stores and Utils */ get UserStore () {
        return webpackmodules_WebpackModules.getByProps("getCurrentUser", "getUser");
    },
    get UserStatusStore () {
        return webpackmodules_WebpackModules.getByProps("getStatus", "getState");
    },
    get UserTypingStore () {
        return webpackmodules_WebpackModules.getByProps("isTyping");
    },
    get UserActivityStore () {
        return webpackmodules_WebpackModules.getByProps("getActivity");
    },
    get UserNameResolver () {
        return webpackmodules_WebpackModules.getByProps("getName");
    },
    get UserNoteStore () {
        return webpackmodules_WebpackModules.getByProps("getNote");
    },
    get UserNoteActions () {
        return webpackmodules_WebpackModules.getByProps("updateNote");
    },
    /* Emoji Store and Utils */ get EmojiInfo () {
        return webpackmodules_WebpackModules.getByProps("isEmojiDisabled");
    },
    get EmojiUtils () {
        return webpackmodules_WebpackModules.getByProps("getGuildEmoji");
    },
    get EmojiStore () {
        return webpackmodules_WebpackModules.getByProps("getByCategory", "EMOJI_NAME_RE");
    },
    /* Invite Store and Utils */ get InviteStore () {
        return webpackmodules_WebpackModules.getByProps("getInvites");
    },
    get InviteResolver () {
        return webpackmodules_WebpackModules.getByProps("resolveInvite");
    },
    get InviteActions () {
        return webpackmodules_WebpackModules.getByProps("acceptInvite");
    },
    /* Discord Objects & Utils */ get DiscordConstants () {
        return webpackmodules_WebpackModules.getByProps("Permissions", "ActivityTypes", "StatusTypes");
    },
    get DiscordPermissions () {
        return webpackmodules_WebpackModules.getByProps("Permissions", "ActivityTypes", "StatusTypes").Permissions;
    },
    get Permissions () {
        return webpackmodules_WebpackModules.getByProps("computePermissions");
    },
    get ColorConverter () {
        return webpackmodules_WebpackModules.getByProps("hex2int");
    },
    get ColorShader () {
        return webpackmodules_WebpackModules.getByProps("darken");
    },
    get TinyColor () {
        return webpackmodules_WebpackModules.getByPrototypes("toRgb");
    },
    get ClassResolver () {
        return webpackmodules_WebpackModules.getByProps("getClass");
    },
    get ButtonData () {
        return webpackmodules_WebpackModules.getByProps("ButtonSizes");
    },
    get NavigationUtils () {
        return webpackmodules_WebpackModules.getByProps("transitionTo", "replaceWith", "getHistory");
    },
    /* Discord Messages */ get MessageStore () {
        return webpackmodules_WebpackModules.getByProps("getMessage", "getMessages");
    },
    get ReactionsStore () {
        return webpackmodules_WebpackModules.getByProps("getReactions", "_dispatcher");
    },
    get MessageActions () {
        return webpackmodules_WebpackModules.getByProps("jumpToMessage", "_sendMessage");
    },
    get MessageQueue () {
        return webpackmodules_WebpackModules.getByProps("enqueue");
    },
    get MessageParser () {
        return webpackmodules_WebpackModules.getModule((m)=>Object.keys(m).length && Object.keys(m).every((k)=>k === "parse" || k === "unparse"));
    },
    /* Experiments */ get ExperimentStore () {
        return webpackmodules_WebpackModules.getByProps("getExperimentOverrides");
    },
    get ExperimentsManager () {
        return webpackmodules_WebpackModules.getByProps("isDeveloper");
    },
    get CurrentExperiment () {
        return webpackmodules_WebpackModules.getByProps("getExperimentId");
    },
    /* Streams */ get StreamStore () {
        return webpackmodules_WebpackModules.getByProps("getAllActiveStreams", "getStreamForUser");
    },
    get StreamPreviewStore () {
        return webpackmodules_WebpackModules.getByProps("getIsPreviewLoading", "getPreviewURL");
    },
    /* Images, Avatars and Utils */ get ImageResolver () {
        return webpackmodules_WebpackModules.getByProps("getUserAvatarURL", "getGuildIconURL");
    },
    get ImageUtils () {
        return webpackmodules_WebpackModules.getByProps("getSizedImageSrc");
    },
    get AvatarDefaults () {
        return webpackmodules_WebpackModules.getByProps("getUserAvatarURL", "DEFAULT_AVATARS");
    },
    /* Drag & Drop */ get DNDSources () {
        return webpackmodules_WebpackModules.getByProps("addTarget");
    },
    get DNDObjects () {
        return webpackmodules_WebpackModules.getByProps("DragSource");
    },
    /* Electron & Other Internals with Utils*/ get ElectronModule () {
        return webpackmodules_WebpackModules.getByProps("setBadge");
    },
    get Flux () {
        return webpackmodules_WebpackModules.getByProps("Store", "connectStores");
    },
    get Dispatcher () {
        return webpackmodules_WebpackModules.getByProps("dirtyDispatch");
    },
    get PathUtils () {
        return webpackmodules_WebpackModules.getByProps("hasBasename");
    },
    get NotificationModule () {
        return webpackmodules_WebpackModules.getByProps("showNotification");
    },
    get RouterModule () {
        return webpackmodules_WebpackModules.getByProps("Router");
    },
    get APIModule () {
        return webpackmodules_WebpackModules.getByProps("getAPIBaseURL");
    },
    get AnalyticEvents () {
        return webpackmodules_WebpackModules.getByProps("AnalyticEventConfigs");
    },
    get KeyGenerator () {
        return webpackmodules_WebpackModules.getByRegex(/"binary"/);
    },
    get Buffers () {
        return webpackmodules_WebpackModules.getByProps("Buffer", "kMaxLength");
    },
    get DeviceStore () {
        return webpackmodules_WebpackModules.getByProps("getDevices");
    },
    get SoftwareInfo () {
        return webpackmodules_WebpackModules.getByProps("os");
    },
    get i18n () {
        return webpackmodules_WebpackModules.getByProps("Messages", "languages");
    },
    /* Media Stuff (Audio/Video) */ get MediaDeviceInfo () {
        return webpackmodules_WebpackModules.getByProps("Codecs", "MediaEngineContextTypes");
    },
    get MediaInfo () {
        return webpackmodules_WebpackModules.getByProps("getOutputVolume");
    },
    get MediaEngineInfo () {
        return webpackmodules_WebpackModules.getByProps("determineMediaEngine");
    },
    get VoiceInfo () {
        return webpackmodules_WebpackModules.getByProps("getEchoCancellation");
    },
    get SoundModule () {
        return webpackmodules_WebpackModules.getByProps("playSound");
    },
    /* Window, DOM, HTML */ get WindowInfo () {
        return webpackmodules_WebpackModules.getByProps("isFocused", "windowSize");
    },
    get DOMInfo () {
        return webpackmodules_WebpackModules.getByProps("canUseDOM");
    },
    /* Locale/Location and Time */ get LocaleManager () {
        return webpackmodules_WebpackModules.getModule((m)=>m.Messages && Object.keys(m.Messages).length);
    },
    get Moment () {
        return webpackmodules_WebpackModules.getByProps("parseZone");
    },
    get LocationManager () {
        return webpackmodules_WebpackModules.getByProps("createLocation");
    },
    get Timestamps () {
        return webpackmodules_WebpackModules.getByProps("fromTimestamp");
    },
    /* Strings and Utils */ get Strings () {
        return webpackmodules_WebpackModules.getModule((m)=>m.Messages && Object.keys(m.Messages).length);
    },
    get StringFormats () {
        return webpackmodules_WebpackModules.getByProps("a", "z");
    },
    get StringUtils () {
        return webpackmodules_WebpackModules.getByProps("toASCII");
    },
    /* URLs and Utils */ get URLParser () {
        return webpackmodules_WebpackModules.getByProps("Url", "parse");
    },
    get ExtraURLs () {
        return webpackmodules_WebpackModules.getByProps("getArticleURL");
    },
    /* Text Processing */ get hljs () {
        return webpackmodules_WebpackModules.getByProps("highlight", "highlightBlock");
    },
    get SimpleMarkdown () {
        return webpackmodules_WebpackModules.getByProps("parseBlock", "parseInline", "defaultOutput");
    },
    /* DOM/React Components */ /* ==================== */ get LayerManager () {
        return webpackmodules_WebpackModules.getByProps("popLayer", "pushLayer");
    },
    get UserSettingsWindow () {
        return webpackmodules_WebpackModules.getByProps("open", "updateAccount");
    },
    get ChannelSettingsWindow () {
        return webpackmodules_WebpackModules.getByProps("open", "updateChannel");
    },
    get GuildSettingsWindow () {
        return webpackmodules_WebpackModules.getByProps("open", "updateGuild");
    },
    /* Modals */ get ModalActions () {
        return webpackmodules_WebpackModules.getByProps("openModal", "updateModal");
    },
    get ModalStack () {
        return webpackmodules_WebpackModules.getByProps("push", "update", "pop", "popWithKey");
    },
    get UserProfileModals () {
        return webpackmodules_WebpackModules.getByProps("fetchMutualFriends", "setSection");
    },
    get AlertModal () {
        return webpackmodules_WebpackModules.getByPrototypes("handleCancel", "handleSubmit");
    },
    get ConfirmationModal () {
        return webpackmodules_WebpackModules.findByDisplayName("ConfirmModal");
    },
    get ChangeNicknameModal () {
        return webpackmodules_WebpackModules.getByProps("open", "changeNickname");
    },
    get CreateChannelModal () {
        return webpackmodules_WebpackModules.getByProps("open", "createChannel");
    },
    get PruneMembersModal () {
        return webpackmodules_WebpackModules.getByProps("open", "prune");
    },
    get NotificationSettingsModal () {
        return webpackmodules_WebpackModules.getByProps("open", "updateNotificationSettings");
    },
    get PrivacySettingsModal () {
        return webpackmodules_WebpackModules.getModule((m)=>m.open && m.open.toString().includes("PRIVACY_SETTINGS_MODAL"));
    },
    get Changelog () {
        return webpackmodules_WebpackModules.getModule((m)=>m.defaultProps && m.defaultProps.selectable == false);
    },
    /* Popouts */ get PopoutStack () {
        return webpackmodules_WebpackModules.getByProps("open", "close", "closeAll");
    },
    get PopoutOpener () {
        return webpackmodules_WebpackModules.getByProps("openPopout");
    },
    get UserPopout () {
        return webpackmodules_WebpackModules.getModule((m)=>m.type.displayName === "UserPopoutContainer");
    },
    /* Context Menus */ get ContextMenuActions () {
        return webpackmodules_WebpackModules.getByProps("openContextMenu");
    },
    get ContextMenuItemsGroup () {
        return webpackmodules_WebpackModules.getByRegex(/itemGroup/);
    },
    get ContextMenuItem () {
        return webpackmodules_WebpackModules.getByRegex(/\.label\b.*\.hint\b.*\.action\b/);
    },
    /* Misc */ get ExternalLink () {
        return webpackmodules_WebpackModules.getByRegex(/trusted/);
    },
    get TextElement () {
        return webpackmodules_WebpackModules.getByDisplayName("LegacyText") || webpackmodules_WebpackModules.getByProps("Colors", "Sizes");
    },
    get Anchor () {
        return webpackmodules_WebpackModules.getByDisplayName("Anchor");
    },
    get Flex () {
        return webpackmodules_WebpackModules.getByDisplayName("Flex");
    },
    get FlexChild () {
        return webpackmodules_WebpackModules.getByProps("Child");
    },
    get Clickable () {
        return webpackmodules_WebpackModules.getByDisplayName("Clickable");
    },
    get Titles () {
        return webpackmodules_WebpackModules.getByProps("Tags", "default");
    },
    get HeaderBar () {
        return webpackmodules_WebpackModules.getByDisplayName("HeaderBar");
    },
    get TabBar () {
        return webpackmodules_WebpackModules.getByDisplayName("TabBar");
    },
    get Tooltip () {
        return webpackmodules_WebpackModules.getByProps("TooltipContainer").TooltipContainer;
    },
    get Spinner () {
        return webpackmodules_WebpackModules.getByDisplayName("Spinner");
    },
    /* Forms */ get FormTitle () {
        return webpackmodules_WebpackModules.getByDisplayName("FormTitle");
    },
    get FormSection () {
        return webpackmodules_WebpackModules.getByDisplayName("FormSection");
    },
    get FormNotice () {
        return webpackmodules_WebpackModules.getByDisplayName("FormNotice");
    },
    /* Scrollers */ get ScrollerThin () {
        return webpackmodules_WebpackModules.getByProps("ScrollerThin").ScrollerThin;
    },
    get ScrollerAuto () {
        return webpackmodules_WebpackModules.getByProps("ScrollerAuto").ScrollerAuto;
    },
    get AdvancedScrollerThin () {
        return webpackmodules_WebpackModules.getByProps("AdvancedScrollerThin").AdvancedScrollerThin;
    },
    get AdvancedScrollerAuto () {
        return webpackmodules_WebpackModules.getByProps("AdvancedScrollerAuto").AdvancedScrollerAuto;
    },
    get AdvancedScrollerNone () {
        return webpackmodules_WebpackModules.getByProps("AdvancedScrollerNone").AdvancedScrollerNone;
    },
    /* Settings */ get SettingsWrapper () {
        return webpackmodules_WebpackModules.getByDisplayName("FormItem");
    },
    get SettingsNote () {
        return webpackmodules_WebpackModules.getByDisplayName("FormText");
    },
    get SettingsDivider () {
        return webpackmodules_WebpackModules.getModule((m)=>!m.defaultProps && m.prototype && m.prototype.render && m.prototype.render.toString().includes("default.divider"));
    },
    get ColorPicker () {
        return webpackmodules_WebpackModules.getModule((m)=>m.displayName === "ColorPicker" && m.defaultProps);
    },
    get Dropdown () {
        return webpackmodules_WebpackModules.getByProps("SingleSelect").SingleSelect;
    },
    get Keybind () {
        return webpackmodules_WebpackModules.getByPrototypes("handleComboChange");
    },
    get RadioGroup () {
        return webpackmodules_WebpackModules.getByDisplayName("RadioGroup");
    },
    get Slider () {
        return webpackmodules_WebpackModules.getByPrototypes("renderMark");
    },
    get SwitchRow () {
        return webpackmodules_WebpackModules.getByDisplayName("SwitchItem");
    },
    get Textbox () {
        return webpackmodules_WebpackModules.getModule((m)=>m.defaultProps && m.defaultProps.type == "text");
    }
}));

;// CONCATENATED MODULE: ../../packages/bdlib/src/modules/webpackmodules.ts
//@ts-nocheck
/**
 * Random set of utilities that didn't fit elsewhere.
 * @module WebpackModules
 */ 

/**
 * Checks if a given module matches a set of parameters.
 * @callback module:WebpackModules.Filters~filter
 * @param {*} module - module to check
 * @returns {boolean} - True if the module matches the filter, false otherwise
 */ /**
 * Filters for use with {@link module:WebpackModules} but may prove useful elsewhere.
 */ class Filters {
    /**
   * Generates a {@link module:WebpackModules.Filters~filter} that filters by a set of properties.
   * @param {Array<string>} props - Array of property names
   * @param {module:WebpackModules.Filters~filter} filter - Additional filter
   * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of properties
   */ static byProperties(props, filter = (m)=>m) {
        return (module)=>{
            const component = filter(module);
            if (!component) return false;
            for(let p = 0; p < props.length; p++){
                if (module[props[p]] === undefined) return false;
            }
            return true;
        };
    }
    /**
   * Generates a {@link module:WebpackModules.Filters~filter} that filters by a set of properties on the object's prototype.
   * @param {Array<string>} fields - Array of property names
   * @param {module:WebpackModules.Filters~filter} filter - Additional filter
   * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of properties on the object's prototype
   */ static byPrototypeFields(fields, filter = (m)=>m) {
        return (module)=>{
            const component = filter(module);
            if (!component) return false;
            if (!component.prototype) return false;
            for(let f = 0; f < fields.length; f++){
                if (module.prototype[fields[f]] === undefined) return false;
            }
            return true;
        };
    }
    /**
   * Generates a {@link module:WebpackModules.Filters~filter} that filters by a regex.
   * @param {RegExp} search - A RegExp to check on the module
   * @param {module:WebpackModules.Filters~filter} filter - Additional filter
   * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of properties
   */ static byCode(search, filter = (m)=>m) {
        return (module)=>{
            const method = filter(module);
            if (!method) return false;
            let methodString = "";
            try {
                methodString = method.toString([]);
            } catch (err) {
                methodString = method.toString();
            }
            return methodString.search(search) !== -1;
        };
    }
    /**
   * Generates a {@link module:WebpackModules.Filters~filter} that filters by strings.
   * @param {...String} search - A RegExp to check on the module
   * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of strings
   */ static byString(...strings) {
        return (module)=>{
            let moduleString = "";
            try {
                moduleString = module.toString([]);
            } catch (err) {
                moduleString = module.toString();
            }
            for (const s of strings){
                if (!moduleString.includes(s)) return false;
            }
            return true;
        };
    }
    /**
   * Generates a {@link module:WebpackModules.Filters~filter} that filters by a set of properties.
   * @param {string} name - Name the module should have
   * @param {module:WebpackModules.Filters~filter} filter - Additional filter
   * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of properties
   */ static byDisplayName(name) {
        return (module)=>{
            return module && module.displayName === name;
        };
    }
    /**
   * Generates a combined {@link module:WebpackModules.Filters~filter} from a list of filters.
   * @param {...module:WebpackModules.Filters~filter} filters - A list of filters
   * @returns {module:WebpackModules.Filters~filter} - Combinatory filter of all arguments
   */ static combine(...filters) {
        return (module)=>{
            return filters.every((filter)=>filter(module));
        };
    }
}
class webpackmodules_WebpackModules {
    static find(filter, first = true) {
        return this.getModule(filter, first);
    }
    static findAll(filter) {
        return this.getModule(filter, false);
    }
    static findByUniqueProperties(props, first = true) {
        return first ? this.getByProps(...props) : this.getAllByProps(...props);
    }
    static findByDisplayName(name) {
        return this.getByDisplayName(name);
    }
    /**
   * Finds a module using a filter function.
   * @param {Function} filter A function to use to filter modules
   * @param {Boolean} first Whether to return only the first matching module
   * @return {Any}
   */ static getModule(filter, first = true) {
        const wrappedFilter = (m)=>{
            try {
                return filter(m);
            } catch (err) {
                return false;
            }
        };
        const modules = this.getAllModules();
        const rm = [];
        for(const index in modules){
            if (!modules.hasOwnProperty(index)) continue;
            const module = modules[index];
            const { exports  } = module;
            let foundModule = null;
            if (!exports) continue;
            if (exports.__esModule && exports.default && wrappedFilter(exports.default)) foundModule = exports.default;
            if (wrappedFilter(exports)) foundModule = exports;
            if (!foundModule) continue;
            if (first) return foundModule;
            rm.push(foundModule);
        }
        return first || rm.length == 0 ? undefined : rm;
    }
    /**
   * Gets the index in the webpack require cache of a specific
   * module using a filter.
   * @param {Function} filter A function to use to filter modules
   * @return {Number|null}
   */ static getIndex(filter) {
        const wrappedFilter = (m)=>{
            try {
                return filter(m);
            } catch (err) {
                return false;
            }
        };
        const modules = this.getAllModules();
        for(const index in modules){
            if (!modules.hasOwnProperty(index)) continue;
            const module = modules[index];
            const exports = module.exports;
            let foundModule = null;
            if (!exports) continue;
            if (exports.__esModule && exports.default && wrappedFilter(exports.default)) foundModule = exports.default;
            if (wrappedFilter(exports)) foundModule = exports;
            if (!foundModule) continue;
            return index;
        }
        return null;
    }
    /**
   * Gets the index in the webpack require cache of a specific
   * module that was already found.
   * @param {Any} module An already acquired module
   * @return {Number|null}
   */ static getIndexByModule(module) {
        return this.getIndex((m)=>m == module);
    }
    /**
   * Finds all modules matching a filter function.
   * @param {Function} filter A function to use to filter modules
   */ static getModules(filter) {
        return this.getModule(filter, false);
    }
    /**
   * Finds a module by its name.
   * @param {String} name The name of the module
   * @param {Function} fallback A function to use to filter modules if not finding a known module
   * @return {Any}
   */ static getModuleByName(name, fallback) {
        if (discordmodules.hasOwnProperty(name)) return discordmodules[name];
        if (!fallback) return undefined;
        const module = this.getModule(fallback, true);
        return module ? discordmodules[name] = module : undefined;
    }
    /**
   * Finds a module by its display name.
   * @param {String} name The display name of the module
   * @return {Any}
   */ static getByDisplayName(name) {
        return this.getModule(Filters.byDisplayName(name), true);
    }
    /**
   * Finds a module using its code.
   * @param {RegEx} regex A regular expression to use to filter modules
   * @param {Boolean} first Whether to return the only the first matching module
   * @return {Any}
   */ static getByRegex(regex, first = true) {
        return this.getModule(Filters.byCode(regex), first);
    }
    /**
   * Finds a single module using properties on its prototype.
   * @param {...string} prototypes Properties to use to filter modules
   * @return {Any}
   */ static getByPrototypes(...prototypes) {
        return this.getModule(Filters.byPrototypeFields(prototypes), true);
    }
    /**
   * Finds all modules with a set of properties of its prototype.
   * @param {...string} prototypes Properties to use to filter modules
   * @return {Any}
   */ static getAllByPrototypes(...prototypes) {
        return this.getModule(Filters.byPrototypeFields(prototypes), false);
    }
    /**
   * Finds a single module using its own properties.
   * @param {...string} props Properties to use to filter modules
   * @return {Any}
   */ static getByProps(...props) {
        return this.getModule(Filters.byProperties(props), true);
    }
    /**
   * Finds all modules with a set of properties.
   * @param {...string} props Properties to use to filter modules
   * @return {Any}
   */ static getAllByProps(...props) {
        return this.getModule(Filters.byProperties(props), false);
    }
    /**
   * Finds a single module using a set of strings.
   * @param {...String} props Strings to use to filter modules
   * @return {Any}
   */ static getByString(...strings) {
        return this.getModule(Filters.byString(...strings), true);
    }
    /**
   * Finds all modules with a set of strings.
   * @param {...String} strings Strings to use to filter modules
   * @return {Any}
   */ static getAllByString(...strings) {
        return this.getModule(Filters.byString(...strings), false);
    }
    /**
   * Gets a specific module by index of the webpack require cache.
   * Best used in combination with getIndex in order to patch a
   * specific function.
   *
   * Note: this gives the **raw** module, meaning the actual module
   * is in returnValue.exports. This is done in order to be able
   * to patch modules which export a single function directly.
   * @param {Number} index Index into the webpack require cache
   * @return {Any}
   */ static getByIndex(index) {
        return webpackmodules_WebpackModules.require.c[index].exports;
    }
    /**
   * Discord's __webpack_require__ function.
   */ static get require() {
        if (this._require) return this._require;
        const id = "zl-webpackmodules";
        const __nested_webpack_require_10784__ = window.webpackJsonp.push([
            [],
            {
                [id]: (module, exports, req)=>module.exports = req
            },
            [
                [
                    id
                ]
            ], 
        ]);
        delete __nested_webpack_require_10784__.m[id];
        delete __nested_webpack_require_10784__.c[id];
        return this._require = __nested_webpack_require_10784__;
    }
    /**
   * Returns all loaded modules.
   * @return {Array}
   */ static getAllModules() {
        return this.require.c;
    }
    // Webpack Chunk Observing
    static get chunkName() {
        return "webpackChunkdiscord_app";
    }
    static initialize() {
        this.handlePush = this.handlePush.bind(this);
        this.listeners = new Set();
        this.__ORIGINAL_PUSH__ = window[this.chunkName].push;
        Object.defineProperty(window[this.chunkName], "push", {
            configurable: true,
            get: ()=>this.handlePush,
            set: (newPush)=>{
                this.__ORIGINAL_PUSH__ = newPush;
                Object.defineProperty(window[this.chunkName], "push", {
                    value: this.handlePush,
                    configurable: true,
                    writable: true
                });
            }
        });
    }
    /**
   * Adds a listener for when discord loaded a chunk. Useful for subscribing to lazy loaded modules.
   * @param {Function} listener - Function to subscribe for chunks
   * @returns {Function} A cancelling function
   */ static addListener(listener) {
        this.listeners.add(listener);
        return this.removeListener.bind(this, listener);
    }
    /**
   * Removes a listener for when discord loaded a chunk.
   * @param {Function} listener
   * @returns {boolean}
   */ static removeListener(listener) {
        return this.listeners.delete(listener);
    }
    static handlePush(chunk) {
        const [, modules] = chunk;
        for(const moduleId in modules){
            const originalModule = modules[moduleId];
            modules[moduleId] = (module, exports, require)=>{
                try {
                    Reflect.apply(originalModule, null, [
                        module,
                        exports,
                        require
                    ]);
                    const listeners = [
                        ...this.listeners
                    ];
                    for(let i = 0; i < listeners.length; i++){
                        try {
                            listeners[i](exports, originalModule, moduleId);
                        } catch (error) {
                            logger_Logger.err("WebpackModules", "Could not fire callback listener:", error);
                        }
                    }
                } catch (error) {
                    logger_Logger.stacktrace("WebpackModules", "Error patching chunked module push", error);
                }
            };
            Object.assign(modules[moduleId], originalModule, {
                toString: ()=>originalModule.toString()
            });
        }
        return Reflect.apply(this.__ORIGINAL_PUSH__, window[this.chunkName], [
            chunk, 
        ]);
    }
};
webpackmodules_WebpackModules.initialize();

;// CONCATENATED MODULE: ../../packages/bdlib/src/modules/colorconverter.ts
//@ts-nocheck
/**
 * Helpful utilities for dealing with colors.
 * @module ColorConverter
 */ 
const DiscordColorUtils = webpackmodules_WebpackModules.getByProps("getDarkness", "isValidHex");
class ColorConverter {
    static getDarkness(color) {
        return DiscordColorUtils.getDarkness(color);
    }
    static hex2int(color) {
        return DiscordColorUtils.hex2int(color);
    }
    static hex2rgb(color) {
        return DiscordColorUtils.hex2rgb(color);
    }
    static int2hex(color) {
        return DiscordColorUtils.int2hex(color);
    }
    static int2rgba(color, alpha) {
        return DiscordColorUtils.int2rgba(color, alpha);
    }
    static isValidHex(color) {
        return DiscordColorUtils.isValidHex(color);
    }
    /**
   * Will get the red green and blue values of any color string.
   * @param {string} color - the color to obtain the red, green and blue values of. Can be in any of these formats: #fff, #ffffff, rgb, rgba
   * @returns {array} - array containing the red, green, and blue values
   */ static getRGB(color) {
        let result = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(color);
        if (result) return [
            parseInt(result[1]),
            parseInt(result[2]),
            parseInt(result[3])
        ];
        result = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)%\s*,\s*([0-9]+(?:\.[0-9]+)?)%\s*,\s*([0-9]+(?:\.[0-9]+)?)%\s*\)/.exec(color);
        if (result) return [
            parseFloat(result[1]) * 2.55,
            parseFloat(result[2]) * 2.55,
            parseFloat(result[3]) * 2.55, 
        ];
        result = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(color);
        if (result) return [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16), 
        ];
        result = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(color);
        if (result) return [
            parseInt(result[1] + result[1], 16),
            parseInt(result[2] + result[2], 16),
            parseInt(result[3] + result[3], 16), 
        ];
    }
    /**
   * Will get the darken the color by a certain percent
   * @param {string} color - Can be in any of these formats: #fff, #ffffff, rgb, rgba
   * @param {number} percent - percent to darken the color by (0-100)
   * @returns {string} - new color in rgb format
   */ static darkenColor(color, percent) {
        const rgb = this.getRGB(color);
        for(let i = 0; i < rgb.length; i++)rgb[i] = Math.round(Math.max(0, rgb[i] - rgb[i] * (percent / 100)));
        return "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
    }
    /**
   * Will get the lighten the color by a certain percent
   * @param {string} color - Can be in any of these formats: #fff, #ffffff, rgb, rgba
   * @param {number} percent - percent to lighten the color by (0-100)
   * @returns {string} - new color in rgb format
   */ static lightenColor(color, percent) {
        const rgb = this.getRGB(color);
        for(let i = 0; i < rgb.length; i++)rgb[i] = Math.round(Math.min(255, rgb[i] + rgb[i] * (percent / 100)));
        return "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
    }
    /**
   * Converts a color to rgba format string
   * @param {string} color - Can be in any of these formats: #fff, #ffffff, rgb, rgba
   * @param {number} alpha - alpha level for the new color
   * @returns {string} - new color in rgb format
   */ static rgbToAlpha(color, alpha) {
        const rgb = this.getRGB(color);
        return "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + alpha + ")";
    }
};

;// CONCATENATED MODULE: ../../packages/bdlib/src/structs/dom/selector.ts
//@ts-nocheck
/** 
 * Representation of a Selector
 * @memberof module:DOMTools
 **/ class Selector {
    /**
     * 
     * @param {string} classname - class to create selector for
     */ constructor(className){
        this.value = " ." + className.split(" ").join(".");
    }
    /**
     * Returns the raw selector, this is how native function get the value.
     * @returns {string} raw selector.
     */ toString() {
        return this.value;
    }
    /**
     * Returns the raw selector, this is how native function get the value.
     * @returns {string} raw selector.
     */ valueOf() {
        return this.value;
    }
    selector(symbol, other) {
        this.value = `${this.toString()} ${symbol} ${other.toString()}`;
        return this;
    }
    /**
     * Adds another selector as a direct child `>` to this one.
     * @param {string|DOMTools.Selector} other - Selector to add as child
     * @returns {DOMTools.Selector} returns self to allow chaining
     */ child(other) {
        return this.selector(">", other);
    }
    /**
     * Adds another selector as a adjacent sibling `+` to this one.
     * @param {string|DOMTools.Selector} other - Selector to add as adjacent sibling
     * @returns {DOMTools.Selector} returns self to allow chaining
     */ adjacent(other) {
        return this.selector("+", other);
    }
    /**
     * Adds another selector as a general sibling `~` to this one.
     * @param {string|DOMTools.Selector} other - Selector to add as sibling
     * @returns {DOMTools.Selector} returns self to allow chaining
     */ sibling(other) {
        return this.selector("~", other);
    }
    /**
     * Adds another selector as a descendent `(space)` to this one.
     * @param {string|DOMTools.Selector} other - Selector to add as descendent
     * @returns {DOMTools.Selector} returns self to allow chaining
     */ descend(other) {
        return this.selector(" ", other);
    }
    /**
     * Adds another selector to this one via `,`.
     * @param {string|DOMTools.Selector} other - Selector to add
     * @returns {DOMTools.Selector} returns self to allow chaining
     */ and(other) {
        return this.selector(",", other);
    }
}
/* harmony default export */ const selector = (Selector);

;// CONCATENATED MODULE: ../../packages/bdlib/src/structs/dom/classname.ts
//@ts-nocheck

/** 
 * Representation of a Class Name
 * @memberof module:DOMTools
 **/ class ClassName {
    /**
     * 
     * @param {string} name - name of the class to represent
     */ constructor(name){
        this.value = name;
    }
    /**
     * Concatenates new class names to the current one using spaces.
     * @param {string} classNames - list of class names to add to this class name
     * @returns {ClassName} returns self to allow chaining
     */ add(...classNames) {
        for(let i = 0; i < classNames.length; i++)this.value += " " + classNames[i];
        return this;
    }
    /**
     * Returns the raw class name, this is how native function get the value.
     * @returns {string} raw class name.
     */ toString() {
        return this.value;
    }
    /**
     * Returns the raw class name, this is how native function get the value.
     * @returns {string} raw class name.
     */ valueOf() {
        return this.value;
    }
    /**
     * Returns the classname represented as {@link module:DOMTools.Selector}.
     * @returns {Selector} selector representation of this class name.
     */ get selector() {
        return new selector(this.value);
    }
    get single() {
        return this.value.split(" ")[0];
    }
    get first() {
        return this.value.split(" ")[0];
    }
}
/* harmony default export */ const classname = (ClassName);

;// CONCATENATED MODULE: ../../packages/bdlib/src/structs/dom/observer.ts
//@ts-nocheck
/**
 * BetterDiscord Client DOM Module
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ 
/* eslint-disable operator-linebreak */ /**
 * Representation of a MutationObserver but with helpful utilities.
 * @memberof module:DOMTools
 **/ class DOMObserver {
    constructor(root, options){
        this.observe = this.observe.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.observerCallback = this.observerCallback.bind(this);
        this.active = false;
        this.root = root || document.getElementById("app-mount");
        this.options = options || {
            attributes: true,
            childList: true,
            subtree: true
        };
        this.observer = new MutationObserver(this.observerCallback);
        this.observe();
    }
    observerCallback(mutations) {
        for (const sub of Array.from(this.subscriptions)){
            try {
                const filteredMutations = sub.filter ? mutations.filter(sub.filter) : mutations;
                if (sub.group) {
                    if (!filteredMutations.length) continue;
                    sub.callback.call(sub.bind || sub, filteredMutations);
                } else {
                    for (const mutation of filteredMutations)sub.callback.call(sub.bind || sub, mutation);
                }
            } catch (err) {
                logger_Logger.stacktrace("DOMObserver", "Error in observer callback", err);
            }
        }
    }
    /**
   * Starts observing the element. This will be called when attaching a callback.
   * You don't need to call this manually.
   */ observe() {
        if (this.active) return;
        this.observer.observe(this.root, this.options);
        this.active = true;
    }
    /**
   * Disconnects this observer. This stops callbacks being called, but does not unbind them.
   * You probably want to use observer.unsubscribeAll instead.
   */ disconnect() {
        if (!this.active) return;
        this.observer.disconnect();
        this.active = false;
    }
    reconnect() {
        if (this.active) {
            this.disconnect();
            this.observe();
        }
    }
    get root() {
        return this._root;
    }
    set root(root) {
        this._root = root;
        this.reconnect();
    }
    get options() {
        return this._options;
    }
    set options(options) {
        this._options = options;
        this.reconnect();
    }
    get subscriptions() {
        return this._subscriptions || (this._subscriptions = []);
    }
    /**
   * Subscribes to mutations.
   * @param {Function} callback A function to call when on a mutation
   * @param {Function} filter A function to call to filter mutations
   * @param {Any} bind Something to bind the callback to
   * @param {Boolean} group Whether to call the callback with an array of mutations instead of a single mutation
   * @return {Object}
   */ subscribe(callback, filter, bind, group) {
        const subscription = {
            callback,
            filter,
            bind,
            group
        };
        this.subscriptions.push(subscription);
        this.observe();
        return subscription;
    }
    /**
   * Removes a subscription and disconnect if there are none left.
   * @param {Object} subscription A subscription object returned by observer.subscribe
   */ unsubscribe(subscription) {
        if (!this.subscriptions.includes(subscription)) subscription = this.subscriptions.find((s)=>s.callback === subscription);
        utilities_Utilities.removeFromArray(this.subscriptions, subscription);
        if (!this.subscriptions.length) this.disconnect();
    }
    unsubscribeAll() {
        this.subscriptions.splice(0, this.subscriptions.length);
        this.disconnect();
    }
    /**
   * Subscribes to mutations that affect an element matching a selector.
   * @param {Function} callback A function to call when on a mutation
   * @param {Function} filter A function to call to filter mutations
   * @param {Any} bind Something to bind the callback to
   * @param {Boolean} group Whether to call the callback with an array of mutations instead of a single mutation
   * @return {Object}
   */ subscribeToQuerySelector(callback, selector, bind, group) {
        return this.subscribe(callback, (mutation)=>{
            return mutation.target.matches(selector) || Array.from(mutation.addedNodes).concat(Array.from(mutation.removedNodes)) // Or if either an added or removed node
            .find((n)=>n instanceof Element && (n.matches(selector) || n.querySelector(selector))); // match or contain an element matching the selector
        }, bind, group);
    }
}
/* harmony default export */ const observer = (DOMObserver);

;// CONCATENATED MODULE: ../../packages/bdlib/src/modules/discordclassmodules.ts
//@ts-nocheck


/**
 * A large list of known and labelled classes in discord.
 * Click the source link down below to view more info. Otherwise, if you
 * have the library installed or have a plugin using this library,
 * do `Object.keys(ZLibrary.DiscordClassModules)` in console for a list of modules.
 *
 * You can use this directly, however the preferred way of doing this is to use {@link module:DiscordClasses} or {@link module:DiscordSelectors}
 *
 * @see module:DiscordClasses
 * @see module:DiscordSelectors
 * @module DiscordClassModules
 */ /* harmony default export */ const discordclassmodules = (utilities_Utilities.memoizeObject({
    get ContextMenu () {
        return webpackmodules_WebpackModules.getByProps("menu", "item");
    },
    get Scrollers () {
        return webpackmodules_WebpackModules.getByProps("scrollerWrap", "scrollerThemed", "scrollerTrack");
    },
    get AccountDetails () {
        return webpackmodules_WebpackModules.getByProps("container", "avatar", "hasBuildOverride");
    },
    get Typing () {
        return webpackmodules_WebpackModules.getByProps("typing", "text");
    },
    get UserPopout () {
        return webpackmodules_WebpackModules.getByProps("userPopout");
    },
    get PopoutRoles () {
        return webpackmodules_WebpackModules.getByProps("roleCircle");
    },
    get UserModal () {
        return webpackmodules_WebpackModules.getByProps("profileBadge");
    },
    get Textarea () {
        return webpackmodules_WebpackModules.getByProps("channelTextArea", "textArea");
    },
    get Popouts () {
        return webpackmodules_WebpackModules.getByProps("popouts", "popout");
    },
    get App () {
        return webpackmodules_WebpackModules.getByProps("app", "mobileApp");
    },
    get Titles () {
        return webpackmodules_WebpackModules.getByProps("defaultMarginh5");
    },
    get Notices () {
        return webpackmodules_WebpackModules.getByProps("notice", "colorInfo");
    },
    get Backdrop () {
        return webpackmodules_WebpackModules.getByProps("backdrop");
    },
    get Modals () {
        return webpackmodules_WebpackModules.getModule((m)=>m.modal && m.inner && !m.header);
    },
    get AuditLog () {
        return webpackmodules_WebpackModules.getByProps("userHook");
    },
    get ChannelList () {
        return Object.assign({}, webpackmodules_WebpackModules.getByProps("containerDefault"), webpackmodules_WebpackModules.getByProps("name", "unread"), webpackmodules_WebpackModules.getByProps("sidebar", "hasNotice"));
    },
    get MemberList () {
        return Object.assign({}, webpackmodules_WebpackModules.getByProps("member", "memberInner"), webpackmodules_WebpackModules.getByProps("members", "membersWrap"));
    },
    get TitleWrap () {
        return webpackmodules_WebpackModules.getByProps("titleWrapper");
    },
    get Titlebar () {
        return webpackmodules_WebpackModules.getByProps("titleBar");
    },
    get Embeds () {
        return webpackmodules_WebpackModules.getByProps("embed", "embedAuthor");
    },
    get Layers () {
        return webpackmodules_WebpackModules.getByProps("layers", "layer");
    },
    get TooltipLayers () {
        return webpackmodules_WebpackModules.getByProps("layerContainer", "layer");
    },
    get Margins () {
        return webpackmodules_WebpackModules.getModule((m)=>!m.title && m.marginBottom40 && m.marginTop40);
    },
    get Dividers () {
        return Object.assign({}, webpackmodules_WebpackModules.getByProps("dividerDefault"), webpackmodules_WebpackModules.getModule((m)=>Object.keys(m).length == 1 && m.divider));
    },
    get Changelog () {
        return Object.assign({}, webpackmodules_WebpackModules.getByProps("container", "added"), webpackmodules_WebpackModules.getByProps("content", "modal", "size"));
    },
    get BasicInputs () {
        return webpackmodules_WebpackModules.getByProps("inputDefault", "copyInput");
    },
    get Messages () {
        return webpackmodules_WebpackModules.getByProps("message", "containerCozy");
    },
    get Guilds () {
        return webpackmodules_WebpackModules.getByProps("guildsWrapper");
    },
    get EmojiPicker () {
        return webpackmodules_WebpackModules.getByProps("emojiPicker", "emojiItem");
    },
    get Reactions () {
        return webpackmodules_WebpackModules.getByProps("reaction", "reactionInner");
    },
    get Checkbox () {
        return webpackmodules_WebpackModules.getByProps("checkbox", "checkboxInner");
    },
    get Tooltips () {
        return webpackmodules_WebpackModules.getByProps("tooltip", "tooltipBlack");
    }
}));

;// CONCATENATED MODULE: ../../packages/bdlib/src/modules/discordclasses.ts
//@ts-nocheck


const getRaw = function(prop) {
    if (!this.hasOwnProperty(prop)) return "";
    return this[prop];
};
const getClass = function(prop) {
    if (!this.hasOwnProperty(prop)) return "";
    return this[prop].split(" ")[0];
};
/**
 * Proxy for all the class packages, allows us to safely attempt
 * to retrieve nested things without error. Also wraps the class in
 * {@link module:DOMTools.ClassName} which adds features but can still
 * be used in native function.
 *
 * For a list of all available class namespaces check out {@link module:DiscordClassModules}.
 *
 * @see module:DiscordClassModules
 * @module DiscordClasses
 */ const discordclasses_DiscordModules = new Proxy(discordclassmodules, {
    get: function(list, item) {
        if (item == "getRaw" || item == "getClass") return (module, prop)=>discordclasses_DiscordModules[module][item]([
                prop
            ]);
        if (list[item] === undefined) return new Proxy({}, {
            get: function() {
                return "";
            }
        });
        return new Proxy(list[item], {
            get: function(obj, prop) {
                if (prop == "getRaw") return getRaw.bind(obj);
                if (prop == "getClass") return getClass.bind(obj);
                if (!obj.hasOwnProperty(prop)) return "";
                return new domtools_DOMTools.ClassName(obj[prop]);
            }
        });
    }
});
/* harmony default export */ const discordclasses = (discordclasses_DiscordModules);

;// CONCATENATED MODULE: ../../packages/bdlib/src/styles/settings.css
const settings_namespaceObject = ".plugin-input-group {\n    margin-top: 5px;\n}\n\n.plugin-input-group .button-collapse {\n    background: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxOS4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FscXVlXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSItOTUwIDUzMiAxOCAxOCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAtOTUwIDUzMiAxOCAxODsiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4NCgkuc3Qwe2ZpbGw6bm9uZTt9DQoJLnN0MXtmaWxsOm5vbmU7c3Ryb2tlOiNGRkZGRkY7c3Ryb2tlLXdpZHRoOjEuNTtzdHJva2UtbWl0ZXJsaW1pdDoxMDt9DQo8L3N0eWxlPg0KPHBhdGggY2xhc3M9InN0MCIgZD0iTS05MzIsNTMydjE4aC0xOHYtMThILTkzMnoiLz4NCjxwb2x5bGluZSBjbGFzcz0ic3QxIiBwb2ludHM9Ii05MzYuNiw1MzguOCAtOTQxLDU0My4yIC05NDUuNCw1MzguOCAiLz4NCjwvc3ZnPg0K);\n    height: 16px;\n    width: 16px;\n    display: inline-block;\n    vertical-align: bottom;\n    transition: transform .3s ease;\n    transform: rotate(0);\n}\n\n.plugin-input-group .button-collapse.collapsed {\n    transition: transform .3s ease;\n    transform: rotate(-90deg);\n}\n\n.plugin-input-group h2 {\n    font-size: 14px;\n}\n\n.plugin-input-group .plugin-input-group h2 {\n    margin-left: 16px;\n}\n\n.plugin-inputs {\n    height: auto;\n    overflow: hidden;\n    transition: height 300ms cubic-bezier(0.47, 0, 0.745, 0.715);\n}\n\n.plugin-inputs.collapsed {\n    height: 0px;\n}\n\n.file-input {\n\n}\n\n.file-input::-webkit-file-upload-button {\n    color: white;\n    background: #7289DA;\n    outline: 0;\n    border: 0;\n    padding: 10px;\n    vertical-align: top;\n    margin-top: -10px;\n    margin-left: -10px;\n    border-radius: 3px 0 0 3px;\n    font-size: 14px;\n    font-weight: 500;\n    font-family: Whitney,Helvetica Neue,Helvetica,Arial,sans-serif;\n    cursor: pointer;\n}\n\n.color-input {\n    background: none;\n    padding: 0;\n    border: none;\n}\n\n.color-input:hover {\n    opacity: 0.8;\n}\n";
;// CONCATENATED MODULE: ../../packages/bdlib/src/structs/listenable.ts
//@ts-nocheck
/**
 * Acts as an interface for anything that should be listenable.
 */ class Listenable {
    constructor(){
        this.listeners = [];
    }
    /**
   * Adds a listener to the current object.
   * @param {callable} callback - callback for when the event occurs
   * @returns {callable} - a way to cancel the listener without needing to call `removeListener`
   */ addListener(callback) {
        if (typeof callback !== "function") return;
        this.listeners.push(callback);
        return ()=>{
            this.listeners.splice(this.listeners.indexOf(callback), 1);
        };
    }
    /**
   * Removes a listener from the current object.
   * @param {callable} callback - callback that was originally registered
   */ removeListener(callback) {
        if (typeof callback !== "function") return;
        this.listeners.splice(this.listeners.indexOf(callback), 1);
    }
    /**
   * Alerts the listeners that an event occurred. Data passed is optional
   * @param {*} [...data] - Any data desired to be passed to listeners
   */ alertListeners(...data) {
        for(let l = 0; l < this.listeners.length; l++)this.listeners[l](...data);
    }
}
/* harmony default export */ const listenable = (Listenable);

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/settings/settingfield.ts
//@ts-nocheck


const AccessibilityProvider = webpackmodules_WebpackModules.getByProps("AccessibilityPreferencesContext").AccessibilityPreferencesContext.Provider;
const LayerProvider = webpackmodules_WebpackModules.getByProps("AppReferencePositionLayer").AppLayerProvider().props.layerContext.Provider; // eslint-disable-line new-cap
/**
 * Setting field to extend to create new settings
 * @memberof module:Settings
 */ class SettingField extends listenable {
    /**
   * @param {string} name - name label of the setting
   * @param {string} note - help/note to show underneath or above the setting
   * @param {callable} onChange - callback to perform on setting change
   * @param {(ReactComponent|HTMLElement)} settingtype - actual setting to render
   * @param {object} [props] - object of props to give to the setting and the settingtype
   * @param {boolean} [props.noteOnTop=false] - determines if the note should be shown above the element or not.
   */ constructor(name, note, onChange, settingtype, props = {}){
        super();
        this.name = name;
        this.note = note;
        if (typeof onChange == "function") this.addListener(onChange);
        this.inputWrapper = domtools_DOMTools.parseHTML(`<div class="plugin-input-container"></div>`);
        this.type = typeof settingtype == "function" ? settingtype : reacttools_ReactTools.wrapElement(settingtype);
        this.props = props;
        domtools_DOMTools.onAdded(this.getElement(), ()=>{
            this.onAdded();
        });
        domtools_DOMTools.onRemoved(this.getElement(), ()=>{
            this.onRemoved();
        });
    }
    /** @returns {HTMLElement} - root element for setting */ getElement() {
        return this.inputWrapper;
    }
    /** Fires onchange to listeners */ onChange() {
        this.alertListeners(...arguments);
    }
    /** Fired when root node added to DOM */ onAdded() {
        const reactElement = discordmodules.ReactDOM.render(discordmodules.React.createElement(ReactSetting, Object.assign({
            title: this.name,
            type: this.type,
            note: this.note
        }, this.props)), this.getElement());
        if (this.props.onChange) reactElement.props.onChange = this.props.onChange(reactElement);
        reactElement.forceUpdate();
    }
    /** Fired when root node removed from DOM */ onRemoved() {
        discordmodules.ReactDOM.unmountComponentAtNode(this.getElement());
    }
}
/* harmony default export */ const settingfield = (SettingField);
class ReactSetting extends discordmodules.React.Component {
    get noteElement() {
        const className = this.props.noteOnTop ? discordclasses.Margins.marginBottom8 : discordclasses.Margins.marginTop8;
        return discordmodules.React.createElement(discordmodules.SettingsNote, {
            children: this.props.note,
            type: "description",
            className: className.toString()
        });
    }
    get dividerElement() {
        return discordmodules.React.createElement("div", {
            className: discordclasses.Dividers.divider.add(discordclasses.Dividers.dividerDefault).toString()
        });
    }
    render() {
        const ce = discordmodules.React.createElement;
        const SettingElement = ce(this.props.type, this.props);
        const Context = ce(AccessibilityProvider, {
            value: {
                reducedMotion: {
                    enabled: false,
                    rawValue: "no-preference"
                }
            }
        }, ce(LayerProvider, {
            value: [
                document.querySelector("#app-mount > .layerContainer-2v_Sit"), 
            ]
        }, SettingElement));
        if (this.props.inline) {
            const Flex = discordmodules.FlexChild;
            const titleDefault = webpackmodules_WebpackModules.getByProps("titleDefault") ? webpackmodules_WebpackModules.getByProps("titleDefault").title : "titleDefault-a8-ZSr title-31JmR4 da-titleDefault da-title";
            return ce(Flex, {
                direction: Flex.Direction.VERTICAL
            }, ce(Flex, {
                align: Flex.Align.START
            }, ce(Flex.Child, {
                wrap: !0
            }, ce("div", {
                className: titleDefault
            }, this.props.title)), ce(Flex.Child, {
                grow: 0,
                shrink: 0
            }, Context)), this.noteElement, this.dividerElement);
        }
        return ce(discordmodules.SettingsWrapper, {
            className: discordclasses.Margins.marginBottom20.toString(),
            title: this.props.title,
            children: [
                this.props.noteOnTop ? this.noteElement : Context,
                this.props.noteOnTop ? Context : this.noteElement,
                this.dividerElement, 
            ]
        });
    }
}


;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/settings/settinggroup.ts
//@ts-nocheck



/**
 * Grouping of controls for easier management in settings panels.
 * @memberof module:Settings
 */ class SettingGroup extends listenable {
    /**
   * @param {string} groupName - title for the group of settings
   * @param {object} [options] - additional options for the group
   * @param {callback} [options.callback] - callback called on settings changed
   * @param {boolean} [options.collapsible=true] - determines if the group should be collapsible
   * @param {boolean} [options.shown=false] - determines if the group should be expanded by default
   */ constructor(groupName, options = {}){
        super();
        const { collapsible =true , shown =false , callback =()=>{}  } = options;
        this.addListener(callback);
        this.onChange = this.onChange.bind(this);
        const collapsed = shown || !collapsible ? "" : "collapsed";
        const group = domtools_DOMTools.parseHTML(`<div class="plugin-input-group">
                                            <h2 class="${discordclasses.Titles.h5} ${discordclasses.Titles.defaultMarginh5} ${discordclasses.Titles.defaultColor}">
                                            <span class="button-collapse ${collapsed}"></span> ${groupName}
                                            </h2>
                                            <div class="plugin-inputs collapsible ${collapsed}"></div>
                                            </div>`);
        const label = group.querySelector("h2");
        const controls = group.querySelector(".plugin-inputs");
        this.group = group;
        this.label = label;
        this.controls = controls;
        if (!collapsible) return;
        label.addEventListener("click", async ()=>{
            const button = label.querySelector(".button-collapse");
            const wasCollapsed = button.classList.contains("collapsed");
            group.parentElement.querySelectorAll(":scope > .plugin-input-group > .collapsible:not(.collapsed)").forEach((element)=>{
                element.style.setProperty("height", element.scrollHeight + "px");
                element.classList.add("collapsed");
                setImmediate(()=>{
                    element.style.setProperty("height", "");
                });
            });
            group.parentElement.querySelectorAll(":scope > .plugin-input-group > h2 > .button-collapse").forEach((e)=>e.classList.add("collapsed"));
            if (!wasCollapsed) return;
            controls.style.setProperty("height", controls.scrollHeight + "px");
            controls.classList.remove("collapsed");
            button.classList.remove("collapsed");
            await new Promise((resolve)=>setTimeout(resolve, 300));
            controls.style.setProperty("height", "");
        });
    }
    /** @returns {HTMLElement} - root node for the group. */ getElement() {
        return this.group;
    }
    /**
   * Adds multiple nodes to this group.
   * @param {(...HTMLElement|...jQuery|...module:Settings.SettingField|...module:Settings.SettingGroup)} nodes - list of nodes to add to the group container
   * @returns {module:Settings.SettingGroup} - returns self for chaining
   */ append(...nodes) {
        for(let i = 0; i < nodes.length; i++){
            if (domtools_DOMTools.resolveElement(nodes[i]) instanceof Element) this.controls.append(nodes[i]);
            else if (nodes[i] instanceof settingfield || nodes[i] instanceof SettingGroup) this.controls.append(nodes[i].getElement());
            if (nodes[i] instanceof settingfield) {
                nodes[i].addListener(((node)=>(value)=>{
                        this.onChange(node.id || node.name, value);
                    })(nodes[i]));
            } else if (nodes[i] instanceof SettingGroup) {
                nodes[i].addListener(((node)=>(settingId, value)=>{
                        this.onChange(node.id || node.name, settingId, value);
                    })(nodes[i]));
            }
        }
        return this;
    }
    /**
   * Appends this node to another
   * @param {HTMLElement} node - node to attach the group to.
   * @returns {module:Settings.SettingGroup} - returns self for chaining
   */ appendTo(node) {
        node.append(this.group);
        return this;
    }
    /** Fires onchange to listeners */ onChange() {
        this.alertListeners(...arguments);
    }
}
/* harmony default export */ const settinggroup = (SettingGroup);

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/settings/settingpanel.ts
//@ts-nocheck




/**
 * Grouping of controls for easier management in settings panels.
 * @memberof module:Settings
 */ class SettingPanel extends listenable {
    /**
   * Creates a new settings panel
   * @param {callable} onChange - callback to fire when settings change
   * @param {(...HTMLElement|...jQuery|...module:Settings.SettingField|...module:Settings.SettingGroup)} nodes  - list of nodes to add to the panel container
   */ constructor(onChange, ...nodes){
        super();
        this.element = domtools_DOMTools.parseHTML(`<div class="plugin-form-container"></div>`);
        if (typeof onChange == "function") this.addListener(onChange);
        this.onChange = this.onChange.bind(this);
        this.append(...nodes);
    }
    /**
   * Creates a new settings panel
   * @param {callable} onChange - callback to fire when settings change
   * @param {(...HTMLElement|...jQuery|...module:Settings.SettingField|...module:Settings.SettingGroup)} nodes  - list of nodes to add to the panel container
   * @returns {HTMLElement} - root node for the panel.
   */ static build(onChange, ...nodes) {
        return new SettingPanel(onChange, ...nodes).getElement();
    }
    /** @returns {HTMLElement} - root node for the panel. */ getElement() {
        return this.element;
    }
    /**
   * Adds multiple nodes to this panel.
   * @param {(...HTMLElement|...jQuery|...SettingField|...SettingGroup)} nodes - list of nodes to add to the panel container
   * @returns {module:Settings.SettingPanel} - returns self for chaining
   */ append(...nodes) {
        for(let i = 0; i < nodes.length; i++){
            if (domtools_DOMTools.resolveElement(nodes[i]) instanceof Element) this.element.append(nodes[i]);
            else if (nodes[i] instanceof settingfield || nodes[i] instanceof settinggroup) this.element.append(nodes[i].getElement());
            if (nodes[i] instanceof settingfield) {
                nodes[i].addListener(((node)=>(value)=>{
                        this.onChange(node.id || node.name, value);
                    })(nodes[i]));
            } else if (nodes[i] instanceof settinggroup) {
                nodes[i].addListener(((node)=>(settingId, value)=>{
                        this.onChange(node.id || node.name, settingId, value);
                    })(nodes[i]));
            }
        }
        return this;
    }
    /** Fires onchange to listeners */ onChange() {
        this.alertListeners(...arguments);
    }
}
/* harmony default export */ const settingpanel = (SettingPanel);

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/settings/types/textbox.ts
//@ts-nocheck


/**
 * Creates a textbox using discord's built in textbox.
 * @memberof module:Settings
 * @extends module:Settings.SettingField
 */ class Textbox extends settingfield {
    /**
   * @param {string} name - name label of the setting
   * @param {string} note - help/note to show underneath or above the setting
   * @param {string} value - current text in box
   * @param {callable} onChange - callback to perform on setting change, callback receives text
   * @param {object} [options] - object of options to give to the setting
   * @param {string} [options.placeholder=""] - placeholder for when textbox is empty
   * @param {boolean} [options.disabled=false] - should the setting be disabled
   */ constructor(name, note, value, onChange, options = {}){
        const { placeholder ="" , disabled =false  } = options;
        super(name, note, onChange, discordmodules.Textbox, {
            onChange: (textbox)=>(val)=>{
                    textbox.props.value = val;
                    textbox.forceUpdate();
                    this.onChange(val);
                },
            value: value,
            disabled: disabled,
            placeholder: placeholder || ""
        });
    }
}
/* harmony default export */ const textbox = (Textbox);

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/colorpicker.ts
//@ts-nocheck

const React = discordmodules.React;
const Popout = webpackmodules_WebpackModules.getByDisplayName("Popout");
const ColorPickerComponents = webpackmodules_WebpackModules.getByProps("CustomColorPicker");
const Swatch = ColorPickerComponents?.CustomColorButton.prototype.render.call({
    props: {}
}).type;
const { default: Tooltip , TooltipPositions  } = webpackmodules_WebpackModules.getByProps("TooltipContainer");
const LocaleManager = discordmodules.LocaleManager;
class colorpicker_ColorPicker extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            value: props.value || 0
        };
        this.onChange = this.onChange.bind(this);
        this.swatchRef = React.createRef();
    }
    get canCustom() {
        return this.props.acceptsCustom || true;
    }
    onChange(value) {
        this.setState({
            value: value
        }, ()=>{
            if (typeof this.props.onChange === "function") this.props.onChange(this.state.value);
        });
    }
    render() {
        const renderPopout = ()=>{
            return React.createElement(ColorPickerComponents.CustomColorPicker, {
                value: this.state.value,
                onChange: this.onChange
            });
        };
        return React.createElement(ColorPickerComponents.default, {
            value: this.state.value,
            onChange: this.onChange,
            colors: this.props.colors,
            renderDefaultButton: (props)=>React.createElement(Tooltip, {
                    position: TooltipPositions.BOTTOM,
                    text: LocaleManager.Messages.DEFAULT
                }, (tooltipProps)=>React.createElement("div", Object.assign(tooltipProps, {
                        className: "defaultButtonWrapper"
                    }), React.createElement(ColorPickerComponents.DefaultColorButton, Object.assign(props, {
                        color: this.props.defaultColor
                    })))),
            renderCustomButton: ()=>React.createElement(Popout, {
                    renderPopout: renderPopout,
                    animation: Popout.Animation.TRANSLATE,
                    align: Popout.Align.CENTER,
                    position: Popout.Positions.BOTTOM
                }, (props)=>React.createElement(Tooltip, {
                        position: TooltipPositions.BOTTOM,
                        text: LocaleManager.Messages.PICK_A_COLOR
                    }, (tooltipProps)=>React.createElement("div", Object.assign({}, tooltipProps, props, {
                            className: "colorPickerButtonWrapper"
                        }), React.createElement(Swatch, {
                            isCustom: true,
                            color: this.state.value,
                            isSelected: !this.props.colors.includes(this.state.value) && this.props.defaultColor !== this.state.value,
                            disabled: !this.canCustom
                        }))))
        });
    }
};

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/settings/types/color.ts
//@ts-nocheck



const presetColors = [
    1752220,
    3066993,
    3447003,
    10181046,
    15277667,
    15844367,
    15105570,
    15158332,
    9807270,
    6323595,
    1146986,
    2067276,
    2123412,
    7419530,
    11342935,
    12745742,
    11027200,
    10038562,
    9936031,
    5533306, 
];
/**
 * Creates a color picker using Discord's built in color picker
 * as a base. Input and output using hex strings.
 * @memberof module:Settings
 * @extends module:Settings.SettingField
 */ class ColorPicker extends settingfield {
    /**
   * @param {string} name - name label of the setting
   * @param {string} note - help/note to show underneath or above the setting
   * @param {string} value - current hex color
   * @param {callable} onChange - callback to perform on setting change, callback receives hex string
   * @param {object} [options] - object of options to give to the setting
   * @param {boolean} [options.disabled=false] - should the setting be disabled
   * @param {string} [options.defaultColor] - default color to show as large option
   * @param {Array<number>} [options.colors] - preset colors to show in swatch
   */ constructor(name, note, value, onChange, options = {}){
        const ColorPickerComponents = webpackmodules_WebpackModules.getByProps("CustomColorPicker");
        if (ColorPickerComponents) {
            const defaultColor = options.defaultColor;
            super(name, note, onChange, colorpicker_ColorPicker, {
                disabled: !!options.disabled,
                onChange: (reactElement)=>(color)=>{
                        reactElement.props.value = color;
                        reactElement.forceUpdate();
                        this.onChange(ColorConverter.int2hex(color));
                    },
                colors: Array.isArray(options.colors) ? options.colors : presetColors,
                defaultColor: defaultColor && typeof defaultColor !== "number" ? ColorConverter.hex2int(defaultColor) : defaultColor,
                value: typeof value == "number" ? value : ColorConverter.hex2int(value),
                customPickerPosition: "right"
            });
        } else {
            const classes = [
                "color-input"
            ];
            if (options.disabled) classes.push(discordclasses.BasicInputs.disabled);
            const ReactColorPicker = domtools_DOMTools.parseHTML(`<input type="color" class="${classes.join(" ")}">`);
            if (options.disabled) ReactColorPicker.setAttribute("disabled", "");
            if (value) ReactColorPicker.setAttribute("value", value);
            ReactColorPicker.addEventListener("change", (event)=>{
                this.onChange(event.target.value);
            });
            super(name, note, onChange, ReactColorPicker, {
                inline: true
            });
        }
    }
    /** Default colors for ColorPicker */ static get presetColors() {
        return presetColors;
    }
}
/* harmony default export */ const color = (ColorPicker);

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/settings/types/file.ts
//@ts-nocheck


/**
 * Creates a file picker using chromium's default.
 * @memberof module:Settings
 * @extends module:Settings.SettingField
 */ class FilePicker extends settingfield {
    /**
   * @param {string} name - name label of the setting
   * @param {string} note - help/note to show underneath or above the setting
   * @param {callable} onChange - callback to perform on setting change, callback receives File object
   * @param {object} [options] - object of options to give to the setting
   * @param {boolean} [options.disabled=false] - should the setting be disabled
   * @param {Array<string>|string} [options.accept] - what file types should be accepted
   * @param {boolean} [options.multiple=false] - should multiple files be accepted
   */ constructor(name, note, onChange, options = {}){
        const classes = discordclasses.BasicInputs.inputDefault.add("file-input");
        if (options.disabled) classes.add(discordclasses.BasicInputs.disabled);
        const ReactFilePicker = domtools_DOMTools.parseHTML(`<input type="file" class="${classes}">`);
        if (options.disabled) ReactFilePicker.setAttribute("disabled", "");
        if (options.multiple) ReactFilePicker.setAttribute("multiple", "");
        if (options.accept) ReactFilePicker.setAttribute("accept", Array.isArray(options.accept) ? options.accept.join(",") : options.accept);
        ReactFilePicker.addEventListener("change", (event)=>{
            this.onChange(event.target.files[0]);
        });
        super(name, note, onChange, ReactFilePicker);
    }
}
/* harmony default export */ const file = (FilePicker);

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/settings/types/slider.ts
//@ts-nocheck


/**
 * Used to render the marker.
 * @param {Number} value - The value to render
 * @returns {string} the text to show in the marker
 * @callback module:Settings~SliderMarkerValue
 */ /**
 * Used to render the grabber tooltip.
 * @param {Number} value - The value to render
 * @returns {string} the text to show in the tooltip
 * @callback module:Settings~SliderRenderValue
 */ /**
 * Creates a slider/range using discord's built in slider.
 * @memberof module:Settings
 * @extends module:Settings.SettingField
 */ class Slider extends settingfield {
    /**
   *
   * @param {string} name - name label of the setting
   * @param {string} note - help/note to show underneath or above the setting
   * @param {number} min - minimum value allowed
   * @param {number} max - maximum value allowed
   * @param {number} value - currently selected value
   * @param {callable} onChange - callback to fire when setting is changed, callback receives number
   * @param {object} [options] - object of options to give to the setting
   * @param {boolean} [options.disabled=false] - should the setting be disabled
   * @param {object} [options.fillStyles] - object of css styles to add to active slider
   * @param {number} [options.defaultValue] - value highlighted as default
   * @param {number} [options.keyboardStep] - step moved when using arrow keys
   * @param {Array<number>} [options.markers] - array of vertical markers to show on the slider
   * @param {boolean} [options.stickToMarkers] - should the slider be forced to use markers
   * @param {boolean} [options.equidistant] - should the markers be scaled to be equidistant
   * @param {module:Settings~SliderMarkerValue} [options.onMarkerRender] - function to call to render the value in the marker
   * @param {module:Settings~SliderMarkerValue} [options.renderMarker] - alias of `onMarkerRender`
   * @param {module:Settings~SliderRenderValue} [options.onValueRender] - function to call to render the value in the tooltip
   * @param {module:Settings~SliderRenderValue} [options.renderValue] - alias of `onValueRender`
   * @param {string} [options.units] - can be used in place of `onValueRender` will use this string and render Math.round(value) + units
   */ constructor(name, note, min, max, value, onChange, options = {}){
        const props = {
            onChange: (_)=>_,
            initialValue: value,
            disabled: !!options.disabled,
            minValue: min,
            maxValue: max,
            handleSize: 10
        };
        if (options.fillStyles) props.fillStyles = options.fillStyles;
        if (typeof options.defaultValue !== "undefined") props.defaultValue = options.defaultValue;
        if (options.keyboardStep) props.keyboardStep = options.keyboardStep;
        if (options.markers) props.markers = options.markers;
        if (options.stickToMarkers) props.stickToMarkers = options.stickToMarkers;
        if (typeof options.equidistant != "undefined") props.equidistant = options.equidistant;
        if (options.units) {
            const renderValueLabel = (val)=>`${Math.round(val)}${options.units}`;
            props.onMarkerRender = renderValueLabel;
            props.onValueRender = renderValueLabel;
        }
        if (options.onMarkerRender || options.renderMarker) props.onMarkerRender = options.onMarkerRender || options.renderMarker;
        if (options.onValueRender || options.renderValue) props.onValueRender = options.onValueRender || options.renderValue;
        super(name, note, onChange, discordmodules.Slider, Object.assign(props, {
            onValueChange: (v)=>this.onChange(v)
        }));
    }
}
/* harmony default export */ const slider = (Slider);

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/settings/types/switch.ts
//@ts-nocheck


class SwitchWrapper extends discordmodules.React.Component {
    constructor(props){
        super(props);
        this.state = {
            enabled: this.props.value
        };
    }
    render() {
        return discordmodules.React.createElement(discordmodules.SwitchRow, Object.assign({}, this.props, {
            value: this.state.enabled,
            onChange: (e)=>{
                this.props.onChange(e);
                this.setState({
                    enabled: e
                });
            }
        }));
    }
}
/**
 * Creates a switch using discord's built in switch.
 * @memberof module:Settings
 * @extends module:Settings.SettingField
 */ class Switch extends settingfield {
    /**
   * @param {string} name - name label of the setting
   * @param {string} note - help/note to show underneath or above the setting
   * @param {boolean} isChecked - should switch be checked
   * @param {callable} onChange - callback to perform on setting change, callback receives boolean
   * @param {object} [options] - object of options to give to the setting
   * @param {boolean} [options.disabled=false] - should the setting be disabled
   */ constructor(name, note, isChecked, onChange, options = {}){
        super(name, note, onChange);
        this.disabled = !!options.disabled;
        this.value = !!isChecked;
    }
    onAdded() {
        discordmodules.ReactDOM.render(discordmodules.React.createElement(SwitchWrapper, {
            children: this.name,
            note: this.note,
            disabled: this.disabled,
            hideBorder: false,
            value: this.value,
            onChange: (e)=>{
                this.onChange(e);
            }
        }), this.getElement());
    }
}
/* harmony default export */ const types_switch = (Switch);

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/settings/types/dropdown.ts
//@ts-nocheck


/**
 * @interface
 * @name module:Settings~DropdownItem
 * @property {string} label - label to show in the dropdown
 * @property {*} value - actual value represented by label (this is passed via onChange)
 */ /**
 * Creates a dropdown using discord's built in dropdown.
 * @memberof module:Settings
 * @extends module:Settings.SettingField
 */ class Dropdown extends settingfield {
    /**
   * @param {string} name - name label of the setting
   * @param {string} note - help/note to show underneath or above the setting
   * @param {*} defaultValue - currently selected value
   * @param {Array<module:Settings~DropdownItem>} values - array of all options available
   * @param {callable} onChange - callback to perform on setting change, callback item value
   * @param {object} [options] - object of options to give to the setting
   * @param {boolean} [options.clearable=false] - should be able to empty the field value
   * @param {boolean} [options.searchable=false] - should user be able to search the dropdown
   * @param {boolean} [options.disabled=false] - should the setting be disabled
   */ constructor(name, note, defaultValue, values, onChange, options = {}){
        const { clearable =false , searchable =false , disabled =false  } = options;
        super(name, note, onChange, discordmodules.Dropdown, {
            clearable: clearable,
            searchable: searchable,
            disabled: disabled,
            options: values,
            onChange: (dropdown)=>(value)=>{
                    dropdown.props.value = value;
                    dropdown.forceUpdate();
                    this.onChange(value);
                },
            value: defaultValue
        });
    }
}
/* harmony default export */ const dropdown = (Dropdown);

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/settings/types/keybind.ts
//@ts-nocheck


/**
 * Creates a keybind setting using discord's built in keybind recorder.
 * @memberof module:Settings=
 * @extends module:Settings.SettingField
 */ class Keybind extends settingfield {
    /**
   * @param {string} name - name label of the setting
   * @param {string} note - help/note to show underneath or above the setting
   * @param {Array<number>} value - array of keycodes
   * @param {callable} onChange - callback to perform on setting change, callback receives array of keycodes
   * @param {object} [options] - object of options to give to the setting
   * @param {boolean} [options.disabled=false] - should the setting be disabled
   */ constructor(label, help, value, onChange, options = {}){
        const { disabled =false  } = options;
        super(label, help, onChange, discordmodules.Keybind, {
            disabled: disabled,
            defaultValue: value.map((a)=>[
                    0,
                    a || 0,
                    1
                ]),
            onChange: (element)=>(val)=>{
                    if (!Array.isArray(val)) return;
                    element.props.value = val;
                    this.onChange(val.map((a)=>a[1]));
                }
        });
    }
}
/* harmony default export */ const keybind = (Keybind);

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/settings/types/radiogroup.ts
//@ts-nocheck


/**
 * @interface
 * @name module:Settings~RadioItem
 * @property {string} name - label to show in the dropdown
 * @property {*} value - actual value represented by label (this is passed via onChange)
 * @property {string} desc - description/help text to show below name
 * @property {string} color - hex string to color the item
 */ /**
 * Creates a radio group using discord's built in radios.
 * @memberof module:Settings
 * @extends module:Settings.SettingField
 */ class RadioGroup extends settingfield {
    /**
   * @param {string} name - name label of the setting
   * @param {string} note - help/note to show underneath or above the setting
   * @param {*} defaultValue - currently selected value
   * @param {Array<module:Settings~RadioItem>} values - array of all options available
   * @param {callable} onChange - callback to perform on setting change, callback item value
   * @param {object} [options] - object of options to give to the setting
   * @param {boolean} [options.disabled=false] - should the setting be disabled
   */ constructor(name, note, defaultValue, values, onChange, options = {}){
        super(name, note, onChange, discordmodules.RadioGroup, {
            noteOnTop: true,
            disabled: !!options.disabled,
            options: values,
            onChange: (reactElement)=>(option)=>{
                    reactElement.props.value = option.value;
                    reactElement.forceUpdate();
                    this.onChange(option.value);
                },
            value: defaultValue
        });
    }
}
/* harmony default export */ const radiogroup = (RadioGroup);

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/settings/index.ts
/**
 * An object that makes generating settings panel 10x easier.
 * @module Settings
 */ 













;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/icons/error.ts
/**
 * Error Icon
 * @param {number} size - Size of the icon.
 */ /* harmony default export */ function error(size) {
    return `<svg width="${size || 24}" height="${size || 24}" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>`;
};

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/icons/info.ts
/**
 * Info Icon
 * @param {number} size - Size of the icon.
 */ /* harmony default export */ function info(size) {
    return `<svg width="${size || 24}" height="${size || 24}" viewBox="0 0 24 24">
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>`;
};

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/icons/success.ts
/**
 * Success Icon
 * @param {number} size - Size of the icon.
 */ /* harmony default export */ function success(size) {
    return `<svg width="${size || 24}" height="${size || 24}" viewBox="0 0 24 24">
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>`;
};

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/icons/warning.ts
/**
 * Warning Icon
 * @param {number} size - Size of the icon.
 */ /* harmony default export */ function warning(size) {
    return `<svg width="${size || 24}" height="${size || 24}" viewBox="0 0 24 24">
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>`;
};

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/icons.ts





;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/tooltip.ts
//@ts-nocheck
/**
 * Tooltip that automatically show and hide themselves on mouseenter and mouseleave events.
 * Will also remove themselves if the node to watch is removed from DOM through
 * a MutationObserver.
 *
 * Note this is not using Discord's internals but normal DOM manipulation and emulates
 * Discord's own tooltips as closely as possible.
 *
 * @module Tooltip
 */ 
const tooltip_getClass = function(sideOrColor) {
    const upperCase = sideOrColor[0].toUpperCase() + sideOrColor.slice(1);
    const tooltipClass = discordclasses.Tooltips[`tooltip${upperCase}`];
    if (tooltipClass) return tooltipClass.value;
    return null;
};
const classExists = function(sideOrColor) {
    return !!tooltip_getClass(sideOrColor);
};
const toPx = function(value) {
    return `${value}px`;
};
/* <div class="layer-v9HyYc da-layer" style="left: 234.5px; bottom: 51px;">
    <div class="tooltip-2QfLtc da-tooltip tooltipTop-XDDSxx tooltipBlack-PPG47z">
        <div class="tooltipPointer-3ZfirK da-tooltipPointer"></div>
        User Settings
    </div>
</div> */ class tooltip_Tooltip {
    /**
   *
   * @constructor
   * @param {(HTMLElement|jQuery)} node - DOM node to monitor and show the tooltip on
   * @param {string} tip - string to show in the tooltip
   * @param {object} options - additional options for the tooltip
   * @param {string} [options.style=black] - correlates to the discord styling/colors (black, brand, green, grey, red, yellow)
   * @param {string} [options.side=top] - can be any of top, right, bottom, left
   * @param {boolean} [options.preventFlip=false] - prevents moving the tooltip to the opposite side if it is too big or goes offscreen
   * @param {boolean} [options.isTimestamp=false] - adds the timestampTooltip class (disables text wrapping)
   * @param {boolean} [options.disablePointerEvents=false] - disables pointer events
   * @param {boolean} [options.disabled=false] - whether the tooltip should be disabled from showing on hover
   */ constructor(node, text, options = {}){
        const { style ="black" , side ="top" , preventFlip =false , isTimestamp =false , disablePointerEvents =false , disabled =false ,  } = options;
        this.node = domtools_DOMTools.resolveElement(node);
        this.label = text;
        this.style = style.toLowerCase();
        this.side = side.toLowerCase();
        this.preventFlip = preventFlip;
        this.isTimestamp = isTimestamp;
        this.disablePointerEvents = disablePointerEvents;
        this.disabled = disabled;
        this.active = false;
        if (!classExists(this.side)) return logger_Logger.err("Tooltip", `Side ${this.side} does not exist.`);
        if (!classExists(this.style)) return logger_Logger.err("Tooltip", `Style ${this.style} does not exist.`);
        this.element = domtools_DOMTools.createElement(`<div class="${discordclasses.TooltipLayers.layer}">`);
        this.tooltipElement = domtools_DOMTools.createElement(`<div class="${discordclasses.Tooltips.tooltip} ${tooltip_getClass(this.style)}"><div class="${discordclasses.Tooltips.tooltipPointer}"></div><div class="${discordclasses.Tooltips.tooltipContent}">${this.label}</div></div>`);
        this.labelElement = this.tooltipElement.childNodes[1];
        this.element.append(this.tooltipElement);
        if (this.disablePointerEvents) {
            this.element.classList.add(discordclasses.TooltipLayers.disabledPointerEvents);
            this.tooltipElement.classList.add(discordclasses.Tooltips.tooltipDisablePointerEvents);
        }
        if (this.isTimestamp) this.tooltipElement.classList.add(webpackmodules_WebpackModules.getByProps("timestampTooltip").timestampTooltip);
        this.node.addEventListener("mouseenter", ()=>{
            if (this.disabled) return;
            this.show();
        });
        this.node.addEventListener("mouseleave", ()=>{
            this.hide();
        });
    }
    /** Alias for the constructor */ static create(node, text, options = {}) {
        return new tooltip_Tooltip(node, text, options);
    }
    /** Container where the tooltip will be appended. */ get container() {
        return document.querySelector(discordselectors.App.app.sibling(discordselectors.TooltipLayers.layerContainer));
    }
    /** Boolean representing if the tooltip will fit on screen above the element */ get canShowAbove() {
        return this.node.getBoundingClientRect().top - this.element.offsetHeight >= 0;
    }
    /** Boolean representing if the tooltip will fit on screen below the element */ get canShowBelow() {
        return this.node.getBoundingClientRect().top + this.node.offsetHeight + this.element.offsetHeight <= domtools_DOMTools.screenHeight;
    }
    /** Boolean representing if the tooltip will fit on screen to the left of the element */ get canShowLeft() {
        return this.node.getBoundingClientRect().left - this.element.offsetWidth >= 0;
    }
    /** Boolean representing if the tooltip will fit on screen to the right of the element */ get canShowRight() {
        return this.node.getBoundingClientRect().left + this.node.offsetWidth + this.element.offsetWidth <= domtools_DOMTools.screenWidth;
    }
    /** Hides the tooltip. Automatically called on mouseleave. */ hide() {
        /** Don't rehide if already inactive */ if (!this.active) return;
        this.active = false;
        this.element.remove();
        this.tooltipElement.className = this._className;
    }
    /** Shows the tooltip. Automatically called on mouseenter. Will attempt to flip if position was wrong. */ show() {
        /** Don't reshow if already active */ if (this.active) return;
        this.active = true;
        this.tooltipElement.className = `${discordclasses.Tooltips.tooltip} ${tooltip_getClass(this.style)}`;
        if (this.disablePointerEvents) this.tooltipElement.classList.add(discordclasses.Tooltips.tooltipDisablePointerEvents);
        if (this.isTimestamp) this.tooltipElement.classList.add(webpackmodules_WebpackModules.getByProps("timestampTooltip").timestampTooltip);
        this.labelElement.textContent = this.label;
        this.container.append(this.element);
        if (this.side == "top") {
            if (this.canShowAbove || !this.canShowAbove && this.preventFlip) this.showAbove();
            else this.showBelow();
        }
        if (this.side == "bottom") {
            if (this.canShowBelow || !this.canShowBelow && this.preventFlip) this.showBelow();
            else this.showAbove();
        }
        if (this.side == "left") {
            if (this.canShowLeft || !this.canShowLeft && this.preventFlip) this.showLeft();
            else this.showRight();
        }
        if (this.side == "right") {
            if (this.canShowRight || !this.canShowRight && this.preventFlip) this.showRight();
            else this.showLeft();
        }
        /** Do not create a new observer each time if one already exists! */ if (this.observer) return;
        /** Use an observer in show otherwise you'll cause unclosable tooltips */ this.observer = new MutationObserver((mutations)=>{
            mutations.forEach((mutation)=>{
                const nodes = Array.from(mutation.removedNodes);
                const directMatch = nodes.indexOf(this.node) > -1;
                const parentMatch = nodes.some((parent)=>parent.contains(this.node));
                if (directMatch || parentMatch) {
                    this.hide();
                    this.observer.disconnect();
                }
            });
        });
        this.observer.observe(document.body, {
            subtree: true,
            childList: true
        });
    }
    /** Force showing the tooltip above the node. */ showAbove() {
        this.tooltipElement.classList.add(tooltip_getClass("top"));
        this.element.style.setProperty("top", toPx(this.node.getBoundingClientRect().top - this.element.offsetHeight - 10));
        this.centerHorizontally();
    }
    /** Force showing the tooltip below the node. */ showBelow() {
        this.tooltipElement.classList.add(tooltip_getClass("bottom"));
        this.element.style.setProperty("top", toPx(this.node.getBoundingClientRect().top + this.node.offsetHeight + 10));
        this.centerHorizontally();
    }
    /** Force showing the tooltip to the left of the node. */ showLeft() {
        this.tooltipElement.classList.add(tooltip_getClass("left"));
        this.element.style.setProperty("left", toPx(this.node.getBoundingClientRect().left - this.element.offsetWidth - 10));
        this.centerVertically();
    }
    /** Force showing the tooltip to the right of the node. */ showRight() {
        this.tooltipElement.classList.add(tooltip_getClass("right"));
        this.element.style.setProperty("left", toPx(this.node.getBoundingClientRect().left + this.node.offsetWidth + 10));
        this.centerVertically();
    }
    centerHorizontally() {
        const nodecenter = this.node.getBoundingClientRect().left + this.node.offsetWidth / 2;
        this.element.style.setProperty("left", toPx(nodecenter - this.element.offsetWidth / 2));
    }
    centerVertically() {
        const nodecenter = this.node.getBoundingClientRect().top + this.node.offsetHeight / 2;
        this.element.style.setProperty("top", toPx(nodecenter - this.element.offsetHeight / 2));
    }
};

;// CONCATENATED MODULE: ../../packages/bdlib/src/styles/toasts.css
const toasts_namespaceObject = ".toasts {\n    position: fixed;\n    display: flex;\n    top: 0;\n    flex-direction: column;\n    align-items: center;\n    justify-content: flex-end;\n    pointer-events: none;\n    z-index: 4000;\n}\n\n@keyframes toast-up {\n    from {\n        transform: translateY(0);\n        opacity: 0;\n    }\n}\n\n.toast {\n    animation: toast-up 300ms ease;\n    transform: translateY(-10px);\n    background: #36393F;\n    padding: 10px;\n    border-radius: 5px;\n    box-shadow: 0 0 0 1px rgba(32,34,37,.6), 0 2px 10px 0 rgba(0,0,0,.2);\n    font-weight: 500;\n    color: #fff;\n    user-select: text;\n    font-size: 14px;\n    opacity: 1;\n    margin-top: 10px;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n}\n\n@keyframes toast-down {\n    to {\n        transform: translateY(0px);\n        opacity: 0;\n    }\n}\n\n.toast.closing {\n    animation: toast-down 200ms ease;\n    animation-fill-mode: forwards;\n    opacity: 1;\n    transform: translateY(-10px);\n}\n\n.toast.toast-info {\n    background-color: #4a90e2;\n}\n\n.toast.toast-success {\n    background-color: #43b581;\n}\n\n.toast.toast-danger,\n.toast.toast-error {\n    background-color: #f04747;\n}\n\n.toast.toast-warning,\n.toast.toast-warn {\n    background-color: #FFA600;\n}\n\n.toast-icon {\n    margin-right: 5px;\n    fill: white;\n    border-radius: 50%;\n    overflow: hidden;\n    height: 20px;\n    width: 20px;\n}\n\n.toast-text {\n    line-height: 20px;\n}";
;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/toasts.ts
//@ts-nocheck
/**
 * Toast maker similar to Android.
 *
 * @module Toasts
 */ 


class Toast {
    /** Shorthand for `type = "success"` for {@link module:Toasts.show} */ static async success(content, options = {}) {
        return this.show(content, Object.assign(options, {
            type: "success"
        }));
    }
    /** Shorthand for `type = "info"` for {@link module:Toasts.show} */ static async info(content, options = {}) {
        return this.show(content, Object.assign(options, {
            type: "info"
        }));
    }
    /** Shorthand for `type = "warning"` for {@link module:Toasts.show} */ static async warning(content, options = {}) {
        return this.show(content, Object.assign(options, {
            type: "warning"
        }));
    }
    /** Shorthand for `type = "error"` for {@link module:Toasts.show} */ static async error(content, options = {}) {
        return this.show(content, Object.assign(options, {
            type: "error"
        }));
    }
    /** Shorthand for `type = "default"` for {@link module:Toasts.show} */ static async default(content, options = {}) {
        return this.show(content, Object.assign(options, {
            type: "default"
        }));
    }
    /**
   * Shows a simple toast, similar to Android, centered over
   * the textarea if it exists, and center screen otherwise.
   * Vertically it shows towards the bottom like in Android.
   * @param {string} content - The string to show in the toast.
   * @param {object} options - additional options for the toast
   * @param {string} [options.type] - Changes the type of the toast stylistically and semantically. {@link module:Toasts.ToastTypes}
   * @param {string} [options.icon] - URL to an optional icon
   * @param {number} [options.timeout=3000] - Adjusts the time (in ms) the toast should be shown for before disappearing automatically
   * @returns {Promise} - Promise that resolves when the toast is removed from the DOM
   */ static async show(content, options = {}) {
        const { type ="" , icon ="" , timeout =3000  } = options;
        this.ensureContainer();
        const toast = domtools_DOMTools.parseHTML(this.buildToast(content, this.parseType(type), icon));
        document.querySelector(".toasts").appendChild(toast);
        await new Promise((resolve)=>setTimeout(resolve, timeout));
        toast.classList.add("closing");
        await new Promise((resolve)=>setTimeout(resolve, 300));
        toast.remove();
        if (!document.querySelectorAll(".toasts .toast").length) document.querySelector(".toasts").remove();
    }
    static buildToast(message, type, icon) {
        const hasIcon = type || icon;
        const className = `toast ${hasIcon ? "toast-has-icon" : ""} ${type && type != "default" ? `toast-${type}` : ""}`;
        if (!icon && type) icon = type;
        return utilities_Utilities.formatString(`<div class="{{className}}">{{icon}}<div class="toast-text">{{message}}</div></div>`, {
            className: className,
            icon: hasIcon ? this.getIcon(icon) : "",
            message: message
        });
    }
    static getIcon(icon) {
        let iconInner = `<img src="${icon}" width="20" height="20" />`;
        switch(icon){
            case "success":
                iconInner = success(20);
                break; // eslint-disable-line new-cap
            case "warning":
                iconInner = warning(20);
                break; // eslint-disable-line new-cap
            case "info":
                iconInner = info(20);
                break; // eslint-disable-line new-cap
            case "error":
                iconInner = error(20); // eslint-disable-line new-cap
        }
        return utilities_Utilities.formatString(`<div class="toast-icon">{{icon}}</div>`, {
            icon: iconInner
        });
    }
    static ensureContainer() {
        if (document.querySelector(".toasts")) return;
        const channelClass = discordselectors.ChannelList.sidebar;
        const container = channelClass ? document.querySelector(`${channelClass} ~ div:not([style])`) : null;
        const memberlist = container ? container.querySelector(discordselectors.MemberList.membersWrap) : null;
        const form = container ? container.querySelector("form") : null;
        const left = container ? container.getBoundingClientRect().left : 310;
        const right = memberlist ? memberlist.getBoundingClientRect().left : 0;
        const width = right ? right - container.getBoundingClientRect().left : container.offsetWidth;
        const bottom = form ? form.offsetHeight : 80;
        const toastWrapper = document.createElement("div");
        toastWrapper.classList.add("toasts");
        toastWrapper.style.setProperty("left", left + "px");
        toastWrapper.style.setProperty("width", width + "px");
        toastWrapper.style.setProperty("bottom", bottom + "px");
        document.querySelector("#app-mount").appendChild(toastWrapper);
    }
    static parseType(type) {
        return this.ToastTypes.hasOwnProperty(type) ? this.ToastTypes[type] : "";
    }
    /**
   * Enumeration of accepted types.
   */ static get ToastTypes() {
        return {
            default: "",
            error: "error",
            success: "success",
            warning: "warning",
            info: "info"
        };
    }
};

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/popouts.ts
//@ts-nocheck
/**
 * Allows an easy way to create and show popouts.
 * @module Popouts
 */ 
const { React: popouts_React , ReactDOM  } = discordmodules;
const { useReducer , useEffect , useRef  } = popouts_React;
const popouts_AccessibilityProvider = webpackmodules_WebpackModules.getByProps("AccessibilityPreferencesContext").AccessibilityPreferencesContext.Provider;
const Layers = webpackmodules_WebpackModules.getByProps("AppReferencePositionLayer");
const PopoutCSSAnimator = webpackmodules_WebpackModules.getByDisplayName("PopoutCSSAnimator");
const popouts_LayerProvider = Layers.AppLayerProvider().props.layerContext.Provider; // eslint-disable-line new-cap
const LayerModule = webpackmodules_WebpackModules.getByProps("LayerClassName");
const { ComponentDispatch  } = webpackmodules_WebpackModules.getByProps("ComponentDispatch");
const { ComponentActions  } = webpackmodules_WebpackModules.getByProps("ComponentActions");
const AnalyticsTrackContext = webpackmodules_WebpackModules.find((m)=>m._currentValue && m._currentValue.toString && m._currentValue.toString().includes("AnalyticsTrackImpressionContext function unimplemented"));
const AnalyticsTracker = webpackmodules_WebpackModules.find((m)=>m.toString && m.toString().includes("setDebugTrackedData"));
const popouts_Popout = webpackmodules_WebpackModules.getByDisplayName("Popout");
const createStore = (state)=>{
    const listeners = new Set();
    const setState = function(getter = (_)=>_) {
        const partial = getter(state);
        if (partial === state) return;
        state = partial;
        [
            ...listeners
        ].forEach((e)=>e());
    };
    setState.getState = ()=>state;
    function storeListener(getter = (_)=>_) {
        const [, forceUpdate] = useReducer((n)=>!n, true);
        useEffect(()=>{
            const dispatch = ()=>{
                forceUpdate();
            };
            listeners.add(dispatch);
            return ()=>{
                listeners.delete(dispatch);
            };
        });
        return getter(state);
    }
    return [
        setState,
        storeListener
    ];
};
const [setPopouts, usePopouts] = createStore([]);
const AnimationTypes = {
    FADE: 3,
    SCALE: 2,
    TRANSLATE: 1
};
class Popouts {
    static get AnimationTypes() {
        return AnimationTypes;
    }
    static initialize() {
        this.dispose();
        this.popouts = 0;
        this.container = Object.assign(document.createElement("div"), {
            className: "ZeresPluginLibraryPopoutsRenderer",
            style: "display: none;"
        });
        this.layerContainer = Object.assign(document.createElement("div"), {
            id: "ZeresPluginLibraryPopouts",
            className: LayerModule.LayerClassName
        });
        document.body.append(this.container, this.layerContainer);
        ReactDOM.render(popouts_React.createElement(PopoutsContainer), this.container);
        Patcher.before("Popouts", LayerModule, "getParentLayerContainer", (_, [element])=>{
            if (element.parentElement === this.layerContainer) return this.layerContainer;
        });
    }
    /**
   * Shows the user popout for a user relative to a target element
   * @param {HTMLElement} target - Element to show the popout in relation to
   * @param {object} user - Discord User object for the user to show
   * @param {object} [options] - Options to modify the request
   * @param {string} [options.guild="currentGuildId"] - Id of the guild  (uses current if not specified)
   * @param {string} [options.channel="currentChannelId"] - Id of the channel (uses current if not specified)
   * @param {string} [options.position="right"] - Positioning relative to element
   * @param {string} [options.align="top"] - Positioning relative to element
   */ static showUserPopout(target, user, options = {}) {
        const { position ="right" , align ="top" , guild =DiscordModules.SelectedGuildStore.getGuildId() , channel =DiscordModules.SelectedChannelStore.getChannelId() ,  } = options;
        target = DOMTools.resolveElement(target);
        // if (target.getBoundingClientRect().right + 250 >= DOMTools.screenWidth && options.autoInvert) position = "left";
        // if (target.getBoundingClientRect().bottom + 400 >= DOMTools.screenHeight && options.autoInvert) align = "bottom";
        // if (target.getBoundingClientRect().top - 400 >= DOMTools.screenHeight && options.autoInvert) align = "top";
        this.openPopout(target, {
            position: position,
            align: align,
            animation: options.animation || Popouts.AnimationTypes.TRANSLATE,
            autoInvert: options.autoInvert,
            nudgeAlignIntoViewport: options.nudgeAlignIntoViewport,
            spacing: options.spacing,
            render: (props)=>{
                return DiscordModules.React.createElement(DiscordModules.UserPopout, Object.assign({}, props, {
                    userId: user.id,
                    guildId: guild,
                    channelId: channel
                }));
            }
        });
    }
    /**
   * Shows a react popout relative to a target element
   * @param {HTMLElement} target - Element to show the popout in relation to
   * @param {object} [options] - Options to modify the request
   * @param {string} [options.position="right"] - General position relative to element
   * @param {string} [options.align="top"] - Alignment relative to element
   * @param {Popouts.AnimationTypes} [options.animation=Popouts.AnimationTypes.TRANSLATE] - Animation type to use
   * @param {boolean} [options.autoInvert=true] - Try to automatically adjust the position if it overflows the screen
   * @param {boolean} [options.nudgeAlignIntoViewport=true] - Try to automatically adjust the alignment if it overflows the screen
   * @param {number} [options.spacing=8] - Spacing between target and popout
   */ static openPopout(target, options) {
        const id = this.popouts++;
        setPopouts((popouts)=>popouts.concat({
                id: id,
                element: popouts_React.createElement(PopoutWrapper, Object.assign({}, popouts_Popout.defaultProps, {
                    reference: {
                        current: target
                    },
                    popoutId: id,
                    key: "popout_" + id,
                    spacing: 50
                }, options))
            }));
        return id;
    }
    static closePopout(id) {
        const popout = setPopouts.getState().find((e)=>e.id === id);
        if (!popout) return null;
        setPopouts((popouts)=>{
            const clone = [
                ...popouts
            ];
            clone.splice(clone.indexOf(popout), 1);
            return clone;
        });
    }
    static dispose() {
        Patcher.unpatchAll("Popouts");
        const container = document.querySelector(".ZeresPluginLibraryPopoutsRenderer");
        const layerContainer = document.querySelector("#ZeresPluginLibraryPopouts");
        if (container) ReactDOM.unmountComponentAtNode(container);
        if (container) container.remove();
        if (layerContainer) layerContainer.remove();
    }
};
function DiscordProviders({ children , container  }) {
    return popouts_React.createElement(popouts_AccessibilityProvider, {
        value: {
            reducedMotion: {
                enabled: false,
                rawValue: "auto"
            }
        }
    }, popouts_React.createElement(popouts_LayerProvider, {
        value: [
            container
        ]
    }, popouts_React.createElement(AnalyticsTrackContext.Provider, {
        value: AnalyticsTracker
    }, children)));
}
function PopoutsContainer() {
    const popouts = usePopouts();
    return popouts_React.createElement(DiscordProviders, {
        container: Popouts.layerContainer
    }, popouts.map((popout)=>popout.element));
}
function PopoutWrapper({ render , animation , popoutId , ...props }) {
    const popoutRef = useRef();
    useEffect(()=>{
        if (!popoutRef.current) return;
        const node = ReactDOM.findDOMNode(popoutRef.current);
        const handleClick = ({ target  })=>{
            if (target === node || node.contains(target)) return;
            Popouts.closePopout(popoutId);
        };
        document.addEventListener("click", handleClick);
        return ()=>{
            document.removeEventListener("click", handleClick);
        };
    }, [
        popoutRef
    ]);
    switch(animation){
        case PopoutCSSAnimator.Types.FADE:
        case PopoutCSSAnimator.Types.SCALE:
        case PopoutCSSAnimator.Types.TRANSLATE:
            {
                const renderPopout = render;
                render = (renderProps)=>{
                    return popouts_React.createElement(PopoutCSSAnimator, {
                        position: renderProps.position,
                        type: animation
                    }, renderPopout(renderProps));
                };
            }
    }
    return popouts_React.createElement(Layers.AppReferencePositionLayer, Object.assign(props, {
        ref: popoutRef,
        positionKey: "0",
        autoInvert: true,
        id: "popout_" + popoutId,
        onMount () {
            ComponentDispatch.dispatch(ComponentActions.POPOUT_SHOW);
        },
        onUnmount () {
            ComponentDispatch.dispatch(ComponentActions.POPOUT_HIDE);
        },
        children: render
    }));
}

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/modals.ts
//@ts-nocheck
/**
 * Allows an easy way to create and show modals.
 * @module Modals
 */ 
const modals_React = discordmodules.React;
const ce = modals_React.createElement;
const Markdown = webpackmodules_WebpackModules.getModule((m)=>m.displayName == "Markdown" && m.rules);
class Modals {
    /** Sizes of modals. */ static get ModalSizes() {
        return {};
    }
    /**
   * Shows the user profile modal for a given user.
   * @param {string} userId - id of the user to show profile for
   */ static showUserProfile(userId) {
        return discordmodules.UserProfileModal.open(userId);
    }
    /**
   * Acts as a wrapper for {@link module:Modals.showModal} where the `children` is a text element.
   * @param {string} title - title of the modal
   * @param {string} content - text to show inside the modal. Can be markdown.
   * @param {object} [options] - see {@link module:Modals.showModal}
   * @see module:Modals.showModal
   */ static showConfirmationModal(title, content, options = {}) {
        this.showModal(title, ce(Markdown, null, content), options);
    }
    /**
   * Shows a very simple alert modal that has title, content and an okay button.
   * @param {string} title - title of the modal
   * @param {string} body - text to show inside the modal
   */ static showAlertModal(title, body) {
        this.showConfirmationModal(title, body, {
            cancelText: null
        });
    }
    /**
   * Shows a generic but very customizable modal.
   * @param {string} title - title of the modal
   * @param {(ReactElement|Array<ReactElement>)} children - a single or array of rendered react elements to act as children
   * @param {object} [options] - options to modify the modal
   * @param {boolean} [options.danger=false] - whether the main button should be red or not
   * @param {string} [options.confirmText=Okay] - text for the confirmation/submit button
   * @param {string} [options.cancelText=Cancel] - text for the cancel button
   * @param {callable} [options.onConfirm=NOOP] - callback to occur when clicking the submit button
   * @param {callable} [options.onCancel=NOOP] - callback to occur when clicking the cancel button
   */ static showModal(title, children, options = {}) {
        const { danger =false , confirmText ="Okay" , cancelText ="Cancel" , onConfirm =()=>{} , onCancel =()=>{} ,  } = options;
        return discordmodules.ModalActions.openModal((props)=>{
            return modals_React.createElement(discordmodules.ConfirmationModal, Object.assign({
                header: title,
                confirmButtonColor: danger ? discordmodules.ButtonData.ButtonColors.RED : discordmodules.ButtonData.ButtonColors.BRAND,
                confirmText: confirmText,
                cancelText: cancelText,
                onConfirm: onConfirm,
                onCancel: onCancel
            }, props), children);
        });
    }
    /**
   * @interface
   * @name module:Modals~Changelog
   * @property {string} title - title of the changelog section
   * @property {string} [type=added] - type information of the section. Options: added, improved, fixed, progress.
   * @property {Array<string>} items - itemized list of items to show in that section. Can use markdown.
   */ /**
   * Shows a changelog modal based on changelog data.
   * @param {string} title - title of the modal
   * @param {string} version - subtitle (usually version or date) of the modal
   * @param {module:Modals~Changelog} changelog - changelog to show inside the modal
   * @param {string} footer - either an html element or text to show in the footer of the modal. Can use markdown.
   */ static showChangelogModal(title, version, changelog, footer) {
        const TextElement = discordmodules.TextElement;
        if (!TextElement) return logger_Logger.warn("Modals", "Unable to show changelog modal--TextElement not found.");
        const changelogItems = [];
        for(let c = 0; c < changelog.length; c++){
            const entry = changelog[c];
            const type = discordclasses.Changelog[entry.type] ? discordclasses.Changelog[entry.type] : discordclasses.Changelog.added;
            const margin = c == 0 ? discordclasses.Changelog.marginTop : "";
            changelogItems.push(ce("h1", {
                className: `${type} ${margin}`
            }, entry.title));
            const list = ce("ul", null, entry.items.map((i)=>ce("li", null, ce(Markdown, null, i))));
            changelogItems.push(list);
        }
        const renderHeader = function() {
            return ce(discordmodules.FlexChild.Child, {
                grow: 1,
                shrink: 1
            }, ce(discordmodules.Titles["default"], {
                tag: discordmodules.Titles.Tags.H4
            }, title), ce(TextElement, {
                size: TextElement.Sizes.SMALL,
                color: TextElement.Colors.PRIMARY,
                className: discordclasses.Changelog.date.toString()
            }, "Version " + version));
        };
        const renderFooter = footer ? function() {
            return ce(Markdown, null, footer);
        } : null;
        return discordmodules.ModalActions.openModal((props)=>{
            return ce(discordmodules.Changelog, Object.assign({
                className: discordclasses.Changelog.container.toString(),
                selectable: true,
                onScroll: (_)=>_,
                onClose: (_)=>_,
                renderHeader: renderHeader,
                renderFooter: renderFooter
            }, props), changelogItems);
        });
    }
};

;// CONCATENATED MODULE: ../../packages/bdlib/src/modules/reacttools.ts
//@ts-nocheck
/**
 * Helpful utilities for dealing with getting react information from DOM objects.
 * @module ReactTools
 */ 


class reacttools_ReactTools {
    static get rootInstance() {
        return document.getElementById("app-mount")._reactRootContainer._internalRoot.current;
    }
    /**
     * Grabs the react internal instance of a specific node.
     * @param {(HTMLElement|jQuery)} node - node to obtain react instance of
     * @return {object} the internal react instance
     */ static getReactInstance(node) {
        const domNode = domtools_DOMTools.resolveElement(node);
        if (!(domNode instanceof Element)) return undefined;
        return domNode[Object.keys(domNode).find((key)=>key.startsWith("__reactInternalInstance") || key.startsWith("__reactFiber"))];
    }
    /**
     * Grabs a value from the react internal instance. Allows you to grab
     * long depth values safely without accessing no longer valid properties.
     * @param {(HTMLElement|jQuery)} node - node to obtain react instance of
     * @param {string} path - path to the requested value
     * @return {(*|undefined)} the value requested or undefined if not found.
     */ static getReactProperty(node, path) {
        return utilities_Utilities.getNestedProp(this.getReactInstance(node), path);
    }
    /**
     * Grabs a value from the react internal instance. Allows you to grab
     * long depth values safely without accessing no longer valid properties.
     * @param {(HTMLElement|jQuery)} node - node to obtain react instance of
     * @param {object} options - options for the search
     * @param {array} [options.include] - list of items to include from the search
     * @param {array} [options.exclude=["Popout", "Tooltip", "Scroller", "BackgroundFlash"]] - list of items to exclude from the search
     * @param {callable} [options.filter=_=>_] - filter to check the current instance with (should return a boolean)
     * @return {(*|null)} the owner instance or undefined if not found.
     */ static getOwnerInstance(node, { include , exclude =[
        "Popout",
        "Tooltip",
        "Scroller",
        "BackgroundFlash"
    ] , filter =(_)=>_  } = {}) {
        if (node === undefined) return undefined;
        const excluding = include === undefined;
        const nameFilter = excluding ? exclude : include;
        function getDisplayName(owner) {
            const type = owner.type;
            if (!type) return null;
            return type.displayName || type.name || null;
        }
        function classFilter(owner) {
            const name = getDisplayName(owner);
            return name !== null && !!(nameFilter.includes(name) ^ excluding);
        }
        let curr = this.getReactInstance(node);
        for(curr = curr && curr.return; !utilities_Utilities.isNil(curr); curr = curr.return){
            if (utilities_Utilities.isNil(curr)) continue;
            const owner = curr.stateNode;
            if (!utilities_Utilities.isNil(owner) && !(owner instanceof HTMLElement) && classFilter(curr) && filter(owner)) return owner;
        }
        return null;
    }
    /**
     * Grabs the react internal state node trees of a specific node.
     * @param {(HTMLElement|jQuery)} node - node to obtain state nodes of
     * @return {Array<Function>} list of found state nodes
     */ static getStateNodes(node) {
        const instance = this.getReactInstance(node);
        const stateNodes = [];
        let lastInstance = instance;
        while(lastInstance && lastInstance.return){
            if (lastInstance.return.stateNode instanceof HTMLElement) break;
            if (lastInstance.return.stateNode) stateNodes.push(lastInstance.return.stateNode);
            lastInstance = lastInstance.return;
        }
        return stateNodes;
    }
    /**
     * Grabs the react internal component tree of a specific node.
     * @param {(HTMLElement|jQuery)} node - node to obtain react components of
     * @return {Array<Function>} list of found react components
     */ static getComponents(node) {
        const instance = this.getReactInstance(node);
        const components = [];
        let lastInstance = instance;
        while(lastInstance && lastInstance.return){
            if (typeof lastInstance.return.type === "string") break;
            if (lastInstance.return.type) components.push(lastInstance.return.type);
            lastInstance = lastInstance.return;
        }
        return components;
    }
    /**
     * Creates and renders a react element that wraps dom elements.
     * @param {(HTMLElement|Array<HTMLElement>)} element - element or array of elements to wrap into a react element
     * @returns {object} - rendered react element
     */ static createWrappedElement(element) {
        if (Array.isArray(element)) element = domtools_DOMTools.wrap(element);
        return discordmodules.React.createElement(this.wrapElement(element));
    }
    /**
     * Creates an unrendered react component that wraps dom elements.
     * @param {(HTMLElement|Array<HTMLElement>)} element - element or array of elements to wrap into a react component
     * @returns {object} - unrendered react component
     */ static wrapElement(element) {
        if (Array.isArray(element)) element = domtools_DOMTools.wrap(element);
        return class ReactWrapper extends discordmodules.React.Component {
            constructor(props){
                super(props);
                this.element = element;
            }
            componentDidMount() {
                this.refs.element.appendChild(this.element);
            }
            render() {
                return discordmodules.React.createElement("div", {
                    className: "react-wrapper",
                    ref: "element"
                });
            }
        };
    }
};

;// CONCATENATED MODULE: ../../packages/bdlib/src/modules/patcher.ts
//@ts-nocheck
/**
 * Patcher that can patch other functions allowing you to run code before, after or
 * instead of the original function. Can also alter arguments and return values.
 *
 * This is a modified version of what we have been working on in BDv2. {@link https://github.com/JsSucks/BetterDiscordApp/blob/master/client/src/modules/patcher.js}
 *
 * @module Patcher
 */ 


class patcher_Patcher {
    // Use window._patches instead of local variables in case something tries to whack the lib
    static get patches() {
        return window._patches || (window._patches = []);
    }
    /**
     * Returns all the patches done by a specific caller
     * @param {string} name - Name of the patch caller
     * @method
     */ static getPatchesByCaller(name) {
        if (!name) return [];
        const patches = [];
        for (const patch of this.patches){
            for (const childPatch of patch.children){
                if (childPatch.caller === name) patches.push(childPatch);
            }
        }
        return patches;
    }
    /**
     * Unpatches all patches passed, or when a string is passed unpatches all
     * patches done by that specific caller.
     * @param {Array|string} patches - Either an array of patches to unpatch or a caller name
     */ static unpatchAll(patches) {
        if (typeof patches === "string") patches = this.getPatchesByCaller(patches);
        for (const patch of patches){
            patch.unpatch();
        }
    }
    static resolveModule(module) {
        if (!module || typeof module === "function" || typeof module === "object" && !Array.isArray(module)) return module;
        if (typeof module === "string") return DiscordModules[module];
        if (Array.isArray(module)) return WebpackModules.findByUniqueProperties(module);
        return null;
    }
    static makeOverride(patch) {
        return function() {
            let returnValue;
            if (!patch.children || !patch.children.length) return patch.originalFunction.apply(this, arguments);
            for (const superPatch of patch.children.filter((c)=>c.type === "before")){
                try {
                    superPatch.callback(this, arguments);
                } catch (err) {
                    Logger.err("Patcher", `Could not fire before callback of ${patch.functionName} for ${superPatch.caller}`, err);
                }
            }
            const insteads = patch.children.filter((c)=>c.type === "instead");
            if (!insteads.length) {
                returnValue = patch.originalFunction.apply(this, arguments);
            } else {
                for (const insteadPatch of insteads){
                    try {
                        const tempReturn = insteadPatch.callback(this, arguments, patch.originalFunction.bind(this));
                        if (typeof tempReturn !== "undefined") returnValue = tempReturn;
                    } catch (err) {
                        Logger.err("Patcher", `Could not fire instead callback of ${patch.functionName} for ${insteadPatch.caller}`, err);
                    }
                }
            }
            for (const slavePatch of patch.children.filter((c)=>c.type === "after")){
                try {
                    const tempReturn = slavePatch.callback(this, arguments, returnValue);
                    if (typeof tempReturn !== "undefined") returnValue = tempReturn;
                } catch (err) {
                    Logger.err("Patcher", `Could not fire after callback of ${patch.functionName} for ${slavePatch.caller}`, err);
                }
            }
            return returnValue;
        };
    }
    static rePatch(patch) {
        patch.proxyFunction = patch.module[patch.functionName] = this.makeOverride(patch);
    }
    static makePatch(module, functionName, name) {
        const patch = {
            name,
            module,
            functionName,
            originalFunction: module[functionName],
            proxyFunction: null,
            revert: ()=>{
                patch.module[patch.functionName] = patch.originalFunction;
                patch.proxyFunction = null;
                patch.children = [];
            },
            counter: 0,
            children: []
        };
        patch.proxyFunction = module[functionName] = this.makeOverride(patch);
        Object.assign(module[functionName], patch.originalFunction);
        module[functionName].__originalFunction = patch.originalFunction;
        module[functionName].toString = ()=>patch.originalFunction.toString();
        this.patches.push(patch);
        return patch;
    }
    /**
     * Function with no arguments and no return value that may be called to revert changes made by {@link module:Patcher}, restoring (unpatching) original method.
     * @callback module:Patcher~unpatch
     */ /**
     * A callback that modifies method logic. This callback is called on each call of the original method and is provided all data about original call. Any of the data can be modified if necessary, but do so wisely.
     *
     * The third argument for the callback will be `undefined` for `before` patches. `originalFunction` for `instead` patches and `returnValue` for `after` patches.
     *
     * @callback module:Patcher~patchCallback
     * @param {object} thisObject - `this` in the context of the original function.
     * @param {arguments} arguments - The original arguments of the original function.
     * @param {(function|*)} extraValue - For `instead` patches, this is the original function from the module. For `after` patches, this is the return value of the function.
     * @return {*} Makes sense only when using an `instead` or `after` patch. If something other than `undefined` is returned, the returned value replaces the value of `returnValue`. If used for `before` the return value is ignored.
     */ /**
     * This method patches onto another function, allowing your code to run beforehand.
     * Using this, you are also able to modify the incoming arguments before the original method is run.
     *
     * @param {string} caller - Name of the caller of the patch function. Using this you can undo all patches with the same name using {@link module:Patcher.unpatchAll}. Use `""` if you don't care.
     * @param {object} moduleToPatch - Object with the function to be patched. Can also patch an object's prototype.
     * @param {string} functionName - Name of the method to be patched
     * @param {module:Patcher~patchCallback} callback - Function to run before the original method
     * @param {object} options - Object used to pass additional options.
     * @param {string} [options.displayName] You can provide meaningful name for class/object provided in `what` param for logging purposes. By default, this function will try to determine name automatically.
     * @param {boolean} [options.forcePatch=true] Set to `true` to patch even if the function doesnt exist. (Adds noop function in place).
     * @return {module:Patcher~unpatch} Function with no arguments and no return value that should be called to cancel (unpatch) this patch. You should save and run it when your plugin is stopped.
     */ static before(caller, moduleToPatch, functionName, callback, options = {}) {
        return this.pushChildPatch(caller, moduleToPatch, functionName, callback, Object.assign(options, {
            type: "before"
        }));
    }
    /**
     * This method patches onto another function, allowing your code to run after.
     * Using this, you are also able to modify the return value, using the return of your code instead.
     *
     * @param {string} caller - Name of the caller of the patch function. Using this you can undo all patches with the same name using {@link module:Patcher.unpatchAll}. Use `""` if you don't care.
     * @param {object} moduleToPatch - Object with the function to be patched. Can also patch an object's prototype.
     * @param {string} functionName - Name of the method to be patched
     * @param {module:Patcher~patchCallback} callback - Function to run instead of the original method
     * @param {object} options - Object used to pass additional options.
     * @param {string} [options.displayName] You can provide meaningful name for class/object provided in `what` param for logging purposes. By default, this function will try to determine name automatically.
     * @param {boolean} [options.forcePatch=true] Set to `true` to patch even if the function doesnt exist. (Adds noop function in place).
     * @return {module:Patcher~unpatch} Function with no arguments and no return value that should be called to cancel (unpatch) this patch. You should save and run it when your plugin is stopped.
     */ static after(caller, moduleToPatch, functionName, callback, options = {}) {
        return this.pushChildPatch(caller, moduleToPatch, functionName, callback, Object.assign(options, {
            type: "after"
        }));
    }
    /**
     * This method patches onto another function, allowing your code to run instead.
     * Using this, you are also able to modify the return value, using the return of your code instead.
     *
     * @param {string} caller - Name of the caller of the patch function. Using this you can undo all patches with the same name using {@link module:Patcher.unpatchAll}. Use `""` if you don't care.
     * @param {object} moduleToPatch - Object with the function to be patched. Can also patch an object's prototype.
     * @param {string} functionName - Name of the method to be patched
     * @param {module:Patcher~patchCallback} callback - Function to run after the original method
     * @param {object} options - Object used to pass additional options.
     * @param {string} [options.displayName] You can provide meaningful name for class/object provided in `what` param for logging purposes. By default, this function will try to determine name automatically.
     * @param {boolean} [options.forcePatch=true] Set to `true` to patch even if the function doesnt exist. (Adds noop function in place).
     * @return {module:Patcher~unpatch} Function with no arguments and no return value that should be called to cancel (unpatch) this patch. You should save and run it when your plugin is stopped.
     */ static instead(caller, moduleToPatch, functionName, callback, options = {}) {
        return this.pushChildPatch(caller, moduleToPatch, functionName, callback, Object.assign(options, {
            type: "instead"
        }));
    }
    /**
     * This method patches onto another function, allowing your code to run before, instead or after the original function.
     * Using this you are able to modify the incoming arguments before the original function is run as well as the return
     * value before the original function actually returns.
     *
     * @param {string} caller - Name of the caller of the patch function. Using this you can undo all patches with the same name using {@link module:Patcher.unpatchAll}. Use `""` if you don't care.
     * @param {object} moduleToPatch - Object with the function to be patched. Can also patch an object's prototype.
     * @param {string} functionName - Name of the method to be patched
     * @param {module:Patcher~patchCallback} callback - Function to run after the original method
     * @param {object} options - Object used to pass additional options.
     * @param {string} [options.type=after] - Determines whether to run the function `before`, `instead`, or `after` the original.
     * @param {string} [options.displayName] You can provide meaningful name for class/object provided in `what` param for logging purposes. By default, this function will try to determine name automatically.
     * @param {boolean} [options.forcePatch=true] Set to `true` to patch even if the function doesnt exist. (Adds noop function in place).
     * @return {module:Patcher~unpatch} Function with no arguments and no return value that should be called to cancel (unpatch) this patch. You should save and run it when your plugin is stopped.
     */ static pushChildPatch(caller, moduleToPatch, functionName, callback, options = {}) {
        const { type ="after" , forcePatch =true  } = options;
        const module = this.resolveModule(moduleToPatch);
        if (!module) return null;
        if (!module[functionName] && forcePatch) module[functionName] = function() {};
        if (!(module[functionName] instanceof Function)) return null;
        if (typeof moduleToPatch === "string") options.displayName = moduleToPatch;
        const displayName = options.displayName || module.displayName || module.name || module.constructor.displayName || module.constructor.name;
        const patchId = `${displayName}.${functionName}`;
        const patch = this.patches.find((p)=>p.module == module && p.functionName == functionName) || this.makePatch(module, functionName, patchId);
        if (!patch.proxyFunction) this.rePatch(patch);
        const child = {
            caller,
            type,
            id: patch.counter,
            callback,
            unpatch: ()=>{
                patch.children.splice(patch.children.findIndex((cpatch)=>cpatch.id === child.id && cpatch.type === type), 1);
                if (patch.children.length <= 0) {
                    const patchNum = this.patches.findIndex((p)=>p.module == module && p.functionName == functionName);
                    if (patchNum < 0) return;
                    this.patches[patchNum].revert();
                    this.patches.splice(patchNum, 1);
                }
            }
        };
        patch.children.push(child);
        patch.counter++;
        return child.unpatch;
    }
};

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/discordcontextmenu.ts
//@ts-nocheck







// d = e.label,
// f = e.icon,
// h = e.imageUrl,
// v = e.hint,
// m = e.subtext,
// g = e.hasSubmenu,
// y = e.disabled,
// E = e.isFocused,
// S = e.menuItemProps,
// T = e.action,
// b = e.onClose,
const discordcontextmenu_React = discordmodules.React;
const ContextMenuActions = discordmodules.ContextMenuActions;
const discordcontextmenu_ce = discordcontextmenu_React.createElement;
const ContextMenu = webpackmodules_WebpackModules.getByProps("MenuRadioItem", "MenuItem");
/**
 * Fires when the item is clicked.
 * @param {MouseEvent} event - The event generated on click
 * @callback module:DiscordContextMenu~MenuItemOnClick
 */ /**
 * @interface
 * @name module:DiscordContextMenu~MenuItem
 * @description
 * This is the generic context menu item component. It is very extensible and will adapt
 * it's type depending on the props.
 *
 * Note: The item ID should be unique to this item across the entire menu. If no `id` is
 * provided, the system will use the `label`. Plugins should ensure there are no `label`
 * conflicts if they do not wish to provide `id`. `label` conflicts (when not using
 * unique `id`s) can cause multiple items to be hovered at once.
 *
 * @param {object} props - props to pass to the react renderer
 * @param {string} props.label - label to show on the menu item
 * @param {string} [props.id] - specific id used for this item
 * @param {string} [props.hint] - hint to show on the right hand side (usually keyboard combo)
 * @param {string} [props.subtext] - description to show underneath
 * @param {string} [props.image] - link to image to show on the side
 * @param {function} [props.icon] - react component to render on the side
 * @param {function} [props.render] - render function for custom rendering the menu item
 * @param {module:DiscordContextMenu~MenuItemOnClick} [props.action] - function to perform on click
 * @param {module:DiscordContextMenu~MenuItemOnClick} [props.onClick] - function to perform on click (alias of `action`)
 * @param {function} [props.onClose] - function to run when this is closed
 * @param {boolean} [props.danger=false] - should the item show as danger (red)
 * @param {boolean} [props.disabled=false] - should the item be disabled/unclickable
 *
 * @param {object} [props.style] - allows you to add custom styles
 * @param {boolean} [props.closeOnClick] - allows you to prevent closing on click
 */ /**
 * @interface
 * @name module:DiscordContextMenu~MenuToggleItem
 * @extends module:DiscordContextMenu~MenuItem
 * @description
 * This item is used for creating checkboxes in menus. Properties shown here are additional
 * to those of the main MenuItem {@link module:DiscordContextMenu~MenuItem}
 *
 *
 * @param {boolean} [props.checked=false] - should the checkbox be checked
 * @param {boolean} [props.active=false] - alias of `checked`
 */ /**
 * @interface
 * @name module:DiscordContextMenu~MenuRadioItem
 * @extends module:DiscordContextMenu~MenuItem
 * @description
 * This item is used for creating radio selections in menus. Properties shown here are additional
 * to those of the main MenuItem {@link module:DiscordContextMenu~MenuItem}
 *
 * Note: for the `forceUpdate` option... Without this enabled, you will manually need to
 * manage the state for the functional component. If you do not the toggle will appear
 * to not update. @see {@link https://reactjs.org/docs/hooks-reference.html#usestate}
 *
 * @param {boolean} [props.checked=false] - should the checkbox be checked
 * @param {boolean} [props.active=false] - alias of `checked`
 * @param {boolean} [props.forceUpdate=true] - should the menu be force-updated after click
 */ /**
 * @interface
 * @name module:DiscordContextMenu~SubMenuItem
 * @extends module:DiscordContextMenu~MenuItem
 * @description
 * This item is used for creating nested submenus. Properties shown here are additional
 * to those of the main MenuItem {@link module:DiscordContextMenu~MenuItem}
 *
 * @param {Array<object>} [props.render] - array of items to render in the submenu
 * @param {Array<object>} [props.items] - alias of `render`
 * @param {Array<object>} [props.children] - Already rendered elements
 */ /**
 * @interface
 * @name module:DiscordContextMenu~MenuControlItem
 * @extends module:DiscordContextMenu~MenuItem
 * @description
 * This item is used for adding custom controls like sliders to the context menu.
 * Properties shown here are additional to those of the main MenuItem {@link module:DiscordContextMenu~MenuItem}
 *
 * @param {function} [props.control] - control function that renders the component
 */ /**
 * A utility for building and rendering Discord's own menus.
 * @module DiscordContextMenu
 */ class DiscordContextMenu {
    /**
   * Builds a single menu item. The only prop shown here is the type, the rest should
   * match the actual component being built. View those to see what options exist
   * for each, they often have less in common than you might think. See {@link module:DiscordContextMenu.MenuItem}
   * for the majority of props commonly available. Check the documentation for the
   * rest of the components.
   *
   * @param {object} props - props used to build the item
   * @param {string} [props.type="text"] - type of the item, options: text, submenu, toggle, radio, custom, separator
   * @returns {object} the created component
   *
   * @see {@link module:DiscordContextMenu~MenuItem}
   * @see {@link module:DiscordContextMenu~MenuToggleItem}
   * @see {@link module:DiscordContextMenu~MenuRadioItem}
   * @see {@link module:DiscordContextMenu~SubMenuItem}
   * @see {@link module:DiscordContextMenu~MenuControlItem}
   *
   * @example
   * // Creates a single menu item that prints "MENU ITEM" on click
   * DiscordContextMenu.buildMenuItem({
   *      label: "Menu Item",
   *      action: () => {console.log("MENU ITEM");}
   * });
   *
   * @example
   * // Creates a single toggle item that starts unchecked
   * // and print the new value on every toggle
   * DiscordContextMenu.buildMenuItem({
   *      type: "toggle",
   *      label: "Item Toggle",
   *      checked: false,
   *      action: (newValue) => {console.log(newValue);}
   * });
   */ static buildMenuItem(props) {
        const { type  } = props;
        if (type === "separator") return discordcontextmenu_ce(ContextMenu.MenuSeparator);
        let Component = ContextMenu.MenuItem;
        if (type === "submenu") {
            if (!props.children) props.children = this.buildMenuChildren(props.render || props.items);
        } else if (type === "toggle" || type === "radio") {
            Component = type === "toggle" ? ContextMenu.MenuCheckboxItem : ContextMenu.MenuRadioItem;
            if (props.active) props.checked = props.active;
        } else if (type === "control") {
            Component = ContextMenu.MenuControlItem;
        }
        if (!props.id) props.id = `${DOMTools.escapeID(props.label)}`;
        if (props.danger) props.color = "colorDanger";
        if (props.onClick && !props.action) props.action = props.onClick;
        props.extended = true;
        return discordcontextmenu_ce(Component, props);
    }
    /**
   * Creates the all the items **and groups** of a context menu recursively.
   * There is no hard limit to the number of groups within groups or number
   * of items in a menu.
   * @param {Array<object>} setup - array of item props used to build items. See {@link module:DiscordContextMenu.buildMenuItem}
   * @returns {Array<object>} array of the created component
   *
   * @example
   * // Creates a single item group item with a toggle item
   * DiscordContextMenu.buildMenuChildren([{
   *      type: "group",
   *      items: [{
   *          type: "toggle",
   *          label: "Item Toggle",
   *          active: false,
   *          action: (newValue) => {console.log(newValue);}
   *      }]
   * }]);
   *
   * @example
   * // Creates two item groups with a single toggle item each
   * DiscordContextMenu.buildMenuChildren([{
   *     type: "group",
   *     items: [{
   *         type: "toggle",
   *         label: "Item Toggle",
   *         active: false,
   *         action: (newValue) => {
   *             console.log(newValue);
   *         }
   *     }]
   * }, {
   *     type: "group",
   *     items: [{
   *         type: "toggle",
   *         label: "Item Toggle",
   *         active: false,
   *         action: (newValue) => {
   *             console.log(newValue);
   *         }
   *     }]
   * }]);
   */ static buildMenuChildren(setup) {
        const mapper = (s)=>{
            if (s.type === "group") return buildGroup(s);
            return this.buildMenuItem(s);
        };
        const buildGroup = function(group) {
            const items = group.items.map(mapper).filter((i)=>i);
            return discordcontextmenu_ce(ContextMenu.MenuGroup, null, items);
        };
        return setup.map(mapper).filter((i)=>i);
    }
    /**
   * Creates the menu *component* including the wrapping `ContextMenu`.
   * Calls {@link module:DiscordContextMenu.buildMenuChildren} under the covers.
   * Used to call in combination with {@link module:DiscordContextMenu.openContextMenu}.
   * @param {Array<object>} setup - array of item props used to build items. See {@link module:DiscordContextMenu.buildMenuChildren}
   * @returns {function} the unique context menu component
   */ static buildMenu(setup) {
        return (props)=>{
            return discordcontextmenu_ce(ContextMenu.default, props, this.buildMenuChildren(setup));
        };
    }
    /**
   *
   * @param {MouseEvent} event - The context menu event. This can be emulated, requires target, and all X, Y locations.
   * @param {function} menuComponent - Component to render. This can be any react component or output of {@link module:DiscordContextMenu.buildMenu}
   * @param {object} config - configuration/props for the context menu
   * @param {string} [config.position="right"] - default position for the menu, options: "left", "right"
   * @param {string} [config.align="top"] - default alignment for the menu, options: "bottom", "top"
   * @param {function} [config.onClose] - function to run when the menu is closed
   * @param {boolean} [config.noBlurEvent=false] - No clue
   */ static openContextMenu(event, menuComponent, config) {
        return ContextMenuActions.openContextMenu(event, function(e) {
            return discordcontextmenu_ce(menuComponent, Object.assign({}, e, {
                onClose: ContextMenuActions.closeContextMenu
            }));
        }, config);
    }
    /**
   * Attempts to find and return a specific context menu type's module. Useful
   * when patching the render of these menus.
   * @param {string | Function} nameOrFilter - name of the context menu type
   * @returns {Promise<object>} the webpack module the menu was found in
   */ static getDiscordMenu(nameOrFilter) {
        if (typeof nameOrFilter !== "function") {
            const displayName = nameOrFilter;
            nameOrFilter = (m)=>m && m.displayName === displayName;
        }
        const directMatch = WebpackModules.getModule((m)=>m.default && nameOrFilter(m.default));
        if (directMatch) return Promise.resolve(directMatch);
        return new Promise((resolve)=>{
            const cancel = WebpackModules.addListener((module)=>{
                if (!module.default || !nameOrFilter(module.default)) return;
                resolve(module);
                cancel();
            });
        });
    }
    /**
   * Calls `forceUpdate()` on all context menus it can find. Useful for
   * after patching a menu.
   */ static forceUpdateMenus() {
        const menus = document.querySelectorAll(`.${DiscordClasses.ContextMenu.menu.first}`);
        for (const menu of menus){
            const stateNode = Utilities.findInTree(ReactTools.getReactInstance(menu), (m)=>m && m.forceUpdate && m.updatePosition, {
                walkable: [
                    "return",
                    "stateNode"
                ]
            });
            if (!stateNode) continue;
            stateNode.forceUpdate();
            stateNode.updatePosition();
        }
    }
    static initialize() {
        Patcher.unpatchAll("DCM");
        this.patchMenuItem();
        this.patchToggleItem();
    }
    static patchMenuItem() {
        const MenuItem = WebpackModules.getModule((m)=>m.default && m.default.displayName == "MenuItem");
        if (!MenuItem || !MenuItem.default) return;
        Patcher.after("DCM", MenuItem, "default", (_, args, ret)=>{
            if (!args || !args[0] || !args[0].extended) return;
            const [props] = args;
            if (props.style) ret.props.style = props.style;
            if (props.closeOnClick !== false || !props.action) return;
            ret.props.onClick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                return props.action(...arguments);
            };
        });
    }
    static patchToggleItem() {
        const MenuToggleItem = WebpackModules.getModule((m)=>m.default && m.default.displayName == "MenuCheckboxItem");
        if (!MenuToggleItem || !MenuToggleItem.default) return;
        Patcher.before("DCM", MenuToggleItem, "default", (_, args)=>{
            if (!args || !args[0] || !args[0].extended) return;
            const [props] = args;
            const [active, doToggle] = discordcontextmenu_React.useState(props.checked || false);
            props.checked = active;
            const originalAction = props.action;
            props.action = function(ev) {
                originalAction(ev);
                doToggle(!active);
            };
        });
    }
};

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/errorboundary.ts

const errorboundary_React = discordmodules.React;
const errorboundary_ce = errorboundary_React.createElement;
class ErrorBoundary extends errorboundary_React.Component {
    constructor(props){
        super(props);
        this.state = {
            hasError: false
        };
    }
    componentDidCatch() {
        this.setState({
            hasError: true
        });
    }
    render() {
        if (this.state.hasError) return this.props.errorChildren ? this.props.errorChildren : errorboundary_ce("div", {
            className: "error"
        }, "Component Error");
        return this.props.children;
    }
};
function WrapBoundary(Original) {
    return class ErrorBoundaryWrapper extends errorboundary_React.Component {
        render() {
            return errorboundary_ce(ErrorBoundary, null, errorboundary_ce(Original, this.props));
        }
    };
}

;// CONCATENATED MODULE: ../../packages/bdlib/src/ui/index.ts











;// CONCATENATED MODULE: ../../packages/bdlib/src/styles/updates.css
const updates_namespaceObject = "#pluginNotice {\n    -webkit-app-region: drag;\n    border-radius: 0;\n    overflow: hidden;\n    height: 36px;\n    animation: open-updates 400ms ease;\n}\n\n@keyframes open-updates {\n    from { height: 0; }\n}\n\n#pluginNotice.closing {\n    transition: height 400ms ease;\n    height: 0;\n}\n\n#outdatedPlugins {\n    font-weight: 700;\n}\n\n#outdatedPlugins>span {\n    -webkit-app-region: no-drag;\n    color: #fff;\n    cursor: pointer;\n}\n\n#outdatedPlugins>span:hover {\n    text-decoration: underline;\n}";
;// CONCATENATED MODULE: ../../packages/bdlib/src/modules/pluginupdater.ts
//@ts-nocheck
/**
 * Functions that check for and update existing plugins.
 * @module PluginUpdater
 */ 




/**
 * Function that gets the remote version from the file contents.
 * @param {string} fileContent - the content of the remote file
 * @returns {string} - remote version
 * @callback module:PluginUpdater~versioner
 */ /**
 * Comparator that takes the current version and the remote version,
 * then compares them returning `true` if there is an update and `false` otherwise.
 * @param {string} currentVersion - the current version of the plugin
 * @param {string} remoteVersion - the remote version of the plugin
 * @returns {boolean} - whether the plugin has an update or not
 * @callback module:PluginUpdater~comparator
 */ class PluginUpdater {
    static get CSS() {
        return updates_namespaceObject;
    }
    /**
   * Checks for updates for the specified plugin at the specified link. The final
   * parameter should link to the raw text of the plugin and will compare semantic
   * versions.
   * @param {string} pluginName - name of the plugin
   * @param {string} currentVersion - current version (semantic versioning only)
   * @param {string} updateURL - url to check for update
   * @param {module:PluginUpdater~versioner} [versioner] - versioner that finds the remote version. If not provided uses {@link module:PluginUpdater.defaultVersioner}.
   * @param {module:PluginUpdater~comparator} [comparator] - comparator that determines if there is an update. If not provided uses {@link module:PluginUpdater.defaultComparator}.
   */ static checkForUpdate(pluginName, currentVersion, updateURL, versioner, comparator) {
        console.log(pluginName, currentVersion, updateURL, versioner, comparator);
        let updateLink = "https://raw.githubusercontent.com/rauenzi/BetterDiscordAddons/master/Plugins/" + pluginName + "/" + pluginName + ".plugin.js";
        if (updateURL) updateLink = updateURL;
        if (typeof versioner != "function") versioner = this.defaultVersioner;
        if (typeof comparator != "function") comparator = this.defaultComparator;
        if (typeof window.PluginUpdates === "undefined") {
            window.PluginUpdates = {
                plugins: {},
                checkAll: async function() {
                    for(const key in this.plugins){
                        const plugin = this.plugins[key];
                        if (!plugin.versioner) plugin.versioner = PluginUpdater.defaultVersioner;
                        if (!plugin.comparator) plugin.comparator = PluginUpdater.defaultComparator;
                        await PluginUpdater.processUpdateCheck(plugin.name, plugin.raw);
                    }
                },
                interval: setInterval(()=>{
                    window.PluginUpdates.checkAll();
                }, 7200000)
            };
            this.patchPluginList();
        }
        window.PluginUpdates.plugins[updateLink] = {
            name: pluginName,
            raw: updateLink,
            version: currentVersion,
            versioner: versioner,
            comparator: comparator
        };
        PluginUpdater.processUpdateCheck(pluginName, updateLink);
    }
    /**
   * Will check for updates and automatically show or remove the update notice
   * bar based on the internal result. Better not to call this directly and to
   * instead use {@link module:PluginUpdater.checkForUpdate}.
   * @param {string} pluginName - name of the plugin to check
   * @param {string} updateLink - link to the raw text version of the plugin
   */ static async processUpdateCheck(pluginName, updateLink) {
        return new Promise((resolve)=>{
            const request = require("request");
            request(updateLink, (error, response, result)=>{
                console.log(result);
                if (error || response.statusCode !== 200) return resolve();
                const remoteVersion = window.PluginUpdates.plugins[updateLink].versioner(result);
                console.log("remoteVersion", remoteVersion);
                const hasUpdate = window.PluginUpdates.plugins[updateLink].comparator(window.PluginUpdates.plugins[updateLink].version, remoteVersion);
                console.log("hasUpdate", hasUpdate);
                if (hasUpdate) resolve(this.showUpdateNotice(pluginName, updateLink));
                else resolve(this.removeUpdateNotice(pluginName));
            });
        });
    }
    /**
   * The default versioner used as {@link module:PluginUpdater~versioner} for {@link module:PluginUpdater.checkForUpdate}.
   * This works on basic semantic versioning e.g. "1.0.0". You do not need to provide this as a versioner if your plugin adheres
   * to this style as this will be used as default.
   * @param {string} currentVersion
   * @param {string} content
   */ static defaultVersioner(content) {
        const remoteVersion = content.match(/['"][0-9]+\.[0-9]+\.[0-9]+['"]/i);
        if (!remoteVersion) return "0.0.0";
        return remoteVersion.toString().replace(/['"]/g, "");
    }
    /**
   * The default comparator used as {@link module:PluginUpdater~comparator} for {@link module:PluginUpdater.checkForUpdate}.
   * This works on basic semantic versioning e.g. "1.0.0". You do not need to provide this as a comparator if your plugin adheres
   * to this style as this will be used as default.
   * @param {string} currentVersion
   * @param {string} content
   */ static defaultComparator(currentVersion, remoteVersion) {
        currentVersion = currentVersion.split(".").map((e)=>{
            return parseInt(e);
        });
        remoteVersion = remoteVersion.split(".").map((e)=>{
            return parseInt(e);
        });
        if (remoteVersion[0] > currentVersion[0]) return true;
        else if (remoteVersion[0] == currentVersion[0] && remoteVersion[1] > currentVersion[1]) return true;
        else if (remoteVersion[0] == currentVersion[0] && remoteVersion[1] == currentVersion[1] && remoteVersion[2] > currentVersion[2]) return true;
        return false;
    }
    static patchPluginList() {
        domtools_DOMTools.observer.subscribeToQuerySelector((mutation)=>{
            if (!mutation.addedNodes || !mutation.addedNodes.length) return;
            const button = document.getElementsByClassName("bd-pfbtn")[0];
            if (!button || !button.textContent.toLowerCase().includes("plugin") || button.nextElementSibling.classList.contains("bd-updatebtn")) return;
            button.after(PluginUpdater.createUpdateButton());
        }, "#bd-settingspane-container");
    }
    /**
   * Creates the update button found in the plugins page of BetterDiscord
   * settings. Returned button will already have listeners to create the tooltip.
   * @returns {HTMLElement} check for update button
   */ static createUpdateButton() {
        const updateButton = domtools_DOMTools.parseHTML(`<button class="bd-pfbtn bd-updatebtn" style="left: 220px;">Check for Updates</button>`);
        updateButton.onclick = function() {
            Toast.info("Plugin update check in progress.");
            window.PluginUpdates.checkAll().then(()=>{
                Toast.success("Plugin update check complete.");
            });
        };
        const tooltip = new tooltip_Tooltip(updateButton, "Checks for updates of plugins that support this feature. Right-click for a list.");
        updateButton.oncontextmenu = function() {
            if (!window.PluginUpdates || !window.PluginUpdates.plugins) return;
            tooltip.label = Object.values(window.PluginUpdates.plugins).map((p)=>p.name).join(", ");
            tooltip.side = "bottom";
            tooltip.show();
            updateButton.onmouseout = function() {
                tooltip.label = "Checks for updates of plugins that support this feature. Right-click for a list.";
                tooltip.side = "top";
            };
        };
        return updateButton;
    }
    /**
   * Will download the latest version and replace the the old plugin version.
   * Will also update the button in the update bar depending on if the user
   * is using RestartNoMore plugin by square {@link https://github.com/Inve1951/BetterDiscordStuff/blob/master/plugins/restartNoMore.plugin.js}
   * @param {string} pluginName - name of the plugin to download
   * @param {string} updateLink - link to the raw text version of the plugin
   */ static downloadPlugin(pluginName, updateLink) {
        const request = require("request");
        const fileSystem = require("fs");
        const path = require("path");
        request(updateLink, async (error, response, body)=>{
            if (error) return logger_Logger.warn("PluginUpdates", "Unable to get update for " + pluginName);
            const remoteVersion = window.PluginUpdates.plugins[updateLink].versioner(body);
            let filename = updateLink.split("/");
            filename = filename[filename.length - 1];
            const file = path.join(BdApi.Plugins.folder, filename);
            await new Promise((r)=>fileSystem.writeFile(file, body, r));
            Toast.success(`${pluginName} ${window.PluginUpdates.plugins[updateLink].version} has been replaced by ${pluginName} ${remoteVersion}`);
            this.removeUpdateNotice(pluginName);
            if (BdApi.isSettingEnabled("fork-ps-5")) return;
            if (!window.PluginUpdates.downloaded) {
                window.PluginUpdates.downloaded = [];
                const button = domtools_DOMTools.parseHTML(`<button class="btn btn-reload ${discordclasses.Notices.buttonMinor} ${discordclasses.Notices.button}">Reload</button>`);
                const tooltip = new tooltip_Tooltip(button, window.PluginUpdates.downloaded.join(", "), {
                    side: "top"
                });
                button.addEventListener("click", (e)=>{
                    e.preventDefault();
                    window.location.reload(false);
                });
                button.addEventListener("mouseenter", ()=>{
                    tooltip.label = window.PluginUpdates.downloaded.join(", ");
                });
                document.getElementById("pluginNotice").append(button);
            }
            window.PluginUpdates.plugins[updateLink].version = remoteVersion;
            window.PluginUpdates.downloaded.push(pluginName);
        });
    }
    /**
   * Will show the update notice top bar seen in Discord. Better not to call
   * this directly and to instead use {@link module:PluginUpdater.checkForUpdate}.
   * @param {string} pluginName - name of the plugin
   * @param {string} updateLink - link to the raw text version of the plugin
   */ static showUpdateNotice(pluginName, updateLink) {
        if (!document.getElementById("pluginNotice")) {
            const noticeElement = domtools_DOMTools.parseHTML(`<div class="${discordclasses.Notices.notice} ${discordclasses.Notices.colorInfo}" id="pluginNotice">
                                                        <div class="${discordclasses.Notices.closeButton}" id="pluginNoticeDismiss"></div>
                                                        <span class="notice-message">The following plugins have updates:</span>&nbsp;&nbsp;<strong id="outdatedPlugins"></strong>
                                                    </div>`);
            domtools_DOMTools.query("[class*='app-'] > [class*='app-']").prepend(noticeElement);
            noticeElement.querySelector("#pluginNoticeDismiss").addEventListener("click", async ()=>{
                noticeElement.classList.add("closing");
                await new Promise((resolve)=>setTimeout(resolve, 400));
                noticeElement.remove();
            });
        }
        const pluginNoticeID = pluginName + "-notice";
        if (document.getElementById(pluginNoticeID)) return;
        const pluginNoticeElement = domtools_DOMTools.parseHTML(`<span id="${pluginNoticeID}">${pluginName}</span>`);
        pluginNoticeElement.addEventListener("click", ()=>{
            this.downloadPlugin(pluginName, updateLink);
        });
        if (document.getElementById("outdatedPlugins").querySelectorAll("span").length) document.getElementById("outdatedPlugins").append(domtools_DOMTools.createElement("<span class='separator'>, </span>"));
        document.getElementById("outdatedPlugins").append(pluginNoticeElement);
        const tooltip = new tooltip_Tooltip(pluginNoticeElement, "Click To Update!", {
            side: "bottom"
        });
        // If this is the first one added, show the tooltip immediately.
        if (document.getElementById("outdatedPlugins").querySelectorAll("span").length === 1) tooltip.show();
    }
    /**
   * Will remove the plugin from the update notice top bar seen in Discord.
   * Better not to call this directly and to instead use {@link module:PluginUpdater.checkForUpdate}.
   * @param {string} pluginName - name of the plugin
   */ static removeUpdateNotice(pluginName) {
        if (!document.getElementById("outdatedPlugins")) return;
        const notice = document.getElementById(pluginName + "-notice");
        if (notice) {
            if (notice.nextElementSibling && notice.nextElementSibling.matches(".separator")) notice.nextElementSibling.remove();
            else if (notice.previousElementSibling && notice.previousElementSibling.matches(".separator")) notice.previousElementSibling.remove();
            notice.remove();
        }
        if (!document.getElementById("outdatedPlugins").querySelectorAll("span").length) {
            if (document.querySelector("#pluginNotice .btn-reload")) document.querySelector("#pluginNotice .notice-message").textContent = "To finish updating you need to reload.";
            else document.getElementById("pluginNoticeDismiss").click();
        }
    }
};

;// CONCATENATED MODULE: ../../packages/bdlib/src/structs/plugin.ts
//@ts-nocheck







/* harmony default export */ function structs_plugin(meta) {
    return class Plugin {
        constructor(){
            this._config = meta;
            this._enabled = false;
            if (typeof meta.defaultConfig != "undefined") {
                this.defaultSettings = {};
                for(let s = 0; s < meta.defaultConfig.length; s++){
                    const current = meta.defaultConfig[s];
                    if (current.type != "category") {
                        this.defaultSettings[current.id] = current.value;
                    } else {
                        this.defaultSettings[current.id] = {};
                        for(let si = 0; si < current.settings.length; si++){
                            const subCurrent = current.settings[si];
                            this.defaultSettings[current.id][subCurrent.id] = subCurrent.value;
                        }
                    }
                }
                this._hasConfig = true;
                this.settings = utilities_Utilities.deepclone(this.defaultSettings);
            }
        }
        getName() {
            return this._config.info.name.replace(" ", "");
        }
        getDescription() {
            return this._config.info.description;
        }
        getVersion() {
            return this._config.info.version;
        }
        getAuthor() {
            return this._config.info.authors.map((a)=>a.name).join(", ");
        }
        load() {
            const currentVersionInfo = utilities_Utilities.loadData(this.getName(), "currentVersionInfo", {
                version: this.getVersion(),
                hasShownChangelog: false
            });
            if (currentVersionInfo.version != this.getVersion() || !currentVersionInfo.hasShownChangelog) {
                this.showChangelog();
                utilities_Utilities.saveData(this.getName(), "currentVersionInfo", {
                    version: this.getVersion(),
                    hasShownChangelog: true
                });
            }
            PluginUpdater.checkForUpdate(this.getName(), this.getVersion(), this._config.info.github_raw);
        }
        async start() {
            logger_Logger.info(this.getName(), `version ${this.getVersion()} has started.`);
            if (this.defaultSettings) this.settings = this.loadSettings();
            this._enabled = true;
            if (typeof this.onStart == "function") this.onStart();
        }
        stop() {
            logger_Logger.info(this.getName(), `version ${this.getVersion()} has stopped.`);
            this._enabled = false;
            if (typeof this.onStop == "function") this.onStop();
        }
        get isEnabled() {
            return this._enabled;
        }
        get strings() {
            if (!this._config.strings) return {};
            const locale = discordmodules.UserSettingsStore.locale.split("-")[0];
            if (this._config.strings.hasOwnProperty(locale)) return this._config.strings[locale];
            if (this._config.strings.hasOwnProperty("en")) return this._config.strings.en;
            return this._config.strings;
        }
        set strings(strings) {
            this._config.strings = strings;
        }
        showSettingsModal() {
            if (typeof this.getSettingsPanel != "function") return;
            Modals.showModal(this.getName() + " Settings", reacttools_ReactTools.createWrappedElement(this.getSettingsPanel()), {
                cancelText: "",
                confirmText: "Done",
                size: Modals.ModalSizes.MEDIUM
            });
        }
        showChangelog(footer) {
            if (typeof this._config.changelog == "undefined") return;
            Modals.showChangelogModal(this.getName() + " Changelog", this.getVersion(), this._config.changelog, footer);
        }
        saveSettings(settings) {
            utilities_Utilities.saveSettings(this.getName(), this.settings ? this.settings : settings);
        }
        loadSettings(defaultSettings) {
            // loadSettings -> loadData -> defaultSettings gets deep cloned
            return utilities_Utilities.loadSettings(this.getName(), this.defaultSettings ? this.defaultSettings : defaultSettings);
        }
        buildSetting(data) {
            const { name , note , type , value , onChange , id  } = data;
            let setting = null;
            if (type == "color") setting = new color(name, note, value, onChange, {
                disabled: data.disabled,
                presetColors: data.presetColors
            });
            else if (type == "dropdown") setting = new dropdown(name, note, value, data.options, onChange);
            else if (type == "file") setting = new file(name, note, onChange);
            else if (type == "keybind") setting = new keybind(name, note, value, onChange);
            else if (type == "radio") setting = new radiogroup(name, note, value, data.options, onChange, {
                disabled: data.disabled
            });
            else if (type == "slider") setting = new slider(name, note, data.min, data.max, value, onChange, data);
            else if (type == "switch") setting = new types_switch(name, note, value, onChange, {
                disabled: data.disabled
            });
            else if (type == "textbox") setting = new textbox(name, note, value, onChange, {
                placeholder: data.placeholder || ""
            });
            if (id) setting.id = id;
            return setting;
        }
        buildSettingsPanel() {
            const config = this._config.defaultConfig;
            const buildGroup = (group)=>{
                const { name , id , collapsible , shown , settings  } = group;
                // this.settings[id] = {};
                const list = [];
                for(let s = 0; s < settings.length; s++){
                    const current = Object.assign({}, settings[s]);
                    current.value = this.settings[id][current.id];
                    current.onChange = (value)=>{
                        this.settings[id][current.id] = value;
                    };
                    if (Object.keys(this.strings).length && this.strings.settings && this.strings.settings[id] && this.strings.settings[id][current.id]) {
                        const { settingName =name , note  } = this.strings.settings[id][current.id];
                        current.name = settingName;
                        current.note = note;
                    }
                    list.push(this.buildSetting(current));
                }
                const settingGroup = new settinggroup(name, {
                    shown,
                    collapsible
                }).append(...list);
                settingGroup.id = id;
                return settingGroup;
            };
            const list1 = [];
            for(let s1 = 0; s1 < config.length; s1++){
                const current = Object.assign({}, config[s1]);
                if (current.type != "category") {
                    current.value = this.settings[current.id];
                    current.onChange = (value)=>{
                        this.settings[current.id] = value;
                    };
                    if (Object.keys(this.strings).length && this.strings.settings && this.strings.settings[current.id]) {
                        const { name , note  } = this.strings.settings[current.id];
                        current.name = name;
                        current.note = note;
                    }
                    list1.push(this.buildSetting(current));
                } else {
                    list1.push(buildGroup(current));
                }
            }
            return new settingpanel(this.saveSettings.bind(this), ...list1);
        }
    };
};

;// CONCATENATED MODULE: ../../packages/bdlib/src/structs/index.ts







;// CONCATENATED MODULE: ../../packages/bdlib/src/modules/domtools.ts
//@ts-nocheck
/**
 * Helpful utilities for dealing with DOM operations.
 *
 * This module also extends `HTMLElement` to add a set of utility functions,
 * the same as the ones available in the module itself, but with the `element`
 * parameter bound to `this`.
 * @module DOMTools
 */ 
/**
 * @interface
 * @name Offset
 * @property {number} top - Top offset of the target element.
 * @property {number} right - Right offset of the target element.
 * @property {number} bottom - Bottom offset of the target element.
 * @property {number} left - Left offset of the target element.
 * @property {number} height - Outer height of the target element.
 * @property {number} width - Outer width of the target element.
 */ /**
 * Function that automatically removes added listener.
 * @callback module:DOMTools~CancelListener
 */ class domtools_DOMTools {
    static get Selector() {
        return selector;
    }
    static get ClassName() {
        return classname;
    }
    static get DOMObserver() {
        return observer;
    }
    /**
   * Default DOMObserver for global usage.
   *
   * @see DOMObserver
   */ static get observer() {
        return this._observer || (this._observer = new observer());
    }
    /** Document/window width */ static get screenWidth() {
        return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    }
    /** Document/window height */ static get screenHeight() {
        return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    }
    static animate({ timing =(_)=>_ , update , duration  }) {
        // https://javascript.info/js-animation
        const start = performance.now();
        requestAnimationFrame(function renderFrame(time) {
            // timeFraction goes from 0 to 1
            let timeFraction = (time - start) / duration;
            if (timeFraction > 1) timeFraction = 1;
            // calculate the current animation state
            const progress = timing(timeFraction);
            update(progress); // draw it
            if (timeFraction < 1) requestAnimationFrame(renderFrame);
        });
    }
    /**
   * Adds a style to the document.
   * @param {string} id - identifier to use as the element id
   * @param {string} css - css to add to the document
   */ static addStyle(id, css) {
        document.head.append(domtools_DOMTools.createElement(`<style id="${id}">${css}</style>`));
    }
    /**
   * Removes a style from the document.
   * @param {string} id - original identifier used
   */ static removeStyle(id) {
        const element = document.getElementById(id);
        if (element && element.tagName === "STYLE") element.remove();
    }
    /**
   * Adds/requires a remote script to be loaded
   * @param {string} id - identifier to use for this script
   * @param {string} url - url from which to load the script
   * @returns {Promise} promise that resolves when the script is loaded
   */ static addScript(id, url) {
        return new Promise((resolve)=>{
            const script = document.createElement("script");
            script.id = id;
            script.src = url;
            script.type = "text/javascript";
            script.onload = resolve;
            document.head.append(script);
        });
    }
    /**
   * Removes a remote script from the document.
   * @param {string} id - original identifier used
   */ static removeScript(id) {
        const element = document.getElementById(id);
        if (element && element.tagName === "SCRIPT") element.remove();
    }
    /**
   * This is my shit version of not having to use `$` from jQuery. Meaning
   * that you can pass a selector and it will automatically run {@link module:DOMTools.query}.
   * It also means that you can pass a string of html and it will perform and return `parseHTML`.
   * @see module:DOMTools.parseHTML
   * @see module:DOMTools.query
   * @param {string} selector - Selector to query or HTML to parse
   * @returns {(DocumentFragment|NodeList|HTMLElement)} - Either the result of `parseHTML` or `query`
   */ static Q(selector) {
        const element = this.parseHTML(selector);
        const isHTML = element instanceof NodeList ? Array.from(element).some((n)=>n.nodeType === 1) : element.nodeType === 1;
        if (isHTML) return element;
        return this.query(selector);
    }
    /**
   * Essentially a shorthand for `document.querySelector`. If the `baseElement` is not provided
   * `document` is used by default.
   * @param {string} selector - Selector to query
   * @param {Element} [baseElement] - Element to base the query from
   * @returns {(Element|null)} - The found element or null if not found
   */ static query(selector, baseElement) {
        if (!baseElement) baseElement = document;
        return baseElement.querySelector(selector);
    }
    /**
   * Essentially a shorthand for `document.querySelectorAll`. If the `baseElement` is not provided
   * `document` is used by default.
   * @param {string} selector - Selector to query
   * @param {Element} [baseElement] - Element to base the query from
   * @returns {Array<Element>} - Array of all found elements
   */ static queryAll(selector, baseElement) {
        if (!baseElement) baseElement = document;
        return baseElement.querySelectorAll(selector);
    }
    /**
   * Parses a string of HTML and returns the results. If the second parameter is true,
   * the parsed HTML will be returned as a document fragment {@see https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment}.
   * This is extremely useful if you have a list of elements at the top level, they can then be appended all at once to another node.
   *
   * If the second parameter is false, then the return value will be the list of parsed
   * nodes and there were multiple top level nodes, otherwise the single node is returned.
   * @param {string} html - HTML to be parsed
   * @param {boolean} [fragment=false] - Whether or not the return should be the raw `DocumentFragment`
   * @returns {(DocumentFragment|NodeList|HTMLElement)} - The result of HTML parsing
   */ static parseHTML(html, fragment = false) {
        const template = document.createElement("template");
        template.innerHTML = html;
        const node = template.content.cloneNode(true);
        if (fragment) return node;
        return node.childNodes.length > 1 ? node.childNodes : node.childNodes[0];
    }
    /** Alternate name for {@link module:DOMTools.parseHTML} */ static createElement(html, fragment = false) {
        return this.parseHTML(html, fragment);
    }
    /**
   * Takes a string of html and escapes it using the brower's own escaping mechanism.
   * @param {String} html - html to be escaped
   */ static escapeHTML(html) {
        const textNode = document.createTextNode("");
        const spanElement = document.createElement("span");
        spanElement.append(textNode);
        textNode.nodeValue = html;
        return spanElement.innerHTML;
    }
    /**
   * Takes a string and escapes it for use as a DOM id.
   * @param {String} id - string to be escaped
   */ static escapeID(id) {
        return id.replace(/^[^a-z]+|[^\w-]+/gi, "-");
    }
    /**
   * Adds a list of classes from the target element.
   * @param {Element} element - Element to edit classes of
   * @param {...string} classes - Names of classes to add
   * @returns {Element} - `element` to allow for chaining
   */ static addClass(element, ...classes) {
        classes = classes.flat().filter((c)=>c);
        for(let c1 = 0; c1 < classes.length; c1++)classes[c1] = classes[c1].toString().split(" ");
        classes = classes.flat().filter((c)=>c);
        element.classList.add(...classes);
        return element;
    }
    /**
   * Removes a list of classes from the target element.
   * @param {Element} element - Element to edit classes of
   * @param {...string} classes - Names of classes to remove
   * @returns {Element} - `element` to allow for chaining
   */ static removeClass(element, ...classes) {
        for(let c2 = 0; c2 < classes.length; c2++)classes[c2] = classes[c2].toString().split(" ");
        classes = classes.flat().filter((c)=>c);
        element.classList.remove(...classes);
        return element;
    }
    /**
   * When only one argument is present: Toggle class value;
   * i.e., if class exists then remove it and return false, if not, then add it and return true.
   * When a second argument is present:
   * If the second argument evaluates to true, add specified class value, and if it evaluates to false, remove it.
   * @param {Element} element - Element to edit classes of
   * @param {string} classname - Name of class to toggle
   * @param {boolean} [indicator] - Optional indicator for if the class should be toggled
   * @returns {Element} - `element` to allow for chaining
   */ static toggleClass(element, classname, indicator) {
        classname = classname.toString().split(" ").filter((c)=>c);
        if (typeof indicator !== "undefined") classname.forEach((c)=>element.classList.toggle(c, indicator));
        else classname.forEach((c)=>element.classList.toggle(c));
        return element;
    }
    /**
   * Checks if an element has a specific class
   * @param {Element} element - Element to edit classes of
   * @param {string} classname - Name of class to check
   * @returns {boolean} - `true` if the element has the class, `false` otherwise.
   */ static hasClass(element, classname) {
        return classname.toString().split(" ").filter((c)=>c).every((c)=>element.classList.contains(c));
    }
    /**
   * Replaces one class with another
   * @param {Element} element - Element to edit classes of
   * @param {string} oldName - Name of class to replace
   * @param {string} newName - New name for the class
   * @returns {Element} - `element` to allow for chaining
   */ static replaceClass(element, oldName, newName) {
        element.classList.replace(oldName, newName);
        return element;
    }
    /**
   * Appends `thisNode` to `thatNode`
   * @param {Node} thisNode - Node to be appended to another node
   * @param {Node} thatNode - Node for `thisNode` to be appended to
   * @returns {Node} - `thisNode` to allow for chaining
   */ static appendTo(thisNode, thatNode) {
        if (typeof thatNode == "string") thatNode = this.query(thatNode);
        if (!thatNode) return null;
        thatNode.append(thisNode);
        return thisNode;
    }
    /**
   * Prepends `thisNode` to `thatNode`
   * @param {Node} thisNode - Node to be prepended to another node
   * @param {Node} thatNode - Node for `thisNode` to be prepended to
   * @returns {Node} - `thisNode` to allow for chaining
   */ static prependTo(thisNode, thatNode) {
        if (typeof thatNode == "string") thatNode = this.query(thatNode);
        if (!thatNode) return null;
        thatNode.prepend(thisNode);
        return thisNode;
    }
    /**
   * Insert after a specific element, similar to jQuery's `thisElement.insertAfter(otherElement)`.
   * @param {Node} thisNode - The node to insert
   * @param {Node} targetNode - Node to insert after in the tree
   * @returns {Node} - `thisNode` to allow for chaining
   */ static insertAfter(thisNode, targetNode) {
        targetNode.parentNode.insertBefore(thisNode, targetNode.nextSibling);
        return thisNode;
    }
    /**
   * Insert after a specific element, similar to jQuery's `thisElement.after(newElement)`.
   * @param {Node} thisNode - The node to insert
   * @param {Node} newNode - Node to insert after in the tree
   * @returns {Node} - `thisNode` to allow for chaining
   */ static after(thisNode, newNode) {
        thisNode.parentNode.insertBefore(newNode, thisNode.nextSibling);
        return thisNode;
    }
    /**
   * Gets the next sibling element that matches the selector.
   * @param {Element} element - Element to get the next sibling of
   * @param {string} [selector=""] - Optional selector
   * @returns {Element} - The sibling element
   */ static next(element, selector = "") {
        return selector ? element.querySelector("+ " + selector) : element.nextElementSibling;
    }
    /**
   * Gets all subsequent siblings.
   * @param {Element} element - Element to get next siblings of
   * @returns {NodeList} - The list of siblings
   */ static nextAll(element) {
        return element.querySelectorAll("~ *");
    }
    /**
   * Gets the subsequent siblings until an element matches the selector.
   * @param {Element} element - Element to get the following siblings of
   * @param {string} selector - Selector to stop at
   * @returns {Array<Element>} - The list of siblings
   */ static nextUntil(element, selector) {
        const next = [];
        while(element.nextElementSibling && !element.nextElementSibling.matches(selector))next.push(element = element.nextElementSibling);
        return next;
    }
    /**
   * Gets the previous sibling element that matches the selector.
   * @param {Element} element - Element to get the previous sibling of
   * @param {string} [selector=""] - Optional selector
   * @returns {Element} - The sibling element
   */ static previous(element, selector = "") {
        const previous = element.previousElementSibling;
        if (selector) return previous && previous.matches(selector) ? previous : null;
        return previous;
    }
    /**
   * Gets all preceeding siblings.
   * @param {Element} element - Element to get preceeding siblings of
   * @returns {NodeList} - The list of siblings
   */ static previousAll(element) {
        const previous = [];
        while(element.previousElementSibling)previous.push(element = element.previousElementSibling);
        return previous;
    }
    /**
   * Gets the preceeding siblings until an element matches the selector.
   * @param {Element} element - Element to get the preceeding siblings of
   * @param {string} selector - Selector to stop at
   * @returns {Array<Element>} - The list of siblings
   */ static previousUntil(element, selector) {
        const previous = [];
        while(element.previousElementSibling && !element.previousElementSibling.matches(selector))previous.push(element = element.previousElementSibling);
        return previous;
    }
    /**
   * Find which index in children a certain node is. Similar to jQuery's `$.index()`
   * @param {HTMLElement} node - The node to find its index in parent
   * @returns {number} Index of the node
   */ static indexInParent(node) {
        const children = node.parentNode.childNodes;
        let num = 0;
        for(let i = 0; i < children.length; i++){
            if (children[i] == node) return num;
            if (children[i].nodeType == 1) num++;
        }
        return -1;
    }
    /** Shorthand for {@link module:DOMTools.indexInParent} */ static index(node) {
        return this.indexInParent(node);
    }
    /**
   * Gets the parent of the element if it matches the selector,
   * otherwise returns null.
   * @param {Element} element - Element to get parent of
   * @param {string} [selector=""] - Selector to match parent
   * @returns {(Element|null)} - The sibling element or null
   */ static parent(element, selector = "") {
        return !selector || element.parentElement.matches(selector) ? element.parentElement : null;
    }
    /**
   * Gets all children of Element that match the selector if provided.
   * @param {Element} element - Element to get all children of
   * @param {string} selector - Selector to match the children to
   * @returns {Array<Element>} - The list of children
   */ static findChild(element, selector) {
        return element.querySelector(":scope > " + selector);
    }
    /**
   * Gets all children of Element that match the selector if provided.
   * @param {Element} element - Element to get all children of
   * @param {string} selector - Selector to match the children to
   * @returns {Array<Element>} - The list of children
   */ static findChildren(element, selector) {
        return element.querySelectorAll(":scope > " + selector);
    }
    /**
   * Gets all ancestors of Element that match the selector if provided.
   * @param {Element} element - Element to get all parents of
   * @param {string} [selector=""] - Selector to match the parents to
   * @returns {Array<Element>} - The list of parents
   */ static parents(element, selector = "") {
        const parents = [];
        if (selector) while(element.parentElement && element.parentElement.closest(selector))parents.push(element = element.parentElement.closest(selector));
        else while(element.parentElement)parents.push(element = element.parentElement);
        return parents;
    }
    /**
   * Gets the ancestors until an element matches the selector.
   * @param {Element} element - Element to get the ancestors of
   * @param {string} selector - Selector to stop at
   * @returns {Array<Element>} - The list of parents
   */ static parentsUntil(element, selector) {
        const parents = [];
        while(element.parentElement && !element.parentElement.matches(selector))parents.push(element = element.parentElement);
        return parents;
    }
    /**
   * Gets all siblings of the element that match the selector.
   * @param {Element} element - Element to get all siblings of
   * @param {string} [selector="*"] - Selector to match the siblings to
   * @returns {Array<Element>} - The list of siblings
   */ static siblings(element, selector = "*") {
        return Array.from(element.parentElement.children).filter((e)=>e != element && e.matches(selector));
    }
    /**
   * Sets or gets css styles for a specific element. If `value` is provided
   * then it sets the style and returns the element to allow for chaining,
   * otherwise returns the style.
   * @param {Element} element - Element to set the CSS of
   * @param {string} attribute - Attribute to get or set
   * @param {string} [value] - Value to set for attribute
   * @returns {Element|string} - When setting a value, element is returned for chaining, otherwise the value is returned.
   */ static css(element, attribute, value) {
        if (typeof value == "undefined") return global.getComputedStyle(element)[attribute];
        element.style[attribute] = value;
        return element;
    }
    /**
   * Sets or gets the width for a specific element. If `value` is provided
   * then it sets the width and returns the element to allow for chaining,
   * otherwise returns the width.
   * @param {Element} element - Element to set the CSS of
   * @param {string} [value] - Width to set
   * @returns {Element|string} - When setting a value, element is returned for chaining, otherwise the value is returned.
   */ static width(element, value) {
        if (typeof value == "undefined") return parseInt(getComputedStyle(element).width);
        element.style.width = value;
        return element;
    }
    /**
   * Sets or gets the height for a specific element. If `value` is provided
   * then it sets the height and returns the element to allow for chaining,
   * otherwise returns the height.
   * @param {Element} element - Element to set the CSS of
   * @param {string} [value] - Height to set
   * @returns {Element|string} - When setting a value, element is returned for chaining, otherwise the value is returned.
   */ static height(element, value) {
        if (typeof value == "undefined") return parseInt(getComputedStyle(element).height);
        element.style.height = value;
        return element;
    }
    /**
   * Sets the inner text of an element if given a value, otherwise returns it.
   * @param {Element} element - Element to set the text of
   * @param {string} [text] - Content to set
   * @returns {string} - Either the string set by this call or the current text content of the node.
   */ static text(element, text) {
        if (typeof text == "undefined") return element.textContent;
        return element.textContent = text;
    }
    /**
   * Returns the innerWidth of the element.
   * @param {Element} element - Element to retrieve inner width of
   * @return {number} - The inner width of the element.
   */ static innerWidth(element) {
        return element.clientWidth;
    }
    /**
   * Returns the innerHeight of the element.
   * @param {Element} element - Element to retrieve inner height of
   * @return {number} - The inner height of the element.
   */ static innerHeight(element) {
        return element.clientHeight;
    }
    /**
   * Returns the outerWidth of the element.
   * @param {Element} element - Element to retrieve outer width of
   * @return {number} - The outer width of the element.
   */ static outerWidth(element) {
        return element.offsetWidth;
    }
    /**
   * Returns the outerHeight of the element.
   * @param {Element} element - Element to retrieve outer height of
   * @return {number} - The outer height of the element.
   */ static outerHeight(element) {
        return element.offsetHeight;
    }
    /**
   * Gets the offset of the element in the page.
   * @param {Element} element - Element to get offset of
   * @return {Offset} - The offset of the element
   */ static offset(element) {
        return element.getBoundingClientRect();
    }
    static get listeners() {
        return this._listeners || (this._listeners = {});
    }
    /**
   * This is similar to jQuery's `on` function and can *hopefully* be used in the same way.
   *
   * Rather than attempt to explain, I'll show some example usages.
   *
   * The following will add a click listener (in the `myPlugin` namespace) to `element`.
   * `DOMTools.on(element, "click.myPlugin", () => {console.log("clicked!");});`
   *
   * The following will add a click listener (in the `myPlugin` namespace) to `element` that only fires when the target is a `.block` element.
   * `DOMTools.on(element, "click.myPlugin", ".block", () => {console.log("clicked!");});`
   *
   * The following will add a click listener (without namespace) to `element`.
   * `DOMTools.on(element, "click", () => {console.log("clicked!");});`
   *
   * The following will add a click listener (without namespace) to `element` that only fires once.
   * `const cancel = DOMTools.on(element, "click", () => {console.log("fired!"); cancel();});`
   *
   * @param {Element} element - Element to add listener to
   * @param {string} event - Event to listen to with option namespace (e.g. "event.namespace")
   * @param {(string|callable)} delegate - Selector to run on element to listen to
   * @param {callable} [callback] - Function to fire on event
   * @returns {module:DOMTools~CancelListener} - A function that will undo the listener
   */ static on(element, event, delegate, callback) {
        const [type, namespace] = event.split(".");
        const hasDelegate = delegate && callback;
        if (!callback) callback = delegate;
        const eventFunc = !hasDelegate ? callback : function(ev) {
            if (ev.target.matches(delegate)) {
                callback(ev);
            }
        };
        element.addEventListener(type, eventFunc);
        const cancel = ()=>{
            element.removeEventListener(type, eventFunc);
        };
        if (namespace) {
            if (!this.listeners[namespace]) this.listeners[namespace] = [];
            const newCancel = ()=>{
                cancel();
                this.listeners[namespace].splice(this.listeners[namespace].findIndex((l)=>l.event == type && l.element == element), 1);
            };
            this.listeners[namespace].push({
                event: type,
                element: element,
                cancel: newCancel
            });
            return newCancel;
        }
        return cancel;
    }
    /**
   * Functionality for this method matches {@link module:DOMTools.on} but automatically cancels itself
   * and removes the listener upon the first firing of the desired event.
   *
   * @param {Element} element - Element to add listener to
   * @param {string} event - Event to listen to with option namespace (e.g. "event.namespace")
   * @param {(string|callable)} delegate - Selector to run on element to listen to
   * @param {callable} [callback] - Function to fire on event
   * @returns {module:DOMTools~CancelListener} - A function that will undo the listener
   */ static once(element, event, delegate, callback) {
        const [type, namespace] = event.split(".");
        const hasDelegate = delegate && callback;
        if (!callback) callback = delegate;
        const eventFunc = !hasDelegate ? function(ev) {
            callback(ev);
            element.removeEventListener(type, eventFunc);
        } : function(ev) {
            if (!ev.target.matches(delegate)) return;
            callback(ev);
            element.removeEventListener(type, eventFunc);
        };
        element.addEventListener(type, eventFunc);
        const cancel = ()=>{
            element.removeEventListener(type, eventFunc);
        };
        if (namespace) {
            if (!this.listeners[namespace]) this.listeners[namespace] = [];
            const newCancel = ()=>{
                cancel();
                this.listeners[namespace].splice(this.listeners[namespace].findIndex((l)=>l.event == type && l.element == element), 1);
            };
            this.listeners[namespace].push({
                event: type,
                element: element,
                cancel: newCancel
            });
            return newCancel;
        }
        return cancel;
    }
    static __offAll(event, element) {
        const [type, namespace] = event.split(".");
        let matchFilter = (listener)=>listener.event == type, defaultFilter = (_)=>_;
        if (element) {
            matchFilter = (l)=>l.event == type && l.element == element;
            defaultFilter = (l)=>l.element == element;
        }
        const listeners = this.listeners[namespace] || [];
        const list = type ? listeners.filter(matchFilter) : listeners.filter(defaultFilter);
        for(let c = 0; c < list.length; c++)list[c].cancel();
    }
    /**
   * This is similar to jQuery's `off` function and can *hopefully* be used in the same way.
   *
   * Rather than attempt to explain, I'll show some example usages.
   *
   * The following will remove a click listener called `onClick` (in the `myPlugin` namespace) from `element`.
   * `DOMTools.off(element, "click.myPlugin", onClick);`
   *
   * The following will remove a click listener called `onClick` (in the `myPlugin` namespace) from `element` that only fired when the target is a `.block` element.
   * `DOMTools.off(element, "click.myPlugin", ".block", onClick);`
   *
   * The following will remove a click listener (without namespace) from `element`.
   * `DOMTools.off(element, "click", onClick);`
   *
   * The following will remove all listeners in namespace `myPlugin` from `element`.
   * `DOMTools.off(element, ".myPlugin");`
   *
   * The following will remove all click listeners in namespace `myPlugin` from *all elements*.
   * `DOMTools.off("click.myPlugin");`
   *
   * The following will remove all listeners in namespace `myPlugin` from *all elements*.
   * `DOMTools.off(".myPlugin");`
   *
   * @param {(Element|string)} element - Element to remove listener from
   * @param {string} [event] - Event to listen to with option namespace (e.g. "event.namespace")
   * @param {(string|callable)} [delegate] - Selector to run on element to listen to
   * @param {callable} [callback] - Function to fire on event
   * @returns {Element} - The original element to allow for chaining
   */ static off(element, event, delegate, callback) {
        if (typeof element == "string") return this.__offAll(element);
        const [type, namespace] = event.split(".");
        if (namespace) return this.__offAll(event, element);
        const hasDelegate = delegate && callback;
        if (!callback) callback = delegate;
        const eventFunc = !hasDelegate ? callback : function(ev) {
            if (ev.target.matches(delegate)) {
                callback(ev);
            }
        };
        element.removeEventListener(type, eventFunc);
        return element;
    }
    /**
   * Adds a listener for when the node is added/removed from the document body.
   * The listener is automatically removed upon firing.
   * @param {HTMLElement} node - node to wait for
   * @param {callable} callback - function to be performed on event
   * @param {boolean} onMount - determines if it should fire on Mount or on Unmount
   */ static onMountChange(node, callback, onMount = true) {
        const wrappedCallback = ()=>{
            this.observer.unsubscribe(wrappedCallback);
            callback();
        };
        this.observer.subscribe(wrappedCallback, (mutation)=>{
            const nodes = Array.from(onMount ? mutation.addedNodes : mutation.removedNodes);
            const directMatch = nodes.indexOf(node) > -1;
            const parentMatch = nodes.some((parent)=>parent.contains(node));
            return directMatch || parentMatch;
        });
        return node;
    }
    /** Shorthand for {@link module:DOMTools.onMountChange} with third parameter `true` */ static onMount(node, callback) {
        return this.onMountChange(node, callback);
    }
    /** Shorthand for {@link module:DOMTools.onMountChange} with third parameter `false` */ static onUnmount(node, callback) {
        return this.onMountChange(node, callback, false);
    }
    /** Alias for {@link module:DOMTools.onMount} */ static onAdded(node, callback) {
        return this.onMount(node, callback);
    }
    /** Alias for {@link module:DOMTools.onUnmount} */ static onRemoved(node, callback) {
        return this.onUnmount(node, callback, false);
    }
    /**
   * Helper function which combines multiple elements into one parent element
   * @param {Array<HTMLElement>} elements - array of elements to put into a single parent
   */ static wrap(elements) {
        const domWrapper = this.parseHTML(`<div class="dom-wrapper"></div>`);
        for(let e = 0; e < elements.length; e++)domWrapper.appendChild(elements[e]);
        return domWrapper;
    }
    /**
   * Resolves the node to an HTMLElement. This is mainly used by library modules.
   * @param {(jQuery|Element)} node - node to resolve
   */ static resolveElement(node) {
        try {
            if (!(node instanceof window.jQuery) && !(node instanceof Element)) return undefined;
            return node instanceof window.jQuery ? node[0] : node;
        } catch  {
            return node;
        }
    }
};

;// CONCATENATED MODULE: ../../packages/bdlib/src/modules/discordselectors.ts
//@ts-nocheck


const getSelectorAll = function(prop) {
    if (!this.hasOwnProperty(prop)) return "";
    return `.${this[prop].split(" ").join(".")}`;
};
const getSelector = function(prop) {
    if (!this.hasOwnProperty(prop)) return "";
    return `.${this[prop].split(" ")[0]}`;
};
/**
 * Gives us a way to retrieve the internal classes as selectors without
 * needing to concatenate strings or use string templates. Wraps the
 * selector in {@link module:DOMTools.Selector} which adds features but can
 * still be used in native function.
 *
 * For a list of all available class namespaces check out {@link module:DiscordClassModules}.
 *
 * @see module:DiscordClassModules
 * @module DiscordSelectors
 */ const DiscordSelectors = new Proxy(discordclassmodules, {
    get: function(list, item) {
        if (item == "getSelectorAll" || item == "getSelector") return (module, prop)=>DiscordSelectors[module][item]([
                prop
            ]);
        if (list[item] === undefined) return new Proxy({}, {
            get: function() {
                return "";
            }
        });
        return new Proxy(list[item], {
            get: function(obj, prop) {
                if (prop == "getSelectorAll") return getSelectorAll.bind(obj);
                if (prop == "getSelector") return getSelector.bind(obj);
                if (!obj.hasOwnProperty(prop)) return "";
                return new domtools_DOMTools.Selector(obj[prop]);
            }
        });
    }
});
/* harmony default export */ const discordselectors = (DiscordSelectors);

;// CONCATENATED MODULE: ../../packages/bdlib/src/modules/reactcomponents.ts
//@ts-nocheck
/**
 * BetterDiscord React Component Manipulations
 * Original concept and some code by samogot - https://github.com/samogot / https://github.com/samogot/betterdiscord-plugins/tree/master/v2/1Lib%20Discord%20Internals
 *
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ 




class ReactComponent {
    constructor(id, component, selector, filter){
        this.id = id;
        this.component = component;
        this.selector = selector;
        this.filter = filter;
    }
    forceUpdateAll() {
        if (!this.selector) return;
        for (const e of document.querySelectorAll(this.selector)){
            const stateNode = Utilities.findInTree(ReactTools.getReactInstance(e), (m)=>m && m.forceUpdate, {
                walkable: [
                    "return",
                    "stateNode"
                ]
            });
            if (!stateNode) continue;
            stateNode.forceUpdate();
        }
    }
}
/**
 * Methods for obtaining and interacting with react components.
 * @module ReactComponents
 */ class ReactComponents {
    static get components() {
        return this._components || (this._components = new Map());
    }
    static get unknownComponents() {
        return this._unknownComponents || (this._unknownComponents = new Set());
    }
    static get listeners() {
        return this._listeners || (this._listeners = new Map());
    }
    static get nameSetters() {
        return this._nameSetters || (this._nameSetters = new Set());
    }
    static get ReactComponent() {
        return ReactComponent;
    }
    static initialize() {
        ReactAutoPatcher.autoUnpatch();
        ReactAutoPatcher.autoPatch();
        ReactAutoPatcher.processAll();
    }
    static push(component, selector, filter) {
        if (typeof component !== "function") return null;
        const { displayName  } = component;
        if (!displayName) return this.processUnknown(component);
        const have = this.components.get(displayName);
        if (have) {
            if (!have.selector) have.selector = selector;
            if (!have.filter) have.filter = filter;
            return component;
        }
        const c = new ReactComponent(displayName, component, selector, filter);
        this.components.set(c.id, c);
        const listener = this.listeners.get(displayName);
        if (listener) {
            for (const l of listener.children)l(c);
            this.listeners.delete(listener);
        }
        return c;
    }
    /**
   * Finds a component from the components array or by waiting for it to be mounted.
   * @param {String} name The component's name
   * @param {Object} selector A selector to look for
   * @return {Promise<ReactComponent>}
   */ static async getComponentByName(name, selector) {
        return this.getComponent(name, selector, (m)=>m.displayName == name);
    }
    /**
   * Finds a component from the components array or by waiting for it to be mounted.
   * @param {String} name The component's name
   * @param {Object} selector A selector to look for
   * @param {Function} filter A function to filter components if a single element is rendered by multiple components
   * @return {Promise<ReactComponent>}
   */ static async getComponent(name, selector, filter) {
        const have = this.components.get(name);
        if (have) {
            if (!have.selector) have.selector = selector;
            if (!have.filter) have.filter = filter;
            return have;
        }
        if (selector) {
            const callback = ()=>{
                if (this.components.get(name)) {
                    DOMTools.observer.unsubscribe(observerSubscription);
                    return;
                }
                const elements = document.querySelectorAll(selector);
                if (!elements.length) return;
                let component;
                for (const element of elements){
                    const componentsFound = ReactTools.getComponents(element);
                    component = filter ? componentsFound.find(filter) : componentsFound[0];
                    if (component) break;
                }
                console.log(component);
                if (!component && filter) return;
                DOMTools.observer.unsubscribe(observerSubscription);
                if (!component) return;
                if (!component.displayName) component.displayName = name;
                this.push(component, selector, filter);
            };
            const observerSubscription = DOMTools.observer.subscribeToQuerySelector(callback, selector, null, true);
            setTimeout(callback, 0);
        }
        let listener = this.listeners.get(name);
        if (!listener) {
            listener = {
                id: name,
                children: [],
                filter
            };
            this.listeners.set(name, listener);
        }
        return new Promise((resolve)=>{
            listener.children.push(resolve);
        });
    }
    static setName(name, filter) {
        const have = this.components.get(name);
        if (have) return have;
        for (const component of this.unknownComponents.entries()){
            if (!filter(component)) continue;
            component.displayName = name;
            this.unknownComponents.delete(component);
            return this.push(component);
        }
        return this.nameSetters.add({
            name,
            filter
        });
    }
    static processUnknown(component) {
        const have = this.unknownComponents.has(component);
        for (const setter of this.nameSetters.entries()){
            if (setter.filter.filter(component)) {
                component.displayName = setter.name;
                this.nameSetters.delete(setter);
                return this.push(component);
            }
        }
        if (have) return have;
        this.unknownComponents.add(component);
        return component;
    }
    static *recursiveComponents(internalInstance = ReactTools.rootInstance) {
        if (internalInstance.stateNode) yield internalInstance.stateNode;
        if (internalInstance.sibling) yield* this.recursiveComponents(internalInstance.sibling);
        if (internalInstance.child) yield* this.recursiveComponents(internalInstance.child);
    }
};
class ReactAutoPatcher {
    /**
   * Wait for React to be loaded and patch it's createElement to store all unknown components.
   * Also patches some known components.
   */ static async autoPatch() {
        this.autoUnpatch();
        Patcher.before("ReactComponents", Modules.React, "createElement", (react, [component])=>ReactComponents.push(component));
        Patcher.instead("ReactComponents", Modules.React.Component.prototype, "UNSAFE_componentWillMount", (component)=>ReactComponents.push(component));
        Patcher.instead("ReactComponents", Modules.React.Component.prototype, "componentWillMount", (component)=>ReactComponents.push(component));
    }
    static async autoUnpatch() {
        Patcher.unpatchAll("ReactComponents");
    }
    /**
   * Finds and processes all currently available react components.
   */ static processAll() {
        for (const component of ReactComponents.recursiveComponents()){
            ReactComponents.push(component.constructor);
        }
    }
}

;// CONCATENATED MODULE: ../../packages/bdlib/src/modules/pluginutilities.ts
//@ts-nocheck


/**
 * A series of useful functions for BetterDiscord plugins.
 * @module PluginUtilities
 * @deprecated 1/21/22 Use Alternatives
 */ class PluginUtilities {
    /**
     * Loads data through BetterDiscord's API.
     * @param {string} name - name for the file (usually plugin name)
     * @param {string} key - which key the data is saved under
     * @param {object} defaultData - default data to populate the object with
     * @returns {object} the combined saved and default data
     * @deprecated 1/21/22 Use Utilities or BdApi directly
    */ static loadData(name, key, defaultData) {
        return Utilities.loadData(name, key, defaultData);
    }
    /**
     * Saves data through BetterDiscord's API.
     * @param {string} name - name for the file (usually plugin name)
     * @param {string} key - which key the data should be saved under
     * @param {object} data - data to save
     * @deprecated 1/21/22 Use Utilities or BdApi directly
    */ static saveData(name, key, data) {
        return Utilities.saveData(name, key, data);
    }
    /**
     * Loads settings through BetterDiscord's API.
     * @param {string} name - name for the file (usually plugin name)
     * @param {object} defaultData - default data to populate the object with
     * @returns {object} the combined saved and default settings
     * @deprecated 1/21/22 Use Utilities or BdApi directly
    */ static loadSettings(name, defaultSettings) {
        return Utilities.loadSettings(name, defaultSettings);
    }
    /**
     * Saves settings through BetterDiscord's API.
     * @param {string} name - name for the file (usually plugin name)
     * @param {object} data - settings to save
     * @deprecated 1/21/22 Use Utilities or BdApi directly
    */ static saveSettings(name, data) {
        return Utilities.saveSettings(name, data);
    }
    /**
     * Get the full path to the BetterDiscord folder.
     * @returns {string} full path to the BetterDiscord folder
     * @deprecated 1/21/22 Use BdApi
     */ static getBDFolder(subtarget = "") {
        const process = require("process");
        const path = require("path");
        if (process.env.injDir) return path.resolve(process.env.injDir, subtarget);
        switch(process.platform){
            case "win32":
                return path.resolve(process.env.APPDATA, "BetterDiscord/", subtarget);
            case "darwin":
                return path.resolve(process.env.HOME, "Library/Application Support/", "BetterDiscord/", subtarget);
            default:
                return path.resolve(process.env.XDG_CONFIG_HOME ? process.env.XDG_CONFIG_HOME : process.env.HOME + "/.config", "BetterDiscord/", subtarget);
        }
    }
    /**
     * Get the full path to the plugins folder.
     * @returns {string} full path to the plugins folder
     * @deprecated 1/21/22 Use BdApi
     */ static getPluginsFolder() {
        return BdApi.Plugins.folder;
    }
    /**
     * Get the full path to the themes folder.
     * @returns {string} full path to the themes folder
     * @deprecated 1/21/22 Use BdApi
     */ static getThemesFolder() {
        return BdApi.Themes.folder;
    }
    /**
     * Adds a callback to a set of listeners for onSwitch.
     * @param {callable} callback - basic callback to happen on channel switch
     * @deprecated 1/21/22 Use onSwitch
     */ static addOnSwitchListener() {}
    /**
     * Removes the listener added by {@link InternalUtilities.addOnSwitchListener}.
     * @param {callable} callback - callback to remove from the listener list
     * @deprecated 1/21/22 Use onSwitch
     */ static removeOnSwitchListener() {}
    /**
     * Adds a style to the document.
     * @param {string} id - identifier to use as the element id
     * @param {string} css - css to add to the document
     * @deprecated 1/21/22 Use DOMTools
     */ static addStyle(id, css) {
        return DOMTools.addStyle(id, css);
    }
    /**
     * Removes a style from the document.
     * @param {string} id - original identifier used
     * @deprecated 1/21/22 Use DOMTools
     */ static removeStyle(id) {
        return DOMTools.removeStyle(id);
    }
    /**
     * Adds/requires a remote script to be loaded
     * @param {string} id - identifier to use for this script
     * @param {string} url - url from which to load the script
     * @returns {Promise} promise that resolves when the script is loaded
     * @deprecated 1/21/22 Use DOMTools
     */ static addScript(id, url) {
        return DOMTools.addScript(id, url);
    }
    /**
     * Removes a remote script from the document.
     * @param {string} id - original identifier used
     * @deprecated 1/21/22 Use DOMTools
     */ static removeScript(id) {
        return DOMTools.removeScript(id);
    }
};

;// CONCATENATED MODULE: ../../packages/bdlib/src/modules/index.ts

















;// CONCATENATED MODULE: external "child_process"
const external_child_process_namespaceObject = require("child_process");
;// CONCATENATED MODULE: external "path"
const external_path_namespaceObject = require("path");
;// CONCATENATED MODULE: ./src/paths.ts


const captureBinFolder = (0,external_path_namespaceObject.join)(__dirname, "screen-capture");
const captureBinExePath = (0,external_path_namespaceObject.join)(captureBinFolder, "main.exe");
const captureVersionPath = (0,external_path_namespaceObject.join)(captureBinFolder, "version.txt");
const captureSfxPath = (0,external_path_namespaceObject.join)(__dirname, "capture-win64.sfx.exe");
const configPath = (0,external_path_namespaceObject.join)(__dirname, "Screensharing.config.json");
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
    bitrate: 15388600,
    resolution: "1920x1080",
    framerate: 90,
    encoder: "nvenc",
    threads: 4,
    server_url: "http://0.tunnelr.co:4000/api"
};
const saveSettings = (newState)=>{
    BdApi.setData("Screensharing", "settings", typeof newState === "function" ? newState(getSettings()) : {
        ...defaults,
        ...newState
    });
    return getSettings();
};
const getSettings = ()=>{
    const data = BdApi.getData("Screensharing", "settings");
    return {
        ...defaults,
        ...data
    };
};
const getSettingsPanel = ()=>{
    const settings = getSettings();
    return settingpanel.build(()=>saveSettings(settings), new textbox("Resolution", "", settings.resolution, (e)=>{
        settings.resolution = e;
    }), new textbox("Bitrate", "", String(settings.bitrate), (e)=>{
        settings.bitrate = Number(e);
    }), new textbox("Framerate", "", String(settings.framerate), (e)=>{
        settings.framerate = Number(e);
    }), new types_switch("Remote control", "", settings.remote_enabled, (e)=>{
        settings.remote_enabled = e;
    }), new types_switch("Peer to peer", "", settings.direct_connect, (e)=>{
        settings.direct_connect = e;
    }), new radiogroup("Encoder", "", settings.encoder, [
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

;// CONCATENATED MODULE: ./src/button.ts




const id = "nitedani-stream-toggle";
const buttonContainerSelector = "section[aria-label='User area']";
const isMounted = ()=>document.querySelector("#" + id);
let observerSubscription = null;
let buttonEl = null;
const mountButton = async ()=>{
    const el = await waitForSelector(buttonContainerSelector);
    const running = isRunning();
    if (isMounted()) {
        return;
    }
    buttonEl = document.createElement("button");
    buttonEl.innerText = running ? "Stop" : "Start";
    buttonEl.id = id;
    buttonEl.addEventListener("click", ()=>{
        if (running) {
            stopCapture();
            buttonEl.innerText = "Start";
        } else {
            const settings = saveSettings((state)=>({
                    ...state,
                    stream_id: random()
                }));
            startCapture();
            discordmodules.ElectronModule.copy(`${settings.server_url.replace("/api", "")}/stream/${settings.stream_id}`);
            BdApi.showToast("Stream URL copied to clipboard");
            buttonEl.innerText = "Stop";
        }
    });
    el.appendChild(buttonEl);
    observerSubscription ??= domtools_DOMTools.observer.subscribeToQuerySelector(()=>mountButton(), buttonContainerSelector, null, true);
};
const unmountButton = ()=>{
    if (observerSubscription) {
        domtools_DOMTools.observer.unsubscribe(observerSubscription);
    }
    const el = isMounted();
    if (!el) {
        return;
    }
    el.remove();
};

;// CONCATENATED MODULE: external "fs"
const external_fs_namespaceObject = require("fs");
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
const package_namespaceObject = {"i8":"0.0.3"};
;// CONCATENATED MODULE: ./src/index.tsx






const config = {
    info: {
        name: "Screen sharing",
        authors: [
            {
                name: "nitedani",
                discord_id: "148196158357897216",
                github_username: "nitedani"
            }, 
        ],
        version: package_namespaceObject.i8,
        description: "Screen sharing",
        github: "https://github.com/nitedani/better-discord-screenshare",
        github_raw: "https://raw.githubusercontent.com/nitedani/better-discord-screenshare/main/apps/screensharing/dist/Screensharing.plugin.js"
    }
};
const BasePlugin = structs_plugin(config);
class ScreensharingPlugin extends BasePlugin {
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

module.exports["default"] = __webpack_exports__["default"];
/******/ })()
;