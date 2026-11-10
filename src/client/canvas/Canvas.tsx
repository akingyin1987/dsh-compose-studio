// 画布与节点渲染（React 占位渲染，几何来自文档模型）
import React, { useMemo } from "react";
import type { CanvasDocument, Node, ContainerNode, LeafNode } from "../../shared/document.js";
import { isContainerNode } from "../../shared/document.js";
import { getBuiltinDevice } from "../../shared/device.js";
import type { StudioState, Action } from "../store.js";
import { PreviewNode } from "./PreviewRenderer.js";

// ===== 渲染树（纯数据，可测试） =====

export interface RenderNode {
	id: string;
	type: string;
	label?: string;
	depth: number;
	selected: boolean;
	isContainer: boolean;
	children: RenderNode[];
	props: Record<string, unknown>;
	text?: string;
}

/**
 * 从文档模型构建渲染树（纯函数）。
 * 几何/结构来自文档模型，不依赖真实组件渲染（Phase 1 由 Compose Web 替换）。
 */
export function buildRenderTree(
	doc: CanvasDocument,
	selectedIds: Set<string>,
): RenderNode {
	const build = (node: Node, depth: number): RenderNode => {
		const isContainer = isContainerNode(node);
		const children: RenderNode[] = isContainer
			? node.children
					.map((id) => doc.nodes[id])
					.filter((n): n is Node => Boolean(n))
					.map((n) => build(n, depth + 1))
			: [];
		return {
			id: node.id,
			type: node.type,
			label: node.label,
			depth,
			selected: selectedIds.has(node.id),
			isContainer,
			children,
			props: node.props,
			text: isContainer ? undefined : (node as LeafNode).text,
		};
	};
	return build(doc.root, 0);
}

// ===== 组件 =====

function RenderNodeView({
	node,
	onSelect,
}: {
	node: RenderNode;
	onSelect: (id: string) => void;
}) {
	return (
		<div
			onClick={(e) => {
				e.stopPropagation();
				onSelect(node.id);
			}}
			data-node-id={node.id}
			style={{
				border: node.selected ? "2px solid #1976d2" : "1px dashed transparent",
				borderRadius: 4,
				padding: "4px 8px",
				margin: "2px 0",
				background: node.selected ? "#e3f2fd" : "transparent",
				transition: "border-color 0.1s",
			}}
		>
			<div style={{ fontSize: 11, color: "#888", lineHeight: 1.2 }}>
				{node.type}
				{node.label ? ` · ${node.label}` : ""}
			</div>
			{node.text !== undefined ? (
				<div style={{ fontSize: 13, color: "#333" }}>{node.text}</div>
			) : null}
			{node.children.map((child) => (
				<RenderNodeView key={child.id} node={child} onSelect={onSelect} />
			))}
		</div>
	);
}

export function Canvas({
	state,
	dispatch,
}: {
	state: StudioState;
	dispatch: (action: Action) => void;
}) {
	const { document, device, selection } = state;
	const selectedIds = useMemo(
		() => new Set(selection.ids),
		[selection.ids],
	);
	const tree = useMemo(
		() => buildRenderTree(document, selectedIds),
		[document, selectedIds],
	);
	const activeDevice = getBuiltinDevice(device.activeId);
	const widthDp = activeDevice?.widthDp ?? 360;
	const heightDp = activeDevice?.heightDp ?? 800;

	const handleSelect = (id: string): void => {
		dispatch({ type: "selection/set", ids: [id], anchorId: id });
	};

	return (
		<div
			style={{
				flex: 1,
				overflow: "auto",
				background: "#f0f2f5",
				padding: 24,
			}}
			onClick={() => dispatch({ type: "selection/set", ids: [], anchorId: null })}
		>
			<div
				style={{
					transform: `scale(${device.zoom})`,
					transformOrigin: "top center",
					width: widthDp,
					minHeight: heightDp,
					margin: "0 auto",
					background: "#fff",
					border: "1px solid #d0d0d0",
					borderRadius: 8,
					padding: 8,
					boxSizing: "border-box",
					backgroundImage: device.showGrid
						? "linear-gradient(#f5f5f5 1px, transparent 1px), linear-gradient(90deg, #f5f5f5 1px, transparent 1px)"
						: "none",
					backgroundSize: "20px 20px",
				}}
			>
				<PreviewNode node={tree} onSelect={handleSelect} />
			</div>
		</div>
	);
}

/** 容器类型集合（判断容器用）。 */
export function isContainerType(node: Node): node is ContainerNode {
	return isContainerNode(node);
}
