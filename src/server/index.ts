// dsh-compose-studio —— 服务端入口（Cordis 插件）
// DSH 0.2.2：服务注入用 ctx.inject([...], callback) 命令式（替代 export const inject）；
// 配置 schema 通过插件的 Config 导出由框架自动读取。
import { defineTool } from "@deepseek-ai/dsh-tools";
import type { Context } from "@deepseek-ai/cordis";
// 宿主包通过 declare module 扩充 Context，side-effect import 触发类型加载
import "@deepseek-ai/dsh-host-webserver";
import "@deepseek-ai/dsh-llm";
import "@deepseek-ai/dsh-settings";
import { RPC_PREFIX, PROTOCOL_VERSION, MAIN_PANEL_ID } from "../shared/invariant.js";
import { ConfigSchema, type Config } from "./config.js";

// 配置 schema（框架自动读取；可调参数统一暴露）
export { ConfigSchema as Config };

/**
 * Cordis 插件入口。
 * @param ctx - 宿主上下文。
 * @param config - 解析后的配置（由 ConfigSchema 校验）。
 */
export function apply(ctx: Context, config: Config) {
	void config;
	// 注意：0.2.2 服务名列表无 "llm"（Phase 3 需要时调研正确服务名，可能是 "agents"）
	ctx.inject(["tools", "webServer"], (child) => {
		// --- 工具：打开可视化编辑器 ---
		child.effect(
			() =>
				child.tools.register(
					defineTool({
						name: "compose_studio_open",
						description:
							"Open the Compose Studio visual editor in the DSH main panel. " +
							"Use when the user wants to visually design, drag-and-drop, or inspect a Jetpack Compose screen, " +
							"or when they ask to generate Compose UI from a description.",
						parameters: {
							documentId: {
								type: "string",
								description:
									"Optional document id to load. Omit to open a new document.",
							},
						},
						output: {
							schema: {
								type: "object",
								additionalProperties: false,
								properties: {
									opened: {
										type: "boolean",
										required: true,
										description: "Whether the studio was opened.",
									},
								},
							},
							render: (_args, v) => [
								{
									type: "text",
									text: v.opened
										? "Compose Studio opened."
										: "Failed to open Compose Studio.",
								},
							],
						},
						execute: async () => {
							// 客户端订阅面板选择状态；服务端仅确认可打开。
							return { opened: true };
						},
					}),
				),
			"compose-studio: tool compose_studio_open",
		);

		// --- RPC 路由：/compose-studio/* ---
		child.effect(
			() =>
				child.webServer.register({
					kind: "prefix",
					path: RPC_PREFIX,
					handler: async (req, res) => {
						const pathname = new URL(
							req.url ?? "/",
							"http://dsh.internal",
						).pathname;
						if (pathname === `${RPC_PREFIX}/ping`) {
							res.writeHead(200, { "content-type": "application/json" });
							res.end(
								JSON.stringify({
									ok: true,
									protocol: PROTOCOL_VERSION,
									panel: MAIN_PANEL_ID,
									name: "dsh-compose-studio",
								}),
							);
							return;
						}
						res.writeHead(404, {
							"content-type": "text/plain; charset=utf-8",
						});
						res.end("not found");
					},
				}),
			"compose-studio: rpc",
		);
	});
}
