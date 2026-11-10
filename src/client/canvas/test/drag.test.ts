import { describe, expect, it } from "vitest";
import {
	axisOf,
	computeInsertIndex,
	createNodeFromDescriptor,
	findParentId,
	isInSubtree,
	resolveContainerId,
	resolveDropTarget,
	type ChildGeometry,
} from "../drag.js";
import { findDescriptor } from "../../palette/catalog.js";
import type { CanvasDocument, ContainerNode, Node } from "../../../shared/document.js";
import { createDefaultTheme } from "../../../shared/theme.js";
import { BUILTIN_DEVICES } from "../../../shared/device.js";

function makeDoc(): CanvasDocument {
	const root: ContainerNode = {
		id: "root",
		type: "m3.Scaffold",
		props: {},
		children: ["col"],
	};
	const col: ContainerNode = {
		id: "col",
		type: "layout.Column",
		props: {},
		children: ["t1", "t2"],
	};
	const t1: Node = { id: "t1", type: "m3.Text", props: { text: "Hello" }, text: "Hello" };
	const t2: Node = { id: "t2", type: "m3.Button", props: {} };
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

describe("axisOf", () => {
	it("Row 为水平轴", () => {
		expect(axisOf("layout.Row")).toBe("horizontal");
	});
	it("Column / Scaffold 为垂直轴", () => {
		expect(axisOf("layout.Column")).toBe("vertical");
		expect(axisOf("m3.Scaffold")).toBe("vertical");
	});
});

describe("computeInsertIndex", () => {
	const geoms: ChildGeometry[] = [
		{ id: "a", start: 0, end: 100 },
		{ id: "b", start: 100, end: 200 },
		{ id: "c", start: 200, end: 300 },
	];

	it("空列表返回 0", () => {
		expect(computeInsertIndex("vertical", [], 0, 0)).toBe(0);
	});
	it("指针在第一个元素上半 → 0", () => {
		expect(computeInsertIndex("vertical", geoms, 0, 40)).toBe(0);
	});
	it("指针在元素中点之后 → 下一个位置", () => {
		expect(computeInsertIndex("vertical", geoms, 0, 60)).toBe(1);
		expect(computeInsertIndex("vertical", geoms, 0, 160)).toBe(2);
	});
	it("指针超过所有元素 → 末尾", () => {
		expect(computeInsertIndex("vertical", geoms, 0, 999)).toBe(3);
	});
	it("水平轴使用 x 分量", () => {
		expect(computeInsertIndex("horizontal", geoms, 40, 0)).toBe(0);
		expect(computeInsertIndex("horizontal", geoms, 140, 0)).toBe(1);
		expect(computeInsertIndex("horizontal", geoms, 240, 0)).toBe(2);
	});
});

describe("findParentId", () => {
	it("返回直接父容器 id", () => {
		expect(findParentId(makeDoc(), "t1")).toBe("col");
		expect(findParentId(makeDoc(), "col")).toBe("root");
	});
	it("根节点无父", () => {
		expect(findParentId(makeDoc(), "root")).toBeNull();
	});
	it("未知节点返回 null", () => {
		expect(findParentId(makeDoc(), "missing")).toBeNull();
	});
});

describe("resolveContainerId", () => {
	it("命中容器 → 其自身", () => {
		expect(resolveContainerId(makeDoc(), "col")).toBe("col");
		expect(resolveContainerId(makeDoc(), "root")).toBe("root");
	});
	it("命中叶子 → 父容器", () => {
		expect(resolveContainerId(makeDoc(), "t1")).toBe("col");
	});
	it("未命中 → null", () => {
		expect(resolveContainerId(makeDoc(), null)).toBeNull();
		expect(resolveContainerId(makeDoc(), "missing")).toBeNull();
	});
});

describe("resolveDropTarget", () => {
	const geoms: ChildGeometry[] = [
		{ id: "t1", start: 0, end: 100 },
		{ id: "t2", start: 100, end: 200 },
	];

	it("命中叶子 → 父容器 + 计算 index", () => {
		const target = resolveDropTarget(makeDoc(), "t1", "vertical", geoms, 0, 40);
		expect(target).toEqual({ parentId: "col", index: 0 });
	});
	it("命中容器 → 自身", () => {
		const target = resolveDropTarget(makeDoc(), "col", "vertical", geoms, 0, 150);
		expect(target).toEqual({ parentId: "col", index: 2 });
	});
	it("命中根 → root 容器", () => {
		const target = resolveDropTarget(makeDoc(), "root", "vertical", geoms, 0, 40);
		expect(target).toEqual({ parentId: "root", index: 0 });
	});
	it("未命中 → null", () => {
		expect(resolveDropTarget(makeDoc(), null, "vertical", geoms, 0, 0)).toBeNull();
	});
});

describe("isInSubtree", () => {
	it("自身在子树中", () => {
		expect(isInSubtree(makeDoc(), "col", "col")).toBe(true);
	});
	it("后代在子树中", () => {
		expect(isInSubtree(makeDoc(), "t1", "col")).toBe(true);
		expect(isInSubtree(makeDoc(), "t1", "root")).toBe(true);
	});
	it("非后代不在子树中", () => {
		expect(isInSubtree(makeDoc(), "root", "col")).toBe(false);
		expect(isInSubtree(makeDoc(), "col", "t1")).toBe(false);
	});
});

describe("createNodeFromDescriptor", () => {
	it("Text → 叶子节点，带默认 props 与 text 字段", () => {
		const descriptor = findDescriptor("m3.Text");
		expect(descriptor).toBeDefined();
		const node = createNodeFromDescriptor(descriptor!, new Set());
		expect(node.type).toBe("m3.Text");
		expect(node.id).toBe("m3-Text-1");
		expect(node.props.text).toBe("Text");
		expect("text" in node && node.text).toBe("Text");
		expect("children" in node).toBe(false);
	});

	it("Column → 容器节点，children 为空", () => {
		const descriptor = findDescriptor("layout.Column");
		const node = createNodeFromDescriptor(descriptor!, new Set());
		expect(node.type).toBe("layout.Column");
		expect("children" in node).toBe(true);
		if ("children" in node) expect(node.children).toEqual([]);
	});

	it("id 冲突时序号递增", () => {
		const descriptor = findDescriptor("m3.Button");
		const node = createNodeFromDescriptor(descriptor!, new Set(["m3-Button-1"]));
		expect(node.id).toBe("m3-Button-2");
	});

	it("Button → 容器节点（slot 渲染）", () => {
		const descriptor = findDescriptor("m3.Button");
		const node = createNodeFromDescriptor(descriptor!, new Set());
		expect("children" in node).toBe(true);
	});
});
