// 画布与节点渲染（Dark Mode 设计；设备框模拟真实屏幕）
import React, { useMemo } from "react";
import type { CanvasDocument, Node, ContainerNode, LeafNode } from "../../shared/document.js";
import { isContainerNode } from "../../shared/document.js";
import { getBuiltinDevice } from "../../shared/device.js";
import type { StudioState, Action } from "../store.js";
import { PreviewNode } from "./PreviewRenderer.js";
import { UI } from "../theme/ui.js";

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

export function Canvas({
	state,
	dispatch,
}: {
	state: StudioState;
	dispatch: (action: Action) => void;
}) {
	const { document, device, selection } = state;
	const selectedIds = useMemo(() => new Set(selection.ids), [selection.ids]);
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
				background: UI.bg,
				padding: UI.space.xl,
			}}
			onClick={() => dispatch({ type: "selection/set", ids: [], anchorId: null })}
		>
			{/* 设备框（模拟真实屏幕） */}
			<div
				style={{
					transform: `scale(${device.zoom})`,
					transformOrigin: "top center",
					width: widthDp,
					minHeight: heightDp,
					margin: "0 auto",
					background: "#FFFFFF",
					borderRadius: UI.radius.xl,
					boxShadow: UI.shadow.lg,
					border: `1px solid ${UI.border}`,
					padding: UI.space.md,
					boxSizing: "border-box",
					backgroundImage: device.showGrid
						? "linear-gradient(#f1f5f9 1px, transparent 1px), linear-gradient(90deg, #f1f5f9 1px, transparent 1px)"
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
