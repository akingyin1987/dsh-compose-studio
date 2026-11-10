// dsh-compose-studio —— 客户端入口
// DSH 客户端通过 window.__ModuleLoader__.load 加载本文件。
// 方案 A：编辑器注册到 conversation slot（主内容区），侧栏图标切换，返回按钮注销。
import React, { useReducer } from "react";
import type { ClientContext } from "@deepseek-ai/dsh-client-runtime/client";
import { reducer, createInitialState } from "./store.js";
import { ComponentPalette } from "./palette/ComponentPalette.js";
import { Canvas } from "./canvas/Canvas.js";
import { Inspector } from "./inspector/Inspector.js";
import { ChatPanel } from "./chat/ChatPanel.js";

// 扩充 SlotMap（与宿主 layout 插件声明一致）
declare module "@deepseek-ai/dsh-client-ui-slots" {
	interface SlotMap {
		/** 主内容区（single，session-maybe）：编辑器视图（注册会替换会话内容）。 */
		conversation: { kind: "single"; scope: "session-maybe" };
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

// --- 三栏面板（内嵌主内容区，带"返回会话"按钮） ---
function ComposeStudioPanel({ onClose }: { onClose: () => void }) {
	const [state, dispatch] = useReducer(reducer, null, createInitialState);

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				width: "100%",
				height: "100%",
				background: "#fafafa",
				overflow: "hidden",
			}}
		>
			{/* 三栏区域 */}
			<div style={{ display: "flex", flex: 1, minHeight: 0 }}>
				{/* 左：组件面板 */}
				<div
					style={{
						width: 240,
						flexShrink: 0,
						borderRight: "1px solid #e0e0e0",
						background: "#fff",
						overflow: "hidden",
					}}
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
							padding: "0 16px",
							borderBottom: "1px solid #e0e0e0",
							background: "#fff",
							gap: 12,
						}}
					>
						<button
							onClick={onClose}
							style={{
								border: "1px solid #d0d0d0",
								background: "#fff",
								borderRadius: 6,
								padding: "4px 12px",
								fontSize: 13,
								cursor: "pointer",
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
						borderLeft: "1px solid #e0e0e0",
						background: "#fff",
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
				{/* 顶部栏 */}
				<rect x="1" y="1" width="14" height="4.5" rx="1.5" opacity="0.9" />
				{/* 左列 */}
				<rect x="1" y="7" width="6" height="8" rx="1.5" opacity="0.65" />
				{/* 右列 */}
				<rect x="9" y="7" width="6" height="8" rx="1.5" opacity="0.65" />
			</svg>
			Studio
		</button>
	);
}

// --- 客户端插件入口 ---
export function apply(ctx: ClientContext) {
	console.log("[compose-studio] apply called");
	try {
	// 编辑器注册状态（null = 未打开，会话视图）
	let disposeEditor: (() => void) | null = null;

	const closeEditor = (): void => {
		disposeEditor?.();
		disposeEditor = null;
	};

	const openEditor = (): void => {
		console.log("[compose-studio] openEditor", { disposeEditor });
		if (disposeEditor) return; // 已打开
		// 用 inject 等待 conversation slot 声明（避免加载顺序问题）
		disposeEditor = ctx.slots.inject("conversation", () => {
			console.log("[compose-studio] conversation inject fired, registering");
			return ctx.slots.register(
				{
					name: "conversation",
				},
				// wrapper：注入 onClose（slot 组件参数由框架注入）
				() => <ComposeStudioPanel onClose={closeEditor} />,
			);
		});
		console.log("[compose-studio] inject done", {
			disposeEditor: typeof disposeEditor,
		});
	};

	// 侧栏入口（点击打开编辑器）
	// 用 inject 等待 sidebar.footer.action 声明（sidebar 插件可能晚于本插件加载）
	ctx.effect(
		() =>
			ctx.slots.inject("sidebar.footer.action", () =>
				ctx.slots.register(
					{
						name: "sidebar.footer.action",
						id: "composeStudio",
						order: 80,
					},
					() => <PanelIcon onClick={openEditor} />,
				),
			),
		"compose-studio: sidebar entry"
	);
		console.log("[compose-studio] apply OK");
	} catch (e) {
		console.error("[compose-studio] apply FAILED:", e);
		throw e;
	}
}

export const inject = ["slots"];
