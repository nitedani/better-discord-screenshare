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
* @version ${version}
*/`;

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
