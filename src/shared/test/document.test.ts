import { describe, expect, it } from "vitest";
import {
	isContainerNode,
	validateBasicInvariants,
	type CanvasDocument,
	type ContainerNode,
	type Node,
} from "../document.js";
import { createDefaultTheme } from "../theme.js";
import { BUILTIN_DEVICES } from "../device.js";
import {
	validateDocument,
	isDocumentValid,
	assertDocumentInvariants,
	isVersionSupported,
} from "../validate.js";

function makeDoc(overrides?: Partial<CanvasDocument>): CanvasDocument {
	const root: ContainerNode = {
		id: "root",
		type: "Scaffold",
		props: {},
		children: ["a"],
	};
	const a: ContainerNode = {
		id: "a",
		type: "Column",
		props: {},
		children: ["b"],
	};
	const b: Node = { id: "b", type: "Text", props: {}, text: "hi" };
	return {
		version: 1,
		id: "doc1",
		name: "Test",
		createdAt: 0,
		updatedAt: 0,
		root,
		nodes: { root, a, b },
		theme: createDefaultTheme(),
		devices: BUILTIN_DEVICES,
		activeDeviceId: "phone",
		...overrides,
	};
}

describe("document 类型工具", () => {
	it("isContainerNode 区分子节点与容器", () => {
		expect(
			isContainerNode({ id: "c", type: "Column", props: {}, children: [] }),
		).toBe(true);
		expect(isContainerNode({ id: "t", type: "Text", props: {} })).toBe(false);
	});
});

describe("文档不变式", () => {
	it("正常文档通过校验", () => {
		expect(isDocumentValid(makeDoc())).toBe(true);
		expect(validateDocument(makeDoc())).toEqual({
			duplicateParents: [],
			unresolvedChildren: [],
			duplicateChildren: [],
			rootNotContainer: false,
		});
	});

	it("根非容器节点 → rootNotContainer", () => {
		const doc = makeDoc();
		doc.root = { id: "root", type: "Text", props: {}, text: "x" } as unknown as ContainerNode;
		const errors = validateDocument(doc);
		expect(errors.rootNotContainer).toBe(true);
		expect(isDocumentValid(doc)).toBe(false);
	});

	it("节点被多个父节点引用 → duplicateParents", () => {
		const doc = makeDoc();
		// root.children = ["a", "a"]：a 被引用两次（同时触发 duplicateChildren）
		doc.root.children = ["a", "a"];
		const errors = validateDocument(doc);
		expect(errors.duplicateChildren).toContain("a");
		expect(isDocumentValid(doc)).toBe(false);
	});

	it("children 引用无法解析 → unresolvedChildren", () => {
		const doc = makeDoc();
		const a = doc.nodes.a as ContainerNode;
		a.children = ["missing"];
		const errors = validateDocument(doc);
		expect(errors.unresolvedChildren).toContain("missing");
		expect(isDocumentValid(doc)).toBe(false);
	});

	it("slots 中的引用同样校验", () => {
		const doc = makeDoc();
		doc.root.slots = { topBar: ["a"] };
		// a 同时被 children 和 slots 引用 → duplicateParents
		const errors = validateDocument(doc);
		expect(errors.duplicateParents).toContain("a");
	});

	it("assertDocumentInvariants 不满足时抛错", () => {
		const doc = makeDoc();
		const a = doc.nodes.a as ContainerNode;
		a.children = ["missing"];
		expect(() => assertDocumentInvariants(doc)).toThrow(/不变式/);
	});

	it("validateBasicInvariants 仅检查根节点", () => {
		const doc = makeDoc();
		expect(validateBasicInvariants(doc).rootNotContainer).toBe(false);
	});
});

describe("版本兼容", () => {
	it("v1 受支持", () => {
		expect(isVersionSupported(1)).toBe(true);
		expect(isVersionSupported(2)).toBe(false);
	});
});
