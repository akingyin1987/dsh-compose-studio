// M3 风格 React 模拟渲染（降级预览，docs/design.md 6.6 降级策略）
// Phase 1 先用 React 模拟 Compose 外观；T10/T11 替换为 Compose Web 真实渲染。
// 覆盖 catalog 全部 52 个组件。
import React from "react";
import type { RenderNode } from "./Canvas.js";
import { DND_MIME, axisOf, getModifierStyle, type DropTarget } from "./drag.js";
import { studioDebug } from "../debug.js";

// ===== M3 样式常量（近似 Material 3 基线风格） =====

const M3 = {
	text: (size = 14, weight = 400): React.CSSProperties => ({
		fontSize: size,
		fontWeight: weight,
		color: "#1C1B1F",
		lineHeight: 1.4,
	}),
	button: (variant: string = "filled"): React.CSSProperties => {
		const base: React.CSSProperties = {
			borderRadius: 20,
			height: 40,
			padding: "0 24px",
			fontSize: 14,
			fontWeight: 500,
			cursor: "pointer",
			display: "inline-flex",
			alignItems: "center",
			justifyContent: "center",
			gap: 8,
			border: "none",
			fontFamily: "inherit",
			letterSpacing: 0.1,
		};
		switch (variant) {
			// Filled：实心 primary 背景 + onPrimary 文字 + 轻阴影（高强调）
			case "filled":
				return {
					...base,
					background: "#6750A4",
					color: "#FFFFFF",
					boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
				};
			// Filled tonal：secondaryContainer 背景 + onSecondaryContainer 文字
			case "tonal":
				return { ...base, background: "#E8DEF8", color: "#1D192B" };
			// Elevated：surface 背景 + primary 文字 + 明显阴影
			case "elevated":
				return {
					...base,
					background: "#F7F2FA",
					color: "#6750A4",
					boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
				};
			// Outlined：透明 + outline 边框 + primary 文字（中等强调）
			case "outlined":
				return {
					...base,
					background: "transparent",
					color: "#6750A4",
					border: "1px solid #79747E",
				};
			// Text：透明 + primary 文字（低强调）
			case "text":
				return {
					...base,
					background: "transparent",
					color: "#6750A4",
					padding: "0 12px",
				};
			default:
				return {
					...base,
					background: "#6750A4",
					color: "#FFFFFF",
					boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
				};
		}
	},
	card: (variant: string = "filled"): React.CSSProperties => ({
		borderRadius: 12,
		border: variant === "outlined" ? "1px solid #79747E" : "1px solid #E7E0EC",
		background: variant === "elevated" ? "#F7F2FA" : "#FFFBFE",
		padding: 12,
		boxShadow: variant === "elevated" ? "0 1px 3px rgba(0,0,0,0.15)" : undefined,
	}),
	topBar: {
		height: 56,
		background: "#FFFBFE",
		borderBottom: "1px solid #E7E0EC",
		display: "flex",
		alignItems: "center",
		padding: "0 16px",
		fontSize: 20,
		fontWeight: 500,
	},
	textField: (outlined = false): React.CSSProperties => ({
		border: outlined ? "1px solid #79747E" : "none",
		borderBottom: outlined ? undefined : "1px solid #79747E",
		borderRadius: outlined ? 4 : 0,
		padding: "10px 12px",
		fontSize: 14,
		background: "#fff",
		minWidth: 160,
	}),
	image: {
		background: "#E7E0EC",
		borderRadius: 4,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		color: "#49454F",
		fontSize: 12,
	},
	icon: {
		width: 24,
		height: 24,
		color: "#49454F",
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		fontSize: 18,
	},
	scaffold: {
		display: "flex",
		flexDirection: "column" as const,
		height: "100%",
		minHeight: "100%",
		background: "#FFFBFE",
	},
	surface: {
		borderRadius: 12,
		padding: 12,
		background: "#F7F2FA",
	},
	divider: { background: "#CAC4D0" },
	toggle: (checked: boolean): React.CSSProperties => ({
		width: 18,
		height: 18,
		borderRadius: checked ? 9 : 2,
		background: checked ? "#6750A4" : "transparent",
		border: "2px solid #79747E",
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		color: "#fff",
		fontSize: 12,
	}),
	slider: (value: number): React.CSSProperties => ({
		flex: 1,
		height: 4,
		borderRadius: 2,
		background: `linear-gradient(to right, #6750A4 ${value}%, #E7E0EC ${value}%)`,
		position: "relative" as const,
	}),
	chip: (selected = false): React.CSSProperties => ({
		padding: "4px 12px",
		borderRadius: 8,
		fontSize: 12,
		background: selected ? "#E8DEF8" : "transparent",
		border: "1px solid #79747E",
		display: "inline-flex",
		alignItems: "center",
	}),
	progress: (value: number, linear = false): React.CSSProperties =>
		linear
			? { height: 4, borderRadius: 2, background: `linear-gradient(to right, #6750A4 ${value}%, #E7E0EC ${value}%)` }
			: { width: 36, height: 36, borderRadius: "50%", background: `conic-gradient(#6750A4 ${value * 3.6}deg, #E7E0EC 0deg)` },
	navigation: (vertical = false): React.CSSProperties => ({
		display: "flex",
		flexDirection: (vertical ? "column" : "row") as "column" | "row",
		gap: 8,
		padding: 8,
		background: "#F3EDF7",
	}),
	dialog: {
		position: "fixed" as const,
		top: "50%",
		left: "50%",
		transform: "translate(-50%, -50%)",
		background: "#FFFBFE",
		borderRadius: 28,
		padding: 24,
		minWidth: 280,
		boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
	},
	tooltip: {
		position: "fixed" as const,
		bottom: 20,
		left: "50%",
		transform: "translateX(-50%)",
		background: "#313033",
		color: "#fff",
		padding: "6px 12px",
		borderRadius: 4,
		fontSize: 12,
	},
	badge: {
		minWidth: 20,
		height: 20,
		borderRadius: 10,
		background: "#B3261E",
		color: "#fff",
		fontSize: 11,
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		padding: "0 6px",
	},
	tab: (active = false): React.CSSProperties => ({
		padding: "8px 16px",
		fontSize: 14,
		fontWeight: active ? 600 : 400,
		color: active ? "#6750A4" : "#49454F",
		borderBottom: active ? "2px solid #6750A4" : "2px solid transparent",
	}),
	canvas: {
		background: "#F7F2FA",
		borderRadius: 4,
		border: "1px dashed #CAC4D0",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		color: "#79747E",
		fontSize: 12,
	},
	spacer: { background: "rgba(103,80,164,0.08)", borderRadius: 2 },
	listItem: {
		display: "flex",
		flexDirection: "column" as const,
		padding: "12px 16px",
		borderBottom: "1px solid #E7E0EC",
	},
	menu: {
		background: "#FFFBFE",
		borderRadius: 4,
		boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
		padding: 8,
		minWidth: 180,
	},
	snackbar: {
		position: "fixed" as const,
		bottom: 16,
		left: 16,
		right: 16,
		background: "#313033",
		color: "#fff",
		padding: "12px 16px",
		borderRadius: 4,
		fontSize: 14,
		display: "flex",
		justifyContent: "space-between",
	},
};

