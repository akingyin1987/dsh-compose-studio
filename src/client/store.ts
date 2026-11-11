// 客户端状态（单一数据源，docs/design.md 6.1）
import type { CanvasDocument, Node, ContainerNode } from "../shared/document.js";
import { isContainerNode } from "../shared/document.js";
import type { ThemeSpec } from "../shared/theme.js";
import { createDefaultTheme } from "../shared/theme.js";
import { BUILTIN_DEVICES } from "../shared/device.js";

export const HISTORY_LIMIT = 100;
export const MERGE_WINDOW_MS = 800;

export interface StudioState {
	document: CanvasDocument;
	selection: { ids: string[]; anchorId: string | null };
	clipboard: ClipboardPayload | null;
	theme: ThemeSpec;
	device: { activeId: string; zoom: number; showGrid: boolean };
	history: { undo: HistoryEntry[]; redo: HistoryEntry[] };
	ui: {
		leftWidth: number;
		rightWidth: number;
		inspectorTab: "props" | "theme";
		/** 显示容器边界虚线（默认开启）。 */
		showBorders: boolean;
	};
}

export interface ClipboardPayload {
	nodes: Node[];
	fromIds: string[];
}

export interface HistoryEntry {
	action: Action;
	inverse: Action | null;
	label: string;
	ts: number;
}

