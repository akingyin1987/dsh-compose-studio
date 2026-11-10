// dsh-compose-studio —— 服务端入口（Cordis 插件）
import { defineTool } from "@deepseek-ai/dsh-tools";
import type { Context } from "@deepseek-ai/cordis";
// 宿主包通过 declare module 扩充 Context，side-effect import 触发类型加载
import "@deepseek-ai/dsh-host-webserver";
import "@deepseek-ai/dsh-llm";
import "@deepseek-ai/dsh-settings";
import { settingsNamespace } from "@deepseek-ai/dsh-settings";
import { RPC_PREFIX, PROTOCOL_VERSION, MAIN_PANEL_ID } from "../shared/invariant.js";
import { ConfigSchema, CONFIG_NAMESPACE, type Config } from "./config.js";

// 注意：DSH 0.1.0-rc.7 无 "workspace" 服务（宿主为 workspaceRegistry，
// 且非 inject 声明式服务）。Phase 1 需要工作区读写时再调研正确服务名。
export const inject = ["tools", "webServer", "llm", "settings"];

/**
 * Cordis 插件入口。
 * @param ctx - 宿主上下文。
 * @param config - 解析后的配置（由 ConfigSchema 校验）。
 */
export function apply(ctx: Context, config: Config) {
	// --- 配置 schema（可调参数统一暴露） ---
	// SettingsScope 随插件卸载自动清理（宿主实践：直接注册，不用 ctx.effect 包裹）
	ctx.settings.register(settingsNamespace(CONFIG_NAMESPACE), ConfigSchema);

	// --- 工具：打开可视化编辑器 ---
	ctx.effect(
		() =>
			ctx.tools.register(
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
					const pathname = new URL(
						req.url ?? "/",
						"http://dsh.internal"
					).pathname;
					if (pathname === `${RPC_PREFIX}/ping`) {
						res.writeHead(200, { "content-type": "application/json" });
						res.end(
							JSON.stringify({
								ok: true,
								protocol: PROTOCOL_VERSION,
								panel: MAIN_PANEL_ID,
								name: "dsh-compose-studio",
							})
						);
						return;
					}
					res.writeHead(404, {
						"content-type": "text/plain; charset=utf-8",
					});
					res.end("not found");
				},
			}),
		"compose-studio: rpc"
	);
}
