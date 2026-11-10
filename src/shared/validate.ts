// 文档校验（docs/design.md 5.3 不变式 + 版本兼容）
import type { CanvasDocument, Node, InvariantErrors } from "./document.js";
import {
	DOCUMENT_VERSION,
	isContainerNode,
	validateBasicInvariants,
} from "./document.js";

/** 收集所有容器节点的 children/slots 引用。 */
function collectReferences(
	doc: CanvasDocument,
): { parentCount: Map<string, number>; referenced: Set<string> } {
	const parentCount = new Map<string, number>();
	const referenced = new Set<string>();
	const walk = (node: Node): void => {
		if (isContainerNode(node)) {
			for (const id of [...node.children, ...Object.values(node.slots ?? {}).flat()]) {
				referenced.add(id);
				parentCount.set(id, (parentCount.get(id) ?? 0) + 1);
			}
			// 递归遍历（从 nodes 表解析子节点）
			for (const id of [...node.children, ...Object.values(node.slots ?? {}).flat()]) {
				const child = doc.nodes[id];
				if (child) walk(child);
			}
		}
	};
	walk(doc.root);
	return { parentCount, referenced };
}

/**
 * 完整不变式校验：
 * - 任意节点至多一个父节点
 * - children 无重复 id 且全部可解析
 * - 根节点必须是容器节点
 */
export function validateDocument(doc: CanvasDocument): InvariantErrors {
	const base = validateBasicInvariants(doc);
	const { parentCount, referenced } = collectReferences(doc);

	for (const [id, count] of parentCount) {
		if (count > 1) base.duplicateParents.push(id);
	}
	for (const id of referenced) {
		if (!doc.nodes[id]) base.unresolvedChildren.push(id);
	}
	// 重复 children（同一容器内）
	const duplicateChildren = new Set<string>();
	const walk = (node: Node): void => {
		if (isContainerNode(node)) {
			const seen = new Set<string>();
			for (const id of [...node.children, ...Object.values(node.slots ?? {}).flat()]) {
				if (seen.has(id)) duplicateChildren.add(id);
				seen.add(id);
			}
			for (const id of node.children) {
				const child = doc.nodes[id];
				if (child) walk(child);
			}
		}
	};
	walk(doc.root);
	base.duplicateChildren = [...duplicateChildren];
	return base;
}

export function isDocumentValid(doc: CanvasDocument): boolean {
	const errors = validateDocument(doc);
	return (
		!errors.rootNotContainer &&
		errors.duplicateParents.length === 0 &&
		errors.unresolvedChildren.length === 0 &&
		errors.duplicateChildren.length === 0
	);
}

/** 断言不变式（加载/保存前调用）。 */
export function assertDocumentInvariants(doc: CanvasDocument): void {
	const errors = validateDocument(doc);
	const messages: string[] = [];
	if (errors.rootNotContainer) messages.push("root 必须是容器节点");
	if (errors.duplicateParents.length > 0)
		messages.push(`节点有多个父节点: ${errors.duplicateParents.join(", ")}`);
	if (errors.duplicateChildren.length > 0)
		messages.push(`children 有重复 id: ${errors.duplicateChildren.join(", ")}`);
	if (errors.unresolvedChildren.length > 0)
		messages.push(`children 引用无法解析: ${errors.unresolvedChildren.join(", ")}`);
	if (messages.length > 0) {
		throw new Error(`文档不变式校验失败: ${messages.join("; ")}`);
	}
}

/** 版本兼容校验（当前仅 v1）。 */
export function isVersionSupported(version: number): boolean {
	return version === DOCUMENT_VERSION;
}
