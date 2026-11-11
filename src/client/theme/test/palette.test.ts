import { describe, expect, it } from "vitest";
import { createPreviewPalette, withAlpha } from "../palette.js";
import { createThemeFromPreset } from "../../../shared/theme.js";

describe("createPreviewPalette", () => {
	it("映射主题 colorScheme 全部字段", () => {
		const theme = createThemeFromPreset("blue-dark");
		const palette = createPreviewPalette(theme);
		expect(palette.primary).toBe("#9ECAFF");
		expect(palette.onPrimary).toBe("#003258");
		expect(palette.background).toBe("#1A1C1E");
		expect(palette.onSurface).toBe(theme.colorScheme.onSurface);
		expect(palette.surfaceContainerHighest).toBe(
			theme.colorScheme.surfaceContainerHighest,
		);
		expect(palette.inversePrimary).toBe(theme.colorScheme.inversePrimary);
	});

	it("两个主题的色板互不影响", () => {
		const light = createPreviewPalette(createThemeFromPreset("purple-light"));
		const dark = createPreviewPalette(createThemeFromPreset("purple-dark"));
		expect(light.primary).not.toBe(dark.primary);
	});
});

describe("withAlpha", () => {
	it("为 6 位 hex 追加 alpha", () => {
		expect(withAlpha("#6750A4", "14")).toBe("#6750A414");
	});

	it("非 6 位原样返回", () => {
		expect(withAlpha("#fff", "14")).toBe("#fff");
		expect(withAlpha("#806750A4", "14")).toBe("#806750A4");
	});
});
