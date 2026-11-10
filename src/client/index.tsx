// dsh-compose-studio —— 客户端入口
// DSH 客户端通过 window.__ModuleLoader__.load 加载本文件。
// 方案 A：编辑器注册到 conversation slot（主内容区），侧栏图标切换，返回按钮注销。
import React, { useReducer } from "react";
import type { ClientContext } from "@deepseek-ai/dsh-client-runtime/client";
import { reducer, createInitialState } from "./store.js";
import { ComponentPalette } from "./palette/ComponentPalette.js";
import { Canvas } from "./canvas/Canvas.js";
import { Inspector } from "./inspector/Inspector.js";

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
				width: "100%",
				height: "100%",
				background: "#fafafa",
				overflow: "hidden",
			}}
		>
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
	);
}

// --- 侧栏入口图标 ---
function PanelIcon({ onClick }: { onClick: () => void }) {
	return (
		<span
			onClick={(e) => {
				e.stopPropagation();
				onClick();
			}}
			title="Compose Studio"
			style={{
				display: "inline-flex",
				fontSize: 16,
				color: "currentColor",
				cursor: "pointer",
			}}
		>
			◆
		</span>
	);
}

// --- 客户端插件入口 ---
export function apply(ctx: ClientContext) {
	// 编辑器注册状态（null = 未打开，会话视图）
	let disposeEditor: (() => void) | null = null;

	const closeEditor = (): void => {
		disposeEditor?.();
		disposeEditor = null;
	};

	const openEditor = (): void => {
		if (disposeEditor) return; // 已打开
		disposeEditor = ctx.slots.register(
			{
				name: "conversation",
			},
			// wrapper：注入 onClose（slot 组件参数由框架注入）
			() => <ComposeStudioPanel onClose={closeEditor} />,
		);
	};

	// 侧栏入口（点击打开编辑器）
	ctx.effect(
		() =>
			ctx.slots.register(
				{
					name: "sidebar.footer.action",
					id: "composeStudio",
					order: 80,
				},
				() => <PanelIcon onClick={openEditor} />,
			),
		"compose-studio: sidebar entry"
	);
}

export const inject = ["slots"];
