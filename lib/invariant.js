// src/shared/invariant.ts
var RPC_PREFIX = "/compose-studio";
var PROTOCOL_VERSION = 1;
var MAIN_PANEL_ID = "composeStudio";
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
  RPC_PREFIX
};
//# sourceMappingURL=invariant.js.map
