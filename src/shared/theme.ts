// Material 3 主题模型（docs/design.md 5.4）
// 含：ThemeSpec、主题预设（light/dark × 紫/蓝/绿）、可配置色角色分组。

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

// ===== 预设色板 =====

/** 紫色 · 浅色（M3 baseline light）。 */
const PURPLE_LIGHT: ThemeSpec["colorScheme"] = {
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
};

/** 紫色 · 深色（M3 baseline dark）。 */
const PURPLE_DARK: ThemeSpec["colorScheme"] = {
	primary: "#D0BCFF",
	onPrimary: "#381E72",
	primaryContainer: "#4F378B",
	onPrimaryContainer: "#EADDFF",
	secondary: "#CCC2DC",
	onSecondary: "#332D41",
	secondaryContainer: "#4A4458",
	onSecondaryContainer: "#E8DEF8",
	tertiary: "#EFB8C8",
	onTertiary: "#492532",
	tertiaryContainer: "#633B48",
	onTertiaryContainer: "#FFD8E4",
	error: "#F2B8B5",
	onError: "#601410",
	errorContainer: "#8C1D18",
	onErrorContainer: "#F9DEDC",
	background: "#1C1B1F",
	onBackground: "#E6E1E5",
	surface: "#1C1B1F",
	onSurface: "#E6E1E5",
	surfaceVariant: "#49454F",
	onSurfaceVariant: "#CAC4D0",
	outline: "#938F99",
	outlineVariant: "#49454F",
	surfaceContainer: "#211F26",
	surfaceContainerHigh: "#2B2930",
	surfaceContainerHighest: "#36343B",
	surfaceContainerLow: "#1D1B20",
	surfaceContainerLowest: "#0F0D13",
	inverseSurface: "#E6E1E5",
	inverseOnSurface: "#313033",
	inversePrimary: "#6750A4",
	scrim: "#000000",
};

/** 蓝色 · 浅色。 */
const BLUE_LIGHT: ThemeSpec["colorScheme"] = {
	primary: "#0061A4",
	onPrimary: "#FFFFFF",
	primaryContainer: "#D1E4FF",
	onPrimaryContainer: "#001D36",
	secondary: "#535F70",
	onSecondary: "#FFFFFF",
	secondaryContainer: "#D7E3F7",
	onSecondaryContainer: "#101C2B",
	tertiary: "#6B5778",
	onTertiary: "#FFFFFF",
	tertiaryContainer: "#F2DAFF",
	onTertiaryContainer: "#251431",
	error: "#B3261E",
	onError: "#FFFFFF",
	errorContainer: "#F9DEDC",
	onErrorContainer: "#410E0B",
	background: "#FDFBFF",
	onBackground: "#1A1C1E",
	surface: "#FDFBFF",
	onSurface: "#1A1C1E",
	surfaceVariant: "#DFE2EB",
	onSurfaceVariant: "#43474E",
	outline: "#73777F",
	outlineVariant: "#C3C7CF",
	surfaceContainer: "#F0F4FA",
	surfaceContainerHigh: "#E8EDF3",
	surfaceContainerHighest: "#E2E8EE",
	surfaceContainerLow: "#F6F8FC",
	surfaceContainerLowest: "#FFFFFF",
	inverseSurface: "#2F3033",
	inverseOnSurface: "#F1F0F4",
	inversePrimary: "#9ECAFF",
	scrim: "#000000",
};

/** 蓝色 · 深色。 */
const BLUE_DARK: ThemeSpec["colorScheme"] = {
	primary: "#9ECAFF",
	onPrimary: "#003258",
	primaryContainer: "#00497D",
	onPrimaryContainer: "#D1E4FF",
	secondary: "#BBC7DB",
	onSecondary: "#253140",
	secondaryContainer: "#3B4858",
	onSecondaryContainer: "#D7E3F7",
	tertiary: "#D6BEE4",
	onTertiary: "#3B2948",
	tertiaryContainer: "#523F5F",
	onTertiaryContainer: "#F2DAFF",
	error: "#F2B8B5",
	onError: "#601410",
	errorContainer: "#8C1D18",
	onErrorContainer: "#F9DEDC",
	background: "#1A1C1E",
	onBackground: "#E2E2E6",
	surface: "#1A1C1E",
	onSurface: "#E2E2E6",
	surfaceVariant: "#43474E",
	onSurfaceVariant: "#C3C7CF",
	outline: "#8D9199",
	outlineVariant: "#43474E",
	surfaceContainer: "#212427",
	surfaceContainerHigh: "#2B2F33",
	surfaceContainerHighest: "#363A3E",
	surfaceContainerLow: "#1B1E21",
	surfaceContainerLowest: "#0F1113",
	inverseSurface: "#E2E2E6",
	inverseOnSurface: "#2F3033",
	inversePrimary: "#0061A4",
	scrim: "#000000",
};

