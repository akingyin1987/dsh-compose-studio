// 组件目录（docs/design.md 5.1）
import type { PropSchema } from "../../shared/document.js";

export interface CodegenHint {
	imports: string[];
	render: "leaf" | "container" | "slot";
	slotProp?: string;
	modifierFirst?: boolean;
	wrapperTemplate?: string;
}

export interface PreviewSpec {
	kind: "text" | "button" | "container" | "image" | "icon" | "field";
	text?: string;
}

export interface ChildrenSchema {
	accepts?: string[];
	slotProp?: string;
}

export interface ComponentDescriptor {
	/** 稳定 id，如 "m3.Button"。 */
	id: string;
	composable: string;
	fqn: string;
	category: string;
	brief: string;
	docsUrl?: string;
	icon?: string;
	defaultProps: PropSchema[];
	defaultChildren?: ChildrenSchema;
	codegen: CodegenHint;
	preview: PreviewSpec;
	tags: string[];
}

export interface ComponentCategory {
	id: string;
	label: string;
	icon?: string;
	children: ComponentDescriptor[];
}

// ===== Phase 1 内置组件清单 =====

const DESCRIPTORS: ComponentDescriptor[] = [
	// ---- 布局 ----
	{
		id: "layout.Column",
		composable: "Column",
		fqn: "androidx.compose.foundation.layout.Column",
		category: "layout",
		brief: "垂直布局容器",
		icon: "columns",
		defaultProps: [
			{ kind: "dp", key: "spacing", label: "间距", default: 8 },
		],
		codegen: {
			imports: ["androidx.compose.foundation.layout.Column"],
			render: "container",
		},
		preview: { kind: "container" },
		tags: ["column", "vertical", "layout", "排列"],
	},
	{
		id: "layout.Row",
		composable: "Row",
		fqn: "androidx.compose.foundation.layout.Row",
		category: "layout",
		brief: "水平布局容器",
		icon: "rows",
		defaultProps: [
			{ kind: "dp", key: "spacing", label: "间距", default: 8 },
		],
		codegen: {
			imports: ["androidx.compose.foundation.layout.Row"],
			render: "container",
		},
		preview: { kind: "container" },
		tags: ["row", "horizontal", "layout"],
	},
	{
		id: "layout.Box",
		composable: "Box",
		fqn: "androidx.compose.foundation.layout.Box",
		category: "layout",
		brief: "层叠布局容器",
		icon: "box",
		defaultProps: [],
		codegen: {
			imports: ["androidx.compose.foundation.layout.Box"],
			render: "container",
		},
		preview: { kind: "container" },
		tags: ["box", "stack", "layout"],
	},
	// ---- Material 3 ----
	{
		id: "m3.Text",
		composable: "Text",
		fqn: "androidx.compose.material3.Text",
		category: "material3",
		brief: "文本",
		icon: "type",
		defaultProps: [
			{ kind: "string", key: "text", label: "文本", default: "Text" },
			{ kind: "text-style", key: "style", label: "样式" },
		],
		codegen: { imports: ["androidx.compose.material3.Text"], render: "leaf" },
		preview: { kind: "text", text: "Text" },
		tags: ["text", "label", "title", "文本"],
	},
	{
		id: "m3.Button",
		composable: "Button",
		fqn: "androidx.compose.material3.Button",
		category: "material3",
		brief: "按钮（含 content 槽）",
		icon: "mouse-pointer-click",
		defaultProps: [
			{ kind: "event", key: "onClick", label: "点击", actions: ["onClick"] },
		],
		defaultChildren: { slotProp: "content" },
		codegen: {
			imports: ["androidx.compose.material3.Button"],
			render: "slot",
			slotProp: "content",
		},
		preview: { kind: "button", text: "Button" },
		tags: ["button", "click", "action", "按钮"],
	},
	{
		id: "m3.TextField",
		composable: "TextField",
		fqn: "androidx.compose.material3.TextField",
		category: "material3",
		brief: "文本输入框",
		icon: "text-cursor-input",
		defaultProps: [
			{ kind: "string", key: "label", label: "标签", default: "Label" },
			{ kind: "string", key: "value", label: "值", default: "" },
			{
				kind: "event",
				key: "onValueChange",
				label: "值变化",
				actions: ["onValueChange"],
			},
		],
		codegen: { imports: ["androidx.compose.material3.TextField"], render: "leaf" },
		preview: { kind: "field", text: "TextField" },
		tags: ["textfield", "input", "输入"],
	},
	{
		id: "m3.Card",
		composable: "Card",
		fqn: "androidx.compose.material3.Card",
		category: "material3",
		brief: "卡片容器",
		icon: "square",
		defaultProps: [],
		defaultChildren: { slotProp: "content" },
		codegen: {
			imports: ["androidx.compose.material3.Card"],
			render: "slot",
			slotProp: "content",
		},
		preview: { kind: "container" },
		tags: ["card", "surface", "卡片"],
	},
	{
		id: "m3.Scaffold",
		composable: "Scaffold",
		fqn: "androidx.compose.material3.Scaffold",
		category: "material3",
		brief: "Material 3 脚手架（根容器）",
		icon: "layout-template",
		defaultProps: [],
		defaultChildren: { slotProp: "content" },
		codegen: {
			imports: ["androidx.compose.material3.Scaffold"],
			render: "slot",
			slotProp: "content",
		},
		preview: { kind: "container" },
		tags: ["scaffold", "screen", "页面"],
	},
	{
		id: "m3.TopAppBar",
		composable: "TopAppBar",
		fqn: "androidx.compose.material3.TopAppBar",
		category: "material3",
		brief: "顶部应用栏",
		icon: "panel-top",
		defaultProps: [
			{ kind: "string", key: "title", label: "标题", default: "Title" },
		],
		codegen: {
			imports: [
				"androidx.compose.material3.TopAppBar",
				"androidx.compose.material3.Text",
			],
			render: "slot",
			slotProp: "title",
		},
		preview: { kind: "container" },
		tags: ["topbar", "appbar", "header", "顶栏"],
	},
	// ---- 内容 ----
	{
		id: "content.Image",
		composable: "Image",
		fqn: "androidx.compose.foundation.Image",
		category: "content",
		brief: "图片",
		icon: "image",
		defaultProps: [
			{ kind: "string", key: "url", label: "图片地址", default: "" },
			{ kind: "dp", key: "width", label: "宽", default: 100 },
			{ kind: "dp", key: "height", label: "高", default: 100 },
		],
		codegen: { imports: ["androidx.compose.foundation.Image"], render: "leaf" },
		preview: { kind: "image" },
		tags: ["image", "picture", "图片"],
	},
	{
		id: "content.Icon",
		composable: "Icon",
		fqn: "androidx.compose.material3.Icon",
		category: "content",
		brief: "图标",
		icon: "star",
		defaultProps: [
			{
				kind: "enum",
				key: "name",
				label: "图标",
				options: [
					{ value: "star", label: "Star" },
					{ value: "heart", label: "Heart" },
					{ value: "home", label: "Home" },
				],
				default: "star",
			},
		],
		codegen: { imports: ["androidx.compose.material3.Icon"], render: "leaf" },
		preview: { kind: "icon" },
		tags: ["icon", "图标"],
	},
];

export const CATALOG: ComponentCategory[] = [
	{
		id: "layout",
		label: "布局",
		icon: "layout",
		children: DESCRIPTORS.filter((d) => d.category === "layout"),
	},
	{
		id: "material3",
		label: "Material 3",
		icon: "component",
		children: DESCRIPTORS.filter((d) => d.category === "material3"),
	},
	{
		id: "content",
		label: "内容",
		icon: "image",
		children: DESCRIPTORS.filter((d) => d.category === "content"),
	},
];

export const ALL_DESCRIPTORS: ComponentDescriptor[] = DESCRIPTORS;

export function findDescriptor(id: string): ComponentDescriptor | undefined {
	return DESCRIPTORS.find((d) => d.id === id);
}

export function searchDescriptors(query: string): ComponentDescriptor[] {
	const q = query.toLowerCase().trim();
	if (!q) return DESCRIPTORS;
	return DESCRIPTORS.filter(
		(d) =>
			d.brief.toLowerCase().includes(q) ||
			d.composable.toLowerCase().includes(q) ||
			d.fqn.toLowerCase().includes(q) ||
			d.tags.some((t) => t.includes(q)),
	);
}
