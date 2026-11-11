// 拖拽编排（docs/design.md 6.3：拖放完成时一次性 dispatch node/add + node/move）
// 纯函数层：落点计算 / 容器解析 / 默认节点创建（可单测，几何由 UI 层从 DOM 测量）。
import type {
	CanvasDocument,
	ContainerNode,
	LeafNode,
	Node,
} from "../../shared/document.js";
import { isContainerNode } from "../../shared/document.js";
import type { ComponentDescriptor } from "../palette/catalog.js";

/** 拖拽数据类型（palette 与 canvas 共用；payload 为 descriptor id 或节点 id）。 */
export const DND_MIME = "application/x-compose-studio";

export type Axis = "vertical" | "horizontal";

/** 子节点在主轴上的几何（start/end 已由调用方按轴取好坐标）。 */
export interface ChildGeometry {
	id: string;
	start: number;
	end: number;
}

export interface DropTarget {
	parentId: string;
	index: number;
}

/** 节点主轴（Row 水平，其余垂直）。 */
export function axisOf(nodeType: string): Axis {
	return nodeType === "layout.Row" ? "horizontal" : "vertical";
}

/**
 * 计算插入 index：返回第一个中点超过指针位置的子元素下标。
 * pointer 与几何同坐标系（clientX/clientY），axis 决定用哪个分量。
 */
export function computeInsertIndex(
	axis: Axis,
	children: ChildGeometry[],
	x: number,
	y: number,
): number {
	const pos = axis === "vertical" ? y : x;
	for (let i = 0; i < children.length; i++) {
		const mid = (children[i].start + children[i].end) / 2;
		if (pos < mid) return i;
	}
	return children.length;
}

/** 在文档中查找节点的父容器 id（遍历 children 与 slots）。 */
export function findParentId(doc: CanvasDocument, id: string): string | null {
	for (const node of Object.values(doc.nodes)) {
		if (!isContainerNode(node)) continue;
		if (node.children.includes(id)) return node.id;
		for (const ids of Object.values(node.slots ?? {})) {
			if (ids.includes(id)) return node.id;
		}
	}
	return null;
}

/**
 * 解析落点容器：命中容器 → 用其自身；命中叶子 → 用父容器；未命中 → null。
 */
export function resolveContainerId(
	doc: CanvasDocument,
	hitId: string | null,
): string | null {
	if (!hitId) return null;
	const hitNode = doc.nodes[hitId];
	if (hitNode && isContainerNode(hitNode)) return hitNode.id;
	return findParentId(doc, hitId);
}

/**
 * 解析完整落点（容器 + index）。
 * childGeometries 为命中容器内直接子节点的几何（顺序与文档 children 一致）。
 */
export function resolveDropTarget(
	doc: CanvasDocument,
	hitId: string | null,
	axis: Axis,
	childGeometries: ChildGeometry[],
	x: number,
	y: number,
): DropTarget | null {
	const parentId = resolveContainerId(doc, hitId);
	if (!parentId) return null;
	const parent = doc.nodes[parentId];
	if (!parent || !isContainerNode(parent)) return null;
	return { parentId, index: computeInsertIndex(axis, childGeometries, x, y) };
}

/** 判断 id 是否在 subtreeRootId 的子树中（含自身）；用于禁止把容器拖入自身/子孙。 */
export function isInSubtree(
	doc: CanvasDocument,
	id: string,
	subtreeRootId: string,
): boolean {
	if (id === subtreeRootId) return true;
	const root = doc.nodes[subtreeRootId];
	if (!root || !isContainerNode(root)) return false;
	const walk = (node: Node): boolean => {
		if (node.id === id) return true;
		if (!isContainerNode(node)) return false;
		return node.children.some((cid) => {
			const child = doc.nodes[cid];
			return child ? walk(child) : false;
		});
	};
	return walk(root);
}

/** 从节点 props 读取修饰符样式（宽/高/内边距/背景色，纯函数）。
 * key 带 modifier 前缀，避免与组件自身属性（如 Image 的 width）冲突。 */
export function getModifierStyle(
	props: Record<string, unknown>,
): {
	width?: number;
	height?: number;
	padding?: number;
	background?: string;
} {
	return {
		width: props.modifierWidth != null ? Number(props.modifierWidth) : undefined,
		height: props.modifierHeight != null ? Number(props.modifierHeight) : undefined,
		padding: props.modifierPadding != null ? Number(props.modifierPadding) : undefined,
		background:
			typeof props.modifierBackground === "string"
				? props.modifierBackground
				: undefined,
	};
}

/** 由 descriptor 创建默认节点（id 在 takenIds 中唯一，按序号递增）。 */
export function createNodeFromDescriptor(
	descriptor: ComponentDescriptor,
	takenIds: Set<string>,
): Node {
	const props: Record<string, unknown> = {};
	for (const schema of descriptor.defaultProps) {
		if ("default" in schema && schema.default !== undefined) {
			props[schema.key] = schema.default;
		}
	}
	const base = descriptor.id.replace(/[^A-Za-z0-9]+/g, "-");
	let seq = 1;
	let id = `${base}-${seq}`;
	while (takenIds.has(id)) {
		seq += 1;
		id = `${base}-${seq}`;
	}
	if (descriptor.codegen.render === "leaf") {
		const node: LeafNode = { id, type: descriptor.id, props };
		if (descriptor.preview.kind === "text" && typeof props.text === "string") {
			node.text = props.text;
		}
		return node;
	}
	const node: ContainerNode = { id, type: descriptor.id, props, children: [] };
	return node;
}
