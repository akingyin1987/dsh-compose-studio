export interface TextStyle {
    fontFamily?: string;
    /** sp */
    fontSize?: number;
    fontWeight?: "W100" | "W200" | "W300" | "W400" | "W500" | "W600" | "W700" | "W800" | "W900";
    lineHeight?: number;
    letterSpacing?: number;
    textDecoration?: "none" | "lineThrough";
}
export interface ThemeSpec {
    dark: boolean;
    colorScheme: {
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
    };
    typography: {
        displayLarge: TextStyle;
        displayMedium: TextStyle;
        displaySmall: TextStyle;
        headlineLarge: TextStyle;
        headlineMedium: TextStyle;
        headlineSmall: TextStyle;
        titleLarge: TextStyle;
        titleMedium: TextStyle;
        titleSmall: TextStyle;
        bodyLarge: TextStyle;
        bodyMedium: TextStyle;
        bodySmall: TextStyle;
        labelLarge: TextStyle;
        labelMedium: TextStyle;
        labelSmall: TextStyle;
    };
    shapes: {
        extraSmall: number;
        small: number;
        medium: number;
        large: number;
        extraLarge: number;
    };
}
export interface ThemePreset {
    id: string;
    /** 展示名（如「紫色 · 浅色」）。 */
    name: string;
    description: string;
    /** 色相族标识（用于浅色/深色互相切换时匹配同族预设）。 */
    baseId: string;
    dark: boolean;
    colorScheme: ThemeSpec["colorScheme"];
}
export declare const THEME_PRESETS: ThemePreset[];
export declare function getThemePreset(id: string): ThemePreset | undefined;
/** 由色板 + 明暗构造完整主题。 */
export declare function createTheme(dark: boolean, colorScheme: ThemeSpec["colorScheme"]): ThemeSpec;
/** 由预设 id 构造主题（未知 id 回退默认浅色）。 */
export declare function createThemeFromPreset(id: string): ThemeSpec;
/** 默认主题（紫色 · 浅色）。 */
export declare function createDefaultTheme(): ThemeSpec;
/** 判断主题是否与某预设完全一致（用于高亮当前预设）。 */
export declare function findMatchingPreset(theme: ThemeSpec): ThemePreset | undefined;
/** 同色相族的深色 / 浅色对应预设。 */
export declare function getVariantPreset(preset: ThemePreset, dark: boolean): ThemePreset | undefined;
export interface ColorRole {
    key: keyof ThemeSpec["colorScheme"];
    label: string;
}
export interface ColorRoleGroup {
    id: string;
    label: string;
    roles: ColorRole[];
}
export declare const COLOR_ROLE_GROUPS: ColorRoleGroup[];
//# sourceMappingURL=theme.d.ts.map