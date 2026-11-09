/** 客户端 RPC 路由前缀。 */
export declare const RPC_PREFIX = "/compose-studio";
/** 客户端—服务端协议版本；破坏性变更时递增。 */
export declare const PROTOCOL_VERSION = 1;
/** 主面板 id（main keyed slot 的 key，也是侧栏 panellist 的 id）。 */
export declare const MAIN_PANEL_ID = "composeStudio";
/** RPC 方法名。 */
export declare const RPC_METHOD: {
    readonly PING: "ping";
    readonly DOC_LOAD: "doc/load";
    readonly DOC_SAVE: "doc/save";
    readonly DOC_EXPORT: "doc/export";
    readonly CODEGEN_GENERATE: "codegen/generate";
    readonly LLM_GENERATE: "llm/generate";
    readonly THEME_RESOLVE: "theme/resolve";
};
//# sourceMappingURL=invariant.d.ts.map