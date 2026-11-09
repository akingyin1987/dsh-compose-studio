// dsh-compose-studio —— 客户端入口
// DSH 客户端通过 window.__ModuleLoader__.load 加载本文件。
// factory 接收 require，用于解析宿主提供的 React 等模块。
import React from "react";

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

// --- 主面板：三栏布局占位（Phase 0 骨架） ---
function ComposeStudioPanel() {
	return (
		<div
			style={{
				display: "flex",
				height: "100%",
				fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
				color: "#222",
				background: "#fafafa",
			}}
		>
			<div
				style={{
					flex: 1,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					fontSize: 14,
					color: "#666",
				}}
			>
				Compose Studio — Phase 0 skeleton
			</div>
		</div>
	);
}

// --- 侧栏入口图标 ---
function PanelIcon() {
	return (
		<span
			style={{ display: "inline-flex", fontSize: 16, color: "currentColor" }}
		>
			◆
		</span>
	);
}

// --- 客户端插件入口 ---
interface ClientSlotContext {
	slots: {
		inject(name: string, factory: () => unknown): void;
		register(options: Record<string, unknown>, component: unknown): unknown;
	};
}

export function apply(ctx: ClientSlotContext) {
	// 主面板（keyed slot）
	ctx.slots.inject("main", function* () {
		yield ctx.slots.register(
			{
				name: "main",
				key: "composeStudio",
				children: {},
			},
			ComposeStudioPanel
		);
	});

	// 侧栏入口
	ctx.slots.inject("sidebar.panellist", () =>
		ctx.slots.register(
			{
				name: "sidebar.panellist",
				id: "composeStudio",
				order: 80,
				label: () => "Compose Studio",
			},
			PanelIcon
		)
	);
}

export const inject = ["slots", "layout", "locale"];
