import { describe, expect, it } from "vitest";
import { buildRenderTree } from "../Canvas.js";
import type { CanvasDocument, ContainerNode, Node } from "../../../shared/document.js";
import { createDefaultTheme } from "../../../shared/theme.js";
import { BUILTIN_DEVICES } from "../../../shared/device.js";

function makeDoc(): CanvasDocument {
	const root: ContainerNode = {
		id: "root",
		type: "Scaffold",
		props: {},
		children: ["col"],
	};
	const col: ContainerNode = {
		id: "col",
		type: "Column",
		props: {},
		children: ["t1", "t2"],
	};
	const t1: Node = { id: "t1", type: "Text", props: { text: "Hello" }, text: "Hello" };
	const t2: Node = { id: "t2", type: "Text", props: {}, text: "World" };
	return {
		version: 1,
		id: "d1",
		name: "Test",
		createdAt: 0,
		updatedAt: 0,
		root,
		nodes: { root, col, t1, t2 },
		theme: createDefaultTheme(),
		devices: BUILTIN_DEVICES,
		activeDeviceId: "phone",
	};
}

describe("buildRenderTree", () => {
	it("嵌套容器正确渲染", () => {
		const tree = buildRenderTree(makeDoc(), new Set());
		expect(tree.id).toBe("root");
		expect(tree.isContainer).toBe(true);
		expect(tree.children.length).toBe(1);
		const col = tree.children[0];
		expect(col.type).toBe("Column");
		expect(col.children.length).toBe(2);
		expect(col.children.map((c) => c.id)).toEqual(["t1", "t2"]);
	});

	it("选中状态标记", () => {
		const tree = buildRenderTree(makeDoc(), new Set(["t1"]));
		const col = tree.children[0];
		expect(col.children[0].selected).toBe(true);
		expect(col.children[1].selected).toBe(false);
	});

	it("depth 层级正确", () => {
		const tree = buildRenderTree(makeDoc(), new Set());
		expect(tree.depth).toBe(0);
		expect(tree.children[0].depth).toBe(1);
		expect(tree.children[0].children[0].depth).toBe(2);
	});

	it("缺失子节点被安全跳过", () => {
		const doc = makeDoc();
		(doc.nodes.col as ContainerNode).children = ["t1", "missing"];
		const tree = buildRenderTree(doc, new Set());
		expect(tree.children[0].children.length).toBe(1);
		expect(tree.children[0].children[0].id).toBe("t1");
	});

	it("text 内容传递", () => {
		const tree = buildRenderTree(makeDoc(), new Set());
		expect(tree.children[0].children[0].text).toBe("Hello");
	});

	it("label 语义名传递", () => {
		const doc = makeDoc();
		(doc.nodes.t1 as Node).label = "Title";
		const tree = buildRenderTree(doc, new Set());
		expect(tree.children[0].children[0].label).toBe("Title");
	});
});
