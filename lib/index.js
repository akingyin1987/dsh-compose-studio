// dsh-compose-studio —— 服务端入口（Cordis 插件）
import { defineTool } from "@deepseek-ai/dsh-tools";
import { RPC_PREFIX, PROTOCOL_VERSION, MAIN_PANEL_ID } from "./invariant.js";

export const inject = ["tools", "webServer", "llm", "workspace"];

/**
 * Cordis 插件入口。
 * @param {import("@deepseek-ai/cordis").Context} ctx - 宿主上下文。
 */
export function apply(ctx) {
	// --- 工具：打开可视化编辑器 ---
	ctx.effect(
		() =>
			ctx.tools.register(
				defineTool({
					name: "compose_studio_open",
					description:
						"Open the Compose Studio visual editor in the DSH main panel. " +
						"Use when the user wants to visually design, drag-and-drop, or inspect a Jetpack Compose screen, "+
						"or when they ask to generate Compose UI from a description.",
					parameters: {
						documentId: {
							type: "string",
							required: false,
							description: "Optional document id to load. Omit to open a new document."
					},
					output: {
						schema: {
							type: "object",
							additionalProperties: false,
							properties: {
								opened: { type: "boolean", required: true, description: "Whether the studio was opened." }
							}
						},
						render: (args, v) => [
							{ type: "text", text: v.opened ? "Compose Studio opened." : "Failed to open Compose Studio." }
						]
					},
					execute: async () => {
						// 客户端订阅面板选择状态；服务端仅确认可打开。
						return { opened: true };
					}
				})
			),
		"compose-studio: tool compose_studio_open"
	);

	// --- RPC 路由：/compose-studio/* ---
	ctx.effect(
		() =>
			ctx.webServer.register({
				kind: "prefix",
				path: RPC_PREFIX,
				handler: async (req, res) => {
					const pathname = new URL(req.url ?? "/", "http://dsh.internal").pathname;
					if (pathname === `${RPC_PREFIX}/ping`) {
						res.writeHead(200, { "content-type": "application/json" });
						res.end(
							JSON.stringify({
								ok: true,
								protocol: PROTOCOL_VERSION,
								panel: MAIN_PANEL_ID,
								name: "dsh-compose-studio"
							})
						);
						return;
					}
					res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
					res.end("not found");
				}
			}),
		"compose-studio: rpc"
	);
}
