// 属性面板（按 PropSchema 动态生成表单）—— Dark Mode 设计
import React from "react";
import type { PropSchema, TextStyleSpec, SizeMode } from "../../shared/document.js";
import { getSizeMode } from "../../shared/document.js";
import type { StudioState, Action } from "../store.js";
import { findDescriptor } from "../palette/catalog.js";
import { UI } from "../theme/ui.js";
import { ThemePanel } from "../theme/ThemePanel.js";

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

// ===== 通用修饰符（Modifier） =====

/** 通用 Modifier 字段（所有组件可用；存于 node.props，modifier 前缀避免冲突）。 */
export const MODIFIER_FIELDS = [
	{ key: "modifierWidth", label: "宽", kind: "size" },
	{ key: "modifierHeight", label: "高", kind: "size" },
	{ key: "modifierPadding", label: "内边距 (dp)", kind: "dp" },
	{ key: "modifierBackground", label: "背景色", kind: "color" },
] as const;

/** 尺寸模式选项。 */
export const SIZE_MODE_OPTIONS = [
	{ value: "fixed", label: "固定 (dp)" },
	{ value: "wrap", label: "包裹内容" },
	{ value: "match", label: "填充父容器" },
	{ value: "weight", label: "权重 (weight)" },
] as const;

/** 从 props 读取修饰符样式（纯函数，可测试）。 */
export { getModifierStyle } from "../canvas/drag.js";

function ModifierSection({
	node,
	dispatch,
}: {
	node: import("../../shared/document.js").Node;
	dispatch: (action: Action) => void;
}) {
	const props = node.props;
	const setProp = (key: string, value: unknown): void => {
		dispatch({ type: "node/updateProps", id: node.id, patch: { [key]: value } });
	};
	// 读取修饰符值（number 或 string；未设置返回空串）
	const modifierValue = (key: string): number | string => {
		const v = props[key];
		return typeof v === "number" ? v : typeof v === "string" ? v : "";
	};

	/** 尺寸字段：模式下拉 + 数值输入（fixed/weight 时）。 */
	const renderSizeField = (field: typeof MODIFIER_FIELDS[number]): React.ReactNode => {
		const mode = getSizeMode(props, field.key);
		const raw = props[field.key];
		const numValue = typeof raw === "number" ? raw : "";
		const showNumber = mode === "fixed" || mode === "weight";
		return (
			<div style={{ display: "flex", gap: UI.space.sm, alignItems: "center" }}>
				<select
					value={mode}
					onChange={(e) =>
						setProp(`${field.key}Mode`, e.target.value as SizeMode)
					}
					style={{ ...inputStyle, width: 110 }}
				>
					{SIZE_MODE_OPTIONS.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</select>
				{showNumber && (
					<input
						type="number"
						style={{ ...inputStyle, width: 70 }}
						value={numValue}
						placeholder={mode === "weight" ? "1" : "dp"}
						onChange={(e) => {
							const v = e.target.value;
							setProp(field.key, v === "" ? undefined : Number(v));
						}}
					/>
				)}
			</div>
		);
	};

	return (
		<div style={{ marginBottom: UI.space.md }}>
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
				修饰符
			</div>
			{MODIFIER_FIELDS.map((field) => (
				<FieldRow key={field.key} label={field.label}>
					{field.kind === "size" ? (
						renderSizeField(field)
					) : field.kind === "dp" ? (
						<input
							type="number"
							style={{ ...inputStyle, width: 90 }}
							value={modifierValue(field.key)}
							placeholder="auto"
							onChange={(e) => {
								const raw = e.target.value;
								setProp(field.key, raw === "" ? undefined : Number(raw));
							}}
						/>
					) : (
						<div style={{ display: "flex", gap: UI.space.sm, alignItems: "center" }}>
							<input
								type="color"
								style={{
									width: 36,
									height: 28,
									padding: 0,
									border: `1px solid ${UI.border}`,
								}}
								value={modifierValue(field.key) || "#ffffff"}
								onChange={(e) => setProp(field.key, e.target.value)}
							/>
							<button
								onClick={() => setProp(field.key, undefined)}
								title="清除背景"
								style={{
									border: `1px solid ${UI.border}`,
									background: "transparent",
									color: UI.textMuted,
									borderRadius: UI.radius.sm,
									fontSize: 11,
									padding: "2px 8px",
									cursor: "pointer",
									fontFamily: UI.fontSans,
								}}
							>
								清除
							</button>
						</div>
					)}
				</FieldRow>
			))}
		</div>
	);
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

function PropsPanel({
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
			<ModifierSection node={node} dispatch={dispatch} />
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

// ===== Inspector 面板（属性 / 主题 标签页） =====

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: `${UI.space.sm}px ${UI.space.md}px`,
        border: "none",
        borderBottom: active ? `2px solid ${UI.primary}` : "2px solid transparent",
        background: "transparent",
        color: active ? UI.text : UI.textMuted,
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        cursor: "pointer",
        fontFamily: UI.fontSans,
      }}
    >
      {children}
    </button>
  );
}

export function Inspector({
  state,
  dispatch,
}: {
  state: StudioState;
  dispatch: (action: Action) => void;
}) {
  const tab = state.ui.inspectorTab;
  return (
    <div style={{ fontFamily: UI.fontSans }}>
      <div
        style={{
          display: "flex",
          padding: `0 ${UI.space.xs}px`,
          borderBottom: `1px solid ${UI.border}`,
        }}
      >
        <TabButton
          active={tab === "props"}
          onClick={() => dispatch({ type: "ui/setInspectorTab", tab: "props" })}
        >
          属性
        </TabButton>
        <TabButton
          active={tab === "theme"}
          onClick={() => dispatch({ type: "ui/setInspectorTab", tab: "theme" })}
        >
          主题
        </TabButton>
      </div>
      {tab === "theme" ? (
        <ThemePanel state={state} dispatch={dispatch} />
      ) : (
        <PropsPanel state={state} dispatch={dispatch} />
      )}
    </div>
  );
}
