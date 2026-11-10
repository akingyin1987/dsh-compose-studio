// 画布与节点渲染（Dark Mode 设计；设备框模拟真实屏幕）
import React, { useMemo, useRef, useState } from "react";
import type { CanvasDocument, Node, ContainerNode, LeafNode } from "../../shared/document.js";
import { isContainerNode } from "../../shared/document.js";
import { getBuiltinDevice } from "../../shared/device.js";
import type { StudioState, Action } from "../store.js";
import { PreviewNode } from "./PreviewRenderer.js";
import {
	DND_MIME,
	axisOf,
	computeInsertIndex,
	createNodeFromDescriptor,
	isInSubtree,
	resolveContainerId,
	type Axis,
	type ChildGeometry,
	type DropTarget,
} from "./drag.js";
import { findDescriptor } from "../palette/catalog.js";
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

/** 测量容器元素内直接子节点在主轴上的几何（顺序与文档 children 一致）。 */
function measureChildren(
	containerEl: HTMLElement,
	axis: Axis,
): ChildGeometry[] {
	const childEls = Array.from(containerEl.children).filter(
		(el): el is HTMLElement =>
			el instanceof HTMLElement && el.hasAttribute("data-node-id"),
	);
	return childEls.map((el) => {
		const r = el.getBoundingClientRect();
		return {
			id: el.getAttribute("data-node-id") as string,
			start: axis === "vertical" ? r.top : r.left,
			end: axis === "vertical" ? r.bottom : r.right,
		};
	});
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

	const frameRef = useRef<HTMLDivElement>(null);
	const [dropIndicator, setDropIndicator] = useState<DropTarget | null>(null);

	const handleSelect = (id: string): void => {
		dispatch({ type: "selection/set", ids: [id], anchorId: id });
	};

	/** 从命中元素解析落点容器与几何，更新指示条。 */
	const updateDropTarget = (e: React.DragEvent): void => {
		const hitEl = (e.target as HTMLElement).closest("[data-node-id]");
		const hitId = hitEl?.getAttribute("data-node-id") ?? null;
		const parentId = resolveContainerId(document, hitId) ?? document.root.id;
		const parent = document.nodes[parentId];
		if (!parent || !isContainerNode(parent)) return;
		const axis = axisOf(parent.type);
		// 容器元素：命中容器自身；命中叶子时向上找容器；未命中时用 root 元素
		const containerEl =
			(hitEl?.closest("[data-container]") as HTMLElement | null) ??
			(frameRef.current?.querySelector(
				`[data-node-id="${parentId}"]`,
			) as HTMLElement | null);
		if (!containerEl) return;
		const geoms = measureChildren(containerEl, axis);
		const index = computeInsertIndex(axis, geoms, e.clientX, e.clientY);
		setDropIndicator({ parentId, index });
	};

	const handleDragOver = (e: React.DragEvent): void => {
		if (!e.dataTransfer.types.includes(DND_MIME)) return;
		e.preventDefault();
		e.dataTransfer.dropEffect = "copy";
		updateDropTarget(e);
	};

	const handleDragLeave = (e: React.DragEvent): void => {
		if (
			frameRef.current &&
			!frameRef.current.contains(e.relatedTarget as globalThis.Node)
		) {
			setDropIndicator(null);
		}
	};

	const handleDrop = (e: React.DragEvent): void => {
		if (!e.dataTransfer.types.includes(DND_MIME)) return;
		e.preventDefault();
		const payload = e.dataTransfer.getData(DND_MIME);
		const target = dropIndicator;
		setDropIndicator(null);
		if (!payload) return;

		// payload 为 descriptor id → 新建节点
		const descriptor = findDescriptor(payload);
		if (descriptor) {
			const node = createNodeFromDescriptor(
				descriptor,
				new Set(Object.keys(document.nodes)),
			);
			dispatch({
				type: "node/add",
				parentId: target?.parentId ?? document.root.id,
				node,
				index: target?.index,
			});
			dispatch({ type: "selection/set", ids: [node.id], anchorId: node.id });
			return;
		}
		// payload 为节点 id → 重排（根节点不可移动；禁止拖入自身/子孙防止成环）
		if (document.nodes[payload] && payload !== document.root.id) {
			const toParentId = target?.parentId ?? document.root.id;
			if (!isInSubtree(document, toParentId, payload)) {
				dispatch({
					type: "node/move",
					id: payload,
					toParentId,
					index: target?.index ?? 0,
				});
				dispatch({ type: "selection/set", ids: [payload], anchorId: payload });
			}
		}
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
				ref={frameRef}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
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
				<PreviewNode
					node={tree}
					onSelect={handleSelect}
					dropIndicator={dropIndicator}
				/>
			</div>
		</div>
	);
}

/** 容器类型集合（判断容器用）。 */
export function isContainerType(node: Node): node is ContainerNode {
	return isContainerNode(node);
}
