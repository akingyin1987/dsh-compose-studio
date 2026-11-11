import { describe, expect, it } from "vitest";
import {
	reducer,
	pushHistory,
	createEmptyDocument,
	generateDocId,
	HISTORY_LIMIT,
	MERGE_WINDOW_MS,
	type StudioState,
	type Action,
	type HistoryEntry,
} from "../store.js";
import type { CanvasDocument, ContainerNode, Node } from "../../shared/document.js";
import { createDefaultTheme } from "../../shared/theme.js";
import { BUILTIN_DEVICES } from "../../shared/device.js";

function makeState(overrides?: Partial<StudioState>): StudioState {
	const root: ContainerNode = {
		id: "root",
		type: "Scaffold",
		props: {},
		children: [],
	};
	const doc: CanvasDocument = {
		version: 1,
		id: "d1",
		name: "Test",
		createdAt: 0,
		updatedAt: 0,
		root,
		nodes: { root },
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
		...overrides,
	};
}

describe("reducer 文档操作", () => {
	it("node/add 添加子节点并记录历史", () => {
		const s = makeState();
		const node: Node = { id: "t1", type: "Text", props: {}, text: "hi" };
		const next = reducer(s, { type: "node/add", parentId: "root", node });
		expect(next.document.nodes.t1).toEqual(node);
		expect(next.document.root.children).toContain("t1");
		expect(next.history.undo.length).toBe(1);
	});

	it("node/remove 级联删除子树", () => {
		let s = makeState();
		s = reducer(s, {
			type: "node/add",
			parentId: "root",
			node: { id: "c", type: "Column", props: {}, children: [] },
		});
		s = reducer(s, {
			type: "node/add",
			parentId: "c",
			node: { id: "t", type: "Text", props: {} },
		});
		expect(Object.keys(s.document.nodes).length).toBe(3);
		const removed = reducer(s, { type: "node/remove", id: "c" });
		expect(removed.document.nodes.c).toBeUndefined();
		expect(removed.document.nodes.t).toBeUndefined();
		expect(removed.document.root.children).not.toContain("c");
	});

	it("node/move 移动节点", () => {
		let s = makeState();
		s = reducer(s, {
			type: "node/add",
			parentId: "root",
			node: { id: "a", type: "Row", props: {}, children: [] },
		});
		s = reducer(s, {
			type: "node/add",
			parentId: "root",
			node: { id: "b", type: "Row", props: {}, children: [] },
		});
		s = reducer(s, {
			type: "node/add",
			parentId: "a",
			node: { id: "t", type: "Text", props: {} },
		});
		const moved = reducer(s, {
			type: "node/move",
			id: "t",
			toParentId: "b",
			index: 0,
		});
		expect((moved.document.nodes.b as ContainerNode).children).toContain("t");
		expect((moved.document.nodes.a as ContainerNode).children).not.toContain("t");
	});

	it("node/updateProps 更新属性", () => {
		let s = makeState();
		s = reducer(s, {
			type: "node/add",
			parentId: "root",
			node: { id: "t", type: "Text", props: { text: "a" } },
		});
		const next = reducer(s, {
			type: "node/updateProps",
			id: "t",
			patch: { text: "b" },
		});
		expect(next.document.nodes.t.props.text).toBe("b");
	});

	it("node/rename 设置语义名", () => {
		let s = makeState();
		s = reducer(s, {
			type: "node/add",
			parentId: "root",
			node: { id: "t", type: "Text", props: {} },
		});
		const next = reducer(s, { type: "node/rename", id: "t", label: "Title" });
		expect(next.document.nodes.t.label).toBe("Title");
	});

	it("selection/set 更新选中", () => {
		const s = makeState();
		const next = reducer(s, {
			type: "selection/set",
			ids: ["a", "b"],
			anchorId: "a",
		});
		expect(next.selection).toEqual({ ids: ["a", "b"], anchorId: "a" });
	});

	it("theme/update 深合并", () => {
		const s = makeState();
		const next = reducer(s, {
			type: "theme/update",
			patch: { dark: true, colorScheme: { primary: "#000000" } },
		});
		expect(next.theme.dark).toBe(true);
		expect(next.theme.colorScheme.primary).toBe("#000000");
		// 未修改的字段保留
		expect(next.theme.colorScheme.secondary).toBeDefined();
	});

	it("device/set 与 canvas/zoom", () => {
		const s = makeState();
		const next = reducer(s, { type: "device/set", id: "tablet" });
		expect(next.device.activeId).toBe("tablet");
		const zoomed = reducer(s, { type: "canvas/zoom", zoom: 1.5 });
		expect(zoomed.device.zoom).toBe(1.5);
	});
});

