import type { ThemeSpec } from "../../shared/theme.js";
/** 浅色方案所需 import。 */
export declare const THEME_IMPORTS_LIGHT: string[];
/** 深色方案所需 import。 */
export declare const THEME_IMPORTS_DARK: string[];
/** #RRGGBB / #AARRGGBB → Color(0x......)。 */
export declare function colorToKotlin(hex: string): string;
/** 生成 colorScheme 声明（lightColorScheme / darkColorScheme）。 */
export declare function renderColorScheme(theme: ThemeSpec): string[];
/** 生成 GeneratedTheme Composable（包裹屏幕内容）。 */
export declare function renderThemeComposable(): string[];
//# sourceMappingURL=theme.d.ts.map