/** 排列值 → CSS justifyContent。 */
function arrangementCss(value: unknown): string {
	switch (value) {
		case "top":
		case "start":
			return "flex-start";
		case "center":
			return "center";
		case "bottom":
		case "end":
			return "flex-end";
		case "spaceBetween":
			return "space-between";
		case "spaceAround":
			return "space-around";
		case "spaceEvenly":
			return "space-evenly";
		default:
			return "flex-start";
	}
}

/** 对齐值 → CSS alignItems。 */
function alignmentCss(value: unknown): string {
	switch (value) {
		case "start":
			return "flex-start";
		case "center":
			return "center";
		case "end":
			return "flex-end";
		default:
			return "flex-start";
	}
}

/** 落点指示条（垂直容器用水平线，水平容器用垂直线）。 */
function indicatorStyle(nodeType: string): React.CSSProperties {
	const axis = axisOf(nodeType);
	return axis === "vertical"
		? { height: 2, width: "100%", background: "#1976d2", borderRadius: 1, flexShrink: 0 }
		: { width: 2, alignSelf: "stretch", background: "#1976d2", borderRadius: 1, flexShrink: 0 };
}

/** 空容器占位提示样式。 */
const containerPlaceholder: React.CSSProperties = {
	border: "1px dashed #CAC4D0",
	borderRadius: 4,
	padding: "12px 16px",
	color: "#79747E",
	fontSize: 12,
	textAlign: "center",
	width: "100%",
	boxSizing: "border-box",
};