/** 深Partial（theme/update 用）。 */
export type DeepPartial<T> = {
	[K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export type Action =
	| { type: "node/add"; parentId: string; node: Node; index?: number; ts?: number }
	| { type: "node/remove"; id: string; ts?: number }
	| {
			type: "node/move";
			id: string;
			toParentId: string;
			index: number;
			fromParentId?: string;
			fromIndex?: number;
			ts?: number;
	  }
	| { type: "node/updateProps"; id: string; patch: Record<string, unknown>; ts?: number }
	| { type: "node/rename"; id: string; label: string; ts?: number }
	// 恢复子树（node/remove 的逆操作，携带完整子树）
	| {
			type: "node/restore";
			parentId: string;
			index?: number;
			subtree: Record<string, Node>;
			rootId: string;
			ts?: number;
	  }
	| { type: "selection/set"; ids: string[]; anchorId?: string | null; ts?: number }
	| { type: "theme/update"; patch: DeepPartial<ThemeSpec>; ts?: number }
	| { type: "device/set"; id: string; ts?: number }
	| { type: "canvas/zoom"; zoom: number; ts?: number }
	| { type: "history/undo"; ts?: number }
	| { type: "history/redo"; ts?: number }
	// 文档生命周期
	| { type: "doc/new"; docId: string; name?: string; ts?: number }
	| { type: "doc/load"; doc: CanvasDocument; ts?: number }
	| { type: "doc/rename"; name: string; ts?: number }
	| { type: "ui/toggleBorders"; ts?: number };

const now = (): number => Date.now();

// ===== 初始状态（示例文档） =====

/** 创建初始状态（含示例文档：Scaffold > Column > [Text, Button]）。 */
export function createInitialState(): StudioState {
	const root: ContainerNode = {
		id: "root",
		type: "m3.Scaffold",
		props: {},
		children: ["col"],
	};
	const col: ContainerNode = {
		id: "col",
		type: "Column",
		props: { spacing: 16 },
		children: ["title", "btn"],
	};
	const title: Node = {
		id: "title",
		type: "m3.Text",
		props: { text: "Compose Studio" },
		text: "Compose Studio",
	};
	const btn: Node = { id: "btn", type: "m3.Button", props: {} };
	const doc: CanvasDocument = {
		version: 1,
		id: "doc-initial",
		name: "Untitled",
		createdAt: now(),
		updatedAt: now(),
		root,
		nodes: { root, col, title, btn },
		theme: createDefaultTheme(),
		devices: BUILTIN_DEVICES,
		activeDeviceId: "phone",
	};
	return {
		document: doc,
		selection: { ids: [], anchorId: null },
		clipboard: null,
		theme: createDefaultTheme(),
		device: { activeId: "phone", zoom: 1, showGrid: false },
		history: { undo: [], redo: [] },
		ui: { leftWidth: 240, rightWidth: 320, inspectorTab: "props", showBorders: true },
	};
}

/** 创建空文档（根为 Scaffold）。 */
export function createEmptyDocument(
	id: string,
	name = "Untitled",
): CanvasDocument {
	const root: ContainerNode = {
		id: "root",
		type: "m3.Scaffold",
		props: {},
		children: [],
	};
	return {
		version: 1,
		id,
		name,
		createdAt: now(),
		updatedAt: now(),
		root,
		nodes: { root },
		theme: createDefaultTheme(),
		devices: BUILTIN_DEVICES,
		activeDeviceId: "phone",
	};
}

/** 生成唯一文档 id。 */
export function generateDocId(): string {
	return `doc-${Date.now().toString(36)}-${Math.random()
		.toString(36)
		.slice(2, 8)}`;
}

/** 同步 root 引用（doc 操作后 root 对象可能变化）。 */
function syncRoot(doc: CanvasDocument): CanvasDocument {
	const root = doc.nodes[doc.root.id];
	if (!root || !isContainerNode(root)) return doc;
	return root === doc.root ? doc : { ...doc, root };
}

// ===== 文档操作（纯函数） =====

function docAddNode(
	doc: CanvasDocument,
	parentId: string,
	node: Node,
	index?: number,
): CanvasDocument {
	const parent = doc.nodes[parentId];
	if (!parent || !isContainerNode(parent)) return doc;
	const nodes = { ...doc.nodes, [node.id]: node };
	const children = [...parent.children];
	const at = index ?? children.length;
	children.splice(at, 0, node.id);
	return syncRoot({
		...doc,
		nodes: { ...nodes, [parentId]: { ...parent, children } },
	});
}

function collectSubtreeIds(doc: CanvasDocument, id: string): Set<string> {
	const result = new Set<string>();
	const walk = (node: Node): void => {
		if (result.has(node.id)) return;
		result.add(node.id);
		if (isContainerNode(node)) {
			for (const cid of node.children) {
				const child = doc.nodes[cid];
				if (child) walk(child);
			}
		}
	};
	const node = doc.nodes[id];
	if (node) walk(node);
	return result;
}

function collectSubtreeNodes(
	doc: CanvasDocument,
	id: string,
): Record<string, Node> {
	const result: Record<string, Node> = {};
	const walk = (node: Node): void => {
		if (result[node.id]) return;
		result[node.id] = node;
		if (isContainerNode(node)) {
			for (const cid of node.children) {
				const child = doc.nodes[cid];
				if (child) walk(child);
			}
		}
	};
	const node = doc.nodes[id];
	if (node) walk(node);
	return result;
}

function docRemoveNode(doc: CanvasDocument, id: string): CanvasDocument {
	const toDelete = collectSubtreeIds(doc, id);
	const nodes = { ...doc.nodes };
	for (const delId of toDelete) delete nodes[delId];
	// 从所有父节点的 children/slots 中移除引用
	for (const node of Object.values(nodes)) {
		if (!isContainerNode(node)) continue;
		const children = node.children.filter((cid) => !toDelete.has(cid));
		if (children.length !== node.children.length) {
			nodes[node.id] = { ...node, children };
		}
		if (node.slots) {
			const slots: Record<string, string[]> = {};
			let changed = false;
			for (const [key, ids] of Object.entries(node.slots)) {
				const filtered = ids.filter((sid) => !toDelete.has(sid));
				slots[key] = filtered;
				if (filtered.length !== ids.length) changed = true;
			}
			if (changed) nodes[node.id] = { ...nodes[node.id], slots };
		}
	}
	return syncRoot({ ...doc, nodes });
}

function docMoveNode(
	doc: CanvasDocument,
	id: string,
	toParentId: string,
	index: number,
): CanvasDocument {
	const fromParent = findParent(doc, id);
	const node = doc.nodes[id];
	if (!node) return doc;
	let next = doc;
	if (fromParent && isContainerNode(fromParent)) {
		const children = fromParent.children.filter((cid) => cid !== id);
		next = {
			...next,
			nodes: { ...next.nodes, [fromParent.id]: { ...fromParent, children } },
		};
	}
	const toParent = next.nodes[toParentId];
	if (!toParent || !isContainerNode(toParent)) return doc;
	const children = [...toParent.children];
	children.splice(index, 0, id);
	return syncRoot({
		...next,
		nodes: { ...next.nodes, [toParentId]: { ...toParent, children } },
	});
}

function findParent(doc: CanvasDocument, id: string): ContainerNode | undefined {
	for (const node of Object.values(doc.nodes)) {
		if (!isContainerNode(node)) continue;
		if (node.children.includes(id)) return node;
		for (const ids of Object.values(node.slots ?? {})) {
			if (ids.includes(id)) return node;
		}
	}
	return undefined;
}

function docUpdateProps(
	doc: CanvasDocument,
	id: string,
	patch: Record<string, unknown>,
): CanvasDocument {
	const node = doc.nodes[id];
	if (!node) return doc;
	return syncRoot({
		...doc,
		nodes: { ...doc.nodes, [id]: { ...node, props: { ...node.props, ...patch } } },
	});
}

function docRestoreSubtree(
	doc: CanvasDocument,
	parentId: string,
	index: number | undefined,
	subtree: Record<string, Node>,
	rootId: string,
): CanvasDocument {
	const parent = doc.nodes[parentId];
	if (!parent || !isContainerNode(parent)) return doc;
	const nodes = { ...doc.nodes, ...subtree };
	const children = [...parent.children];
	children.splice(index ?? children.length, 0, rootId);
	return syncRoot({
		...doc,
		nodes: { ...nodes, [parentId]: { ...parent, children } },
	});
}

// ===== 逆操作 =====

function invert(action: Action, state: StudioState): Action | null {
	switch (action.type) {
		case "node/add":
			return { type: "node/remove", id: action.node.id };
		case "node/remove": {
			const node = state.document.nodes[action.id];
			if (!node) return null;
			const parent = findParent(state.document, action.id);
			if (!parent) return null;
			const index = parent.children.indexOf(action.id);
			const subtree = collectSubtreeNodes(state.document, action.id);
			return {
				type: "node/restore",
				parentId: parent.id,
				index: index >= 0 ? index : undefined,
				subtree,
				rootId: action.id,
			};
		}
		case "node/move": {
			if (!action.fromParentId || action.fromIndex === undefined) return null;
			return {
				type: "node/move",
				id: action.id,
				toParentId: action.fromParentId,
				index: action.fromIndex,
				fromParentId: action.toParentId,
				fromIndex: action.index,
			};
		}
		case "node/updateProps": {
			const node = state.document.nodes[action.id];
			if (!node) return null;
			const original: Record<string, unknown> = {};
			for (const key of Object.keys(action.patch)) {
				original[key] = node.props[key];
			}
			return { type: "node/updateProps", id: action.id, patch: original };
		}
		case "node/rename": {
			const node = state.document.nodes[action.id];
			if (!node || node.label === undefined) return null;
			return { type: "node/rename", id: action.id, label: node.label };
		}
		case "node/restore": {
			// 恢复的逆操作是再次删除根节点
			return { type: "node/remove", id: action.rootId };
		}
		case "selection/set":
			return {
				type: "selection/set",
				ids: state.selection.ids,
				anchorId: state.selection.anchorId,
			};
		case "device/set": {
			const prev = state.device.activeId;
			return { type: "device/set", id: prev };
		}
		case "canvas/zoom":
			return { type: "canvas/zoom", zoom: state.device.zoom };
		default:
			return null;
	}
}

// ===== 历史栈 =====

export function pushHistory(
	undo: HistoryEntry[],
	entry: HistoryEntry,
): HistoryEntry[] {
	// 合并：连续 node/updateProps（同 id）在 MERGE_WINDOW_MS 内合并，保留原 inverse
	if (entry.action.type === "node/updateProps" && undo.length > 0) {
		const last = undo[0];
		if (
			last.action.type === "node/updateProps" &&
			last.action.id === (entry.action as { id: string }).id &&
			entry.ts - last.ts < MERGE_WINDOW_MS
		) {
			return [{ ...entry, inverse: last.inverse, label: entry.label }, ...undo.slice(1)];
		}
	}
	return [entry, ...undo].slice(0, HISTORY_LIMIT);
}

// ===== Reducer =====

export function reducer(state: StudioState, action: Action): StudioState {
	const ts = action.ts ?? now();

	switch (action.type) {
		case "node/add": {
			const next = docAddNode(state.document, action.parentId, action.node, action.index);
			if (next === state.document) return state;
			return withHistory(state, next, action, ts);
		}
		case "node/remove": {
			const next = docRemoveNode(state.document, action.id);
			if (next === state.document) return state;
			return withHistory(state, next, action, ts);
		}
		case "node/move": {
			const fromParent = findParent(state.document, action.id);
			const enriched: Action = {
				...action,
				fromParentId: action.fromParentId ?? fromParent?.id,
				fromIndex:
					action.fromIndex ??
					(fromParent ? fromParent.children.indexOf(action.id) : undefined),
			};
			const next = docMoveNode(state.document, action.id, action.toParentId, action.index);
			if (next === state.document) return state;
			return withHistory(state, next, enriched, ts);
		}
		case "node/updateProps": {
			const next = docUpdateProps(state.document, action.id, action.patch);
			if (next === state.document) return state;
			return withHistory(state, next, action, ts);
		}
		case "node/rename": {
			const node = state.document.nodes[action.id];
			if (!node) return state;
			const next = syncRoot({
				...state.document,
				nodes: { ...state.document.nodes, [action.id]: { ...node, label: action.label } },
			});
			return withHistory(state, next, action, ts);
		}
		case "node/restore": {
			const next = docRestoreSubtree(
				state.document,
				action.parentId,
				action.index,
				action.subtree,
				action.rootId,
			);
			if (next === state.document) return state;
			return withHistory(state, next, action, ts);
		}
		case "selection/set":
			return {
				...state,
				selection: { ids: action.ids, anchorId: action.anchorId ?? null },
			};
		case "theme/update":
			return { ...state, theme: deepMerge(state.theme, action.patch) };
		case "device/set":
			return { ...state, device: { ...state.device, activeId: action.id } };
		case "canvas/zoom":
			return { ...state, device: { ...state.device, zoom: action.zoom } };
		case "history/undo": {
			const [entry, ...rest] = state.history.undo;
			if (!entry || !entry.inverse) return state;
			const base: StudioState = {
				...state,
				history: { undo: rest, redo: [entry, ...state.history.redo] },
			};
			return applyWithoutHistory(base, entry.inverse);
		}
		case "history/redo": {
			const [entry, ...rest] = state.history.redo;
			if (!entry) return state;
			const base: StudioState = {
				...state,
				history: { undo: [entry, ...state.history.undo], redo: rest },
			};
			return applyWithoutHistory(base, entry.action);
		}
		case "doc/new": {
			const doc = createEmptyDocument(action.docId, action.name);
			return {
				...state,
				document: doc,
				selection: { ids: [], anchorId: null },
				history: { undo: [], redo: [] },
			};
		}
		case "doc/load":
			return {
				...state,
				document: action.doc,
				selection: { ids: [], anchorId: null },
				history: { undo: [], redo: [] },
			};
		case "doc/rename":
			return {
				...state,
				document: { ...state.document, name: action.name },
			};
		case "ui/toggleBorders":
			return {
				...state,
				ui: { ...state.ui, showBorders: !state.ui.showBorders },
			};
		default:
			return state;
	}
}

/** 应用 action 并记录历史（reducer 内部）。 */
function withHistory(
	state: StudioState,
	nextDoc: CanvasDocument,
	action: Action,
	ts: number,
): StudioState {
	const inverse = invert(action, state);
	const entry: HistoryEntry = { action, inverse, label: action.type, ts };
	return {
		...state,
		document: nextDoc,
		history: { undo: pushHistory(state.history.undo, entry), redo: [] },
	};
}

/** 应用 action（不记录历史，供 undo/redo 使用）。 */
function applyWithoutHistory(state: StudioState, action: Action): StudioState {
	const tmp = reducer({ ...state, history: { undo: [], redo: [] } }, action);
	return { ...tmp, history: state.history };
}

/** 深合并（theme/update）。 */
function deepMerge<T>(base: T, patch: DeepPartial<T>): T {
	if (typeof patch !== "object" || patch === null || Array.isArray(patch)) {
		return patch as T;
	}
	const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
	for (const [key, value] of Object.entries(patch as Record<string, unknown>)) {
		if (value === undefined) continue;
		const baseValue = result[key];
		if (
			typeof value === "object" &&
			value !== null &&
			!Array.isArray(value) &&
			typeof baseValue === "object" &&
			baseValue !== null &&
			!Array.isArray(baseValue)
		) {
			result[key] = deepMerge(baseValue, value as DeepPartial<unknown>);
		} else {
			result[key] = value;
		}
	}
	return result as T;
}
