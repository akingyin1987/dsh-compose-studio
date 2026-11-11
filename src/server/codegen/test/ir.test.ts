import { describe, expect, it } from "vitest";
import { buildIr } from "../ir.js";
import type { CanvasDocument, ContainerNode, Node } from "../../../shared/document.js";
import { createDefaultTheme } from "../../../shared/theme.js";
import { BUILTIN_DEVICES } from "../../../shared/device.js";

/** 构造测试文档（nodes 数组 + rootId）。 */
function makeDoc(nodes: Node[], rootId: string): CanvasDocument {
	const root = nodes.find((n) => n.id === rootId) as ContainerNode;
	return {
		version: 1,
		id: "d1",
		name: "Test",
		createdAt: 0,
		updatedAt: 0,
		root,
		nodes: Object.fromEntries(nodes.map((n) => [n.id, n])),
		theme: createDefaultTheme(),
		devices: BUILTIN_DEVICES,
		activeDeviceId: "phone",
	};
}

describe("buildIr", () => {
	it("Scaffold 根节点 → slot content", () => {
		const doc = makeDoc(
			[
				{ id: "root", type: "m3.Scaffold", props: {}, children: ["col"] },
				{ id: "col", type: "layout.Column", props: { spacing: 16 }, children: [] },
			],
			"root",
		);
		const ir = buildIr(doc);
		expect(ir.composable).toBe("Scaffold");
		expect(ir.imports).toContain("androidx.compose.material3.Scaffold");
		expect(ir.slots?.content?.[0]?.composable).toBe("Column");
		expect(ir.children).toBeUndefined();
	});

	it("Column → children 数组", () => {
		const doc = makeDoc(
			[
				{ id: "root", type: "layout.Column", props: { spacing: 8 }, children: ["t1", "t2"] },
				{ id: "t1", type: "m3.Text", props: { text: "Hello" } },
				{ id: "t2", type: "m3.Text", props: { text: "World" } },
			],
			"root",
		);
		const ir = buildIr(doc);
		expect(ir.composable).toBe("Column");
		expect(ir.children).toHaveLength(2);
		expect(ir.children?.[0]?.composable).toBe("Text");
		expect(ir.slots).toBeUndefined();
	});

	it("Text → literal text attr", () => {
		const doc = makeDoc(
			[
				{ id: "root", type: "m3.Scaffold", props: {}, children: ["t1"] },
				{ id: "t1", type: "m3.Text", props: { text: "Hello" } },
			],
			"root",
		);
		const ir = buildIr(doc);
		const text = ir.slots?.content?.[0];
		expect(text?.attrs).toContainEqual({
			name: "text",
			value: { kind: "literal", value: "Hello" },
		});
	});

	it("dp 属性带 unit 标记", () => {
		const doc = makeDoc(
			[
				{ id: "root", type: "layout.Column", props: { spacing: 16 }, children: [] },
			],
			"root",
		);
		const ir = buildIr(doc);
		const spacing = ir.attrs.find((a) => a.name === "spacing");
		expect(spacing?.unit).toBe("dp");
		expect(spacing?.value).toEqual({ kind: "literal", value: 16 });
		expect(ir.imports).toContain("androidx.compose.ui.unit.dp");
	});

	it("event → expression TODO 占位", () => {
		const doc = makeDoc(
			[
				{ id: "root", type: "layout.Column", props: {}, children: ["btn"] },
				{ id: "btn", type: "m3.Button", props: {}, children: [] },
			],
			"root",
		);
		const ir = buildIr(doc);
		const btn = ir.children?.[0];
		const onClick = btn?.attrs.find((a) => a.name === "onClick");
		expect(onClick?.value.kind).toBe("expression");
		expect((onClick?.value as { code: string }).code).toContain("TODO");
	});

	it("modifierBackground 6 位 hex → Color(0xFF...)", () => {
		const withBg = makeDoc(
			[
				{ id: "root", type: "layout.Column", props: {}, children: ["box"] },
				{ id: "box", type: "layout.Box", props: { modifierBackground: "#6750A4" }, children: [] },
			],
			"root",
		);
		const ir = buildIr(withBg);
		const box = ir.children?.[0];
		const modifier = box?.attrs.find((a) => a.name === "modifier");
		expect(modifier?.value.kind).toBe("expression");
		expect((modifier?.value as { code: string }).code).toContain("Color(0xFF6750A4)");
	});

	it("modifier → Modifier 链表达式 + imports", () => {
		const doc = makeDoc(
			[
				{ id: "root", type: "layout.Box", props: { modifierWidth: 100, modifierHeight: 50, modifierPadding: 16 }, children: [] },
			],
			"root",
		);
		const ir = buildIr(doc);
		const modifier = ir.attrs.find((a) => a.name === "modifier");
		expect(modifier?.value.kind).toBe("expression");
		const code = (modifier?.value as { code: string }).code;
		expect(code).toContain("Modifier");
		expect(code).toContain(".width(100.dp)");
		expect(code).toContain(".height(50.dp)");
		expect(code).toContain(".padding(16.dp)");
		expect(ir.imports).toContain("androidx.compose.ui.Modifier");
		expect(ir.imports).toContain("androidx.compose.ui.unit.dp");
	});

	it("未知组件降级为 Box", () => {
		const doc = makeDoc(
			[
				{ id: "root", type: "m3.Scaffold", props: {}, children: ["unk"] },
				{ id: "unk", type: "unknown.Foo", props: {}, children: [] },
			],
			"root",
		);
		const ir = buildIr(doc);
		const unk = ir.slots?.content?.[0];
		expect(unk?.composable).toBe("Box");
		expect(unk?.imports).toContain("androidx.compose.foundation.layout.Box");
	});

	it("空 children 不生成 children/slots 字段", () => {
		const doc = makeDoc(
			[{ id: "root", type: "layout.Column", props: {}, children: [] }],
			"root",
		);
		const ir = buildIr(doc);
		expect(ir.children).toBeUndefined();
		expect(ir.slots).toBeUndefined();
	});

	it("label → comments", () => {
		const doc = makeDoc(
			[{ id: "root", type: "layout.Column", props: {}, children: [], label: "根布局" }],
			"root",
		);
		const ir = buildIr(doc);
		expect(ir.comments).toContain("// 根布局");
	});

	it("纯函数：相同输入两次调用结果相等", () => {
		const doc = makeDoc(
			[
				{ id: "root", type: "m3.Scaffold", props: {}, children: ["col"] },
				{ id: "col", type: "layout.Column", props: { spacing: 8 }, children: ["t1"] },
				{ id: "t1", type: "m3.Text", props: { text: "Hi" } },
			],
			"root",
		);
		const a = buildIr(doc);
		const b = buildIr(doc);
		expect(a).toEqual(b);
	});

	it("modifier 尺寸模式：wrap/match/weight/fixed", () => {
		const doc = makeDoc(
			[
				{
					id: "root",
					type: "layout.Column",
					props: {},
					children: ["c1", "c2", "c3", "c4"],
				},
				{ id: "c1", type: "layout.Box", props: { modifierWidthMode: "wrap" }, children: [] },
				{ id: "c2", type: "layout.Box", props: { modifierWidthMode: "match" }, children: [] },
				{
					id: "c3",
					type: "layout.Box",
					props: { modifierWidthMode: "weight", modifierWidth: 1 },
					children: [],
				},
				{
					id: "c4",
					type: "layout.Box",
					props: { modifierWidthMode: "fixed", modifierWidth: 100 },
					children: [],
				},
			],
			"root",
		);
		const ir = buildIr(doc);
		const [c1, c2, c3, c4] = ir.children ?? [];
		const code = (n: typeof c1): string => {
			const attr = n.attrs.find((a) => a.name === "modifier");
			return attr?.value.kind === "expression" ? attr.value.code : "";
		};
		expect(code(c1)).toContain("wrapContentWidth");
		expect(code(c2)).toContain("fillMaxWidth");
		expect(code(c3)).toContain(".weight(1f)");
		expect(code(c4)).toContain(".width(100.dp)");
	});

	it("Button text 属性 → 默认 Text 子节点（不作为参数）", () => {
		const doc = makeDoc(
			[
				{
					id: "root",
					type: "layout.Column",
					props: {},
					children: ["btn"],
				},
				{
					id: "btn",
					type: "m3.Button",
					props: { text: "Submit" },
					children: [],
				},
			],
			"root",
		);
		const ir = buildIr(doc);
		const btn = ir.children?.[0];
		expect(btn?.attrs.some((a) => a.name === "text")).toBe(false);
		expect(btn?.slots?.content?.[0]?.composable).toBe("Text");
		expect(btn?.slots?.content?.[0]?.attrs).toContainEqual({
			name: "text",
			value: { kind: "literal", value: "Submit" },
		});
	});

	it("Button 空 children → slots.content 空数组", () => {
		const doc = makeDoc(
			[
				{ id: "root", type: "layout.Column", props: {}, children: ["btn"] },
				{ id: "btn", type: "m3.Button", props: {}, children: [] },
			],
			"root",
		);
		const ir = buildIr(doc);
		const btn = ir.children?.[0];
		expect(btn?.slots?.content).toEqual([]);
	});
});
