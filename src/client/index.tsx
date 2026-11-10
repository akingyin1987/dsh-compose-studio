// dsh-compose-studio —— 客户端入口
// DSH 0.2.2：注册到 main slot（主面板，panel 系统），
// 通过 ctx.layout.selectPanel(id) 切换（null = 会话）。
import React, { useReducer } from "react";
import type { ClientContext } from "@deepseek-ai/dsh-client-runtime/client";
import { reducer, createInitialState } from "./store.js";
import { ComponentPalette } from "./palette/ComponentPalette.js";
import { Canvas } from "./canvas/Canvas.js";
import { Inspector } from "./inspector/Inspector.js";
import { ChatPanel } from "./chat/ChatPanel.js";
import { UI } from "./theme/ui.js";

// 扩充 SlotMap（与宿主 layout 插件声明一致）
declare module "@deepseek-ai/dsh-client-ui-slots" {
	interface SlotMap {
		/** 主面板（keyed，root）：编辑器 panel（key=composeStudio）。 */
		main: { kind: "keyed"; scope: "root" };
		/** 侧栏底部动作区（list）：编辑器入口。 */
		"sidebar.footer.action": { kind: "list"; scope: "root" };
	}
}

declare global {
	interface Window {
		__ModuleLoader__: {
			load(options: {
				id: string;
				factory: (require: (id: string) => unknown) => unknown;
			}): void;
		};
	}
}

// layout 服务最小接口（避免引入完整 layout 类型；selectPanel 切换主面板）
interface LayoutService {
	selectPanel(panelId: string | null): void;
}
declare module "@deepseek-ai/cordis" {
	interface Context {
		layout: LayoutService;
	}
}

/** panel id（MainPanelId 为 branded type，此处用字面量） */
const PANEL_ID = "composeStudio";

// --- 三栏面板（内嵌主面板，带"返回会话"按钮） ---
function ComposeStudioPanel({ onBack }: { onBack: () => void }) {
	const [state, dispatch] = useReducer(reducer, null, createInitialState);

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				width: "100%",
				height: "100%",
				background: UI.bg,
				color: UI.text,
				fontFamily: UI.fontSans,
				overflow: "hidden",
			}}
		>
			{/* 三栏区域 */}
			<div style={{ display: "flex", flex: 1, minHeight: 0 }}>
				{/* 左：组件面板 */}
				<div
					style={{ width: 240, flexShrink: 0, overflow: "hidden" }}
				>
					<ComponentPalette />
				</div>
				{/* 中：画布（含顶栏） */}
				<div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
					<div
						style={{
							height: 48,
							display: "flex",
							alignItems: "center",
							padding: `0 ${UI.space.lg}px`,
							borderBottom: `1px solid ${UI.border}`,
							background: UI.surface,
							gap: UI.space.md,
						}}
					>
						<button
							onClick={onBack}
							style={{
								border: `1px solid ${UI.border}`,
								background: UI.surfaceAlt,
								color: UI.text,
								borderRadius: UI.radius.md,
								padding: `${UI.space.xs}px ${UI.space.md}px`,
								fontSize: 13,
								cursor: "pointer",
								fontFamily: UI.fontSans,
							}}
						>
							← 返回会话
						</button>
						<span style={{ fontSize: 14, fontWeight: 600 }}>
							Compose Studio
						</span>
					</div>
					<Canvas state={state} dispatch={dispatch} />
				</div>
				{/* 右：属性面板 */}
				<div
					style={{
						width: 320,
						flexShrink: 0,
						borderLeft: `1px solid ${UI.border}`,
						background: UI.surface,
						overflow: "auto",
					}}
				>
					<Inspector state={state} dispatch={dispatch} />
				</div>
			</div>
			{/* 底部：AI 聊天调整（Phase 3 LLM） */}
			<ChatPanel />
		</div>
	);
}

// --- 侧栏入口图标（布局/组件语义 SVG） ---
function PanelIcon({ onClick }: { onClick: () => void }) {
	return (
		<button
			onClick={(e) => {
				e.stopPropagation();
				onClick();
			}}
			title="Compose Studio（可视化编辑器）"
			style={{
				display: "inline-flex",
				alignItems: "center",
				gap: 4,
				padding: "4px 8px",
				borderRadius: 6,
				border: "none",
				background: "transparent",
				color: "currentColor",
				cursor: "pointer",
				fontSize: 12,
				lineHeight: 1,
			}}
		>
			<svg
				width="14"
				height="14"
				viewBox="0 0 16 16"
				fill="currentColor"
				style={{ flexShrink: 0 }}
			>
				<rect x="1" y="1" width="14" height="4.5" rx="1.5" opacity="0.9" />
				<rect x="1" y="7" width="6" height="8" rx="1.5" opacity="0.65" />
				<rect x="9" y="7" width="6" height="8" rx="1.5" opacity="0.65" />
			</svg>
			Studio
		</button>
	);
}

// --- 客户端插件入口 ---
export function apply(ctx: ClientContext) {
	// 注册 main panel（id=composeStudio，通过 selectPanel 切换）
	ctx.effect(
		() =>
			ctx.slots.inject("main", () =>
				ctx.slots.register(
					{ name: "main", key: PANEL_ID },
					() => (
						<ComposeStudioPanel
							onBack={() => ctx.layout.selectPanel(null)}
						/>
					),
				),
			),
		"compose-studio: main panel",
	);

	// 侧栏入口（点击切换到编辑器 panel）
	ctx.effect(
		() =>
			ctx.slots.inject("sidebar.footer.action", () =>
				ctx.slots.register(
					{
						name: "sidebar.footer.action",
						id: PANEL_ID,
						order: 80,
					},
					() => (
						<PanelIcon
							onClick={() => ctx.layout.selectPanel(PANEL_ID)}
						/>
					),
				),
			),
		"compose-studio: sidebar entry",
	);
}

export const inject = ["slots", "layout"];