describe("undo/redo", () => {
	it("撤销/重做 node/add", () => {
		let s = makeState();
		s = reducer(s, {
			type: "node/add",
			parentId: "root",
			node: { id: "t", type: "Text", props: {} },
		});
		expect(s.document.nodes.t).toBeDefined();
		const undone = reducer(s, { type: "history/undo" });
		expect(undone.document.nodes.t).toBeUndefined();
		expect(undone.history.redo.length).toBe(1);
		const redone = reducer(undone, { type: "history/redo" });
		expect(redone.document.nodes.t).toBeDefined();
	});

	it("撤销 node/remove 恢复子树", () => {
		let s = makeState();
		s = reducer(s, {
			type: "node/add",
			parentId: "root",
			node: { id: "c", type: "Column", props: {}, children: [] },
		});
		s = reducer(s, {
			type: "node/add",
			parentId: "c",
			node: { id: "t", type: "Text", props: {} },
		});
		const before = s;
		const removed = reducer(s, { type: "node/remove", id: "c" });
		expect(removed.document.nodes.c).toBeUndefined();
		const undone = reducer(removed, { type: "history/undo" });
		expect(undone.document.nodes.c).toBeDefined();
		expect(undone.document.nodes.t).toBeDefined();
		void before;
	});

	it("新操作清空 redo 栈", () => {
		let s = makeState();
		s = reducer(s, {
			type: "node/add",
			parentId: "root",
			node: { id: "t", type: "Text", props: {} },
		});
		s = reducer(s, { type: "history/undo" });
		expect(s.history.redo.length).toBe(1);
		s = reducer(s, {
			type: "node/add",
			parentId: "root",
			node: { id: "t2", type: "Text", props: {} },
		});
		expect(s.history.redo.length).toBe(0);
	});
});

describe("历史栈策略", () => {
	it("800ms 内连续 updateProps 合并为一次", () => {
		let s = makeState();
		s = reducer(s, {
			type: "node/add",
			parentId: "root",
			node: { id: "t", type: "Text", props: { text: "a" } },
		});
		const t0 = Date.now();
		s = reducer(s, {
			type: "node/updateProps",
			id: "t",
			patch: { text: "b" },
			ts: t0,
		});
		const lenAfterFirst = s.history.undo.length;
		s = reducer(s, {
			type: "node/updateProps",
			id: "t",
			patch: { text: "c" },
			ts: t0 + MERGE_WINDOW_MS - 100,
		});
		// 合并：长度不变，文档更新
		expect(s.history.undo.length).toBe(lenAfterFirst);
		expect(s.document.nodes.t.props.text).toBe("c");
		// 一次 undo 回到 "a"（合并的逆操作是首次前的值）
		const undone = reducer(s, { type: "history/undo" });
		expect(undone.document.nodes.t.props.text).toBe("a");
	});

	it("超过 800ms 不合并", () => {
		let s = makeState();
		s = reducer(s, {
			type: "node/add",
			parentId: "root",
			node: { id: "t", type: "Text", props: { text: "a" } },
		});
		const t0 = Date.now();
		s = reducer(s, {
			type: "node/updateProps",
			id: "t",
			patch: { text: "b" },
			ts: t0,
		});
		const lenAfterFirst = s.history.undo.length;
		s = reducer(s, {
			type: "node/updateProps",
			id: "t",
			patch: { text: "c" },
			ts: t0 + MERGE_WINDOW_MS + 100,
		});
		expect(s.history.undo.length).toBe(lenAfterFirst + 1);
	});

	it("历史上限 100", () => {
		let s = makeState();
		for (let i = 0; i < HISTORY_LIMIT + 20; i++) {
			s = reducer(s, {
				type: "node/add",
				parentId: "root",
				node: { id: `t${i}`, type: "Text", props: {} },
			});
		}
		expect(s.history.undo.length).toBe(HISTORY_LIMIT);
	});
});

