// 临时调试总线（验证拖拽事件链路用，验证完成后移除）
// 事件：window CustomEvent("studio:debug")，detail 为字符串消息。
export const STUDIO_DEBUG_EVENT = "studio:debug";

export function studioDebug(msg: string): void {
	window.dispatchEvent(new CustomEvent(STUDIO_DEBUG_EVENT, { detail: msg }));
}
