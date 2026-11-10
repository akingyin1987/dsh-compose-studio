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
/** 默认浅色主题（占位值，Phase 2 完善）。 */
export declare function createDefaultTheme(): ThemeSpec;
//# sourceMappingURL=theme.d.ts.map