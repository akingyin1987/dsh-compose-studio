import { describe, expect, it } from "vitest";
import { getSelectedNode, getPropSchemas } from "../Inspector.js";
import type { CanvasDocument, ContainerNode, Node } from "../../../shared/document.js";
import { createDefaultTheme } from "../../../shared/theme.js";
import { BUILTIN_DEVICES } from "../../../shared/device.js";
import type { StudioState } from "../../store.js";

function makeState(anchorId: string | null): StudioState {
	const root: ContainerNode = {
		id: "root",
		type: "Scaffold",
		props: {},
		children: ["t1"],
	};
	const t1: Node = { id: "t1", type: "m3.Text", props: { text: "Hi" } };
	const doc: CanvasDocument = {
		version: 1,
		id: "d1",
		name: "Test",
		createdAt: 0,
		updatedAt: 0,
		root,
		nodes: { root, t1 },
		theme: createDefaultTheme(),
		devices: BUILTIN_DEVICES,
		activeDeviceId: "phone",
	};
	return {
		document: doc,
		selection: { ids: anchorId ? [anchorId] : [], anchorId },
		clipboard: null,
		theme: createDefaultTheme(),
		device: { activeId: "phone", zoom: 1, showGrid: false },
		history: { undo: [], redo: [] },
		ui: { leftWidth: 240, rightWidth: 320, inspectorTab: "props" },
	};
}

describe("getSelectedNode", () => {
	it("无选中返回 null", () => {
		expect(getSelectedNode(makeState(null))).toBeNull();
	});

	it("返回选中节点", () => {
		const node = getSelectedNode(makeState("t1"));
		expect(node?.id).toBe("t1");
	});

	it("选中不存在的节点返回 null", () => {
		expect(getSelectedNode(makeState("missing"))).toBeNull();
	});
});

describe("getPropSchemas", () => {
	it("已知组件返回 PropSchema 列表", () => {
		const schemas = getPropSchemas({ id: "t1", type: "m3.Text", props: {} });
		expect(schemas.length).toBeGreaterThan(0);
		expect(schemas.some((s) => s.key === "text")).toBe(true);
	});

	it("未知组件返回空数组", () => {
		expect(getPropSchemas({ id: "x", type: "unknown.Component", props: {} })).toEqual(
			[],
		);
	});

	it("Button 含事件与 content 槽", () => {
		const schemas = getPropSchemas({ id: "b", type: "m3.Button", props: {} });
		expect(schemas.some((s) => s.kind === "event" && s.key === "onClick")).toBe(
			true,
		);
	});
});