/** 绿色 · 浅色。 */
const GREEN_LIGHT: ThemeSpec["colorScheme"] = {
	primary: "#2E7D32",
	onPrimary: "#FFFFFF",
	primaryContainer: "#C8E6C9",
	onPrimaryContainer: "#0B290B",
	secondary: "#526350",
	onSecondary: "#FFFFFF",
	secondaryContainer: "#D5E8CF",
	onSecondaryContainer: "#101F10",
	tertiary: "#38656A",
	onTertiary: "#FFFFFF",
	tertiaryContainer: "#BCEBF1",
	onTertiaryContainer: "#002023",
	error: "#B3261E",
	onError: "#FFFFFF",
	errorContainer: "#F9DEDC",
	onErrorContainer: "#410E0B",
	background: "#FCFDF7",
	onBackground: "#1A1C18",
	surface: "#FCFDF7",
	onSurface: "#1A1C18",
	surfaceVariant: "#DEE5D8",
	onSurfaceVariant: "#424940",
	outline: "#72796F",
	outlineVariant: "#C2C9BC",
	surfaceContainer: "#F0F4EA",
	surfaceContainerHigh: "#E9EEE4",
	surfaceContainerHighest: "#E3E9DE",
	surfaceContainerLow: "#F6F9F1",
	surfaceContainerLowest: "#FFFFFF",
	inverseSurface: "#2F312C",
	inverseOnSurface: "#F0F1EA",
	inversePrimary: "#A5D6A7",
	scrim: "#000000",
};

/** 绿色 · 深色。 */
const GREEN_DARK: ThemeSpec["colorScheme"] = {
	primary: "#8BD8A8",
	onPrimary: "#00391C",
	primaryContainer: "#00522C",
	onPrimaryContainer: "#A9F2C2",
	secondary: "#B9CCB4",
	onSecondary: "#243424",
	secondaryContainer: "#3A4B39",
	onSecondaryContainer: "#D5E8CF",
	tertiary: "#A0CFD4",
	onTertiary: "#003739",
	tertiaryContainer: "#1E4D52",
	onTertiaryContainer: "#BCEBF1",
	error: "#F2B8B5",
	onError: "#601410",
	errorContainer: "#8C1D18",
	onErrorContainer: "#F9DEDC",
	background: "#1A1C18",
	onBackground: "#E2E3DC",
	surface: "#1A1C18",
	onSurface: "#E2E3DC",
	surfaceVariant: "#424940",
	onSurfaceVariant: "#C2C9BC",
	outline: "#8C9386",
	outlineVariant: "#424940",
	surfaceContainer: "#21241F",
	surfaceContainerHigh: "#2B2F29",
	surfaceContainerHighest: "#363A33",
	surfaceContainerLow: "#1B1E19",
	surfaceContainerLowest: "#0F120D",
	inverseSurface: "#E2E3DC",
	inverseOnSurface: "#2F312C",
	inversePrimary: "#2E7D32",
	scrim: "#000000",
};

// ===== 主题预设 =====

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

export const THEME_PRESETS: ThemePreset[] = [
	{
		id: "purple-light",
		name: "紫色 · 浅色",
		description: "Material 3 基线浅色调",
		baseId: "purple",
		dark: false,
		colorScheme: PURPLE_LIGHT,
	},
	{
		id: "purple-dark",
		name: "紫色 · 深色",
		description: "Material 3 基线深色调",
		baseId: "purple",
		dark: true,
		colorScheme: PURPLE_DARK,
	},
	{
		id: "blue-light",
		name: "蓝色 · 浅色",
		description: "清爽的蓝色品牌调",
		baseId: "blue",
		dark: false,
		colorScheme: BLUE_LIGHT,
	},
	{
		id: "blue-dark",
		name: "蓝色 · 深色",
		description: "沉稳的深蓝夜间调",
		baseId: "blue",
		dark: true,
		colorScheme: BLUE_DARK,
	},
	{
		id: "green-light",
		name: "绿色 · 浅色",
		description: "自然清新的绿色调",
		baseId: "green",
		dark: false,
		colorScheme: GREEN_LIGHT,
	},
	{
		id: "green-dark",
		name: "绿色 · 深色",
		description: "低饱和的暗夜绿色调",
		baseId: "green",
		dark: true,
		colorScheme: GREEN_DARK,
	},
];

export function getThemePreset(id: string): ThemePreset | undefined {
	return THEME_PRESETS.find((p) => p.id === id);
}

/** 默认排版（占位值，Phase 2 可完善）。 */
function defaultTypography(): ThemeSpec["typography"] {
	const t = () => ({}) as TextStyle;
	return {
		displayLarge: t(),
		displayMedium: t(),
		displaySmall: t(),
		headlineLarge: t(),
		headlineMedium: t(),
		headlineSmall: t(),
		titleLarge: t(),
		titleMedium: t(),
		titleSmall: t(),
		bodyLarge: t(),
		bodyMedium: t(),
		bodySmall: t(),
		labelLarge: t(),
		labelMedium: t(),
		labelSmall: t(),
	};
}

function defaultShapes(): ThemeSpec["shapes"] {
	return { extraSmall: 4, small: 8, medium: 12, large: 16, extraLarge: 28 };
}

