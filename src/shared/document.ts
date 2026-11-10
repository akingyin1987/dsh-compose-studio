// 画布文档模型与属性 Schema（docs/design.md 5.2 / 5.3）
import type { DeviceProfile } from "./device.js";
import type { ThemeSpec } from "./theme.js";

/** 文档版本（当前 v1；破坏性变更时递增并配套迁移）。 */
export const DOCUMENT_VERSION = 1 as const;

/** 画布文档（单一数据源，不可变）。
 * 采用 design.md 5.3 的"树形 + id 引用"：children 存 id，
 * 节点对象存放在 nodes 扁平表中（加载时由 validate.ts 解析校验）。 */
export interface CanvasDocument {
	version: typeof DOCUMENT_VERSION;
	id: string;
	name: string;
	createdAt: number;
	updatedAt: number;
	root: ContainerNode;
	/** 扁平节点表（含 root 及所有子节点，key 为节点 id）。 */
	nodes: Record<string, Node>;
	theme: ThemeSpec;
	devices: DeviceProfile[];
	activeDeviceId: string;
}

export interface NodeBase {
	/** 文档内唯一 id。 */
	id: string;
	/** 对应 ComponentDescriptor.id（如 "m3.Button"）。 */
	type: string;
	/** 可选语义名（用于代码生成命名）。 */
	label?: string;
}

export interface ContainerNode extends NodeBase {
	type: string;
	props: Record<string, unknown>;
	/** 有序子节点 id。 */
	children: string[];
	/** 命名槽（如 topBar / content）。 */
	slots?: Record<string, string[]>;
}

export interface LeafNode extends NodeBase {
	type: string;
	props: Record<string, unknown>;
	/** Text 的内容。 */
	text?: string;
}

export type Node = ContainerNode | LeafNode;

export function isContainerNode(node: Node): node is ContainerNode {
	return Array.isArray((node as ContainerNode).children);
}

// ===== 属性 Schema（5.2） =====

export interface TextStyleSpec {
	fontFamily?: string;
	fontSize?: number;
	fontWeight?: "W100" | "W200" | "W300" | "W400" | "W500" | "W600" | "W700" | "W800" | "W900";
	lineHeight?: number;
	letterSpacing?: number;
	textDecoration?: "none" | "lineThrough";
}

export type PropSchema =
	| { kind: "string"; key: string; label: string; default?: string; maxLength?: number; multiline?: boolean }
	| { kind: "boolean"; key: string; label: string; default?: boolean }
	| { kind: "number"; key: string; label: string; default?: number; min?: number; max?: number; step?: number; unit?: string }
	| { kind: "enum"; key: string; label: string; options: { value: string; label: string }[]; default?: string }
	| { kind: "color"; key: string; label: string; default?: string }
	| { kind: "dp"; key: string; label: string; default?: number; min?: number; max?: number }
	| { kind: "spacing"; key: string; label: string; default?: { x: number; y: number } }
	| { kind: "text-style"; key: string; label: string; default?: TextStyleSpec }
	| { kind: "event"; key: string; label: string; actions: string[] }
	| { kind: "slot"; key: string; label: string; accepts: string[] };

// ===== 不变式错误（5.3） =====

export interface InvariantErrors {
	/** 节点被多个父节点引用（违反"至多一个父节点"）。 */
	duplicateParents: string[];
	/** children 中无法解析的 id。 */
	unresolvedChildren: string[];
	/** children 中重复的 id。 */
	duplicateChildren: string[];
	/** 根节点不是容器节点。 */
	rootNotContainer: boolean;
}

/**
 * 基础不变式：根节点必须是容器节点。
 * 完整校验（父节点计数、children 解析）见 validate.ts（需要节点索引）。
 */
export function validateBasicInvariants(doc: CanvasDocument): InvariantErrors {
	return {
		duplicateParents: [],
		unresolvedChildren: [],
		duplicateChildren: [],
		rootNotContainer: !isContainerNode(doc.root),
	};
}