describe("pushHistory", () => {
	it("合并逻辑：相邻同 id updateProps", () => {
		const entry1: HistoryEntry = {
			action: { type: "node/updateProps", id: "t", patch: { a: 1 } },
			inverse: null,
			label: "updateProps",
			ts: 1000,
		};
		const entry2: HistoryEntry = {
			action: { type: "node/updateProps", id: "t", patch: { a: 2 } },
			inverse: { type: "node/updateProps", id: "t", patch: { a: 1 } },
			label: "updateProps",
			ts: 1000 + MERGE_WINDOW_MS - 1,
		};
		const result = pushHistory([entry1], entry2);
		expect(result.length).toBe(1);
		expect(result[0].action).toEqual(entry2.action);
		// 保留原 inverse
		expect(result[0].inverse).toBe(entry1.inverse);
	});

	it("非相邻或非 updateProps 不合并", () => {
		const entry1: HistoryEntry = {
			action: { type: "node/add", parentId: "root", node: { id: "t", type: "Text", props: {} } },
			inverse: { type: "node/remove", id: "t" },
			label: "add",
			ts: 1000,
		};
		const entry2: HistoryEntry = {
			action: { type: "node/updateProps", id: "t", patch: { a: 1 } },
			inverse: null,
			label: "updateProps",
			ts: 1000 + 100,
		};
		const result = pushHistory([entry1], entry2);
		expect(result.length).toBe(2);
	});
});

describe("文档生命周期", () => {
	it("doc/new 创建空文档（根为 Scaffold）", () => {
		const s = makeState();
		const next = reducer(s, { type: "doc/new", docId: "new-doc", name: "New" });
		expect(next.document.id).toBe("new-doc");
		expect(next.document.name).toBe("New");
		expect(next.document.root.type).toBe("m3.Scaffold");
		expect(next.document.root.children).toEqual([]);
		expect(next.selection.ids).toEqual([]);
		expect(next.history.undo).toEqual([]);
	});

	it("doc/load 替换文档并清空选择/历史", () => {
		const s = makeState();
		const newDoc = createEmptyDocument("loaded", "Loaded");
		const next = reducer(s, { type: "doc/load", doc: newDoc });
		expect(next.document.id).toBe("loaded");
		expect(next.selection.ids).toEqual([]);
		expect(next.history.undo).toEqual([]);
	});

	it("doc/rename 更新文档名", () => {
		const s = makeState();
		const next = reducer(s, { type: "doc/rename", name: "Renamed" });
		expect(next.document.name).toBe("Renamed");
	});

	it("generateDocId 生成唯一 id", () => {
		const a = generateDocId();
		const b = generateDocId();
		expect(a).not.toBe(b);
		expect(a).toMatch(/^doc-/);
	});

	it("createEmptyDocument 结构完整", () => {
		const doc = createEmptyDocument("x", "X");
		expect(doc.version).toBe(1);
		expect(doc.root.id).toBe("root");
		expect(doc.nodes.root).toEqual(doc.root);
		expect(doc.devices.length).toBeGreaterThan(0);
	});

	it("ui/toggleBorders 切换容器边界显示", () => {
		const s = makeState();
		expect(s.ui.showBorders).toBe(true);
		const next = reducer(s, { type: "ui/toggleBorders" });
		expect(next.ui.showBorders).toBe(false);
		const back = reducer(next, { type: "ui/toggleBorders" });
		expect(back.ui.showBorders).toBe(true);
	});
});
