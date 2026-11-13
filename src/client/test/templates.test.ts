import { describe, expect, it } from "vitest";
import {
	TEMPLATES,
	getTemplate,
	buildTemplateDocument,
} from "../templates.js";
import type { CanvasDocument, Node } from "../../shared/document.js";
import { isContainerNode } from "../../shared/document.js";
import { isDocumentValid } from "../../shared/validate.js";
import { createThemeFromPreset } from "../../shared/theme.js";

const theme = createThemeFromPreset("blue-dark");

function collectReachableIds(doc: CanvasDocument): Set<string> {
	const ids = new Set<string>();
	const walk = (node: Node): void => {
		if (ids.has(node.id)) return;
		ids.add(node.id);
		if (isContainerNode(node)) {
			for (const cid of node.children) {
				const child = doc.nodes[cid];
				if (child) walk(child);
			}
		}
	};
	walk(doc.root);
	return ids;
}

function build(templateId: string): CanvasDocument {
	return buildTemplateDocument(templateId, `doc-${templateId}`, templateId, theme);
}

describe("模板库", () => {
	it("id 唯一且包含常用页面", () => {
		const ids = TEMPLATES.map((t) => t.id);
		expect(new Set(ids).size).toBe(ids.length);
		for (const expected of ["blank", "login", "signup", "list", "settings", "profile"]) {
			expect(ids).toContain(expected);
		}
	});

	it("每个模板产出结构合法、无孤立节点的文档", () => {
		for (const template of TEMPLATES) {
			const doc = build(template.id);
			expect(isDocumentValid(doc), template.id).toBe(true);
			expect(doc.theme).toBe(theme);
			// 所有节点都从 root 可达（无孤立节点）
			expect([...collectReachableIds(doc)].sort()).toEqual(
				Object.keys(doc.nodes).sort(),
			);
		}
	});

	it("空白模板根为 Scaffold 且无子节点", () => {
		const doc = build("blank");
		expect(doc.root.type).toBe("m3.Scaffold");
		expect(doc.root.children).toEqual([]);
	});

	it("登录模板包含输入框与按钮", () => {
		const doc = build("login");
		const types = Object.values(doc.nodes).map((n) => n.type);
		expect(types).toContain("m3.OutlinedTextField");
		expect(types.filter((t) => t === "m3.OutlinedTextField").length).toBe(2);
		expect(types).toContain("m3.Button");
		expect(types).toContain("m3.TextButton");
		// 包含标题文案
		const texts = Object.values(doc.nodes)
			.map((n) => n.props.text)
			.filter((t): t is string => typeof t === "string");
		expect(texts).toContain("欢迎回来");
		expect(texts).toContain("登录");
	});

	it("注册模板字段数多于登录模板", () => {
		const count = (id: string): number =>
			Object.values(build(id).nodes).filter(
				(n) => n.type === "m3.OutlinedTextField",
			).length;
		expect(count("signup")).toBeGreaterThan(count("login"));
	});

	it("列表模板使用 LazyColumn 与 ListItem", () => {
		const doc = build("list");
		const types = Object.values(doc.nodes).map((n) => n.type);
		expect(types).toContain("layout.LazyColumn");
		expect(types.filter((t) => t === "m3.ListItem").length).toBe(5);
		expect(types).toContain("m3.TopAppBar");
	});

	it("设置模板含开关与分割线", () => {
		const doc = build("settings");
		const types = Object.values(doc.nodes).map((n) => n.type);
		expect(types.filter((t) => t === "m3.Switch").length).toBe(2);
		expect(types).toContain("m3.HorizontalDivider");
		expect(types).toContain("m3.TopAppBar");
	});

	it("个人资料模板含图片 / 卡片 / 统计", () => {
		const doc = build("profile");
		const types = Object.values(doc.nodes).map((n) => n.type);
		expect(types).toContain("content.Image");
		expect(types).toContain("m3.Card");
		expect(types.filter((t) => t === "layout.Column").length).toBeGreaterThanOrEqual(2);
	});

	it("未知模板抛错", () => {
		expect(() => build("nope")).toThrow(/未知模板/);
	});

	it("getTemplate 查找", () => {
		expect(getTemplate("login")?.name).toBe("登录");
		expect(getTemplate("nope")).toBeUndefined();
	});
});
