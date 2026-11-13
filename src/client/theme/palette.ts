// 预览调色板：ThemeSpec → React/CSS 可用色板（纯函数，可测试）。
// PreviewRenderer 与 Canvas 设备框共用，保证「组件默认使用当前主题」。
import type { ThemeSpec } from "../../shared/theme.js";

export interface PreviewPalette {
	primary: string;
	onPrimary: string;
	primaryContainer: string;
	onPrimaryContainer: string;
	secondary: string;
	onSecondary: string;
	secondaryContainer: string;
	onSecondaryContainer: string;
	tertiary: string;
	onTertiary: string;
	tertiaryContainer: string;
	onTertiaryContainer: string;
	error: string;
	onError: string;
	errorContainer: string;
	onErrorContainer: string;
	background: string;
	onBackground: string;
	surface: string;
	onSurface: string;
	surfaceVariant: string;
	onSurfaceVariant: string;
	outline: string;
	outlineVariant: string;
	surfaceContainer: string;
	surfaceContainerHigh: string;
	surfaceContainerHighest: string;
	surfaceContainerLow: string;
	surfaceContainerLowest: string;
	inverseSurface: string;
	inverseOnSurface: string;
	inversePrimary: string;
	scrim: string;
}

/** 由主题构造预览色板（直接映射 colorScheme）。 */
export function createPreviewPalette(theme: ThemeSpec): PreviewPalette {
	return { ...theme.colorScheme };
}

/** 给 #RRGGBB 追加 alpha（#RRGGBBAA），用于网格/半透明占位。 */
export function withAlpha(hex: string, alphaHex: string): string {
	const h = hex.replace(/^#/, "");
	if (h.length !== 6) return hex;
	return `#${h}${alphaHex}`;
}
