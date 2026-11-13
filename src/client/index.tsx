// dsh-compose-studio —— 客户端入口
// DSH 0.2.2：注册到 main slot（主面板，panel 系统），
// 通过 ctx.layout.selectPanel(id) 切换（null = 会话）。
import React, { useCallback, useEffect, useReducer, useRef, useState } from "react";
import type { ClientContext } from "@deepseek-ai/dsh-client-runtime/client";
import { reducer, createInitialState, generateDocId } from "./store.js";
import { ComponentPalette } from "./palette/ComponentPalette.js";
import { Canvas } from "./canvas/Canvas.js";
import { Inspector } from "./inspector/Inspector.js";
import { ChatPanel } from "./chat/ChatPanel.js";
import { RpcClient } from "./rpc.js";
import { UI } from "./theme/ui.js";
import { TEMPLATES } from "./templates.js";

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
	const rpc = useRef<RpcClient | null>(null);
	if (!rpc.current) rpc.current = new RpcClient();
	const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(
		"idle",
	);
	const firstRender = useRef(true);
	const saveTimer = useRef<number | undefined>(undefined);
	const [showTemplates, setShowTemplates] = useState(false);

	// 快捷键：Delete/Backspace 删除选中节点；Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y 撤销重做
	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent): void => {
			const target = e.target as HTMLElement | null;
			if (
				target &&
				(target.tagName === "INPUT" ||
					target.tagName === "TEXTAREA" ||
					target.isContentEditable)
			) {
				return;
			}
			const selectedId = state.selection.anchorId;
			if (
				(e.key === "Delete" || e.key === "Backspace") &&
				selectedId &&
				selectedId !== state.document.root.id
			) {
				e.preventDefault();
				dispatch({ type: "node/remove", id: selectedId });
				return;
			}
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
				e.preventDefault();
				dispatch({ type: e.shiftKey ? "history/redo" : "history/undo" });
				return;
			}
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
				e.preventDefault();
				dispatch({ type: "history/redo" });
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [state.selection.anchorId, state.document.root.id]);

	// 自动保存：编辑后 debounce 1500ms（首次渲染跳过）
	useEffect(() => {
		if (firstRender.current) {
			firstRender.current = false;
			return;
		}
		if (saveTimer.current !== undefined) {
			window.clearTimeout(saveTimer.current);
		}
		setSaveState("idle");
		saveTimer.current = window.setTimeout(() => {
			setSaveState("saving");
			rpc.current
				?.saveDocument(state.document)
				.then(() => setSaveState("saved"))
				.catch((e) => {
					console.error("自动保存失败", e);
					setSaveState("error");
				});
		}, 1500);
		return () => {
			if (saveTimer.current !== undefined) {
				window.clearTimeout(saveTimer.current);
			}
		};
	}, [state.document]);

	// 从模板新建文档
	const handleNewFromTemplate = useCallback((templateId: string) => {
		const template = TEMPLATES.find((t) => t.id === templateId);
		dispatch({
			type: "doc/new",
			docId: generateDocId(),
			name: template?.name ?? "Untitled",
			template: templateId,
		});
		setShowTemplates(false);
	}, []);

	// 切换文档（输入 id 加载）
	const handleLoad = useCallback(async () => {
		const id = window.prompt("输入文档 id：");
		if (!id) return;
		try {
			const doc = await rpc.current?.loadDocument(id);
			if (doc) {
				dispatch({ type: "doc/load", doc });
				setSaveState("idle");
			}
		} catch (e) {
			window.alert(`加载失败: ${e instanceof Error ? e.message : String(e)}`);
		}
	}, []);

	// 导出 Kotlin 到工作区
	const handleExport = useCallback(async () => {
		try {
			const files = await rpc.current?.exportDocument(state.document);
			if (files) {
				window.alert(
					`导出 ${files.length} 个文件:\n${files.map((f) => f.path).join("\n")}`,
				);
			}
		} catch (e) {
			window.alert(`导出失败: ${e instanceof Error ? e.message : String(e)}`);
		}
	}, [state.document]);

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
						{/* 保存状态 */}
						<span
							style={{
								fontSize: 12,
								color:
									saveState === "error"
										? UI.destructive
										: saveState === "saving"
											? UI.textMuted
											: UI.textFaint,
							}}
						>
							{saveState === "saving"
								? "保存中…"
								: saveState === "saved"
									? "已保存"
									: saveState === "error"
										? "保存失败"
										: ""}
						</span>
						{/* 文档操作 + 撤销 / 重做 */}
						<div style={{ marginLeft: "auto", display: "flex", gap: UI.space.sm }}>
							<div style={{ position: "relative" }}>
								<button
									onClick={() => setShowTemplates((v) => !v)}
									title="新建文档（可选模板）"
									style={{
										border: `1px solid ${UI.border}`,
										background: UI.surfaceAlt,
										color: UI.text,
										borderRadius: UI.radius.md,
										padding: `${UI.space.xs}px ${UI.space.sm}px`,
										fontSize: 13,
										cursor: "pointer",
										fontFamily: UI.fontSans,
									}}
								>
									新建 ▾
								</button>
								{showTemplates && (
									<>
										{/* 点击空白关闭 */}
										<div
											onClick={() => setShowTemplates(false)}
											style={{
												position: "fixed",
												inset: 0,
												zIndex: 20,
											}}
										/>
										<div
											style={{
												position: "absolute",
												top: "calc(100% + 6px)",
												left: 0,
												zIndex: 21,
												width: 260,
												maxHeight: 360,
												overflow: "auto",
												background: UI.surface,
												border: `1px solid ${UI.border}`,
												borderRadius: UI.radius.lg,
												boxShadow: UI.shadow.lg,
												padding: UI.space.sm,
											}}
										>
											<div
												style={{
													fontSize: 11,
													fontWeight: 600,
													color: UI.textFaint,
													padding: `${UI.space.xs}px ${UI.space.sm}px`,
													letterSpacing: "0.05em",
												}}
											>
												选择模板
											</div>
											{TEMPLATES.map((t) => (
												<button
													key={t.id}
													onClick={() => handleNewFromTemplate(t.id)}
													style={{
														display: "block",
														width: "100%",
														textAlign: "left",
														padding: `${UI.space.sm}px ${UI.space.md}px`,
														marginBottom: 2,
														border: "none",
														borderRadius: UI.radius.md,
														background: "transparent",
														color: UI.text,
														cursor: "pointer",
														fontFamily: UI.fontSans,
													}}
													onMouseEnter={(e) => {
														e.currentTarget.style.background = UI.surfaceAlt;
													}}
													onMouseLeave={(e) => {
														e.currentTarget.style.background = "transparent";
													}}
												>
													<div style={{ fontSize: 13, fontWeight: 600 }}>
														{t.name}
													</div>
													<div
														style={{
															fontSize: 11,
															color: UI.textMuted,
															marginTop: 2,
														}}
													>
														{t.description}
													</div>
												</button>
											))}
										</div>
									</>
								)}
							</div>
							<button
								onClick={handleLoad}
								title="打开文档"
								style={{
									border: `1px solid ${UI.border}`,
									background: UI.surfaceAlt,
									color: UI.text,
									borderRadius: UI.radius.md,
									padding: `${UI.space.xs}px ${UI.space.sm}px`,
									fontSize: 13,
									cursor: "pointer",
									fontFamily: UI.fontSans,
								}}
							>
								打开
							</button>
							<button
								onClick={handleExport}
								title="导出 Kotlin 到工作区"
								style={{
									border: `1px solid ${UI.border}`,
									background: UI.surfaceAlt,
									color: UI.text,
									borderRadius: UI.radius.md,
									padding: `${UI.space.xs}px ${UI.space.sm}px`,
									fontSize: 13,
									cursor: "pointer",
									fontFamily: UI.fontSans,
								}}
							>
								导出
							</button>
							<button
								onClick={() => dispatch({ type: "ui/toggleBorders" })}
								title="显示/隐藏容器边界"
								style={{
									border: `1px solid ${state.ui.showBorders ? UI.primary : UI.border}`,
									background: state.ui.showBorders ? UI.primaryContainer : UI.surfaceAlt,
									color: state.ui.showBorders ? UI.primary : UI.textMuted,
									borderRadius: UI.radius.md,
									padding: `${UI.space.xs}px ${UI.space.sm}px`,
									fontSize: 13,
									cursor: "pointer",
									fontFamily: UI.fontSans,
								}}
							>
								{state.ui.showBorders ? "边界✓" : "边界"}
							</button>
							<button
								onClick={() => dispatch({ type: "history/undo" })}
								disabled={state.history.undo.length === 0}
								title="撤销（Ctrl+Z）"
								style={{
									border: `1px solid ${UI.border}`,
									background: UI.surfaceAlt,
									color: state.history.undo.length === 0 ? UI.textFaint : UI.text,
									borderRadius: UI.radius.md,
									padding: `${UI.space.xs}px ${UI.space.sm}px`,
									fontSize: 13,
									cursor: state.history.undo.length === 0 ? "default" : "pointer",
									fontFamily: UI.fontSans,
									opacity: state.history.undo.length === 0 ? 0.5 : 1,
								}}
							>
								↶ 撤销
							</button>
							<button
								onClick={() => dispatch({ type: "history/redo" })}
								disabled={state.history.redo.length === 0}
								title="重做（Ctrl+Shift+Z）"
								style={{
									border: `1px solid ${UI.border}`,
									background: UI.surfaceAlt,
									color: state.history.redo.length === 0 ? UI.textFaint : UI.text,
									borderRadius: UI.radius.md,
									padding: `${UI.space.xs}px ${UI.space.sm}px`,
									fontSize: 13,
									cursor: state.history.redo.length === 0 ? "default" : "pointer",
									fontFamily: UI.fontSans,
									opacity: state.history.redo.length === 0 ? 0.5 : 1,
								}}
							>
								↷ 重做
							</button>
						</div>
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
