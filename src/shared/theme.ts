// Material 3 主题模型（docs/design.md 5.4）

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
export function createDefaultTheme(): ThemeSpec {
	const typography = () => ({}) as TextStyle;
	return {
		dark: false,
		colorScheme: {
			primary: "#6750A4",
			onPrimary: "#FFFFFF",
			primaryContainer: "#EADDFF",
			onPrimaryContainer: "#21005D",
			secondary: "#625B71",
			onSecondary: "#FFFFFF",
			secondaryContainer: "#E8DEF8",
			onSecondaryContainer: "#1D192B",
			tertiary: "#7D5260",
			onTertiary: "#FFFFFF",
			tertiaryContainer: "#FFD8E4",
			onTertiaryContainer: "#31111D",
			error: "#B3261E",
			onError: "#FFFFFF",
			errorContainer: "#F9DEDC",
			onErrorContainer: "#410E0B",
			background: "#FFFBFE",
			onBackground: "#1C1B1F",
			surface: "#FFFBFE",
			onSurface: "#1C1B1F",
			surfaceVariant: "#E7E0EC",
			onSurfaceVariant: "#49454F",
			outline: "#79747E",
			outlineVariant: "#CAC4D0",
			surfaceContainer: "#F3EDF7",
			surfaceContainerHigh: "#ECE6F0",
			surfaceContainerHighest: "#E6E0E9",
			surfaceContainerLow: "#F7F2FA",
			surfaceContainerLowest: "#FFFFFF",
			inverseSurface: "#313033",
			inverseOnSurface: "#F4EFF4",
			inversePrimary: "#D0BCFF",
			scrim: "#000000",
		},
		typography: {
			displayLarge: typography(),
			displayMedium: typography(),
			displaySmall: typography(),
			headlineLarge: typography(),
			headlineMedium: typography(),
			headlineSmall: typography(),
			titleLarge: typography(),
			titleMedium: typography(),
			titleSmall: typography(),
			bodyLarge: typography(),
			bodyMedium: typography(),
			bodySmall: typography(),
			labelLarge: typography(),
			labelMedium: typography(),
			labelSmall: typography(),
		},
		shapes: { extraSmall: 4, small: 8, medium: 12, large: 16, extraLarge: 28 },
	};
}
