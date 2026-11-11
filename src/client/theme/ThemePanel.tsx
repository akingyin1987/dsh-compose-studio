// 主题面板：预设选择 + 深色切换 + colorScheme 颜色配置
// 所有修改通过 theme/update 同步到 state.theme 与 document.theme。
import React from "react";
import type { StudioState, Action } from "../store.js";
import {
	THEME_PRESETS,
	COLOR_ROLE_GROUPS,
	findMatchingPreset,
	getVariantPreset,
	getThemePreset,
	type ThemePreset,
	type ThemeSpec,
} from "../../shared/theme.js";
import { UI } from "./ui.js";

/** 归一化为 #RRGGBB（color input 仅接受 6 位）。 */
function toHex6(value: string): string {
	const h = value.replace(/^#/, "");
	if (h.length === 8) return `#${h.slice(2)}`;
	return `#${h.length === 6 ? h : "000000"}`.toUpperCase();
}

export function ThemePanel({
	state,
	dispatch,
}: {
	state: StudioState;
	dispatch: (action: Action) => void;
}) {
	const theme = state.theme;
	const matched = findMatchingPreset(theme);
	const matchedPreset = matched ? getThemePreset(matched.id) : undefined;

	const applyPreset = (preset: ThemePreset): void => {
		dispatch({
			type: "theme/update",
			patch: { dark: preset.dark, colorScheme: { ...preset.colorScheme } },
		});
	};

	const toggleDark = (): void => {
		const target = matchedPreset
			? getVariantPreset(matchedPreset, !theme.dark)
			: undefined;
		if (target) {
			applyPreset(target);
		} else {
			dispatch({ type: "theme/update", patch: { dark: !theme.dark } });
		}
	};

	const setColor = (key: keyof ThemeSpec["colorScheme"], value: string): void => {
		dispatch({
			type: "theme/update",
			patch: { colorScheme: { [key]: value } },
		});
	};

	return (
		<div style={{ padding: UI.space.md, fontFamily: UI.fontSans }}>
			{/* 实时预览条 */}
			<div
				style={{
					borderRadius: UI.radius.md,
					background: theme.colorScheme.background,
					border: `1px solid ${UI.border}`,
					padding: UI.space.md,
					marginBottom: UI.space.lg,
				}}
			>
				<div
					style={{
						fontSize: 14,
						fontWeight: 600,
						color: theme.colorScheme.onBackground,
						marginBottom: UI.space.sm,
					}}
				>
					主题预览
				</div>
				<div style={{ display: "flex", gap: UI.space.sm, alignItems: "center" }}>
					<button
						style={{
							height: 32,
							padding: "0 16px",
							borderRadius: 16,
							border: "none",
							background: theme.colorScheme.primary,
							color: theme.colorScheme.onPrimary,
							fontSize: 12,
							cursor: "default",
							fontFamily: UI.fontSans,
						}}
					>
						主要按钮
					</button>
					<button
						style={{
							height: 32,
							padding: "0 16px",
							borderRadius: 16,
							border: `1px solid ${theme.colorScheme.outline}`,
							background: "transparent",
							color: theme.colorScheme.primary,
							fontSize: 12,
							cursor: "default",
							fontFamily: UI.fontSans,
						}}
					>
						次要按钮
					</button>
					<span style={{ fontSize: 12, color: theme.colorScheme.onSurfaceVariant }}>
						文本示例
					</span>
				</div>
			</div>

			{/* 预设 */}
			<SectionTitle>主题预设</SectionTitle>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
					gap: UI.space.sm,
					marginBottom: UI.space.lg,
				}}
			>
				{THEME_PRESETS.map((preset) => {
					const active = matched?.id === preset.id;
					return (
						<button
							key={preset.id}
							onClick={() => applyPreset(preset)}
							title={preset.description}
							style={{
								display: "flex",
								flexDirection: "column",
								gap: UI.space.xs,
								padding: UI.space.sm,
								borderRadius: UI.radius.md,
								border: `1px solid ${active ? UI.primary : UI.border}`,
								background: active ? UI.surfaceAlt : UI.surface,
								cursor: "pointer",
								textAlign: "left",
								fontFamily: UI.fontSans,
							}}
						>
							<div style={{ display: "flex", gap: 3 }}>
								{[preset.colorScheme.primary,
									preset.colorScheme.secondary,
									preset.colorScheme.tertiary,
									preset.colorScheme.background,
									preset.colorScheme.surfaceContainer,
								].map((c, i) => (
									<span
										key={i}
										style={{
											width: 14,
											height: 14,
											borderRadius: 4,
											background: c,
											border: `1px solid ${UI.border}`,
											display: "inline-block",
										}}
									/>
								))}
							</div>
							<span style={{ fontSize: 12, color: UI.text }}>{preset.name}</span>
						</button>
					);
				})}
			</div>

			{/* 深色模式 */}
			<SectionTitle>外观</SectionTitle>
			<button
				onClick={toggleDark}
				style={{
					width: "100%",
					padding: `${UI.space.sm}px ${UI.space.md}px`,
					borderRadius: UI.radius.md,
					border: `1px solid ${UI.border}`,
					background: UI.surfaceAlt,
					color: UI.text,
					fontSize: 13,
					cursor: "pointer",
					marginBottom: UI.space.lg,
					fontFamily: UI.fontSans,
				}}
			>
				{theme.dark ? "当前：深色（点击切换浅色）" : "当前：浅色（点击切换深色）"}
			</button>

			{/* 颜色配置 */}
			<SectionTitle>颜色配置</SectionTitle>
			{COLOR_ROLE_GROUPS.map((group) => (
				<div key={group.id} style={{ marginBottom: UI.space.md }}>
					<div
						style={{
							fontSize: 11,
							fontWeight: 600,
							color: UI.textFaint,
							marginBottom: UI.space.xs,
							letterSpacing: "0.04em",
						}}
					>
						{group.label}
					</div>
					{group.roles.map((role) => (
						<div
							key={role.key}
							style={{
								display: "flex",
								alignItems: "center",
								gap: UI.space.sm,
								marginBottom: 6,
							}}
						>
							<input
								type="color"
								value={toHex6(theme.colorScheme[role.key])}
								onChange={(e) => setColor(role.key, e.target.value.toUpperCase())}
								title={role.label}
								style={{
									width: 32,
									height: 24,
									padding: 0,
									border: `1px solid ${UI.border}`,
									borderRadius: UI.radius.sm,
									background: "transparent",
									cursor: "pointer",
								}}
							/>
							<span style={{ fontSize: 12, color: UI.textMuted, flex: 1 }}>
								{role.label}
							</span>
							<span
								style={{
									fontSize: 11,
									color: UI.textFaint,
									fontFamily: UI.fontMono,
								}}
							>
								{theme.colorScheme[role.key].toUpperCase()}
							</span>
						</div>
					))}
				</div>
			))}
		</div>
	);
}

function SectionTitle({ children }: { children: React.ReactNode }) {
	return (
		<div
			style={{
				fontSize: 12,
				fontWeight: 600,
				color: UI.textMuted,
				marginBottom: UI.space.sm,
				paddingTop: UI.space.sm,
				borderTop: `1px solid ${UI.border}`,
			}}
		>
			{children}
		</div>
	);
}
