import * as Modules from "./modules";
import {
  Settings,
  Tooltip,
  Toasts,
  Popouts,
  Modals,
  DiscordContextMenu,
  ErrorBoundary,
  ColorPicker,
} from "./ui";

export const Library = {
  DCM: DiscordContextMenu,
  ContextMenu: DiscordContextMenu,
  Tooltip,
  Toasts,
  Settings,
  Popouts,
  Modals,
  ...Modules,
  Components: { ErrorBoundary, ColorPicker },
};

export default Library;
