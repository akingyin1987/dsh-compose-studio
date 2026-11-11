import { describe, expect, it } from "vitest";
import {
	THEME_PRESETS,
	COLOR_ROLE_GROUPS,
	createDefaultTheme,
	createThemeFromPreset,
	findMatchingPreset,
	getThemePreset,
	getVariantPreset,
	type ThemeSpec,
} from "../theme.js";

const COLOR_KEYS = Object.keys(createDefaultTheme().colorScheme);

describe("主题预设", () => {
	it("预设数量与 id 唯一", () => {
		expect(THEME_PRESETS.length).toBe(6);
		const ids = THEME_PRESETS.map((p) => p.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("每个预设色板字段完整且为合法 #RRGGBB", () => {
		for (const preset of THEME_PRESETS) {
			expect(Object.keys(preset.colorScheme).sort()).toEqual(COLOR_KEYS.sort());
			for (const [key, value] of Object.entries(preset.colorScheme)) {
				expect(value, `${preset.id}.${key}`).toMatch(/^#[0-9A-Fa-f]{6}$/);
			}
		}
	});

	it("浅色/深色成对存在", () => {
		for (const preset of THEME_PRESETS) {
			const variant = getVariantPreset(preset, !preset.dark);
			expect(variant, `${preset.id} 缺对应变体`).toBeDefined();
			expect(variant?.baseId).toBe(preset.baseId);
		}
	});
});

describe("createThemeFromPreset / createDefaultTheme", () => {
	it("按 id 构造主题并保留明暗标记", () => {
		const dark = createThemeFromPreset("blue-dark");
		expect(dark.dark).toBe(true);
		expect(dark.colorScheme.primary).toBe("#9ECAFF");
		const light = createThemeFromPreset("green-light");
		expect(light.dark).toBe(false);
		expect(light.colorScheme.primary).toBe("#2E7D32");
	});

	it("未知 id 回退默认浅色", () => {
		const theme = createThemeFromPreset("nope");
		expect(theme.dark).toBe(false);
		expect(theme.colorScheme).toEqual(createDefaultTheme().colorScheme);
	});

	it("默认主题与 purple-light 预设一致", () => {
		expect(createDefaultTheme().colorScheme).toEqual(
			getThemePreset("purple-light")!.colorScheme,
		);
	});
});

describe("findMatchingPreset", () => {
	it("精确匹配预设", () => {
		const theme = createThemeFromPreset("purple-dark");
		expect(findMatchingPreset(theme)?.id).toBe("purple-dark");
	});

	it("自定义颜色后不再匹配预设", () => {
		const theme: ThemeSpec = {
			...createThemeFromPreset("purple-light"),
			colorScheme: {
				...createThemeFromPreset("purple-light").colorScheme,
				primary: "#123456",
			},
		};
		expect(findMatchingPreset(theme)).toBeUndefined();
	});
});

describe("COLOR_ROLE_GROUPS", () => {
	it("覆盖全部 colorScheme 字段且无重复", () => {
		const roles = COLOR_ROLE_GROUPS.flatMap((g) => g.roles.map((r) => r.key));
		expect(roles.sort()).toEqual(COLOR_KEYS.sort());
		expect(new Set(roles).size).toBe(roles.length);
	});

	it("每个分组有 label 与 roles", () => {
		for (const group of COLOR_ROLE_GROUPS) {
			expect(group.label.length).toBeGreaterThan(0);
			expect(group.roles.length).toBeGreaterThan(0);
		}
	});
});
