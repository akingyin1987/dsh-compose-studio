// dsh-compose-studio —— 客户端入口
// DSH 客户端通过 window.__ModuleLoader__.load 加载本文件。
// factory 接收 require，用于解析宿主提供的 React 等模块。
import React from "react";
import { useReducer, useEffect, useState } from "react";
import type { ClientContext } from "@deepseek-ai/dsh-client-runtime/client";
import { reducer, createInitialState } from "./store.js";
import { ComponentPalette } from "./palette/ComponentPalette.js";
import { Canvas } from "./canvas/Canvas.js";
import { Inspector } from "./inspector/Inspector.js";

// 扩充 SlotMap：声明本插件使用的 slot（interface 合并，与宿主声明一致）
declare module "@deepseek-ai/dsh-client-ui-slots" {
	interface SlotMap {
		/** 全局浮层（list，additive）：编辑器面板容器。 */
		"shell.overlay": { kind: "list"; scope: "root" };
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

// 插件内通信事件（Phase 0 简化方案；Phase 1 改为 store/服务）
const OPEN_EVENT = "compose-studio:open";

// --- 主面板：三栏布局（组件面板 / 画布 / 属性面板） ---
function ComposeStudioPanel() {
	const [visible, setVisible] = useState(true);
	const [state, dispatch] = useReducer(reducer, null, createInitialState);

	useEffect(() => {
		const handler = () => setVisible(true);
		window.addEventListener(OPEN_EVENT, handler);
		return () => window.removeEventListener(OPEN_EVENT, handler);
	}, []);

	if (!visible) return null;

	return (
		<div
			onClick={() => setVisible(false)}
			style={{
				position: "fixed",
				inset: 0,
				zIndex: 100,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "rgba(0,0,0,0.4)",
			}}
		>
			<div
				onClick={(e) => e.stopPropagation()}
				style={{
					display: "flex",
					width: "90%",
					height: "80%",
					borderRadius: 12,
					boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
					fontFamily:
						"system-ui, -apple-system, 'Segoe UI', sans-serif",
					color: "#222",
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
				{/* 中：画布 */}
				<Canvas state={state} dispatch={dispatch} />
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
		</div>
	);
}

// --- 侧栏入口图标 ---
function PanelIcon() {
	return (
		<span
			onClick={() => window.dispatchEvent(new CustomEvent(OPEN_EVENT))}
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
	// 侧栏入口（sidebar.footer.action，list slot）
	ctx.effect(
		() =>
			ctx.slots.register(
				{
					name: "sidebar.footer.action",
					id: "composeStudio",
					order: 80,
				},
				PanelIcon
			),
		"compose-studio: sidebar entry"
	);

	// 编辑器浮层（shell.overlay，list slot）
	ctx.effect(
		() =>
			ctx.slots.register(
				{
					name: "shell.overlay",
					id: "composeStudio",
					order: 80,
				},
				ComposeStudioPanel
			),
		"compose-studio: overlay panel"
	);
}

export const inject = ["slots"];
