// 属性面板（按 PropSchema 动态生成表单）—— Dark Mode 设计
import React from "react";
import type { PropSchema, TextStyleSpec } from "../../shared/document.js";
import type { StudioState, Action } from "../store.js";
import { findDescriptor } from "../palette/catalog.js";
import { UI } from "../theme/ui.js";

// ===== PropField 字段组件 =====

function FieldRow({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div style={{ marginBottom: UI.space.md }}>
			<div
				style={{
					fontSize: 12,
					color: UI.textMuted,
					marginBottom: UI.space.xs,
				}}
			>
				{label}
			</div>
			{children}
		</div>
	);
}

const inputStyle: React.CSSProperties = {
	width: "100%",
	padding: `${UI.space.sm}px ${UI.space.md}px`,
	border: `1px solid ${UI.border}`,
	borderRadius: UI.radius.md,
	fontSize: 13,
	background: UI.surfaceAlt,
	color: UI.text,
	boxSizing: "border-box",
	outline: "none",
	fontFamily: UI.fontSans,
};

export function PropField({
	schema,
	value,
	onChange,
}: {
	schema: PropSchema;
	value: unknown;
	onChange: (value: unknown) => void;
}) {
	switch (schema.kind) {
		case "string":
			return (
				<FieldRow label={schema.label}>
					<input
						type="text"
						style={inputStyle}
						value={typeof value === "string" ? value : schema.default ?? ""}
						onChange={(e) => onChange(e.target.value)}
					/>
				</FieldRow>
			);
		case "number":
			return (
				<FieldRow label={schema.label}>
					<input
						type="number"
						style={inputStyle}
						value={typeof value === "number" ? value : schema.default ?? 0}
						min={schema.min}
						max={schema.max}
						step={schema.step}
						onChange={(e) => onChange(Number(e.target.value))}
					/>
				</FieldRow>
			);
		case "boolean":
			return (
				<FieldRow label={schema.label}>
					<input
						type="checkbox"
						checked={typeof value === "boolean" ? value : schema.default ?? false}
						onChange={(e) => onChange(e.target.checked)}
						style={{ accentColor: UI.primary }}
					/>
				</FieldRow>
			);
		case "enum":
			return (
				<FieldRow label={schema.label}>
					<select
						style={inputStyle}
						value={typeof value === "string" ? value : schema.default ?? ""}
						onChange={(e) => onChange(e.target.value)}
					>
						{schema.options.map((opt) => (
							<option key={opt.value} value={opt.value}>
								{opt.label}
							</option>
						))}
					</select>
				</FieldRow>
			);
		case "color":
			return (
				<FieldRow label={schema.label}>
					<input
						type="color"
						style={{ width: 40, height: 28, padding: 0, border: `1px solid ${UI.border}` }}
						value={typeof value === "string" ? value : schema.default ?? "#000000"}
						onChange={(e) => onChange(e.target.value)}
					/>
				</FieldRow>
			);
		case "dp":
			return (
				<FieldRow label={schema.label}>
					<input
						type="number"
						style={inputStyle}
						value={typeof value === "number" ? value : schema.default ?? 0}
						min={schema.min}
						max={schema.max}
						onChange={(e) => onChange(Number(e.target.value))}
					/>
				</FieldRow>
			);
		case "spacing": {
			const v = (value ?? schema.default ?? { x: 0, y: 0 }) as {
				x: number;
				y: number;
			};
			return (
				<FieldRow label={schema.label}>
					<div style={{ display: "flex", gap: UI.space.sm }}>
						<input
							type="number"
							style={inputStyle}
							value={v.x}
							onChange={(e) => onChange({ ...v, x: Number(e.target.value) })}
						/>
						<input
							type="number"
							style={inputStyle}
							value={v.y}
							onChange={(e) => onChange({ ...v, y: Number(e.target.value) })}
						/>
					</div>
				</FieldRow>
			);
		}
		case "text-style": {
			const v = (value ?? schema.default ?? {}) as TextStyleSpec;
			return (
				<FieldRow label={schema.label}>
					<input
						type="number"
						style={inputStyle}
						placeholder="fontSize (sp)"
						value={v.fontSize ?? ""}
						onChange={(e) => onChange({ ...v, fontSize: Number(e.target.value) })}
					/>
				</FieldRow>
			);
		}
		case "event":
			return (
				<FieldRow label={schema.label}>
					<div style={{ fontSize: 12, color: UI.textFaint }}>
						事件（{schema.actions.join(", ")}）— Phase 1 占位
					</div>
				</FieldRow>
			);
		case "slot":
			return (
				<FieldRow label={schema.label}>
					<div style={{ fontSize: 12, color: UI.textFaint }}>
						槽（接受: {schema.accepts.join(", ")}）
					</div>
				</FieldRow>
			);
		default:
			return null;
	}
}

// ===== 纯函数（可测试） =====

export function getSelectedNode(
	state: StudioState,
): import("../../shared/document.js").Node | null {
	const id = state.selection.anchorId;
	return id ? (state.document.nodes[id] ?? null) : null;
}

export function getPropSchemas(
	node: import("../../shared/document.js").Node,
): PropSchema[] {
	return findDescriptor(node.type)?.defaultProps ?? [];
}

// ===== Inspector 面板 =====

export function Inspector({
	state,
	dispatch,
}: {
	state: StudioState;
	dispatch: (action: Action) => void;
}) {
	const { selection, document } = state;
	const selectedId = selection.anchorId;
	const node = selectedId ? (document.nodes[selectedId] ?? null) : null;

	if (!node) {
		return (
			<div
				style={{
					padding: UI.space.xl,
					color: UI.textFaint,
					fontSize: 13,
					textAlign: "center",
					fontFamily: UI.fontSans,
				}}
			>
				未选中节点
				<div style={{ fontSize: 11, marginTop: UI.space.xs }}>
					点击画布中的节点查看属性
				</div>
			</div>
		);
	}

	const descriptor = findDescriptor(node.type);
	const propSchemas = descriptor?.defaultProps ?? [];
	const isRoot = node.id === document.root.id;

	const handleChange = (key: string, value: unknown): void => {
		dispatch({ type: "node/updateProps", id: node.id, patch: { [key]: value } });
	};

	const handleDelete = (): void => {
		if (isRoot) return;
		dispatch({ type: "node/remove", id: node.id });
	};

	return (
		<div style={{ padding: UI.space.md, fontFamily: UI.fontSans }}>
			<div
				style={{
					fontSize: 13,
					fontWeight: 600,
					color: UI.text,
					marginBottom: UI.space.md,
					paddingBottom: UI.space.sm,
					borderBottom: `1px solid ${UI.border}`,
				}}
			>
				{node.type}
				{node.label ? ` · ${node.label}` : ""}
			</div>
			{propSchemas.length === 0 ? (
				<div style={{ fontSize: 12, color: UI.textFaint }}>
					该组件无可配置属性
				</div>
			) : (
				propSchemas.map((schema) => (
					<PropField
						key={schema.key}
						schema={schema}
						value={node.props[schema.key]}
						onChange={(v) => handleChange(schema.key, v)}
					/>
				))
			)}
			{!isRoot && (
				<button
					onClick={handleDelete}
					style={{
						width: "100%",
						marginTop: UI.space.lg,
						padding: `${UI.space.sm}px ${UI.space.md}px`,
						border: `1px solid ${UI.destructive}`,
						borderRadius: UI.radius.md,
						background: "transparent",
						color: UI.destructive,
						fontSize: 13,
						cursor: "pointer",
						fontFamily: UI.fontSans,
					}}
				>
					删除节点
				</button>
			)}
		</div>
	);
}
