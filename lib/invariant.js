// src/shared/invariant.ts
var RPC_PREFIX = "/compose-studio";
var PROTOCOL_VERSION = 1;
var MAIN_PANEL_ID = "composeStudio";
var SLOT = {
  MAIN: "main",
  PANEL_LIST: "sidebar.panellist",
  PALETTE: "composeStudio.palette",
  CANVAS: "composeStudio.canvas",
  INSPECTOR: "composeStudio.inspector",
  THEME: "composeStudio.theme"
};
var RPC_METHOD = {
  PING: "ping",
  DOC_LOAD: "doc/load",
  DOC_SAVE: "doc/save",
  DOC_EXPORT: "doc/export",
  CODEGEN_GENERATE: "codegen/generate",
  LLM_GENERATE: "llm/generate",
  THEME_RESOLVE: "theme/resolve"
};
export {
  MAIN_PANEL_ID,
  PROTOCOL_VERSION,
  RPC_METHOD,
  RPC_PREFIX,
  SLOT
};
//# sourceMappingURL=invariant.js.map
