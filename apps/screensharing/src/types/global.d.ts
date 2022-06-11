import Library from "src/types/bdlib";
export { Library };

declare global {
  const __non_webpack_require__: NodeRequire;
  type Library = typeof Library;
  var ZeresPluginLibrary: {
    buildPlugin: (config: any) => [any, typeof Library];
  };

  declare module "*.css" {
    const content: string;
    export default content;
  }
}
