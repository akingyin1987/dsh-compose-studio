import { describe, expect, it } from "vitest";
import {
	CATALOG,
	ALL_DESCRIPTORS,
	findDescriptor,
	searchDescriptors,
} from "../catalog.js";

describe("ComponentCatalog", () => {
	it("覆盖 Phase 1 组件清单（11 个）", () => {
		const ids = ALL_DESCRIPTORS.map((d) => d.id);
		expect(ids).toContain("layout.Column");
		expect(ids).toContain("layout.Row");
		expect(ids).toContain("layout.Box");
		expect(ids).toContain("m3.Text");
		expect(ids).toContain("m3.Button");
		expect(ids).toContain("m3.TextField");
		expect(ids).toContain("m3.Card");
		expect(ids).toContain("m3.Scaffold");
		expect(ids).toContain("m3.TopAppBar");
		expect(ids).toContain("content.Image");
		expect(ids).toContain("content.Icon");
		expect(ALL_DESCRIPTORS.length).toBe(11);
	});

	it("每个 descriptor 含 codegen/preview/fqn", () => {
		for (const cat of CATALOG) {
			for (const d of cat.children) {
				expect(d.codegen).toBeDefined();
				expect(d.codegen.imports.length).toBeGreaterThan(0);
				expect(d.preview).toBeDefined();
				expect(d.fqn).toContain("androidx.compose");
				expect(d.tags.length).toBeGreaterThan(0);
			}
		}
	});

	it("render 类型合法", () => {
		for (const d of ALL_DESCRIPTORS) {
			expect(["leaf", "container", "slot"]).toContain(d.codegen.render);
		}
	});

	it("findDescriptor 查找", () => {
		expect(findDescriptor("m3.Button")?.composable).toBe("Button");
		expect(findDescriptor("layout.Column")?.fqn).toContain("foundation.layout");
		expect(findDescriptor("nope")).toBeUndefined();
	});

	it("searchDescriptors 搜索（标签/名称/brief）", () => {
		expect(searchDescriptors("button").some((d) => d.id === "m3.Button")).toBe(
			true,
		);
		expect(searchDescriptors("按钮").some((d) => d.id === "m3.Button")).toBe(
			true,
		);
		expect(searchDescriptors("")).toEqual(ALL_DESCRIPTORS);
		expect(searchDescriptors("不存在的组件xyz")).toEqual([]);
	});

	it("分类树完整覆盖所有 descriptor", () => {
		const inTree = CATALOG.flatMap((c) => c.children.map((d) => d.id));
		expect(inTree.sort()).toEqual(ALL_DESCRIPTORS.map((d) => d.id).sort());
	});
});
