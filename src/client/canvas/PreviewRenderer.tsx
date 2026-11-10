// M3 风格 React 模拟渲染（降级预览，docs/design.md 6.6 降级策略）
// Phase 1 先用 React 模拟 Compose 外观；T10/T11 替换为 Compose Web 真实渲染。
import React from "react";
import type { RenderNode } from "./Canvas.js";

// ===== M3 样式常量（近似 Material 3 基线风格） =====

const M3 = {
	text: (size = 14, weight = 400): React.CSSProperties => ({
		fontSize: size,
		fontWeight: weight,
		color: "#1C1B1F",
		lineHeight: 1.4,
	}),
	button: {
		background: "#6750A4",
		color: "#FFFFFF",
		borderRadius: 20,
		padding: "8px 20px",
		fontSize: 14,
		fontWeight: 500,
		border: "none",
		cursor: "pointer",
		display: "inline-flex",
		alignItems: "center",
	},
	card: {
		borderRadius: 12,
		border: "1px solid #E7E0EC",
		background: "#FFFBFE",
		padding: 12,
	},
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
	textField: {
		border: "1px solid #79747E",
		borderRadius: 4,
		padding: "10px 12px",
		fontSize: 14,
		background: "#fff",
		minWidth: 160,
	},
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
		minHeight: "100%",
		background: "#FFFBFE",
	},
};

// ===== 预览节点 =====

export function PreviewNode({
	node,
	onSelect,
}: {
	node: RenderNode;
	onSelect: (id: string) => void;
}) {
	const isRoot = node.depth === 0;
	const selected = node.selected;

	// 选中高亮边框（overlay 效果）
	const wrapperStyle: React.CSSProperties = {
		outline: selected ? "2px solid #1976d2" : undefined,
		outlineOffset: 1,
		cursor: "pointer",
		position: "relative",
	};

	const handleClick = (e: React.MouseEvent): void => {
		e.stopPropagation();
		onSelect(node.id);
	};

	// 渲染子节点
	const children =
		node.children.length > 0
			? node.children.map((child) => (
					<PreviewNode key={child.id} node={child} onSelect={onSelect} />
				))
			: null;

	// 按组件类型渲染（M3 风格）
	switch (node.type) {
		case "layout.Column":
			return (
				<div style={{ ...wrapperStyle, display: "flex", flexDirection: "column", gap: Number(node.props.spacing ?? 8) }} onClick={handleClick}>
					{children}
				</div>
			);
		case "layout.Row":
			return (
				<div style={{ ...wrapperStyle, display: "flex", gap: Number(node.props.spacing ?? 8), alignItems: "center" }} onClick={handleClick}>
					{children}
				</div>
			);
		case "layout.Box":
			return (
				<div style={wrapperStyle} onClick={handleClick}>
					{children}
				</div>
			);
		case "m3.Text":
			return (
				<div style={{ ...wrapperStyle, ...M3.text(Number(node.props.fontSize ?? 14), Number(node.props.fontWeight ?? 400)) }} onClick={handleClick}>
					{String(node.props.text ?? node.text ?? "Text")}
				</div>
			);
		case "m3.Button":
			return (
				<button style={{ ...wrapperStyle, ...M3.button }} onClick={(e) => { e.stopPropagation(); onSelect(node.id); }}>
					{children ?? String(node.props.text ?? "Button")}
				</button>
			);
		case "m3.TextField":
			return (
				<div style={wrapperStyle} onClick={handleClick}>
					<input
						style={M3.textField}
						placeholder={String(node.props.label ?? "TextField")}
						readOnly
					/>
				</div>
			);
		case "m3.Card":
			return (
				<div style={{ ...wrapperStyle, ...M3.card }} onClick={handleClick}>
					{children}
				</div>
			);
		case "m3.Scaffold":
			return (
				<div style={{ ...wrapperStyle, ...M3.scaffold }} onClick={handleClick}>
					{children}
				</div>
			);
		case "m3.TopAppBar":
			return (
				<div style={{ ...wrapperStyle, ...M3.topBar }} onClick={handleClick}>
					{String(node.props.title ?? "Title")}
				</div>
			);
		case "content.Image": {
			const w = Number(node.props.width ?? 100);
			const h = Number(node.props.height ?? 100);
			return (
				<div style={{ ...wrapperStyle, ...M3.image, width: w, height: h }} onClick={handleClick}>
					Image
				</div>
			);
		}
		case "content.Icon":
			return (
				<span style={{ ...wrapperStyle, ...M3.icon }} onClick={handleClick}>
					{String(node.props.name ?? "star") === "star" ? "★" : String(node.props.name ?? "★")}
				</span>
			);
		default:
			return (
				<div style={{ ...wrapperStyle, padding: 4, color: "#888", fontSize: 12 }} onClick={handleClick}>
					{node.type}
				</div>
			);
	}
}
