import { describe, expect, it } from "vitest";
import { render } from "../render.js";
import { buildIr } from "../ir.js";
import {
	colorToKotlin,
	renderColorScheme,
	renderThemeComposable,
} from "../theme.js";
import { DEFAULT_GENERATE_OPTIONS } from "../../../shared/ir.js";
import type { CanvasDocument, ContainerNode, Node } from "../../../shared/document.js";
import {
	createDefaultTheme,
	createThemeFromPreset,
} from "../../../shared/theme.js";
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
		props: { spacing: 8 },
		children: ["t1"],
	};
	const t1: Node = { id: "t1", type: "m3.Text", props: { text: "Hello" } };
	return {
		version: 1,
		id: "d1",
		name: "Test",
		createdAt: 0,
		updatedAt: 0,
		root,
		nodes: { root, col, t1 },
		theme: createDefaultTheme(),
		devices: BUILTIN_DEVICES,
		activeDeviceId: "phone",
	};
}

describe("colorToKotlin", () => {
	it("6 位 hex 补 FF alpha", () => {
		expect(colorToKotlin("#6750A4")).toBe("Color(0xFF6750A4)");
		expect(colorToKotlin("#ffffff")).toBe("Color(0xFFFFFFFF)");
	});

	it("8 位 hex 直接使用", () => {
		expect(colorToKotlin("#806750A4")).toBe("Color(0x806750A4)");
	});

	it("非法值回退黑色", () => {
		expect(colorToKotlin("red")).toBe("Color(0xFF000000)");
	});
});

describe("renderColorScheme", () => {
	it("浅色 → lightColorScheme，包含 primary", () => {
		const lines = renderColorScheme(createDefaultTheme());
		expect(lines[0]).toContain("lightColorScheme(");
		expect(lines).toContain("    primary = Color(0xFF6750A4),");
		expect(lines[lines.length - 1]).toBe(")");
	});

	it("深色 → darkColorScheme", () => {
		const lines = renderColorScheme(createThemeFromPreset("purple-dark"));
		expect(lines[0]).toContain("darkColorScheme(");
		expect(lines).toContain("    primary = Color(0xFFD0BCFF),");
	});

	it("覆盖全部 33 个色角色", () => {
		const lines = renderColorScheme(createDefaultTheme());
		// 1 行声明 + 33 个角色 + 1 行收尾
		expect(lines.length).toBe(35);
	});
});

describe("renderThemeComposable", () => {
	it("生成 MaterialTheme 包裹结构", () => {
		const lines = renderThemeComposable();
		expect(lines[0]).toBe("@Composable");
		expect(lines.some((l) => l.includes("fun GeneratedTheme("))).toBe(true);
		expect(lines.some((l) => l.includes("MaterialTheme("))).toBe(true);
	});
});

describe("render（含主题）", () => {
	it("提供 theme 时生成 GeneratedTheme 并包裹屏幕", () => {
		const [file] = render(buildIr(makeDoc()), {
			...DEFAULT_GENERATE_OPTIONS,
			theme: createDefaultTheme(),
		});
		const src = file.source;
		expect(src).toContain("private val GeneratedColorScheme = lightColorScheme(");
		expect(src).toContain("fun GeneratedTheme(content: @Composable () -> Unit)");
		expect(src).toContain("fun GeneratedScreen(modifier: Modifier = Modifier) {");
		expect(src).toContain("GeneratedTheme {");
		// 根节点在 GeneratedTheme 内
		expect(src.indexOf("GeneratedTheme {")).toBeLessThan(src.indexOf("Scaffold("));
		// 主题相关 import
		expect(src).toContain("import androidx.compose.material3.lightColorScheme");
		expect(src).toContain("import androidx.compose.material3.MaterialTheme");
		expect(src).toContain("import androidx.compose.ui.graphics.Color");
	});

	it("深色主题使用 darkColorScheme", () => {
		const [file] = render(buildIr(makeDoc()), {
			...DEFAULT_GENERATE_OPTIONS,
			theme: createThemeFromPreset("blue-dark"),
		});
		expect(file.source).toContain("darkColorScheme(");
		expect(file.source).toContain("import androidx.compose.material3.darkColorScheme");
	});

	it("未提供 theme 时不生成主题代码", () => {
		const [file] = render(buildIr(makeDoc()));
		expect(file.source).not.toContain("GeneratedTheme");
		expect(file.source).not.toContain("lightColorScheme");
		expect(file.source).not.toContain("Color(0x");
	});

	it("主题渲染快照", () => {
		const [file] = render(buildIr(makeDoc()), {
			...DEFAULT_GENERATE_OPTIONS,
			theme: createThemeFromPreset("blue-light"),
		});
		expect(file.source).toMatchSnapshot();
	});
});
