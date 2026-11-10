// 设计 tokens（Dark Mode OLED + Material 3 语义色）
// 参考：ui-ux-pro-max 设计系统（开发者工具/深色）+ Android Studio Darcula 风格
export const UI = {
	// 表面
	bg: "#0F172A", // 主背景（深蓝黑）
	surface: "#1B2336", // 面板/卡片
	surfaceAlt: "#272F42", // 次级表面（hover/输入框）
	border: "#334155", // 边框/分隔线
	borderSubtle: "#1E293B", // 弱分隔线
	// 文本
	text: "#F8FAFC", // 主文本
	textMuted: "#94A3B8", // 次文本
	textFaint: "#64748B", // 弱化文本
	// 品牌色（M3 purple）
	primary: "#6750A4",
	primaryHover: "#7F67BE",
	onPrimary: "#FFFFFF",
	primaryContainer: "#EADDFF",
	// 强调（选中）
	accent: "#22C55E",
	accentBg: "rgba(34, 197, 94, 0.12)",
	// 状态
	destructive: "#EF4444",
	focus: "#818CF8",
	// 圆角
	radius: { sm: 4, md: 6, lg: 12, xl: 16 },
	// 间距（4/8 节奏）
	space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
	// 字体（系统字体 fallback，避免外部依赖）
	fontSans: "system-ui, -apple-system, 'Segoe UI', sans-serif",
	fontMono: "ui-monospace, 'Cascadia Code', Consolas, monospace",
	// 阴影
	shadow: {
		sm: "0 1px 2px rgba(0,0,0,0.3)",
		md: "0 4px 12px rgba(0,0,0,0.4)",
		lg: "0 8px 24px rgba(0,0,0,0.5)",
	},
	// 过渡
	transition: "150ms ease",
} as const;

export type UiToken = typeof UI;
