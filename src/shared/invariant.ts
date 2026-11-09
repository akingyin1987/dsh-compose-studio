// dsh-compose-studio —— 双半共享常量（服务端与客户端共用）
// 注意：此文件不得引入任何 Node 或浏览器专有 API。

/** 客户端 RPC 路由前缀。 */
export const RPC_PREFIX = "/compose-studio";

/** 客户端—服务端协议版本；破坏性变更时递增。 */
export const PROTOCOL_VERSION = 1;

/** 主面板 id（main keyed slot 的 key，也是侧栏 panellist 的 id）。 */
export const MAIN_PANEL_ID = "composeStudio";

// 注意：原稿的 SLOT 常量（main / sidebar.panellist / composeStudio.*）为臆测，
// DSH 0.1.0-rc.7 中不存在这些 slot。真实 slot 名直接写在 src/client/index.tsx
// 的 register 调用处（sidebar.footer.action、shell.overlay）。

/** RPC 方法名。 */
export const RPC_METHOD = {
  PING: "ping",
  DOC_LOAD: "doc/load",
  DOC_SAVE: "doc/save",
  DOC_EXPORT: "doc/export",
  CODEGEN_GENERATE: "codegen/generate",
  LLM_GENERATE: "llm/generate",
  THEME_RESOLVE: "theme/resolve",
} as const;