/** 容器最小高度（空容器可见、可拖放）。 */
const CONTAINER_MIN_HEIGHT = 60;

/** 渲染容器子节点（空时显示占位）。 */
function renderContainerChildren(
	node: RenderNode,
	childrenContent: React.ReactNode,
	label: string,
): React.ReactNode {
	if (node.children.length === 0) {
		return <div style={containerPlaceholder}>{label}</div>;
	}
	return childrenContent;
}

// ===== 按钮变体映射 =====

const BUTTON_VARIANTS: Record<string, string> = {
	"m3.Button": "filled",
	"m3.FilledTonalButton": "tonal",
	"m3.OutlinedButton": "outlined",
	"m3.TextButton": "text",
	"m3.ElevatedButton": "elevated",
	"m3.SegmentedButton": "outlined",
};

const CARD_VARIANTS: Record<string, string> = {
	"m3.Card": "filled",
	"m3.ElevatedCard": "elevated",
	"m3.OutlinedCard": "outlined",
};

/** Button 变体默认文本（官方类型名，便于区分）。 */
const BUTTON_LABELS: Record<string, string> = {
	"m3.Button": "Filled",
	"m3.FilledTonalButton": "Tonal",
	"m3.OutlinedButton": "Outlined",
	"m3.TextButton": "Text",
	"m3.ElevatedButton": "Elevated",
	"m3.SegmentedButton": "Option",
};

// ===== 预览节点 =====

