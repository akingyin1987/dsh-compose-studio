// M3 风格 React 模拟渲染（降级预览，docs/design.md 6.6 降级策略）
// Phase 1 先用 React 模拟 Compose 外观；T10/T11 替换为 Compose Web 真实渲染。
import React from "react";
import type { RenderNode } from "./Canvas.js";
import { DND_MIME, axisOf, type DropTarget } from "./drag.js";
import { studioDebug } from "../debug.js";

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

/** 落点指示条（垂直容器用水平线，水平容器用垂直线）。 */
function indicatorStyle(nodeType: string): React.CSSProperties {
	const axis = axisOf(nodeType);
	return axis === "vertical"
		? {
				height: 2,
				width: "100%",
				background: "#1976d2",
				borderRadius: 1,
				flexShrink: 0,
		  }
		: {
				width: 2,
				alignSelf: "stretch",
				background: "#1976d2",
				borderRadius: 1,
				flexShrink: 0,
		  };
}

// ===== 预览节点 =====

export function PreviewNode({
	node,
	onSelect,
	dropIndicator,
}: {
	node: RenderNode;
	onSelect: (id: string) => void;
	dropIndicator?: DropTarget | null;
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

	// 节点属性（data-node-id 供拖放命中；容器标记 data-container）
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
	const showIndicator =
		dropIndicator != null && dropIndicator.parentId === node.id;
	const renderChildren = (): React.ReactNode => {
		const items: React.ReactNode[] = [];
		node.children.forEach((child, i) => {
			if (showIndicator && dropIndicator.index === i) {
				items.push(
					<div key={`ind-${i}`} style={indicatorStyle(node.type)} />,
				);
			}
			items.push(
				<PreviewNode
					key={child.id}
					node={child}
					onSelect={onSelect}
					dropIndicator={dropIndicator}
				/>,
			);
		});
		if (showIndicator && dropIndicator.index === node.children.length) {
			items.push(<div key="ind-end" style={indicatorStyle(node.type)} />);
		}
		return items;
	};

	// 按组件类型渲染（M3 风格）
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
					}}
					onClick={handleClick}
				>
					{renderChildren()}
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
						alignItems: "center",
					}}
					onClick={handleClick}
				>
					{renderChildren()}
				</div>
			);
		case "layout.Box":
			return (
				<div {...nodeAttrs} {...dragProps} style={wrapperStyle} onClick={handleClick}>
					{renderChildren()}
				</div>
			);
		case "m3.Text":
			return (
				<div
					{...nodeAttrs}
					{...dragProps}
					style={{
						...wrapperStyle,
						...M3.text(
							Number(node.props.fontSize ?? 14),
							Number(node.props.fontWeight ?? 400),
						),
					}}
					onClick={handleClick}
				>
					{String(node.props.text ?? node.text ?? "Text")}
				</div>
			);
		case "m3.Button":
			return (
				<button
					{...nodeAttrs}
					{...dragProps}
					style={{ ...wrapperStyle, ...M3.button }}
					onClick={(e) => {
						e.stopPropagation();
						onSelect(node.id);
					}}
				>
					{node.children.length > 0
						? renderChildren()
						: String(node.props.text ?? "Button")}
				</button>
			);
		case "m3.TextField":
			return (
				<div {...nodeAttrs} {...dragProps} style={wrapperStyle} onClick={handleClick}>
					<input
						style={M3.textField}
						placeholder={String(node.props.label ?? "TextField")}
						readOnly
					/>
				</div>
			);
		case "m3.Card":
			return (
				<div
					{...nodeAttrs}
					{...dragProps}
					style={{ ...wrapperStyle, ...M3.card }}
					onClick={handleClick}
				>
					{renderChildren()}
				</div>
			);
		case "m3.Scaffold":
			return (
				<div
					{...nodeAttrs}
					{...dragProps}
					style={{ ...wrapperStyle, ...M3.scaffold }}
					onClick={handleClick}
				>
					{renderChildren()}
				</div>
			);
		case "m3.TopAppBar":
			return (
				<div
					{...nodeAttrs}
					{...dragProps}
					style={{ ...wrapperStyle, ...M3.topBar }}
					onClick={handleClick}
				>
					{String(node.props.title ?? "Title")}
				</div>
			);
		case "content.Image": {
			const w = Number(node.props.width ?? 100);
			const h = Number(node.props.height ?? 100);
			return (
				<div
					{...nodeAttrs}
					{...dragProps}
					style={{ ...wrapperStyle, ...M3.image, width: w, height: h }}
					onClick={handleClick}
				>
					Image
				</div>
			);
		}
		case "content.Icon":
			return (
				<span
					{...nodeAttrs}
					{...dragProps}
					style={{ ...wrapperStyle, ...M3.icon }}
					onClick={handleClick}
				>
					{String(node.props.name ?? "star}") === "star"
						? "★"
						: String(node.props.name ?? "★")}
				</span>
			);
		default:
			return (
				<div
					{...nodeAttrs}
					{...dragProps}
					style={{ ...wrapperStyle, padding: 4, color: "#888", fontSize: 12 }}
					onClick={handleClick}
				>
					{node.type}
				</div>
			);
	}
}
