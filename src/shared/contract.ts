// 双半共享契约常量（再导出 invariant + 真实 slot 名）
export {
	RPC_PREFIX,
	PROTOCOL_VERSION,
	MAIN_PANEL_ID,
	RPC_METHOD,
} from "./invariant.js";

/** 客户端真实 slot 名（DSH 0.1.0-rc.7 实测，见 design.md 4.5）。 */
export const SLOT = {
	/** 全局浮层（list，additive）：编辑器面板容器。 */
	OVERLAY: "shell.overlay",
	/** 侧栏底部动作区（list）：编辑器入口。 */
	SIDEBAR_ACTION: "sidebar.footer.action",
} as const;
