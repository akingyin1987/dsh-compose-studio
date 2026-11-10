// 组件面板（分类树 + 搜索 + 拖拽源）—— Dark Mode 设计
import React, { useMemo, useState } from "react";
import {
	CATALOG,
	searchDescriptors,
	type ComponentDescriptor,
} from "./catalog.js";
import { UI } from "../theme/ui.js";

/** 拖拽数据类型（canvas 监听此 MIME）。 */
export const DND_MIME = "application/x-compose-studio";

function DescriptorItem({ descriptor }: { descriptor: ComponentDescriptor }) {
	return (
		<div
			draggable
			onDragStart={(e) => {
				e.dataTransfer.setData(DND_MIME, descriptor.id);
				e.dataTransfer.effectAllowed = "copy";
			}}
			title={descriptor.brief}
			style={{
				display: "flex",
				alignItems: "center",
				gap: UI.space.sm,
				padding: `${UI.space.sm}px ${UI.space.md}px`,
				margin: "2px 0",
				borderRadius: UI.radius.md,
				background: UI.surface,
				border: `1px solid ${UI.borderSubtle}`,
				cursor: "grab",
				fontSize: 13,
				color: UI.text,
				transition: `background ${UI.transition}, border-color ${UI.transition}`,
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.background = UI.surfaceAlt;
				e.currentTarget.style.borderColor = UI.border;
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.background = UI.surface;
				e.currentTarget.style.borderColor = UI.borderSubtle;
			}}
		>
			<span style={{ color: UI.primaryHover, fontSize: 11 }}>◆</span>
			<span>{descriptor.composable}</span>
		</div>
	);
}

export function ComponentPalette() {
	const [query, setQuery] = useState("");
	const results = useMemo(() => searchDescriptors(query), [query]);

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
				borderRight: `1px solid ${UI.border}`,
				background: UI.surface,
				fontFamily: UI.fontSans,
			}}
		>
			{/* 标题 */}
			<div
				style={{
					padding: `${UI.space.md}px ${UI.space.lg}px ${UI.space.sm}px`,
					fontSize: 12,
					fontWeight: 600,
					color: UI.textMuted,
					letterSpacing: "0.05em",
					textTransform: "uppercase",
				}}
			>
				组件
			</div>
			{/* 搜索框 */}
			<div style={{ padding: `0 ${UI.space.md}px ${UI.space.md}px` }}>
				<input
					type="text"
					placeholder="搜索组件…"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					style={{
						width: "100%",
						padding: `${UI.space.sm}px ${UI.space.md}px`,
						border: `1px solid ${UI.border}`,
						borderRadius: UI.radius.md,
						fontSize: 13,
						background: UI.surfaceAlt,
						color: UI.text,
						boxSizing: "border-box",
						outline: "none",
						transition: `border-color ${UI.transition}`,
					}}
					onFocus={(e) => {
						e.currentTarget.style.borderColor = UI.focus;
					}}
					onBlur={(e) => {
						e.currentTarget.style.borderColor = UI.border;
					}}
				/>
			</div>
			{/* 列表 */}
			<div style={{ flex: 1, overflow: "auto", padding: `0 ${UI.space.md}px ${UI.space.md}px` }}>
				{query ? (
					results.length === 0 ? (
						<div style={{ color: UI.textFaint, fontSize: 12, padding: UI.space.sm }}>
							无匹配组件
						</div>
					) : (
						results.map((d) => <DescriptorItem key={d.id} descriptor={d} />)
					)
				) : (
					CATALOG.map((cat) => (
						<div key={cat.id} style={{ marginBottom: UI.space.md }}>
							<div
								style={{
									fontSize: 11,
									fontWeight: 600,
									color: UI.textFaint,
									marginBottom: UI.space.xs,
									paddingLeft: UI.space.xs,
									letterSpacing: "0.04em",
								}}
							>
								{cat.label}
							</div>
							{cat.children.map((d) => (
								<DescriptorItem key={d.id} descriptor={d} />
							))}
						</div>
					))
				)}
			</div>
		</div>
	);
}
