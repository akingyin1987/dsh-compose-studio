import { describe, expect, it } from "vitest";
import {
	CATALOG,
	ALL_DESCRIPTORS,
	findDescriptor,
	searchDescriptors,
} from "../catalog.js";

describe("ComponentCatalog", () => {
	it("覆盖 Material 3 核心组件清单（52 个）", () => {
		const ids = ALL_DESCRIPTORS.map((d) => d.id);
		// 布局
		expect(ids).toContain("layout.Column");
		expect(ids).toContain("layout.Row");
		expect(ids).toContain("layout.Box");
		expect(ids).toContain("layout.FlowRow");
		expect(ids).toContain("layout.LazyColumn");
		expect(ids).toContain("layout.Spacer");
		// Material 3
		expect(ids).toContain("m3.Text");
		expect(ids).toContain("m3.Button");
		expect(ids).toContain("m3.OutlinedButton");
		expect(ids).toContain("m3.FilledTonalButton");
		expect(ids).toContain("m3.TextButton");
		expect(ids).toContain("m3.ElevatedButton");
		expect(ids).toContain("m3.IconButton");
		expect(ids).toContain("m3.FloatingActionButton");
		expect(ids).toContain("m3.ExtendedFloatingActionButton");
		expect(ids).toContain("m3.Card");
		expect(ids).toContain("m3.ElevatedCard");
		expect(ids).toContain("m3.OutlinedCard");
		expect(ids).toContain("m3.Checkbox");
		expect(ids).toContain("m3.RadioButton");
		expect(ids).toContain("m3.Switch");
		expect(ids).toContain("m3.Slider");
		expect(ids).toContain("m3.AssistChip");
		expect(ids).toContain("m3.FilterChip");
		expect(ids).toContain("m3.AlertDialog");
		expect(ids).toContain("m3.HorizontalDivider");
		expect(ids).toContain("m3.VerticalDivider");
		expect(ids).toContain("m3.ListItem");
		expect(ids).toContain("m3.DropdownMenu");
		expect(ids).toContain("m3.NavigationBar");
		expect(ids).toContain("m3.NavigationRail");
		expect(ids).toContain("m3.CircularProgressIndicator");
		expect(ids).toContain("m3.LinearProgressIndicator");
		expect(ids).toContain("m3.Snackbar");
		expect(ids).toContain("m3.TabRow");
		expect(ids).toContain("m3.TextField");
		expect(ids).toContain("m3.OutlinedTextField");
		expect(ids).toContain("m3.TopAppBar");
		expect(ids).toContain("m3.Badge");
		expect(ids).toContain("m3.ModalBottomSheet");
		expect(ids).toContain("m3.DatePicker");
		expect(ids).toContain("m3.TimePicker");
		expect(ids).toContain("m3.PlainTooltip");
		expect(ids).toContain("m3.SegmentedButton");
		expect(ids).toContain("m3.Surface");
		expect(ids).toContain("m3.Scaffold");
		// 内容
		expect(ids).toContain("content.Image");
		expect(ids).toContain("content.Icon");
		expect(ids).toContain("content.Canvas");
		expect(ids).toContain("content.BasicText");
		expect(ALL_DESCRIPTORS.length).toBe(52);
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
