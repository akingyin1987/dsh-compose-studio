// IR 构建（纯函数，docs/design.md 7.2）
// buildIr(doc) → IrNode；PropSchema → IrValue 分类（literal/token/expression/resource）。
// 与客户端预览共用 src/shared/ir.ts 的类型。
import type {
	CanvasDocument,
	Node,
	PropSchema,
	TextStyleSpec,
} from "../../shared/document.js";
import { isContainerNode } from "../../shared/document.js";
import type { IrNode, IrAttr, IrValue } from "../../shared/ir.js";
import { getSizeMode } from "../../shared/document.js";
import { findDescriptor } from "../../client/palette/catalog.js";

/** 修饰符属性 key（与 Inspector MODIFIER_FIELDS / drag.getModifierStyle 一致）。 */
const MODIFIER_KEYS = [
	"modifierWidth",
	"modifierHeight",
	"modifierPadding",
	"modifierBackground",
] as const;

/** 修饰符相关的 import 符号。 */
const IMPORT_MODIFIER = "androidx.compose.ui.Modifier";
const IMPORT_DP = "androidx.compose.ui.unit.dp";
const IMPORT_COLOR = "androidx.compose.ui.graphics.Color";
const IMPORT_MATERIAL_THEME = "androidx.compose.material3.MaterialTheme";
const IMPORT_TYPOGRAPHY = "androidx.compose.material3.MaterialTheme";

/**
 * 构建 IR（树 walk，纯函数）。
 * 相同输入始终产生相同输出（可快照测试）。
 */
export function buildIr(doc: CanvasDocument): IrNode {
	return buildNode(doc, doc.root);
}

