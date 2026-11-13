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
export declare function createPreviewPalette(theme: ThemeSpec): PreviewPalette;
/** 给 #RRGGBB 追加 alpha（#RRGGBBAA），用于网格/半透明占位。 */
export declare function withAlpha(hex: string, alphaHex: string): string;
//# sourceMappingURL=palette.d.ts.map