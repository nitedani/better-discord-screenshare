import * as Modules from "./modules";
import { Settings, Tooltip, Toasts, Popouts, Modals, DiscordContextMenu, ErrorBoundary, ColorPicker } from "./ui";
export declare const Library: {
    Components: {
        ErrorBoundary: typeof ErrorBoundary;
        ColorPicker: typeof ColorPicker;
    };
    Utilities: typeof Modules.Utilities;
    WebpackModules: typeof Modules.WebpackModules;
    Filters: typeof Modules.Filters;
    DiscordModules: any;
    ColorConverter: typeof Modules.ColorConverter;
    DOMTools: typeof Modules.DOMTools;
    DiscordClasses: any;
    DiscordSelectors: any;
    ReactTools: typeof Modules.ReactTools;
    ReactComponents: typeof Modules.ReactComponents;
    Logger: typeof Modules.Logger;
    Patcher: typeof Modules.Patcher;
    PluginUpdater: typeof Modules.PluginUpdater;
    PluginUtilities: typeof Modules.PluginUtilities;
    DiscordClassModules: any;
    Structs: typeof Modules.Structs;
    DCM: typeof DiscordContextMenu;
    ContextMenu: typeof DiscordContextMenu;
    Tooltip: typeof Tooltip;
    Toasts: typeof Toasts;
    Settings: typeof Settings;
    Popouts: typeof Popouts;
    Modals: typeof Modals;
};
export default Library;