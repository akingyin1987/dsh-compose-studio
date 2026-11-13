// 主题代码生成：ThemeSpec → Kotlin colorScheme + GeneratedTheme Composable。
// 纯函数、可快照测试；由 render.ts 在提供 theme 选项时调用。
import type { ThemeSpec } from "../../shared/theme.js";

/** 浅色方案所需 import。 */
export const THEME_IMPORTS_LIGHT = [
	"androidx.compose.material3.MaterialTheme",
	"androidx.compose.material3.lightColorScheme",
	"androidx.compose.runtime.Composable",
	"androidx.compose.ui.graphics.Color",
];

/** 深色方案所需 import。 */
export const THEME_IMPORTS_DARK = [
	"androidx.compose.material3.MaterialTheme",
	"androidx.compose.material3.darkColorScheme",
	"androidx.compose.runtime.Composable",
	"androidx.compose.ui.graphics.Color",
];

/** #RRGGBB / #AARRGGBB → Color(0x......)。 */
export function colorToKotlin(hex: string): string {
	const h = hex.replace(/^#/, "");
	if (/^[0-9A-Fa-f]{8}$/.test(h)) return `Color(0x${h.toUpperCase()})`;
	if (/^[0-9A-Fa-f]{6}$/.test(h)) return `Color(0xFF${h.toUpperCase()})`;
	return "Color(0xFF000000)";
}

/** 生成 colorScheme 声明（lightColorScheme / darkColorScheme）。 */
export function renderColorScheme(theme: ThemeSpec): string[] {
	const scheme = theme.dark ? "darkColorScheme" : "lightColorScheme";
	const lines = [`private val GeneratedColorScheme = ${scheme}(`];
	for (const [key, value] of Object.entries(theme.colorScheme)) {
		lines.push(`    ${key} = ${colorToKotlin(String(value))},`);
	}
	lines.push(")");
	return lines;
}

/** 生成 GeneratedTheme Composable（包裹屏幕内容）。 */
export function renderThemeComposable(): string[] {
	return [
		"@Composable",
		"fun GeneratedTheme(content: @Composable () -> Unit) {",
		"    MaterialTheme(",
		"        colorScheme = GeneratedColorScheme,",
		"        content = content,",
		"    )",
		"}",
	];
}
