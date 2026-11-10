// 组件面板（分类树 + 搜索 + 拖拽源）
import React, { useMemo, useState } from "react";
import {
	CATALOG,
	searchDescriptors,
	type ComponentDescriptor,
} from "./catalog.js";

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
				gap: 8,
				padding: "6px 10px",
				margin: "2px 0",
				borderRadius: 6,
				background: "#f5f5f5",
				cursor: "grab",
				fontSize: 13,
			}}
		>
			<span style={{ color: "#888", fontSize: 11 }}>◆</span>
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
				borderRight: "1px solid #e0e0e0",
				background: "#fff",
			}}
		>
			<div style={{ padding: 12 }}>
				<input
					type="text"
					placeholder="搜索组件…"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					style={{
						width: "100%",
						padding: "6px 10px",
						border: "1px solid #d0d0d0",
						borderRadius: 6,
						fontSize: 13,
						boxSizing: "border-box",
					}}
				/>
			</div>
			<div style={{ flex: 1, overflow: "auto", padding: "0 12px 12px" }}>
				{query ? (
					results.length === 0 ? (
						<div style={{ color: "#999", fontSize: 12, padding: 8 }}>
							无匹配组件
						</div>
					) : (
						results.map((d) => <DescriptorItem key={d.id} descriptor={d} />)
					)
				) : (
					CATALOG.map((cat) => (
						<div key={cat.id} style={{ marginBottom: 12 }}>
							<div
								style={{
									fontSize: 12,
									fontWeight: 600,
									color: "#666",
									marginBottom: 4,
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
