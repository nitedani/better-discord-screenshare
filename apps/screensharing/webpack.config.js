import { readFileSync } from "fs";
import { dirname, join } from "path";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import { fileURLToPath } from "url";
import webpack from "webpack";
import WebpackMessages from "webpack-messages";
const __dirname = dirname(fileURLToPath(import.meta.url));
const { name, version } = JSON.parse(readFileSync("./package.json", "utf8"));

const banner = `/**
* @name ${name}
* @version "${version}"
*/
/*@cc_on
@if (@_jscript)
	
// Offer to self-install for clueless users that try to run this directly.
var shell = WScript.CreateObject("WScript.Shell");
var fs = new ActiveXObject("Scripting.FileSystemObject");
var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\\\BetterDiscord\\\\plugins");
var pathSelf = WScript.ScriptFullName;
// Put the user at ease by addressing them in the first person
shell.Popup("It looks like you've mistakenly tried to run me directly. \\n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
  shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
} else if (!fs.FolderExists(pathPlugins)) {
  shell.Popup("I can't find the BetterDiscord plugins folder.\\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
  fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
  // Show the user where to put plugins in the future
  shell.Exec("explorer " + pathPlugins);
  shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
}
WScript.Quit();

@else@*/`;

const footer = `/*@end@*/`;

process.env.NODE_ENV = "production";

const config = {
  stats: "errors-only",
  entry: join(__dirname, "src", "index.tsx"),
  mode: "production",
  target: "node",
  output: {
    path: join(__dirname, "dist"),
    filename: "Screensharing.plugin.js",
    // chunkFormat: 'module',
    library: "default",
    libraryTarget: "commonjs2",
    libraryExport: "default",
  },

  experiments: {
    // outputModule: true,
    // topLevelAwait: true,
  },
  ignoreWarnings: [
    /^(?!CriticalDependenciesWarning$)|CommonJsRequireContextDependency/,
  ],
  // externalsType: "module",
  externalsPresets: { node: true },
  module: {
    parser: {
      // javascript: { importMeta: false },
    },
    rules: [
      {
        test: /\.tsx?$/,
        loader: "swc-loader",
        options: {
          jsc: {
            parser: {
              syntax: "typescript",
              tsx: true, // If you use react
              dynamicImport: true,
              decorators: true,
            },
            target: "es2022",
            transform: {
              decoratorMetadata: true,
            },
          },
        },
      },
      { test: /\.css$/, type: "asset/source" },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".tsx", ".js", ".cjs", ".mjs", ".json", ".css"],
    plugins: [
      //@ts-ignore
      new TsconfigPathsPlugin({
        configFile: join(__dirname, "tsconfig.json"),
      }),
    ],
  },
  optimization: {
    minimize: false,
    nodeEnv: "production",
  },
  plugins: [
    new webpack.BannerPlugin({
      banner,
      raw: true,
    }),
    new webpack.BannerPlugin({
      banner: footer,
      raw: true,
      footer: true,
    }),
    new webpack.IgnorePlugin({
      checkResource(resource) {
        return ["request"].includes(resource);
      },
    }),
    new WebpackMessages({
      name: "plugin",
      logger: (str) => {
        console.log(`>> ${str}`);
      },
    }),
  ],
};

export default config;
