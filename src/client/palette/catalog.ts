// 组件目录（docs/design.md 5.1）
// 覆盖 Android 官网 Compose Material 组件清单（https://developer.android.com/develop/ui/compose/components）
import type { PropSchema } from "../../shared/document.js";

export interface CodegenHint {
	imports: string[];
	render: "leaf" | "container" | "slot";
	slotProp?: string;
	modifierFirst?: boolean;
	wrapperTemplate?: string;
}

export interface PreviewSpec {
	kind: "text" | "button" | "container" | "image" | "icon" | "field" | "progress" | "toggle" | "divider" | "card" | "appbar" | "navigation" | "dialog" | "tooltip" | "badge" | "tab" | "canvas" | "spacer" | "slider" | "chip";
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

// ===== 排列/对齐枚举 =====

/** 排列选项（Column 垂直 / Row 水平）。 */
export const ARRANGEMENT_OPTIONS: { value: string; label: string }[] = [
	{ value: "top", label: "顶部/起始" },
	{ value: "center", label: "居中" },
	{ value: "bottom", label: "底部/末尾" },
	{ value: "spaceBetween", label: "两端对齐" },
	{ value: "spaceAround", label: "均匀分布" },
	{ value: "spaceEvenly", label: "等间距" },
];

/** 对齐选项（Column 水平 / Row 垂直）。 */
export const ALIGNMENT_OPTIONS: { value: string; label: string }[] = [
	{ value: "start", label: "起始" },
	{ value: "center", label: "居中" },
	{ value: "end", label: "末尾" },
];

// ===== 便捷构造器 =====

function m3(
	id: string,
	composable: string,
	brief: string,
	extra: Partial<ComponentDescriptor> = {},
): ComponentDescriptor {
	return {
		id,
		composable,
		fqn: `androidx.compose.material3.${composable}`,
		category: "material3",
		brief,
		icon: "component",
		defaultProps: [],
		codegen: { imports: [`androidx.compose.material3.${composable}`], render: "leaf" },
		preview: { kind: "container" },
		tags: [composable.toLowerCase()],
		...extra,
	};
}

function layout(
	id: string,
	composable: string,
	brief: string,
	extra: Partial<ComponentDescriptor> = {},
): ComponentDescriptor {
	return {
		id,
		composable,
		fqn: `androidx.compose.foundation.layout.${composable}`,
		category: "layout",
		brief,
		icon: "layout",
		defaultProps: [],
		codegen: { imports: [`androidx.compose.foundation.layout.${composable}`], render: "container" },
		preview: { kind: "container" },
		tags: [composable.toLowerCase(), "layout"],
		...extra,
	};
}

function content(
	id: string,
	composable: string,
	fqn: string,
	brief: string,
	extra: Partial<ComponentDescriptor> = {},
): ComponentDescriptor {
	return {
		id,
		composable,
		fqn,
		category: "content",
		brief,
		icon: "type",
		defaultProps: [],
		codegen: { imports: [fqn], render: "leaf" },
		preview: { kind: "container" },
		tags: [composable.toLowerCase()],
		...extra,
	};
}

// ===== Phase 1 内置组件清单（52 个） =====

const DESCRIPTORS: ComponentDescriptor[] = [
	// ================= 布局（8） =================
	layout("layout.Column", "Column", "垂直布局容器", {
		icon: "columns",
		defaultProps: [
			{ kind: "dp", key: "spacing", label: "间距", default: 8 },
			{ kind: "enum", key: "verticalArrangement", label: "垂直排列", options: ARRANGEMENT_OPTIONS, default: "top" },
			{ kind: "enum", key: "horizontalAlignment", label: "水平对齐", options: ALIGNMENT_OPTIONS, default: "start" },
		],
		tags: ["column", "vertical", "layout", "排列"],
	}),
	layout("layout.Row", "Row", "水平布局容器", {
		icon: "rows",
		defaultProps: [
			{ kind: "dp", key: "spacing", label: "间距", default: 8 },
			{ kind: "enum", key: "horizontalArrangement", label: "水平排列", options: ARRANGEMENT_OPTIONS, default: "start" },
			{ kind: "enum", key: "verticalAlignment", label: "垂直对齐", options: ALIGNMENT_OPTIONS, default: "center" },
		],
		tags: ["row", "horizontal", "layout"],
	}),
	layout("layout.Box", "Box", "层叠布局容器", {
		icon: "box",
		tags: ["box", "stack", "layout"],
	}),
	layout("layout.Spacer", "Spacer", "占位间距", {
		icon: "move-vertical",
		defaultProps: [
			{ kind: "dp", key: "width", label: "宽", default: 0 },
			{ kind: "dp", key: "height", label: "高", default: 8 },
		],
		codegen: { imports: ["androidx.compose.foundation.layout.Spacer"], render: "leaf" },
		preview: { kind: "spacer" },
		tags: ["spacer", "space", "占位"],
	}),
	layout("layout.FlowRow", "FlowRow", "流式行布局（自动换行）", {
		icon: "wrap-text",
		defaultProps: [{ kind: "dp", key: "spacing", label: "间距", default: 8 }],
		tags: ["flow", "wrap", "layout", "流式"],
	}),
	layout("layout.FlowColumn", "FlowColumn", "流式列布局（自动换列）", {
		icon: "wrap-text",
		defaultProps: [{ kind: "dp", key: "spacing", label: "间距", default: 8 }],
		tags: ["flow", "wrap", "layout", "流式"],
	}),
	layout("layout.LazyColumn", "LazyColumn", "懒加载垂直列表", {
		icon: "list",
		defaultProps: [{ kind: "dp", key: "spacing", label: "间距", default: 8 }],
		tags: ["lazy", "list", "scroll", "列表"],
	}),
	layout("layout.LazyRow", "LazyRow", "懒加载水平列表", {
		icon: "list",
		defaultProps: [{ kind: "dp", key: "spacing", label: "间距", default: 8 }],
		tags: ["lazy", "list", "scroll", "列表"],
	}),

	// ================= Material 3 —— 文本 =================
	m3("m3.Text", "Text", "文本", {
		icon: "type",
		defaultProps: [
			{ kind: "string", key: "text", label: "文本", default: "Text" },
			{ kind: "text-style", key: "style", label: "样式" },
		],
		preview: { kind: "text", text: "Text" },
		tags: ["text", "label", "title", "文本"],
	}),

	// ================= Material 3 —— 按钮（5） =================
	m3("m3.Button", "Button", "按钮（含 content 槽）", {
		icon: "mouse-pointer-click",
		defaultProps: [
			{ kind: "string", key: "text", label: "文本", default: "Button" },
			{ kind: "event", key: "onClick", label: "点击", actions: ["onClick"] },
		],
		defaultChildren: { slotProp: "content" },
		codegen: { imports: ["androidx.compose.material3.Button"], render: "slot", slotProp: "content" },
		preview: { kind: "button", text: "Button" },
		tags: ["button", "click", "action", "按钮"],
	}),
	m3("m3.FilledTonalButton", "FilledTonalButton", "填充色调按钮", {
		icon: "rectangle-horizontal",
		defaultProps: [
			{ kind: "string", key: "text", label: "文本", default: "Tonal" },
			{ kind: "event", key: "onClick", label: "点击", actions: ["onClick"] },
		],
		defaultChildren: { slotProp: "content" },
		codegen: { imports: ["androidx.compose.material3.FilledTonalButton"], render: "slot", slotProp: "content" },
		preview: { kind: "button", text: "Tonal" },
		tags: ["button", "tonal", "按钮"],
	}),
	m3("m3.OutlinedButton", "OutlinedButton", "描边按钮", {
		icon: "square",
		defaultProps: [
			{ kind: "string", key: "text", label: "文本", default: "Outlined" },
			{ kind: "event", key: "onClick", label: "点击", actions: ["onClick"] },
		],
		defaultChildren: { slotProp: "content" },
		codegen: { imports: ["androidx.compose.material3.OutlinedButton"], render: "slot", slotProp: "content" },
		preview: { kind: "button", text: "Outlined" },
		tags: ["button", "outlined", "描边"],
	}),
	m3("m3.TextButton", "TextButton", "文本按钮", {
		icon: "text",
		defaultProps: [
			{ kind: "string", key: "text", label: "文本", default: "Text" },
			{ kind: "event", key: "onClick", label: "点击", actions: ["onClick"] },
		],
		defaultChildren: { slotProp: "content" },
		codegen: { imports: ["androidx.compose.material3.TextButton"], render: "slot", slotProp: "content" },
		preview: { kind: "button", text: "Text" },
		tags: ["button", "text", "文本"],
	}),
	m3("m3.ElevatedButton", "ElevatedButton", "抬高按钮（阴影）", {
		icon: "layers",
		defaultProps: [
			{ kind: "string", key: "text", label: "文本", default: "Elevated" },
			{ kind: "event", key: "onClick", label: "点击", actions: ["onClick"] },
		],
		defaultChildren: { slotProp: "content" },
		codegen: { imports: ["androidx.compose.material3.ElevatedButton"], render: "slot", slotProp: "content" },
		preview: { kind: "button", text: "Elevated" },
		tags: ["button", "elevated", "阴影"],
	}),

	// ================= Material 3 —— 图标按钮 =================
	m3("m3.IconButton", "IconButton", "图标按钮（含 content 槽）", {
		icon: "circle-dot",
		defaultProps: [{ kind: "event", key: "onClick", label: "点击", actions: ["onClick"] }],
		defaultChildren: { slotProp: "content" },
		codegen: { imports: ["androidx.compose.material3.IconButton"], render: "slot", slotProp: "content" },
		preview: { kind: "button", text: "IB" },
		tags: ["icon", "button", "图标"],
	}),

	// ================= Material 3 —— FAB（2） =================
	m3("m3.FloatingActionButton", "FloatingActionButton", "悬浮操作按钮", {
		icon: "plus-circle",
		defaultProps: [{ kind: "event", key: "onClick", label: "点击", actions: ["onClick"] }],
		defaultChildren: { slotProp: "content" },
		codegen: { imports: ["androidx.compose.material3.FloatingActionButton"], render: "slot", slotProp: "content" },
		preview: { kind: "button", text: "FAB" },
		tags: ["fab", "floating", "action", "悬浮"],
	}),
	m3("m3.ExtendedFloatingActionButton", "ExtendedFloatingActionButton", "扩展悬浮按钮", {
		icon: "plus-square",
		defaultProps: [{ kind: "event", key: "onClick", label: "点击", actions: ["onClick"] }],
		defaultChildren: { slotProp: "content" },
		codegen: { imports: ["androidx.compose.material3.ExtendedFloatingActionButton"], render: "slot", slotProp: "content" },
		preview: { kind: "button", text: "Extended" },
		tags: ["fab", "extended", "悬浮"],
	}),

	// ================= Material 3 —— 卡片（3） =================
	m3("m3.Card", "Card", "卡片容器", {
		icon: "square",
		defaultProps: [{ kind: "event", key: "onClick", label: "点击", actions: ["onClick"] }],
		defaultChildren: { slotProp: "content" },
		codegen: { imports: ["androidx.compose.material3.Card"], render: "slot", slotProp: "content" },
		preview: { kind: "card" },
		tags: ["card", "surface", "卡片"],
	}),
	m3("m3.ElevatedCard", "ElevatedCard", "抬高卡片", {
		icon: "square",
		defaultProps: [{ kind: "event", key: "onClick", label: "点击", actions: ["onClick"] }],
		defaultChildren: { slotProp: "content" },
		codegen: { imports: ["androidx.compose.material3.ElevatedCard"], render: "slot", slotProp: "content" },
		preview: { kind: "card" },
		tags: ["card", "elevated", "卡片"],
	}),
	m3("m3.OutlinedCard", "OutlinedCard", "描边卡片", {
		icon: "square",
		defaultProps: [{ kind: "event", key: "onClick", label: "点击", actions: ["onClick"] }],
		defaultChildren: { slotProp: "content" },
		codegen: { imports: ["androidx.compose.material3.OutlinedCard"], render: "slot", slotProp: "content" },
		preview: { kind: "card" },
		tags: ["card", "outlined", "卡片"],
	}),

	// ================= Material 3 —— 选择控件（4） =================
	m3("m3.Checkbox", "Checkbox", "复选框", {
		icon: "check-square",
		defaultProps: [
			{ kind: "boolean", key: "checked", label: "选中", default: false },
			{ kind: "event", key: "onCheckedChange", label: "变化", actions: ["onCheckedChange"] },
		],
		preview: { kind: "toggle" },
		tags: ["checkbox", "check", "选择", "复选"],
	}),
	m3("m3.RadioButton", "RadioButton", "单选按钮", {
		icon: "circle-dot",
		defaultProps: [
			{ kind: "boolean", key: "selected", label: "选中", default: false },
			{ kind: "event", key: "onClick", label: "点击", actions: ["onClick"] },
		],
		preview: { kind: "toggle" },
		tags: ["radio", "单选", "选择"],
	}),
	m3("m3.Switch", "Switch", "开关", {
		icon: "toggle-left",
		defaultProps: [
			{ kind: "boolean", key: "checked", label: "开启", default: false },
			{ kind: "event", key: "onCheckedChange", label: "变化", actions: ["onCheckedChange"] },
		],
		preview: { kind: "toggle" },
		tags: ["switch", "toggle", "开关"],
	}),
	m3("m3.Slider", "Slider", "滑块", {
		icon: "sliders-horizontal",
		defaultProps: [
			{ kind: "number", key: "value", label: "值", default: 50, min: 0, max: 100 },
			{ kind: "event", key: "onValueChange", label: "变化", actions: ["onValueChange"] },
		],
		preview: { kind: "slider" },
		tags: ["slider", "range", "滑块"],
	}),

	// ================= Material 3 —— Chip（2） =================
	m3("m3.AssistChip", "AssistChip", "辅助标签", {
		icon: "tag",
		defaultProps: [
			{ kind: "string", key: "label", label: "文本", default: "Chip" },
			{ kind: "event", key: "onClick", label: "点击", actions: ["onClick"] },
		],
		preview: { kind: "chip", text: "Chip" },
		tags: ["chip", "tag", "标签"],
	}),
	m3("m3.FilterChip", "FilterChip", "筛选标签", {
		icon: "filter",
		defaultProps: [
			{ kind: "string", key: "label", label: "文本", default: "Filter" },
			{ kind: "boolean", key: "selected", label: "选中", default: false },
			{ kind: "event", key: "onClick", label: "点击", actions: ["onClick"] },
		],
		preview: { kind: "chip", text: "Filter" },
		tags: ["chip", "filter", "筛选"],
	}),

	// ================= Material 3 —— 对话框 =================
	m3("m3.AlertDialog", "AlertDialog", "警告对话框", {
		icon: "message-square",
		defaultProps: [
			{ kind: "string", key: "title", label: "标题", default: "Dialog" },
			{ kind: "string", key: "text", label: "内容", default: "Content" },
			{ kind: "event", key: "onDismiss", label: "关闭", actions: ["onDismiss"] },
		],
		preview: { kind: "dialog" },
		tags: ["dialog", "alert", "对话框"],
	}),

	// ================= Material 3 —— 分割线（2） =================
	m3("m3.HorizontalDivider", "HorizontalDivider", "水平分割线", {
		icon: "minus",
		defaultProps: [{ kind: "dp", key: "thickness", label: "粗细", default: 1 }],
		preview: { kind: "divider" },
		tags: ["divider", "horizontal", "分割线"],
	}),
	m3("m3.VerticalDivider", "VerticalDivider", "垂直分割线", {
		icon: "minus",
		defaultProps: [{ kind: "dp", key: "thickness", label: "粗细", default: 1 }],
		preview: { kind: "divider" },
		tags: ["divider", "vertical", "分割线"],
	}),

	// ================= Material 3 —— 列表 =================
	m3("m3.ListItem", "ListItem", "列表项", {
		icon: "list",
		defaultProps: [
			{ kind: "string", key: "headline", label: "标题", default: "List item" },
			{ kind: "string", key: "supporting", label: "副标题", default: "" },
		],
		preview: { kind: "text", text: "List item" },
		tags: ["list", "item", "列表项"],
	}),

	// ================= Material 3 —— 菜单 =================
	m3("m3.DropdownMenu", "DropdownMenu", "下拉菜单", {
		icon: "menu",
		defaultProps: [
			{ kind: "boolean", key: "expanded", label: "展开", default: false },
			{ kind: "event", key: "onDismiss", label: "关闭", actions: ["onDismiss"] },
		],
		defaultChildren: { slotProp: "content" },
		codegen: { imports: ["androidx.compose.material3.DropdownMenu"], render: "slot", slotProp: "content" },
		preview: { kind: "container" },
		tags: ["menu", "dropdown", "菜单"],
	}),

	// ================= Material 3 —— 导航（2） =================
	m3("m3.NavigationBar", "NavigationBar", "底部导航栏", {
		icon: "panel-bottom",
		defaultChildren: { slotProp: "content" },
		codegen: { imports: ["androidx.compose.material3.NavigationBar"], render: "slot", slotProp: "content" },
		preview: { kind: "navigation" },
		tags: ["navigation", "bar", "导航"],
	}),
	m3("m3.NavigationRail", "NavigationRail", "侧边导航栏", {
		icon: "panel-left",
		defaultChildren: { slotProp: "content" },
		codegen: { imports: ["androidx.compose.material3.NavigationRail"], render: "slot", slotProp: "content" },
		preview: { kind: "navigation" },
		tags: ["navigation", "rail", "导航"],
	}),

	// ================= Material 3 —— 进度（2） =================
	m3("m3.CircularProgressIndicator", "CircularProgressIndicator", "圆形进度指示器", {
		icon: "loader",
		defaultProps: [{ kind: "number", key: "progress", label: "进度", default: 50, min: 0, max: 100 }],
		preview: { kind: "progress" },
		tags: ["progress", "circular", "加载"],
	}),
	m3("m3.LinearProgressIndicator", "LinearProgressIndicator", "线性进度指示器", {
		icon: "loader",
		defaultProps: [{ kind: "number", key: "progress", label: "进度", default: 50, min: 0, max: 100 }],
		preview: { kind: "progress" },
		tags: ["progress", "linear", "加载"],
	}),

	// ================= Material 3 —— Snackbar =================
	m3("m3.Snackbar", "Snackbar", "轻量提示条", {
		icon: "message-square",
		defaultProps: [
			{ kind: "string", key: "message", label: "消息", default: "Snackbar" },
			{ kind: "string", key: "actionLabel", label: "动作", default: "" },
		],
		preview: { kind: "text", text: "Snackbar" },
		tags: ["snackbar", "toast", "提示"],
	}),

	// ================= Material 3 —— 标签页 =================
	m3("m3.TabRow", "TabRow", "标签页行", {
		icon: "tabs",
		defaultProps: [{ kind: "number", key: "selectedIndex", label: "选中", default: 0, min: 0, max: 10 }],
		defaultChildren: { slotProp: "content" },
		codegen: { imports: ["androidx.compose.material3.TabRow"], render: "slot", slotProp: "content" },
		preview: { kind: "tab" },
		tags: ["tab", "tabs", "标签页"],
	}),

	// ================= Material 3 —— 文本输入（2） =================
	m3("m3.TextField", "TextField", "文本输入框", {
		icon: "text-cursor-input",
		defaultProps: [
			{ kind: "string", key: "label", label: "标签", default: "Label" },
			{ kind: "string", key: "value", label: "值", default: "" },
			{ kind: "event", key: "onValueChange", label: "值变化", actions: ["onValueChange"] },
		],
		preview: { kind: "field", text: "TextField" },
		tags: ["textfield", "input", "输入"],
	}),
	m3("m3.OutlinedTextField", "OutlinedTextField", "描边文本输入框", {
		icon: "text-cursor-input",
		defaultProps: [
			{ kind: "string", key: "label", label: "标签", default: "Label" },
			{ kind: "string", key: "value", label: "值", default: "" },
			{ kind: "event", key: "onValueChange", label: "值变化", actions: ["onValueChange"] },
		],
		preview: { kind: "field", text: "Outlined" },
		tags: ["textfield", "outlined", "输入"],
	}),

	// ================= Material 3 —— 顶栏 =================
	m3("m3.TopAppBar", "TopAppBar", "顶部应用栏", {
		icon: "panel-top",
		defaultProps: [{ kind: "string", key: "title", label: "标题", default: "Title" }],
		defaultChildren: { slotProp: "title" },
		codegen: {
			imports: ["androidx.compose.material3.TopAppBar", "androidx.compose.material3.Text"],
			render: "slot",
			slotProp: "title",
		},
		preview: { kind: "appbar" },
		tags: ["topbar", "appbar", "header", "顶栏"],
	}),

	// ================= Material 3 —— 徽章 =================
	m3("m3.Badge", "Badge", "徽章", {
		icon: "badge",
		defaultChildren: { slotProp: "content" },
		codegen: { imports: ["androidx.compose.material3.Badge"], render: "slot", slotProp: "content" },
		preview: { kind: "badge" },
		tags: ["badge", "徽标"],
	}),

	// ================= Material 3 —— 底部弹层 =================
	m3("m3.ModalBottomSheet", "ModalBottomSheet", "模态底部弹层", {
		icon: "panel-bottom",
		defaultProps: [{ kind: "event", key: "onDismiss", label: "关闭", actions: ["onDismiss"] }],
		defaultChildren: { slotProp: "content" },
		codegen: { imports: ["androidx.compose.material3.ModalBottomSheet"], render: "slot", slotProp: "content" },
		preview: { kind: "container" },
		tags: ["bottomsheet", "sheet", "弹层"],
	}),

	// ================= Material 3 —— 选择器（2） =================
	m3("m3.DatePicker", "DatePicker", "日期选择器", {
		icon: "calendar",
		defaultProps: [
			{ kind: "string", key: "selectedDate", label: "日期", default: "2024-01-01" },
			{ kind: "event", key: "onDateChange", label: "变化", actions: ["onDateChange"] },
		],
		preview: { kind: "field", text: "Date" },
		tags: ["datepicker", "date", "日期"],
	}),
	m3("m3.TimePicker", "TimePicker", "时间选择器", {
		icon: "clock",
		defaultProps: [
			{ kind: "string", key: "time", label: "时间", default: "12:00" },
			{ kind: "event", key: "onTimeChange", label: "变化", actions: ["onTimeChange"] },
		],
		preview: { kind: "field", text: "Time" },
		tags: ["timepicker", "time", "时间"],
	}),

	// ================= Material 3 —— 提示 =================
	m3("m3.PlainTooltip", "PlainTooltip", "纯文本提示", {
		icon: "message-circle",
		defaultProps: [{ kind: "string", key: "text", label: "提示", default: "Tooltip" }],
		defaultChildren: { slotProp: "content" },
		codegen: { imports: ["androidx.compose.material3.PlainTooltip"], render: "slot", slotProp: "content" },
		preview: { kind: "tooltip", text: "Tip" },
		tags: ["tooltip", "hint", "提示"],
	}),

	// ================= Material 3 —— 分段按钮 =================
	m3("m3.SegmentedButton", "SegmentedButton", "分段按钮", {
		icon: "columns-3",
		defaultProps: [
			{ kind: "string", key: "label", label: "文本", default: "Option" },
			{ kind: "boolean", key: "selected", label: "选中", default: false },
			{ kind: "event", key: "onClick", label: "点击", actions: ["onClick"] },
		],
		preview: { kind: "button", text: "Option" },
		tags: ["segmented", "button", "分段"],
	}),

	// ================= Material 3 —— 表面 =================
	m3("m3.Surface", "Surface", "表面容器", {
		icon: "square",
		defaultProps: [{ kind: "color", key: "color", label: "颜色", default: "#FFFFFF" }],
		defaultChildren: { slotProp: "content" },
		codegen: { imports: ["androidx.compose.material3.Surface"], render: "slot", slotProp: "content" },
		preview: { kind: "container" },
		tags: ["surface", "container", "表面"],
	}),

	// ================= Material 3 —— 脚手架 =================
	m3("m3.Scaffold", "Scaffold", "Material 3 脚手架（根容器）", {
		icon: "layout-template",
		defaultChildren: { slotProp: "content" },
		codegen: { imports: ["androidx.compose.material3.Scaffold"], render: "slot", slotProp: "content" },
		preview: { kind: "container" },
		tags: ["scaffold", "screen", "页面"],
	}),

	// ================= 内容（4） =================
	content("content.Image", "Image", "androidx.compose.foundation.Image", "图片", {
		icon: "image",
		defaultProps: [
			{ kind: "string", key: "url", label: "图片地址", default: "" },
			{ kind: "dp", key: "width", label: "宽", default: 100 },
			{ kind: "dp", key: "height", label: "高", default: 100 },
		],
		preview: { kind: "image" },
		tags: ["image", "picture", "图片"],
	}),
	content("content.Icon", "Icon", "androidx.compose.material3.Icon", "图标", {
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
		preview: { kind: "icon" },
		tags: ["icon", "图标"],
	}),
	content("content.Canvas", "Canvas", "androidx.compose.foundation.Canvas", "画布", {
		icon: "pen-tool",
		defaultProps: [
			{ kind: "dp", key: "width", label: "宽", default: 200 },
			{ kind: "dp", key: "height", label: "高", default: 200 },
		],
		preview: { kind: "canvas" },
		tags: ["canvas", "draw", "画布"],
	}),
	content("content.BasicText", "BasicText", "androidx.compose.foundation.text.BasicText", "基础文本", {
		icon: "type",
		defaultProps: [{ kind: "string", key: "text", label: "文本", default: "Basic" }],
		preview: { kind: "text", text: "Basic" },
		tags: ["text", "basic", "文本"],
	}),
];

/** 面板功能分组（左侧组件面板按此顺序展示）。 */
export interface PaletteGroup {
	id: string;
	label: string;
	descriptors: string[];
}

export const PALETTE_GROUPS: PaletteGroup[] = [
	{
		id: "buttons",
		label: "按钮",
		descriptors: [
			"m3.Button",
			"m3.FilledTonalButton",
			"m3.OutlinedButton",
			"m3.TextButton",
			"m3.ElevatedButton",
			"m3.SegmentedButton",
			"m3.IconButton",
			"m3.FloatingActionButton",
			"m3.ExtendedFloatingActionButton",
		],
	},
	{
		id: "selection",
		label: "选择控件",
		descriptors: ["m3.Checkbox", "m3.RadioButton", "m3.Switch", "m3.Slider"],
	},
	{
		id: "text",
		label: "文本",
		descriptors: ["m3.Text", "content.BasicText"],
	},
	{
		id: "input",
		label: "输入",
		descriptors: [
			"m3.TextField",
			"m3.OutlinedTextField",
			"m3.DatePicker",
			"m3.TimePicker",
		],
	},
	{
		id: "containers",
		label: "容器",
		descriptors: [
			"layout.Column",
			"layout.Row",
			"layout.Box",
			"layout.FlowRow",
			"layout.FlowColumn",
			"layout.LazyColumn",
			"layout.LazyRow",
			"layout.Spacer",
			"m3.Card",
			"m3.ElevatedCard",
			"m3.OutlinedCard",
			"m3.Surface",
			"m3.Scaffold",
		],
	},
	{
		id: "appbars",
		label: "顶栏 / 底栏",
		descriptors: ["m3.TopAppBar", "m3.ModalBottomSheet"],
	},
	{
		id: "navigation",
		label: "导航",
		descriptors: ["m3.NavigationBar", "m3.NavigationRail", "m3.TabRow"],
	},
	{
		id: "chips",
		label: "标签",
		descriptors: ["m3.AssistChip", "m3.FilterChip"],
	},
	{
		id: "progress",
		label: "进度",
		descriptors: [
			"m3.CircularProgressIndicator",
			"m3.LinearProgressIndicator",
		],
	},
	{
		id: "feedback",
		label: "反馈",
		descriptors: ["m3.Snackbar", "m3.AlertDialog", "m3.Badge", "m3.PlainTooltip"],
	},
	{
		id: "list",
		label: "列表 / 菜单",
		descriptors: ["m3.ListItem", "m3.DropdownMenu"],
	},
	{
		id: "content",
		label: "内容",
		descriptors: [
			"content.Image",
			"content.Icon",
			"content.Canvas",
			"m3.HorizontalDivider",
			"m3.VerticalDivider",
		],
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