function buildNode(doc: CanvasDocument, node: Node): IrNode {
	const descriptor = findDescriptor(node.type);
	const ir: IrNode = {
		// 未知组件降级为 Box（保留子节点，避免丢失结构）
		composable: descriptor?.composable ?? "Box",
		imports: descriptor
			? [...descriptor.codegen.imports]
			: ["androidx.compose.foundation.layout.Box"],
		attrs: [],
		renderKind: descriptor?.codegen.render ?? "container",
	};

	if (node.label) {
		ir.comments = [`// ${node.label}`];
	}

	// 属性（按 PropSchema 顺序；event 始终生成 TODO 占位，其余跳过未设置的）
	if (descriptor) {
		for (const schema of descriptor.defaultProps) {
			const value = node.props[schema.key];
			if (value === undefined && schema.kind !== "event") continue;
			// Button 类：text 属性 → 默认 Text 子节点（不作为参数）
			if (schema.key === "text" && descriptor.codegen.render === "slot") continue;
			const attr = propToAttr(schema, value);
			if (attr) {
				ir.attrs.push(attr);
				ir.imports.push(...importsForAttr(attr));
			}
		}
	}

	// 通用修饰符（宽/高/内边距/背景色）
	const modifierExpr = buildModifierExpression(node.props);
	if (modifierExpr) {
		ir.attrs.push({
			name: "modifier",
			value: { kind: "expression", code: modifierExpr },
		});
		ir.imports.push(IMPORT_MODIFIER);
		if (/(width|height|padding)\(/.test(modifierExpr)) {
			ir.imports.push(IMPORT_DP);
		}
		if (modifierExpr.includes("Color(")) {
			ir.imports.push(IMPORT_COLOR);
		}
	}

	// 子节点
	if (isContainerNode(node)) {
		const children = node.children
			.map((id) => doc.nodes[id])
			.filter((n): n is Node => n != null)
			.map((n) => buildNode(doc, n));

		if (descriptor?.codegen.render === "slot" && descriptor.codegen.slotProp) {
			ir.slots = { [descriptor.codegen.slotProp]: children };
		} else if (children.length > 0) {
			ir.children = children;
		}
	}

	// Button 类：text 属性 → 默认 Text 子节点（无子节点时，渲染为 content 内容）
	if (
		isContainerNode(node) &&
		descriptor?.codegen.render === "slot" &&
		descriptor.codegen.slotProp &&
		node.children.length === 0
	) {
		const textProp = node.props.text;
		if (typeof textProp === "string" && textProp) {
			const textNode: IrNode = {
				composable: "Text",
				imports: ["androidx.compose.material3.Text"],
				attrs: [{ name: "text", value: { kind: "literal", value: textProp } }],
				renderKind: "leaf",
			};
			ir.slots = { ...ir.slots, [descriptor.codegen.slotProp]: [textNode] };
		}
	}

	return ir;
}

/** 属性 → IrAttr。 */
function propToAttr(schema: PropSchema, value: unknown): IrAttr | null {
	switch (schema.kind) {
		case "string":
			return { name: schema.key, value: { kind: "literal", value: String(value) } };
		case "number":
			return { name: schema.key, value: { kind: "literal", value: Number(value) } };
		case "dp":
			return {
				name: schema.key,
				value: { kind: "literal", value: Number(value) },
				unit: "dp",
			};
		case "boolean":
			return { name: schema.key, value: { kind: "literal", value: Boolean(value) } };
		case "enum":
			return { name: schema.key, value: { kind: "literal", value: String(value) } };
		case "color":
			return { name: schema.key, value: classifyColor(String(value)) };
		case "text-style":
			return {
				name: schema.key,
				value: { kind: "expression", code: textStyleToCode(value as TextStyleSpec) },
			};
		case "event":
			return {
				name: schema.key,
				value: { kind: "expression", code: eventToCode(schema) },
			};
		default:
			return null;
	}
}

/** 颜色分类：#RRGGBB → literal；否则 → token（MaterialTheme.colorScheme.<name>）。 */
function classifyColor(value: string): IrValue {
	if (/^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(value)) {
		return { kind: "literal", value };
	}
	return { kind: "token", token: `MaterialTheme.colorScheme.${value}` };
}

/** TextStyleSpec → Kotlin 表达式（fontSize 用 .sp 单位）。 */
function textStyleToCode(style: TextStyleSpec): string {
	if (style.fontSize != null) {
		return `MaterialTheme.typography.bodyLarge.copy(fontSize = ${style.fontSize}.sp)`;
	}
	return "MaterialTheme.typography.bodyLarge";
}

/** 事件 → Kotlin lambda 占位（TODO 注释，render 阶段生成）。 */
function eventToCode(schema: PropSchema & { kind: "event" }): string {
	if (schema.key === "onValueChange") {
		return `{ /* TODO: 处理值变化 */ newValue -> }`;
	}
	return `{ /* TODO: 处理${schema.label} */ }`;
}

/** 尺寸 → Modifier 链片段（fixed/wrap/match/weight）。 */
function sizeModifier(
	props: Record<string, unknown>,
	key: "modifierWidth" | "modifierHeight",
	widthName: "width" | "height",
): string | null {
	const mode = getSizeMode(props, key);
	switch (mode) {
		case "wrap":
			return `.wrapContent${widthName === "width" ? "Width" : "Height"}()`;
		case "match":
			return `.fillMax${widthName === "width" ? "Width" : "Height"}()`;
		case "weight":
			return props[key] != null ? `.weight(${props[key]}f)` : null;
		case "fixed":
			return props[key] != null ? `.${widthName}(${props[key]}.dp)` : null;
	}
}

/** 修饰符 → Modifier 链表达式（无修饰符时返回 null）。 */
function buildModifierExpression(props: Record<string, unknown>): string | null {
	const parts: string[] = ["Modifier"];
	const widthMod = sizeModifier(props, "modifierWidth", "width");
	if (widthMod) parts.push(widthMod);
	const heightMod = sizeModifier(props, "modifierHeight", "height");
	if (heightMod) parts.push(heightMod);
	if (props.modifierPadding != null) parts.push(`.padding(${props.modifierPadding}.dp)`);
	if (props.modifierBackground != null) {
		const hex = String(props.modifierBackground).replace(/^#/, "");
		// 8 位（AARRGGBB）直接用；6 位（RRGGBB）补 FF alpha
		const arg = hex.length === 8 ? `0x${hex}` : `0xFF${hex}`;
		parts.push(`.background(Color(${arg}))`);
	}
	return parts.length > 1 ? parts.join("") : null;
}

/** 属性相关的额外 imports。 */
function importsForAttr(attr: IrAttr): string[] {
	const imports: string[] = [];
	if (attr.unit === "dp") imports.push(IMPORT_DP);
	if (attr.value.kind === "token" && attr.value.token.startsWith("MaterialTheme.")) {
		imports.push(IMPORT_MATERIAL_THEME);
	}
	if (
		attr.value.kind === "expression" &&
		attr.value.code.includes("MaterialTheme.typography")
	) {
		imports.push(IMPORT_TYPOGRAPHY);
	}
	return imports;
}