/** 由色板 + 明暗构造完整主题。 */
export function createTheme(
	dark: boolean,
	colorScheme: ThemeSpec["colorScheme"],
): ThemeSpec {
	return {
		dark,
		colorScheme: { ...colorScheme },
		typography: defaultTypography(),
		shapes: defaultShapes(),
	};
}

/** 由预设 id 构造主题（未知 id 回退默认浅色）。 */
export function createThemeFromPreset(id: string): ThemeSpec {
	const preset = getThemePreset(id);
	if (!preset) return createTheme(false, PURPLE_LIGHT);
	return createTheme(preset.dark, preset.colorScheme);
}

/** 默认主题（紫色 · 浅色）。 */
export function createDefaultTheme(): ThemeSpec {
	return createThemeFromPreset("purple-light");
}

/** 判断主题是否与某预设完全一致（用于高亮当前预设）。 */
export function findMatchingPreset(theme: ThemeSpec): ThemePreset | undefined {
	return THEME_PRESETS.find(
		(p) =>
			p.dark === theme.dark &&
			Object.entries(p.colorScheme).every(
				([key, value]) =>
					theme.colorScheme[key as keyof ThemeSpec["colorScheme"]] === value,
			),
	);
}

/** 同色相族的深色 / 浅色对应预设。 */
export function getVariantPreset(
	preset: ThemePreset,
	dark: boolean,
): ThemePreset | undefined {
	return THEME_PRESETS.find((p) => p.baseId === preset.baseId && p.dark === dark);
}

// ===== 可配置色角色（ThemePanel 按此渲染表单） =====

export interface ColorRole {
	key: keyof ThemeSpec["colorScheme"];
	label: string;
}

export interface ColorRoleGroup {
	id: string;
	label: string;
	roles: ColorRole[];
}

export const COLOR_ROLE_GROUPS: ColorRoleGroup[] = [
	{
		id: "brand",
		label: "品牌色",
		roles: [
			{ key: "primary", label: "主色 primary" },
			{ key: "onPrimary", label: "主色上文字 onPrimary" },
			{ key: "primaryContainer", label: "容器 primaryContainer" },
			{ key: "onPrimaryContainer", label: "容器上文字 onPrimaryContainer" },
		],
	},
	{
		id: "secondary",
		label: "次要色",
		roles: [
			{ key: "secondary", label: "次要 secondary" },
			{ key: "onSecondary", label: "次要上文字 onSecondary" },
			{ key: "secondaryContainer", label: "容器 secondaryContainer" },
			{ key: "onSecondaryContainer", label: "容器上文字 onSecondaryContainer" },
		],
	},
	{
		id: "tertiary",
		label: "第三色",
		roles: [
			{ key: "tertiary", label: "第三 tertiary" },
			{ key: "onTertiary", label: "第三上文字 onTertiary" },
			{ key: "tertiaryContainer", label: "容器 tertiaryContainer" },
			{ key: "onTertiaryContainer", label: "容器上文字 onTertiaryContainer" },
		],
	},
	{
		id: "error",
		label: "错误色",
		roles: [
			{ key: "error", label: "错误 error" },
			{ key: "onError", label: "错误上文字 onError" },
			{ key: "errorContainer", label: "容器 errorContainer" },
			{ key: "onErrorContainer", label: "容器上文字 onErrorContainer" },
		],
	},
	{
		id: "background",
		label: "背景与表面",
		roles: [
			{ key: "background", label: "背景 background" },
			{ key: "onBackground", label: "背景上文字 onBackground" },
			{ key: "surface", label: "表面 surface" },
			{ key: "onSurface", label: "表面上文字 onSurface" },
			{ key: "surfaceVariant", label: "表面变体 surfaceVariant" },
			{ key: "onSurfaceVariant", label: "表面变体上文字 onSurfaceVariant" },
		],
	},
	{
		id: "surfaceContainer",
		label: "表面容器",
		roles: [
			{ key: "surfaceContainer", label: "容器 surfaceContainer" },
			{ key: "surfaceContainerHigh", label: "容器高 surfaceContainerHigh" },
			{ key: "surfaceContainerHighest", label: "容器最高 surfaceContainerHighest" },
			{ key: "surfaceContainerLow", label: "容器低 surfaceContainerLow" },
			{ key: "surfaceContainerLowest", label: "容器最低 surfaceContainerLowest" },
		],
	},
	{
		id: "outline",
		label: "轮廓",
		roles: [
			{ key: "outline", label: "轮廓 outline" },
			{ key: "outlineVariant", label: "轮廓变体 outlineVariant" },
		],
	},
	{
		id: "inverse",
		label: "反色与其他",
		roles: [
			{ key: "inverseSurface", label: "反表面 inverseSurface" },
			{ key: "inverseOnSurface", label: "反表面上文字 inverseOnSurface" },
			{ key: "inversePrimary", label: "反主色 inversePrimary" },
			{ key: "scrim", label: "遮罩 scrim" },
		],
	},
];