export function PreviewNode({
	node,
	onSelect,
	dropIndicator,
	showBorders = true,
}: {
	node: RenderNode;
	onSelect: (id: string) => void;
	dropIndicator?: DropTarget | null;
	/** 显示容器边界虚线（默认开启）。 */
	showBorders?: boolean;
}) {
	const isRoot = node.depth === 0;
	const selected = node.selected;
	const modStyle = getModifierStyle(node.props);

	// 容器边界：选中实线；否则 showBorders 虚线（-1 offset 内缩，不占布局）
	const containerOutline =
		selected || !node.isContainer
			? undefined
			: showBorders
				? "1px dashed rgba(25,118,210,0.55)"
				: undefined;

	const wrapperStyle: React.CSSProperties = {
		outline: selected ? "2px solid #1976d2" : containerOutline,
		outlineOffset: selected ? 1 : -1,
		cursor: "pointer",
		position: "relative",
		...modStyle,
	};

	const nodeAttrs = {
		"data-node-id": node.id,
		...(node.isContainer ? { "data-container": "1" } : {}),
	} as React.HTMLAttributes<HTMLElement>;
	const draggable = !isRoot;
	const dragProps = (draggable
		? {
				draggable: true,
				onDragStart: (e: React.DragEvent) => {
					e.stopPropagation();
					e.dataTransfer.setData(DND_MIME, node.id);
					e.dataTransfer.effectAllowed = "move";
					studioDebug(`dragstart node ${node.id}`);
				},
			}
		: {}) as React.HTMLAttributes<HTMLElement>;

	const handleClick = (e: React.MouseEvent): void => {
		e.stopPropagation();
		onSelect(node.id);
	};

	// 渲染子节点（含落点指示条）
	const showIndicator = dropIndicator != null && dropIndicator.parentId === node.id;
	const renderChildren = (): React.ReactNode => {
		const items: React.ReactNode[] = [];
		node.children.forEach((child, i) => {
			if (showIndicator && dropIndicator.index === i) {
				items.push(<div key={`ind-${i}`} style={indicatorStyle(node.type)} />);
			}
			items.push(
				<PreviewNode
					key={child.id}
					node={child}
					onSelect={onSelect}
					dropIndicator={dropIndicator}
					showBorders={showBorders}
				/>,
			);
		});
		if (showIndicator && dropIndicator.index === node.children.length) {
			items.push(<div key="ind-end" style={indicatorStyle(node.type)} />);
		}
		return items;
	};

	const childrenContent = renderChildren();
	const spacerProps = node.props as { width?: number; height?: number };

	// ===== 布局组件 =====
	switch (node.type) {
		case "layout.Column":
			return (
				<div
					{...nodeAttrs}
					{...dragProps}
					style={{
						...wrapperStyle,
						display: "flex",
						flexDirection: "column",
						gap: Number(node.props.spacing ?? 8),
						justifyContent: arrangementCss(node.props.verticalArrangement),
						alignItems: alignmentCss(node.props.horizontalAlignment),
						minHeight: CONTAINER_MIN_HEIGHT,
					}}
					onClick={handleClick}
				>
					{renderContainerChildren(node, childrenContent, "Column（拖拽组件到此处）")}
				</div>
			);
		case "layout.Row":
			return (
				<div
					{...nodeAttrs}
					{...dragProps}
					style={{
						...wrapperStyle,
						display: "flex",
						gap: Number(node.props.spacing ?? 8),
						justifyContent: arrangementCss(node.props.horizontalArrangement),
						alignItems: alignmentCss(node.props.verticalAlignment) as "flex-start" | "center" | "flex-end",
						minHeight: CONTAINER_MIN_HEIGHT,
					}}
					onClick={handleClick}
				>
					{renderContainerChildren(node, childrenContent, "Row（拖拽组件到此处）")}
				</div>
			);
		case "layout.FlowRow":
			return (
				<div
					{...nodeAttrs}
					{...dragProps}
					style={{ ...wrapperStyle, display: "flex", flexWrap: "wrap", gap: Number(node.props.spacing ?? 8), alignItems: "center", minHeight: CONTAINER_MIN_HEIGHT }}
					onClick={handleClick}
				>
					{renderContainerChildren(node, childrenContent, "FlowRow（拖拽组件到此处）")}
				</div>
			);
		case "layout.FlowColumn":
			return (
				<div
					{...nodeAttrs}
					{...dragProps}
					style={{ ...wrapperStyle, display: "flex", flexDirection: "column", flexWrap: "wrap", gap: Number(node.props.spacing ?? 8), minHeight: CONTAINER_MIN_HEIGHT }}
					onClick={handleClick}
				>
					{renderContainerChildren(node, childrenContent, "FlowColumn（拖拽组件到此处）")}
				</div>
			);
		case "layout.LazyColumn":
			return (
				<div
					{...nodeAttrs}
					{...dragProps}
					style={{ ...wrapperStyle, display: "flex", flexDirection: "column", gap: Number(node.props.spacing ?? 8), overflow: "auto", minHeight: CONTAINER_MIN_HEIGHT }}
					onClick={handleClick}
				>
					{renderContainerChildren(node, childrenContent, "LazyColumn（拖拽组件到此处）")}
				</div>
			);
		case "layout.LazyRow":
			return (
				<div
					{...nodeAttrs}
					{...dragProps}
					style={{ ...wrapperStyle, display: "flex", gap: Number(node.props.spacing ?? 8), overflow: "auto", minHeight: CONTAINER_MIN_HEIGHT }}
					onClick={handleClick}
				>
					{renderContainerChildren(node, childrenContent, "LazyRow（拖拽组件到此处）")}
				</div>
			);
		case "layout.Box":
			return (
				<div
					{...nodeAttrs}
					{...dragProps}
					style={{ ...wrapperStyle, minHeight: CONTAINER_MIN_HEIGHT, position: "relative" }}
					onClick={handleClick}
				>
					{renderContainerChildren(node, childrenContent, "Box（拖拽组件到此处）")}
				</div>
			);
		case "layout.Spacer":
			return (
				<div
					{...nodeAttrs}
					{...dragProps}
					style={{
						...wrapperStyle,
						...M3.spacer,
						width: Number(spacerProps.width ?? 0),
						height: Number(spacerProps.height ?? 8),
						flexShrink: 0,
					}}
					onClick={handleClick}
				/>
			);
	}

	// ===== Material 3 组件 =====
	if (node.type.startsWith("m3.")) {
		switch (node.type) {
			case "m3.Text":
				return (
					<div
						{...nodeAttrs}
						{...dragProps}
						style={{ ...wrapperStyle, ...M3.text(Number(node.props.fontSize ?? 14), Number(node.props.fontWeight ?? 400)) }}
						onClick={handleClick}
					>
						{String(node.props.text ?? node.text ?? "Text")}
					</div>
				);

			case "m3.Button":
			case "m3.FilledTonalButton":
			case "m3.OutlinedButton":
			case "m3.TextButton":
			case "m3.ElevatedButton":
			case "m3.SegmentedButton": {
				const variant = BUTTON_VARIANTS[node.type] ?? "filled";
				return (
					<button
						{...nodeAttrs}
						{...dragProps}
						style={{ ...M3.button(variant), ...wrapperStyle }}
						onClick={(e) => {
							e.stopPropagation();
							onSelect(node.id);
						}}
					>
						{node.children.length > 0
							? childrenContent
							: String(
									node.props.text ??
										BUTTON_LABELS[node.type] ??
										"Button",
								)}
					</button>
				);
			}

			case "m3.IconButton":
				return (
					<button
						{...nodeAttrs}
						{...dragProps}
						style={{ ...wrapperStyle, width: 40, height: 40, borderRadius: "50%", border: "none", background: "transparent", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
						onClick={(e) => {
							e.stopPropagation();
							onSelect(node.id);
						}}
					>
						{node.children.length > 0 ? childrenContent : "★"}
					</button>
				);

			case "m3.FloatingActionButton":
			case "m3.ExtendedFloatingActionButton":
				return (
					<button
						{...nodeAttrs}
						{...dragProps}
						style={{ ...wrapperStyle, width: node.type === "m3.ExtendedFloatingActionButton" ? undefined : 56, height: 56, borderRadius: 16, border: "none", background: "#E8DEF8", color: "#6750A4", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.15)", padding: node.type === "m3.ExtendedFloatingActionButton" ? "0 16px" : 0 }}
						onClick={(e) => {
							e.stopPropagation();
							onSelect(node.id);
						}}
					>
						{childrenContent}
					</button>
				);

			case "m3.Card":
			case "m3.ElevatedCard":
			case "m3.OutlinedCard": {
				const variant = CARD_VARIANTS[node.type] ?? "filled";
				return (
					<div {...nodeAttrs} {...dragProps} style={{ ...M3.card(variant), ...wrapperStyle }} onClick={handleClick}>
						{childrenContent}
					</div>
				);
			}

			case "m3.Checkbox":
				return (
					<div {...nodeAttrs} {...dragProps} style={{ ...wrapperStyle, display: "flex", alignItems: "center", gap: 8 }} onClick={handleClick}>
						<div style={M3.toggle(Boolean(node.props.checked))}>
							{Boolean(node.props.checked) ? "✓" : ""}
						</div>
						<span style={M3.text(14)}>{String(node.props.label ?? "")}</span>
					</div>
				);

			case "m3.RadioButton":
				return (
					<div {...nodeAttrs} {...dragProps} style={{ ...wrapperStyle, display: "flex", alignItems: "center", gap: 8 }} onClick={handleClick}>
						<div style={{ ...M3.toggle(Boolean(node.props.selected)), borderRadius: "50%" }} />
						<span style={M3.text(14)}>{String(node.props.label ?? "")}</span>
					</div>
				);

			case "m3.Switch":
				return (
					<div {...nodeAttrs} {...dragProps} style={{ ...wrapperStyle, display: "flex", alignItems: "center", gap: 8 }} onClick={handleClick}>
						<div style={{ width: 52, height: 32, borderRadius: 16, background: Boolean(node.props.checked) ? "#6750A4" : "#E7E0EC", position: "relative", transition: "background 0.2s" }}>
							<div style={{ width: 24, height: 24, borderRadius: "50%", background: "#fff", position: "absolute", top: 4, left: Boolean(node.props.checked) ? 24 : 4, boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
						</div>
						<span style={M3.text(14)}>{String(node.props.label ?? "")}</span>
					</div>
				);

			case "m3.Slider":
				return (
					<div {...nodeAttrs} {...dragProps} style={{ ...wrapperStyle, display: "flex", alignItems: "center", gap: 12, padding: "0 8px" }} onClick={handleClick}>
						<div style={M3.slider(Number(node.props.value ?? 50))} />
						<span style={M3.text(12)}>{String(node.props.value ?? 50)}</span>
					</div>
				);

			case "m3.AssistChip":
			case "m3.FilterChip":
				return (
					<div {...nodeAttrs} {...dragProps} style={wrapperStyle} onClick={handleClick}>
						<span style={M3.chip(Boolean(node.props.selected))}>
							{String(node.props.label ?? "Chip")}
							{node.type === "m3.FilterChip" ? " ✓" : ""}
						</span>
					</div>
				);

			case "m3.AlertDialog":
				return (
					<div {...nodeAttrs} {...dragProps} style={{ ...wrapperStyle, ...M3.dialog }} onClick={handleClick}>
						<div style={{ fontSize: 20, fontWeight: 500, marginBottom: 12 }}>
							{String(node.props.title ?? "Dialog")}
						</div>
						<div style={M3.text(14)}>{String(node.props.text ?? "")}</div>
						<div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
							<button style={M3.button("text")}>Cancel</button>
							<button style={M3.button("filled")}>OK</button>
						</div>
					</div>
				);

			case "m3.HorizontalDivider":
				return (
					<div {...nodeAttrs} {...dragProps} style={{ ...wrapperStyle, ...M3.divider, height: Number(node.props.thickness ?? 1), width: "100%" }} onClick={handleClick} />
				);

			case "m3.VerticalDivider":
				return (
					<div {...nodeAttrs} {...dragProps} style={{ ...wrapperStyle, ...M3.divider, width: Number(node.props.thickness ?? 1), alignSelf: "stretch" }} onClick={handleClick} />
				);

			case "m3.ListItem":
				return (
					<div {...nodeAttrs} {...dragProps} style={{ ...wrapperStyle, ...M3.listItem }} onClick={handleClick}>
						<span style={{ fontSize: 16, fontWeight: 500 }}>{String(node.props.headline ?? "List item")}</span>
						{Boolean(node.props.supporting) && (
							<span style={M3.text(12)}>{String(node.props.supporting)}</span>
						)}
					</div>
				);

			case "m3.DropdownMenu":
				return (
					<div {...nodeAttrs} {...dragProps} style={{ ...wrapperStyle, ...M3.menu }} onClick={handleClick}>
						{childrenContent}
					</div>
				);

			case "m3.NavigationBar":
				return (
					<div {...nodeAttrs} {...dragProps} style={{ ...wrapperStyle, ...M3.navigation(false) }} onClick={handleClick}>
						{childrenContent}
					</div>
				);

			case "m3.NavigationRail":
				return (
					<div {...nodeAttrs} {...dragProps} style={{ ...wrapperStyle, ...M3.navigation(true) }} onClick={handleClick}>
						{childrenContent}
					</div>
				);

			case "m3.CircularProgressIndicator":
			case "m3.LinearProgressIndicator": {
				const linear = node.type === "m3.LinearProgressIndicator";
				return (
					<div {...nodeAttrs} {...dragProps} style={{ ...wrapperStyle, display: "flex", alignItems: "center", padding: 8 }} onClick={handleClick}>
						<div style={M3.progress(Number(node.props.progress ?? 50), linear)} />
					</div>
				);
			}

			case "m3.Snackbar":
				return (
					<div {...nodeAttrs} {...dragProps} style={{ ...wrapperStyle, ...M3.snackbar }} onClick={handleClick}>
						<span>{String(node.props.message ?? "Snackbar")}</span>
						{Boolean(node.props.actionLabel) && (
							<span style={{ color: "#D0BCFF", fontWeight: 500 }}>{String(node.props.actionLabel)}</span>
						)}
					</div>
				);

			case "m3.TabRow":
				return (
					<div {...nodeAttrs} {...dragProps} style={{ ...wrapperStyle, display: "flex", borderBottom: "1px solid #E7E0EC" }} onClick={handleClick}>
						{childrenContent}
					</div>
				);

			case "m3.TextField":
			case "m3.OutlinedTextField": {
				const outlined = node.type === "m3.OutlinedTextField";
				return (
					<div {...nodeAttrs} {...dragProps} style={wrapperStyle} onClick={handleClick}>
						<input
							style={M3.textField(outlined)}
							placeholder={String(node.props.label ?? "TextField")}
							readOnly
						/>
					</div>
				);
			}

			case "m3.TopAppBar":
				return (
					<div {...nodeAttrs} {...dragProps} style={{ ...wrapperStyle, ...M3.topBar }} onClick={handleClick}>
						{String(node.props.title ?? "Title")}
					</div>
				);

			case "m3.Badge":
				return (
					<div {...nodeAttrs} {...dragProps} style={{ ...wrapperStyle, display: "inline-flex", alignItems: "center", gap: 4 }} onClick={handleClick}>
						{childrenContent}
						<span style={M3.badge}>1</span>
					</div>
				);

			case "m3.ModalBottomSheet":
				return (
					<div {...nodeAttrs} {...dragProps} style={{ ...wrapperStyle, ...M3.card("elevated"), position: "fixed", bottom: 0, left: 0, right: 0, borderRadius: "16px 16px 0 0", boxShadow: "0 -2px 16px rgba(0,0,0,0.2)" }} onClick={handleClick}>
						{childrenContent}
					</div>
				);

			case "m3.DatePicker":
			case "m3.TimePicker":
				return (
					<div {...nodeAttrs} {...dragProps} style={wrapperStyle} onClick={handleClick}>
						<input
							style={M3.textField(true)}
							placeholder={node.type === "m3.DatePicker" ? "Select date" : "Select time"}
							readOnly
						/>
					</div>
				);

			case "m3.PlainTooltip":
				return (
					<div {...nodeAttrs} {...dragProps} style={{ ...wrapperStyle, ...M3.tooltip }} onClick={handleClick}>
						{String(node.props.text ?? "Tooltip")}
					</div>
				);

			case "m3.Surface":
				return (
					<div {...nodeAttrs} {...dragProps} style={{ ...M3.surface, background: String(node.props.color ?? "#F7F2FA"), ...wrapperStyle }} onClick={handleClick}>
						{childrenContent}
					</div>
				);

			case "m3.Scaffold": {
				// Scaffold 槽位：topBar / content / bottomBar / fab
				const isTopBar = (n: RenderNode): boolean => n.type === "m3.TopAppBar";
				const isBottomBar = (n: RenderNode): boolean => n.type === "m3.BottomAppBar";
				const isFab = (n: RenderNode): boolean =>
					n.type === "m3.FloatingActionButton" ||
					n.type === "m3.ExtendedFloatingActionButton";
				const topBar = node.children.filter(isTopBar);
				const bottomBar = node.children.filter(isBottomBar);
				const fab = node.children.filter(isFab);
				const content = node.children.filter(
					(n) => !isTopBar(n) && !isBottomBar(n) && !isFab(n),
				);
				const slotStyle: React.CSSProperties = {
					border: "1px dashed #E7E0EC",
					borderRadius: 4,
					minHeight: 44,
					padding: 4,
				};
				const renderSlot = (
					nodes: RenderNode[],
					label: string,
				): React.ReactNode => (
					<div style={slotStyle}>
						{nodes.length === 0 ? (
							<div style={containerPlaceholder}>{label}</div>
						) : (
							nodes.map((n) => (
								<PreviewNode
									key={n.id}
									node={n}
									onSelect={onSelect}
									dropIndicator={dropIndicator}
								/>
							))
						)}
					</div>
				);
				return (
					<div
						{...nodeAttrs}
						{...dragProps}
						style={{
							...wrapperStyle,
							...M3.scaffold,
							minHeight: "100%",
							position: "relative",
						}}
						onClick={handleClick}
					>
						{renderSlot(topBar, "TopAppBar（拖入顶栏）")}
						<div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
							{renderSlot(content, "Content（拖拽组件到此处）")}
						</div>
						{renderSlot(bottomBar, "BottomAppBar（拖入底栏）")}
						{fab.length > 0 && (
							<div style={{ position: "absolute", bottom: 16, right: 16 }}>
								{fab.map((n) => (
									<PreviewNode
										key={n.id}
										node={n}
										onSelect={onSelect}
										dropIndicator={dropIndicator}
									/>
								))}
							</div>
						)}
					</div>
				);
			}
		}
	}

	// ===== 内容组件 =====
	switch (node.type) {
		case "content.Image": {
			const w = Number(node.props.width ?? 100);
			const h = Number(node.props.height ?? 100);
			return (
				<div {...nodeAttrs} {...dragProps} style={{ ...wrapperStyle, ...M3.image, width: w, height: h }} onClick={handleClick}>
					Image
				</div>
			);
		}
		case "content.Icon":
			return (
				<span {...nodeAttrs} {...dragProps} style={{ ...wrapperStyle, ...M3.icon }} onClick={handleClick}>
					{String(node.props.name ?? "star") === "star" ? "★" : String(node.props.name ?? "★")}
				</span>
			);
		case "content.Canvas":
			return (
				<div
					{...nodeAttrs}
					{...dragProps}
					style={{ ...wrapperStyle, ...M3.canvas, width: Number(node.props.width ?? 200), height: Number(node.props.height ?? 200) }}
					onClick={handleClick}
				>
					Canvas
				</div>
			);
		case "content.BasicText":
			return (
				<div {...nodeAttrs} {...dragProps} style={{ ...wrapperStyle, ...M3.text() }} onClick={handleClick}>
					{String(node.props.text ?? "Basic")}
				</div>
			);
	}

	// ===== 默认（未知组件） =====
	return (
		<div
			{...nodeAttrs}
			{...dragProps}
			style={{
				...wrapperStyle,
				padding: 4,
				color: "#888",
				fontSize: 12,
				minHeight: CONTAINER_MIN_HEIGHT,
			}}
			onClick={handleClick}
		>
			{node.children.length > 0 ? childrenContent : node.type}
		</div>
	);
}
