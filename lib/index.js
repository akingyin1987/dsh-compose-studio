// src/server/index.ts
import { defineTool as defineTool2 } from "@deepseek-ai/dsh-tools";
import "@deepseek-ai/dsh-host-webserver";
import "@deepseek-ai/dsh-llm";
import "@deepseek-ai/dsh-settings";

// src/shared/invariant.ts
var RPC_PREFIX = "/compose-studio";
var PROTOCOL_VERSION = 1;
var MAIN_PANEL_ID = "composeStudio";
var RPC_METHOD = {
  PING: "ping",
  DOC_LOAD: "doc/load",
  DOC_SAVE: "doc/save",
  DOC_EXPORT: "doc/export",
  CODEGEN_GENERATE: "codegen/generate",
  LLM_GENERATE: "llm/generate",
  THEME_RESOLVE: "theme/resolve"
};

// src/server/config.ts
import Schema from "@deepseek-ai/schemastery";
var ConfigSchema = Schema.object({
  defaultDevice: Schema.string().default("phone"),
  themePreset: Schema.string().default("material3"),
  /** 工作区根目录（空 = 进程 cwd）。文档与导出均限制在此目录内。 */
  workspaceRoot: Schema.string().default(""),
  codegen: Schema.object({
    language: Schema.string().default("kotlin"),
    composeBom: Schema.string().default("2024.09.00"),
    packageName: Schema.string().default("com.example.generated"),
    usePreviewAnnotation: Schema.boolean().default(true),
    addModifierDefault: Schema.boolean().default(true)
  }).default({
    language: "kotlin",
    composeBom: "2024.09.00",
    packageName: "com.example.generated",
    usePreviewAnnotation: true,
    addModifierDefault: true
  }),
  llm: Schema.object({
    enabled: Schema.boolean().default(true),
    model: Schema.string().default(""),
    maxTokens: Schema.number().default(4096),
    temperature: Schema.number().default(0.2)
  }).default({
    enabled: true,
    model: "",
    maxTokens: 4096,
    temperature: 0.2
  }),
  persistence: Schema.object({
    autoSaveMs: Schema.number().default(1500),
    historyLimit: Schema.number().default(100)
  }).default({
    autoSaveMs: 1500,
    historyLimit: 100
  })
});

// src/shared/ir.ts
var DEFAULT_GENERATE_OPTIONS = {
  packageName: "com.example.generated",
  composeBom: "2024.09.00",
  usePreviewAnnotation: true,
  addModifierDefault: true,
  minify: false
};

// src/shared/document.ts
var DOCUMENT_VERSION = 1;
function isContainerNode(node) {
  return Array.isArray(node.children);
}
function getSizeMode(props, key) {
  const mode = props[`${key}Mode`];
  return mode === "wrap" || mode === "match" || mode === "weight" ? mode : "fixed";
}
function validateBasicInvariants(doc) {
  return {
    duplicateParents: [],
    unresolvedChildren: [],
    duplicateChildren: [],
    rootNotContainer: !isContainerNode(doc.root)
  };
}

// src/client/palette/catalog.ts
var ARRANGEMENT_OPTIONS = [
  { value: "top", label: "\u9876\u90E8/\u8D77\u59CB" },
  { value: "center", label: "\u5C45\u4E2D" },
  { value: "bottom", label: "\u5E95\u90E8/\u672B\u5C3E" },
  { value: "spaceBetween", label: "\u4E24\u7AEF\u5BF9\u9F50" },
  { value: "spaceAround", label: "\u5747\u5300\u5206\u5E03" },
  { value: "spaceEvenly", label: "\u7B49\u95F4\u8DDD" }
];
var ALIGNMENT_OPTIONS = [
  { value: "start", label: "\u8D77\u59CB" },
  { value: "center", label: "\u5C45\u4E2D" },
  { value: "end", label: "\u672B\u5C3E" }
];
function m3(id, composable, brief, extra = {}) {
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
    ...extra
  };
}
function layout(id, composable, brief, extra = {}) {
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
    ...extra
  };
}
function content(id, composable, fqn, brief, extra = {}) {
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
    ...extra
  };
}
var DESCRIPTORS = [
  // ================= 布局（8） =================
  layout("layout.Column", "Column", "\u5782\u76F4\u5E03\u5C40\u5BB9\u5668", {
    icon: "columns",
    defaultProps: [
      { kind: "dp", key: "spacing", label: "\u95F4\u8DDD", default: 8 },
      { kind: "enum", key: "verticalArrangement", label: "\u5782\u76F4\u6392\u5217", options: ARRANGEMENT_OPTIONS, default: "top" },
      { kind: "enum", key: "horizontalAlignment", label: "\u6C34\u5E73\u5BF9\u9F50", options: ALIGNMENT_OPTIONS, default: "start" }
    ],
    tags: ["column", "vertical", "layout", "\u6392\u5217"]
  }),
  layout("layout.Row", "Row", "\u6C34\u5E73\u5E03\u5C40\u5BB9\u5668", {
    icon: "rows",
    defaultProps: [
      { kind: "dp", key: "spacing", label: "\u95F4\u8DDD", default: 8 },
      { kind: "enum", key: "horizontalArrangement", label: "\u6C34\u5E73\u6392\u5217", options: ARRANGEMENT_OPTIONS, default: "start" },
      { kind: "enum", key: "verticalAlignment", label: "\u5782\u76F4\u5BF9\u9F50", options: ALIGNMENT_OPTIONS, default: "center" }
    ],
    tags: ["row", "horizontal", "layout"]
  }),
  layout("layout.Box", "Box", "\u5C42\u53E0\u5E03\u5C40\u5BB9\u5668", {
    icon: "box",
    tags: ["box", "stack", "layout"]
  }),
  layout("layout.Spacer", "Spacer", "\u5360\u4F4D\u95F4\u8DDD", {
    icon: "move-vertical",
    defaultProps: [
      { kind: "dp", key: "width", label: "\u5BBD", default: 0 },
      { kind: "dp", key: "height", label: "\u9AD8", default: 8 }
    ],
    codegen: { imports: ["androidx.compose.foundation.layout.Spacer"], render: "leaf" },
    preview: { kind: "spacer" },
    tags: ["spacer", "space", "\u5360\u4F4D"]
  }),
  layout("layout.FlowRow", "FlowRow", "\u6D41\u5F0F\u884C\u5E03\u5C40\uFF08\u81EA\u52A8\u6362\u884C\uFF09", {
    icon: "wrap-text",
    defaultProps: [{ kind: "dp", key: "spacing", label: "\u95F4\u8DDD", default: 8 }],
    tags: ["flow", "wrap", "layout", "\u6D41\u5F0F"]
  }),
  layout("layout.FlowColumn", "FlowColumn", "\u6D41\u5F0F\u5217\u5E03\u5C40\uFF08\u81EA\u52A8\u6362\u5217\uFF09", {
    icon: "wrap-text",
    defaultProps: [{ kind: "dp", key: "spacing", label: "\u95F4\u8DDD", default: 8 }],
    tags: ["flow", "wrap", "layout", "\u6D41\u5F0F"]
  }),
  layout("layout.LazyColumn", "LazyColumn", "\u61D2\u52A0\u8F7D\u5782\u76F4\u5217\u8868", {
    icon: "list",
    defaultProps: [{ kind: "dp", key: "spacing", label: "\u95F4\u8DDD", default: 8 }],
    tags: ["lazy", "list", "scroll", "\u5217\u8868"]
  }),
  layout("layout.LazyRow", "LazyRow", "\u61D2\u52A0\u8F7D\u6C34\u5E73\u5217\u8868", {
    icon: "list",
    defaultProps: [{ kind: "dp", key: "spacing", label: "\u95F4\u8DDD", default: 8 }],
    tags: ["lazy", "list", "scroll", "\u5217\u8868"]
  }),
  // ================= Material 3 —— 文本 =================
  m3("m3.Text", "Text", "\u6587\u672C", {
    icon: "type",
    defaultProps: [
      { kind: "string", key: "text", label: "\u6587\u672C", default: "Text" },
      { kind: "text-style", key: "style", label: "\u6837\u5F0F" }
    ],
    preview: { kind: "text", text: "Text" },
    tags: ["text", "label", "title", "\u6587\u672C"]
  }),
  // ================= Material 3 —— 按钮（5） =================
  m3("m3.Button", "Button", "\u6309\u94AE\uFF08\u542B content \u69FD\uFF09", {
    icon: "mouse-pointer-click",
    defaultProps: [
      { kind: "string", key: "text", label: "\u6587\u672C", default: "Button" },
      { kind: "event", key: "onClick", label: "\u70B9\u51FB", actions: ["onClick"] }
    ],
    defaultChildren: { slotProp: "content" },
    codegen: { imports: ["androidx.compose.material3.Button"], render: "slot", slotProp: "content" },
    preview: { kind: "button", text: "Button" },
    tags: ["button", "click", "action", "\u6309\u94AE"]
  }),
  m3("m3.FilledTonalButton", "FilledTonalButton", "\u586B\u5145\u8272\u8C03\u6309\u94AE", {
    icon: "rectangle-horizontal",
    defaultProps: [
      { kind: "string", key: "text", label: "\u6587\u672C", default: "Tonal" },
      { kind: "event", key: "onClick", label: "\u70B9\u51FB", actions: ["onClick"] }
    ],
    defaultChildren: { slotProp: "content" },
    codegen: { imports: ["androidx.compose.material3.FilledTonalButton"], render: "slot", slotProp: "content" },
    preview: { kind: "button", text: "Tonal" },
    tags: ["button", "tonal", "\u6309\u94AE"]
  }),
  m3("m3.OutlinedButton", "OutlinedButton", "\u63CF\u8FB9\u6309\u94AE", {
    icon: "square",
    defaultProps: [
      { kind: "string", key: "text", label: "\u6587\u672C", default: "Outlined" },
      { kind: "event", key: "onClick", label: "\u70B9\u51FB", actions: ["onClick"] }
    ],
    defaultChildren: { slotProp: "content" },
    codegen: { imports: ["androidx.compose.material3.OutlinedButton"], render: "slot", slotProp: "content" },
    preview: { kind: "button", text: "Outlined" },
    tags: ["button", "outlined", "\u63CF\u8FB9"]
  }),
  m3("m3.TextButton", "TextButton", "\u6587\u672C\u6309\u94AE", {
    icon: "text",
    defaultProps: [
      { kind: "string", key: "text", label: "\u6587\u672C", default: "Text" },
      { kind: "event", key: "onClick", label: "\u70B9\u51FB", actions: ["onClick"] }
    ],
    defaultChildren: { slotProp: "content" },
    codegen: { imports: ["androidx.compose.material3.TextButton"], render: "slot", slotProp: "content" },
    preview: { kind: "button", text: "Text" },
    tags: ["button", "text", "\u6587\u672C"]
  }),
  m3("m3.ElevatedButton", "ElevatedButton", "\u62AC\u9AD8\u6309\u94AE\uFF08\u9634\u5F71\uFF09", {
    icon: "layers",
    defaultProps: [
      { kind: "string", key: "text", label: "\u6587\u672C", default: "Elevated" },
      { kind: "event", key: "onClick", label: "\u70B9\u51FB", actions: ["onClick"] }
    ],
    defaultChildren: { slotProp: "content" },
    codegen: { imports: ["androidx.compose.material3.ElevatedButton"], render: "slot", slotProp: "content" },
    preview: { kind: "button", text: "Elevated" },
    tags: ["button", "elevated", "\u9634\u5F71"]
  }),
  // ================= Material 3 —— 图标按钮 =================
  m3("m3.IconButton", "IconButton", "\u56FE\u6807\u6309\u94AE\uFF08\u542B content \u69FD\uFF09", {
    icon: "circle-dot",
    defaultProps: [{ kind: "event", key: "onClick", label: "\u70B9\u51FB", actions: ["onClick"] }],
    defaultChildren: { slotProp: "content" },
    codegen: { imports: ["androidx.compose.material3.IconButton"], render: "slot", slotProp: "content" },
    preview: { kind: "button", text: "IB" },
    tags: ["icon", "button", "\u56FE\u6807"]
  }),
  // ================= Material 3 —— FAB（2） =================
  m3("m3.FloatingActionButton", "FloatingActionButton", "\u60AC\u6D6E\u64CD\u4F5C\u6309\u94AE", {
    icon: "plus-circle",
    defaultProps: [{ kind: "event", key: "onClick", label: "\u70B9\u51FB", actions: ["onClick"] }],
    defaultChildren: { slotProp: "content" },
    codegen: { imports: ["androidx.compose.material3.FloatingActionButton"], render: "slot", slotProp: "content" },
    preview: { kind: "button", text: "FAB" },
    tags: ["fab", "floating", "action", "\u60AC\u6D6E"]
  }),
  m3("m3.ExtendedFloatingActionButton", "ExtendedFloatingActionButton", "\u6269\u5C55\u60AC\u6D6E\u6309\u94AE", {
    icon: "plus-square",
    defaultProps: [{ kind: "event", key: "onClick", label: "\u70B9\u51FB", actions: ["onClick"] }],
    defaultChildren: { slotProp: "content" },
    codegen: { imports: ["androidx.compose.material3.ExtendedFloatingActionButton"], render: "slot", slotProp: "content" },
    preview: { kind: "button", text: "Extended" },
    tags: ["fab", "extended", "\u60AC\u6D6E"]
  }),
  // ================= Material 3 —— 卡片（3） =================
  m3("m3.Card", "Card", "\u5361\u7247\u5BB9\u5668", {
    icon: "square",
    defaultProps: [{ kind: "event", key: "onClick", label: "\u70B9\u51FB", actions: ["onClick"] }],
    defaultChildren: { slotProp: "content" },
    codegen: { imports: ["androidx.compose.material3.Card"], render: "slot", slotProp: "content" },
    preview: { kind: "card" },
    tags: ["card", "surface", "\u5361\u7247"]
  }),
  m3("m3.ElevatedCard", "ElevatedCard", "\u62AC\u9AD8\u5361\u7247", {
    icon: "square",
    defaultProps: [{ kind: "event", key: "onClick", label: "\u70B9\u51FB", actions: ["onClick"] }],
    defaultChildren: { slotProp: "content" },
    codegen: { imports: ["androidx.compose.material3.ElevatedCard"], render: "slot", slotProp: "content" },
    preview: { kind: "card" },
    tags: ["card", "elevated", "\u5361\u7247"]
  }),
  m3("m3.OutlinedCard", "OutlinedCard", "\u63CF\u8FB9\u5361\u7247", {
    icon: "square",
    defaultProps: [{ kind: "event", key: "onClick", label: "\u70B9\u51FB", actions: ["onClick"] }],
    defaultChildren: { slotProp: "content" },
    codegen: { imports: ["androidx.compose.material3.OutlinedCard"], render: "slot", slotProp: "content" },
    preview: { kind: "card" },
    tags: ["card", "outlined", "\u5361\u7247"]
  }),
  // ================= Material 3 —— 选择控件（4） =================
  m3("m3.Checkbox", "Checkbox", "\u590D\u9009\u6846", {
    icon: "check-square",
    defaultProps: [
      { kind: "boolean", key: "checked", label: "\u9009\u4E2D", default: false },
      { kind: "event", key: "onCheckedChange", label: "\u53D8\u5316", actions: ["onCheckedChange"] }
    ],
    preview: { kind: "toggle" },
    tags: ["checkbox", "check", "\u9009\u62E9", "\u590D\u9009"]
  }),
  m3("m3.RadioButton", "RadioButton", "\u5355\u9009\u6309\u94AE", {
    icon: "circle-dot",
    defaultProps: [
      { kind: "boolean", key: "selected", label: "\u9009\u4E2D", default: false },
      { kind: "event", key: "onClick", label: "\u70B9\u51FB", actions: ["onClick"] }
    ],
    preview: { kind: "toggle" },
    tags: ["radio", "\u5355\u9009", "\u9009\u62E9"]
  }),
  m3("m3.Switch", "Switch", "\u5F00\u5173", {
    icon: "toggle-left",
    defaultProps: [
      { kind: "boolean", key: "checked", label: "\u5F00\u542F", default: false },
      { kind: "event", key: "onCheckedChange", label: "\u53D8\u5316", actions: ["onCheckedChange"] }
    ],
    preview: { kind: "toggle" },
    tags: ["switch", "toggle", "\u5F00\u5173"]
  }),
  m3("m3.Slider", "Slider", "\u6ED1\u5757", {
    icon: "sliders-horizontal",
    defaultProps: [
      { kind: "number", key: "value", label: "\u503C", default: 50, min: 0, max: 100 },
      { kind: "event", key: "onValueChange", label: "\u53D8\u5316", actions: ["onValueChange"] }
    ],
    preview: { kind: "slider" },
    tags: ["slider", "range", "\u6ED1\u5757"]
  }),
  // ================= Material 3 —— Chip（2） =================
  m3("m3.AssistChip", "AssistChip", "\u8F85\u52A9\u6807\u7B7E", {
    icon: "tag",
    defaultProps: [
      { kind: "string", key: "label", label: "\u6587\u672C", default: "Chip" },
      { kind: "event", key: "onClick", label: "\u70B9\u51FB", actions: ["onClick"] }
    ],
    preview: { kind: "chip", text: "Chip" },
    tags: ["chip", "tag", "\u6807\u7B7E"]
  }),
  m3("m3.FilterChip", "FilterChip", "\u7B5B\u9009\u6807\u7B7E", {
    icon: "filter",
    defaultProps: [
      { kind: "string", key: "label", label: "\u6587\u672C", default: "Filter" },
      { kind: "boolean", key: "selected", label: "\u9009\u4E2D", default: false },
      { kind: "event", key: "onClick", label: "\u70B9\u51FB", actions: ["onClick"] }
    ],
    preview: { kind: "chip", text: "Filter" },
    tags: ["chip", "filter", "\u7B5B\u9009"]
  }),
  // ================= Material 3 —— 对话框 =================
  m3("m3.AlertDialog", "AlertDialog", "\u8B66\u544A\u5BF9\u8BDD\u6846", {
    icon: "message-square",
    defaultProps: [
      { kind: "string", key: "title", label: "\u6807\u9898", default: "Dialog" },
      { kind: "string", key: "text", label: "\u5185\u5BB9", default: "Content" },
      { kind: "event", key: "onDismiss", label: "\u5173\u95ED", actions: ["onDismiss"] }
    ],
    preview: { kind: "dialog" },
    tags: ["dialog", "alert", "\u5BF9\u8BDD\u6846"]
  }),
  // ================= Material 3 —— 分割线（2） =================
  m3("m3.HorizontalDivider", "HorizontalDivider", "\u6C34\u5E73\u5206\u5272\u7EBF", {
    icon: "minus",
    defaultProps: [{ kind: "dp", key: "thickness", label: "\u7C97\u7EC6", default: 1 }],
    preview: { kind: "divider" },
    tags: ["divider", "horizontal", "\u5206\u5272\u7EBF"]
  }),
  m3("m3.VerticalDivider", "VerticalDivider", "\u5782\u76F4\u5206\u5272\u7EBF", {
    icon: "minus",
    defaultProps: [{ kind: "dp", key: "thickness", label: "\u7C97\u7EC6", default: 1 }],
    preview: { kind: "divider" },
    tags: ["divider", "vertical", "\u5206\u5272\u7EBF"]
  }),
  // ================= Material 3 —— 列表 =================
  m3("m3.ListItem", "ListItem", "\u5217\u8868\u9879", {
    icon: "list",
    defaultProps: [
      { kind: "string", key: "headline", label: "\u6807\u9898", default: "List item" },
      { kind: "string", key: "supporting", label: "\u526F\u6807\u9898", default: "" }
    ],
    preview: { kind: "text", text: "List item" },
    tags: ["list", "item", "\u5217\u8868\u9879"]
  }),
  // ================= Material 3 —— 菜单 =================
  m3("m3.DropdownMenu", "DropdownMenu", "\u4E0B\u62C9\u83DC\u5355", {
    icon: "menu",
    defaultProps: [
      { kind: "boolean", key: "expanded", label: "\u5C55\u5F00", default: false },
      { kind: "event", key: "onDismiss", label: "\u5173\u95ED", actions: ["onDismiss"] }
    ],
    defaultChildren: { slotProp: "content" },
    codegen: { imports: ["androidx.compose.material3.DropdownMenu"], render: "slot", slotProp: "content" },
    preview: { kind: "container" },
    tags: ["menu", "dropdown", "\u83DC\u5355"]
  }),
  // ================= Material 3 —— 导航（2） =================
  m3("m3.NavigationBar", "NavigationBar", "\u5E95\u90E8\u5BFC\u822A\u680F", {
    icon: "panel-bottom",
    defaultChildren: { slotProp: "content" },
    codegen: { imports: ["androidx.compose.material3.NavigationBar"], render: "slot", slotProp: "content" },
    preview: { kind: "navigation" },
    tags: ["navigation", "bar", "\u5BFC\u822A"]
  }),
  m3("m3.NavigationRail", "NavigationRail", "\u4FA7\u8FB9\u5BFC\u822A\u680F", {
    icon: "panel-left",
    defaultChildren: { slotProp: "content" },
    codegen: { imports: ["androidx.compose.material3.NavigationRail"], render: "slot", slotProp: "content" },
    preview: { kind: "navigation" },
    tags: ["navigation", "rail", "\u5BFC\u822A"]
  }),
  // ================= Material 3 —— 进度（2） =================
  m3("m3.CircularProgressIndicator", "CircularProgressIndicator", "\u5706\u5F62\u8FDB\u5EA6\u6307\u793A\u5668", {
    icon: "loader",
    defaultProps: [{ kind: "number", key: "progress", label: "\u8FDB\u5EA6", default: 50, min: 0, max: 100 }],
    preview: { kind: "progress" },
    tags: ["progress", "circular", "\u52A0\u8F7D"]
  }),
  m3("m3.LinearProgressIndicator", "LinearProgressIndicator", "\u7EBF\u6027\u8FDB\u5EA6\u6307\u793A\u5668", {
    icon: "loader",
    defaultProps: [{ kind: "number", key: "progress", label: "\u8FDB\u5EA6", default: 50, min: 0, max: 100 }],
    preview: { kind: "progress" },
    tags: ["progress", "linear", "\u52A0\u8F7D"]
  }),
  // ================= Material 3 —— Snackbar =================
  m3("m3.Snackbar", "Snackbar", "\u8F7B\u91CF\u63D0\u793A\u6761", {
    icon: "message-square",
    defaultProps: [
      { kind: "string", key: "message", label: "\u6D88\u606F", default: "Snackbar" },
      { kind: "string", key: "actionLabel", label: "\u52A8\u4F5C", default: "" }
    ],
    preview: { kind: "text", text: "Snackbar" },
    tags: ["snackbar", "toast", "\u63D0\u793A"]
  }),
  // ================= Material 3 —— 标签页 =================
  m3("m3.TabRow", "TabRow", "\u6807\u7B7E\u9875\u884C", {
    icon: "tabs",
    defaultProps: [{ kind: "number", key: "selectedIndex", label: "\u9009\u4E2D", default: 0, min: 0, max: 10 }],
    defaultChildren: { slotProp: "content" },
    codegen: { imports: ["androidx.compose.material3.TabRow"], render: "slot", slotProp: "content" },
    preview: { kind: "tab" },
    tags: ["tab", "tabs", "\u6807\u7B7E\u9875"]
  }),
  // ================= Material 3 —— 文本输入（2） =================
  m3("m3.TextField", "TextField", "\u6587\u672C\u8F93\u5165\u6846", {
    icon: "text-cursor-input",
    defaultProps: [
      { kind: "string", key: "label", label: "\u6807\u7B7E", default: "Label" },
      { kind: "string", key: "value", label: "\u503C", default: "" },
      { kind: "event", key: "onValueChange", label: "\u503C\u53D8\u5316", actions: ["onValueChange"] }
    ],
    preview: { kind: "field", text: "TextField" },
    tags: ["textfield", "input", "\u8F93\u5165"]
  }),
  m3("m3.OutlinedTextField", "OutlinedTextField", "\u63CF\u8FB9\u6587\u672C\u8F93\u5165\u6846", {
    icon: "text-cursor-input",
    defaultProps: [
      { kind: "string", key: "label", label: "\u6807\u7B7E", default: "Label" },
      { kind: "string", key: "value", label: "\u503C", default: "" },
      { kind: "event", key: "onValueChange", label: "\u503C\u53D8\u5316", actions: ["onValueChange"] }
    ],
    preview: { kind: "field", text: "Outlined" },
    tags: ["textfield", "outlined", "\u8F93\u5165"]
  }),
  // ================= Material 3 —— 顶栏 =================
  m3("m3.TopAppBar", "TopAppBar", "\u9876\u90E8\u5E94\u7528\u680F", {
    icon: "panel-top",
    defaultProps: [{ kind: "string", key: "title", label: "\u6807\u9898", default: "Title" }],
    defaultChildren: { slotProp: "title" },
    codegen: {
      imports: ["androidx.compose.material3.TopAppBar", "androidx.compose.material3.Text"],
      render: "slot",
      slotProp: "title"
    },
    preview: { kind: "appbar" },
    tags: ["topbar", "appbar", "header", "\u9876\u680F"]
  }),
  // ================= Material 3 —— 徽章 =================
  m3("m3.Badge", "Badge", "\u5FBD\u7AE0", {
    icon: "badge",
    defaultChildren: { slotProp: "content" },
    codegen: { imports: ["androidx.compose.material3.Badge"], render: "slot", slotProp: "content" },
    preview: { kind: "badge" },
    tags: ["badge", "\u5FBD\u6807"]
  }),
  // ================= Material 3 —— 底部弹层 =================
  m3("m3.ModalBottomSheet", "ModalBottomSheet", "\u6A21\u6001\u5E95\u90E8\u5F39\u5C42", {
    icon: "panel-bottom",
    defaultProps: [{ kind: "event", key: "onDismiss", label: "\u5173\u95ED", actions: ["onDismiss"] }],
    defaultChildren: { slotProp: "content" },
    codegen: { imports: ["androidx.compose.material3.ModalBottomSheet"], render: "slot", slotProp: "content" },
    preview: { kind: "container" },
    tags: ["bottomsheet", "sheet", "\u5F39\u5C42"]
  }),
  // ================= Material 3 —— 选择器（2） =================
  m3("m3.DatePicker", "DatePicker", "\u65E5\u671F\u9009\u62E9\u5668", {
    icon: "calendar",
    defaultProps: [
      { kind: "string", key: "selectedDate", label: "\u65E5\u671F", default: "2024-01-01" },
      { kind: "event", key: "onDateChange", label: "\u53D8\u5316", actions: ["onDateChange"] }
    ],
    preview: { kind: "field", text: "Date" },
    tags: ["datepicker", "date", "\u65E5\u671F"]
  }),
  m3("m3.TimePicker", "TimePicker", "\u65F6\u95F4\u9009\u62E9\u5668", {
    icon: "clock",
    defaultProps: [
      { kind: "string", key: "time", label: "\u65F6\u95F4", default: "12:00" },
      { kind: "event", key: "onTimeChange", label: "\u53D8\u5316", actions: ["onTimeChange"] }
    ],
    preview: { kind: "field", text: "Time" },
    tags: ["timepicker", "time", "\u65F6\u95F4"]
  }),
  // ================= Material 3 —— 提示 =================
  m3("m3.PlainTooltip", "PlainTooltip", "\u7EAF\u6587\u672C\u63D0\u793A", {
    icon: "message-circle",
    defaultProps: [{ kind: "string", key: "text", label: "\u63D0\u793A", default: "Tooltip" }],
    defaultChildren: { slotProp: "content" },
    codegen: { imports: ["androidx.compose.material3.PlainTooltip"], render: "slot", slotProp: "content" },
    preview: { kind: "tooltip", text: "Tip" },
    tags: ["tooltip", "hint", "\u63D0\u793A"]
  }),
  // ================= Material 3 —— 分段按钮 =================
  m3("m3.SegmentedButton", "SegmentedButton", "\u5206\u6BB5\u6309\u94AE", {
    icon: "columns-3",
    defaultProps: [
      { kind: "string", key: "label", label: "\u6587\u672C", default: "Option" },
      { kind: "boolean", key: "selected", label: "\u9009\u4E2D", default: false },
      { kind: "event", key: "onClick", label: "\u70B9\u51FB", actions: ["onClick"] }
    ],
    preview: { kind: "button", text: "Option" },
    tags: ["segmented", "button", "\u5206\u6BB5"]
  }),
  // ================= Material 3 —— 表面 =================
  m3("m3.Surface", "Surface", "\u8868\u9762\u5BB9\u5668", {
    icon: "square",
    defaultProps: [{ kind: "color", key: "color", label: "\u989C\u8272", default: "#FFFFFF" }],
    defaultChildren: { slotProp: "content" },
    codegen: { imports: ["androidx.compose.material3.Surface"], render: "slot", slotProp: "content" },
    preview: { kind: "container" },
    tags: ["surface", "container", "\u8868\u9762"]
  }),
  // ================= Material 3 —— 脚手架 =================
  m3("m3.Scaffold", "Scaffold", "Material 3 \u811A\u624B\u67B6\uFF08\u6839\u5BB9\u5668\uFF09", {
    icon: "layout-template",
    defaultChildren: { slotProp: "content" },
    codegen: { imports: ["androidx.compose.material3.Scaffold"], render: "slot", slotProp: "content" },
    preview: { kind: "container" },
    tags: ["scaffold", "screen", "\u9875\u9762"]
  }),
  // ================= 内容（4） =================
  content("content.Image", "Image", "androidx.compose.foundation.Image", "\u56FE\u7247", {
    icon: "image",
    defaultProps: [
      { kind: "string", key: "url", label: "\u56FE\u7247\u5730\u5740", default: "" },
      { kind: "dp", key: "width", label: "\u5BBD", default: 100 },
      { kind: "dp", key: "height", label: "\u9AD8", default: 100 }
    ],
    preview: { kind: "image" },
    tags: ["image", "picture", "\u56FE\u7247"]
  }),
  content("content.Icon", "Icon", "androidx.compose.material3.Icon", "\u56FE\u6807", {
    icon: "star",
    defaultProps: [
      {
        kind: "enum",
        key: "name",
        label: "\u56FE\u6807",
        options: [
          { value: "star", label: "Star" },
          { value: "heart", label: "Heart" },
          { value: "home", label: "Home" }
        ],
        default: "star"
      }
    ],
    preview: { kind: "icon" },
    tags: ["icon", "\u56FE\u6807"]
  }),
  content("content.Canvas", "Canvas", "androidx.compose.foundation.Canvas", "\u753B\u5E03", {
    icon: "pen-tool",
    defaultProps: [
      { kind: "dp", key: "width", label: "\u5BBD", default: 200 },
      { kind: "dp", key: "height", label: "\u9AD8", default: 200 }
    ],
    preview: { kind: "canvas" },
    tags: ["canvas", "draw", "\u753B\u5E03"]
  }),
  content("content.BasicText", "BasicText", "androidx.compose.foundation.text.BasicText", "\u57FA\u7840\u6587\u672C", {
    icon: "type",
    defaultProps: [{ kind: "string", key: "text", label: "\u6587\u672C", default: "Basic" }],
    preview: { kind: "text", text: "Basic" },
    tags: ["text", "basic", "\u6587\u672C"]
  })
];
var CATALOG = [
  {
    id: "layout",
    label: "\u5E03\u5C40",
    icon: "layout",
    children: DESCRIPTORS.filter((d) => d.category === "layout")
  },
  {
    id: "material3",
    label: "Material 3",
    icon: "component",
    children: DESCRIPTORS.filter((d) => d.category === "material3")
  },
  {
    id: "content",
    label: "\u5185\u5BB9",
    icon: "image",
    children: DESCRIPTORS.filter((d) => d.category === "content")
  }
];
function findDescriptor(id) {
  return DESCRIPTORS.find((d) => d.id === id);
}

// src/server/codegen/ir.ts
var IMPORT_MODIFIER = "androidx.compose.ui.Modifier";
var IMPORT_DP = "androidx.compose.ui.unit.dp";
var IMPORT_COLOR = "androidx.compose.ui.graphics.Color";
var IMPORT_MATERIAL_THEME = "androidx.compose.material3.MaterialTheme";
var IMPORT_TYPOGRAPHY = "androidx.compose.material3.MaterialTheme";
function buildIr(doc) {
  return buildNode(doc, doc.root);
}
function buildNode(doc, node) {
  const descriptor = findDescriptor(node.type);
  const ir = {
    // 未知组件降级为 Box（保留子节点，避免丢失结构）
    composable: descriptor?.composable ?? "Box",
    imports: descriptor ? [...descriptor.codegen.imports] : ["androidx.compose.foundation.layout.Box"],
    attrs: [],
    renderKind: descriptor?.codegen.render ?? "container"
  };
  if (node.label) {
    ir.comments = [`// ${node.label}`];
  }
  if (descriptor) {
    for (const schema of descriptor.defaultProps) {
      const value = node.props[schema.key];
      if (value === void 0 && schema.kind !== "event") continue;
      if (schema.key === "text" && descriptor.codegen.render === "slot") continue;
      const attr = propToAttr(schema, value);
      if (attr) {
        ir.attrs.push(attr);
        ir.imports.push(...importsForAttr(attr));
      }
    }
  }
  const modifierExpr = buildModifierExpression(node.props);
  if (modifierExpr) {
    ir.attrs.push({
      name: "modifier",
      value: { kind: "expression", code: modifierExpr }
    });
    ir.imports.push(IMPORT_MODIFIER);
    if (/(width|height|padding)\(/.test(modifierExpr)) {
      ir.imports.push(IMPORT_DP);
    }
    if (modifierExpr.includes("Color(")) {
      ir.imports.push(IMPORT_COLOR);
    }
  }
  if (isContainerNode(node)) {
    const children = node.children.map((id) => doc.nodes[id]).filter((n) => n != null).map((n) => buildNode(doc, n));
    if (descriptor?.codegen.render === "slot" && descriptor.codegen.slotProp) {
      ir.slots = { [descriptor.codegen.slotProp]: children };
    } else if (children.length > 0) {
      ir.children = children;
    }
  }
  if (isContainerNode(node) && descriptor?.codegen.render === "slot" && descriptor.codegen.slotProp && node.children.length === 0) {
    const textProp = node.props.text;
    if (typeof textProp === "string" && textProp) {
      const textNode = {
        composable: "Text",
        imports: ["androidx.compose.material3.Text"],
        attrs: [{ name: "text", value: { kind: "literal", value: textProp } }],
        renderKind: "leaf"
      };
      ir.slots = { ...ir.slots, [descriptor.codegen.slotProp]: [textNode] };
    }
  }
  return ir;
}
function propToAttr(schema, value) {
  switch (schema.kind) {
    case "string":
      return { name: schema.key, value: { kind: "literal", value: String(value) } };
    case "number":
      return { name: schema.key, value: { kind: "literal", value: Number(value) } };
    case "dp":
      return {
        name: schema.key,
        value: { kind: "literal", value: Number(value) },
        unit: "dp"
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
        value: { kind: "expression", code: textStyleToCode(value) }
      };
    case "event":
      return {
        name: schema.key,
        value: { kind: "expression", code: eventToCode(schema) }
      };
    default:
      return null;
  }
}
function classifyColor(value) {
  if (/^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(value)) {
    return { kind: "literal", value };
  }
  return { kind: "token", token: `MaterialTheme.colorScheme.${value}` };
}
function textStyleToCode(style) {
  if (style.fontSize != null) {
    return `MaterialTheme.typography.bodyLarge.copy(fontSize = ${style.fontSize}.sp)`;
  }
  return "MaterialTheme.typography.bodyLarge";
}
function eventToCode(schema) {
  if (schema.key === "onValueChange") {
    return `{ /* TODO: \u5904\u7406\u503C\u53D8\u5316 */ newValue -> }`;
  }
  return `{ /* TODO: \u5904\u7406${schema.label} */ }`;
}
function sizeModifier(props, key, widthName) {
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
function buildModifierExpression(props) {
  const parts = ["Modifier"];
  const widthMod = sizeModifier(props, "modifierWidth", "width");
  if (widthMod) parts.push(widthMod);
  const heightMod = sizeModifier(props, "modifierHeight", "height");
  if (heightMod) parts.push(heightMod);
  if (props.modifierPadding != null) parts.push(`.padding(${props.modifierPadding}.dp)`);
  if (props.modifierBackground != null) {
    const hex = String(props.modifierBackground).replace(/^#/, "");
    const arg = hex.length === 8 ? `0x${hex}` : `0xFF${hex}`;
    parts.push(`.background(Color(${arg}))`);
  }
  return parts.length > 1 ? parts.join("") : null;
}
function importsForAttr(attr) {
  const imports = [];
  if (attr.unit === "dp") imports.push(IMPORT_DP);
  if (attr.value.kind === "token" && attr.value.token.startsWith("MaterialTheme.")) {
    imports.push(IMPORT_MATERIAL_THEME);
  }
  if (attr.value.kind === "expression" && attr.value.code.includes("MaterialTheme.typography")) {
    imports.push(IMPORT_TYPOGRAPHY);
  }
  return imports;
}

// src/server/codegen/render.ts
function render(ir, options = DEFAULT_GENERATE_OPTIONS) {
  const ctx = { options, imports: /* @__PURE__ */ new Set(), extracted: [] };
  collectImports(ir, ctx.imports);
  ctx.imports.add("androidx.compose.runtime.Composable");
  ctx.imports.add("androidx.compose.ui.Modifier");
  if (hasArrangement(ir)) {
    ctx.imports.add("androidx.compose.foundation.layout.Arrangement");
  }
  if (hasAlignment(ir)) {
    ctx.imports.add("androidx.compose.ui.Alignment");
  }
  const lines = [
    header(),
    `package ${options.packageName}`,
    "",
    ...[...ctx.imports].sort().map((i) => `import ${i}`),
    "",
    ...kdoc(ir),
    "@Composable",
    "fun GeneratedScreen(modifier: Modifier = Modifier) {",
    ...renderNode(ir, ctx, { isRoot: true, indent: 1 }),
    "}"
  ];
  for (const fn of ctx.extracted) {
    lines.push("");
    lines.push(...fn);
  }
  return [{ path: "GeneratedScreen.kt", source: postProcess(lines.join("\n")) }];
}
function renderNode(ir, ctx, opts) {
  const ind = "    ".repeat(opts.indent);
  const lines = [];
  if (ir.comments) {
    lines.push(...ir.comments.map((c) => ind + c));
  }
  const args = [];
  if (ir.composable === "Column" || ir.composable === "Row") {
    const isColumn = ir.composable === "Column";
    const arrangementName = isColumn ? "verticalArrangement" : "horizontalArrangement";
    const spacingAttr = ir.attrs.find((a) => a.name === "spacing");
    const arrangementAttr = ir.attrs.find(
      (a) => isColumn ? a.name === "verticalArrangement" : a.name === "horizontalArrangement"
    );
    const spacingValue = spacingAttr?.value.kind === "literal" ? spacingAttr.value.value : void 0;
    const arrangementStr = arrangementAttr?.value.kind === "literal" ? String(arrangementAttr.value.value) : void 0;
    if (arrangementStr && arrangementStr !== "top" && arrangementStr !== "start") {
      const arr = arrangementValue(
        arrangementStr,
        isColumn ? "vertical" : "horizontal"
      );
      args.push(
        spacingValue != null ? `${arrangementName} = ${arr}.spacedBy(${spacingValue}.dp)` : `${arrangementName} = ${arr}`
      );
    } else if (spacingValue != null) {
      args.push(
        `${arrangementName} = Arrangement.spacedBy(${spacingValue}.dp)`
      );
    }
  }
  for (const attr of ir.attrs) {
    if (attr.name === "spacing" || attr.name === "verticalArrangement" || attr.name === "horizontalArrangement") {
      continue;
    }
    if (ir.composable === "Column" && attr.name === "horizontalAlignment") {
      args.push(
        `horizontalAlignment = ${alignmentValue(literalValue(attr.value), "horizontal")}`
      );
      continue;
    }
    if (ir.composable === "Row" && attr.name === "verticalAlignment") {
      args.push(
        `verticalAlignment = ${alignmentValue(literalValue(attr.value), "vertical")}`
      );
      continue;
    }
    if (attr.name === "modifier") {
      args.push(`modifier = ${opts.isRoot ? "modifier" : renderValue(attr)}`);
      continue;
    }
    if (attr.name.startsWith("on") && opts.eventParams?.has(attr)) {
      args.push(`${attr.name} = ${opts.eventParams.get(attr)}`);
      continue;
    }
    args.push(`${attr.name} = ${renderValue(attr)}`);
  }
  const sig = `${ir.composable}(${args.join(", ")})`;
  const children = ir.children ?? [];
  const slotEntries = Object.entries(ir.slots ?? {}).filter(([, v]) => v.length > 0);
  if (children.length === 0 && slotEntries.length === 0) {
    lines.push(ind + (ir.renderKind === "slot" ? `${sig} { }` : sig));
    return lines;
  }
  lines.push(ind + sig + " {");
  for (const child of children) {
    lines.push(
      ...renderNode(child, ctx, {
        indent: opts.indent + 1,
        eventParams: opts.eventParams
      })
    );
  }
  for (const [slotName, slotChildren] of slotEntries) {
    const fnName = opts.isRoot ? `Generated${capitalize(slotName)}` : `Generated${capitalize(ir.composable)}${capitalize(slotName)}`;
    const events = collectEvents(slotChildren);
    const { lines: fnLines, paramNames } = renderPrivateFunction(
      fnName,
      slotChildren,
      events,
      ctx
    );
    ctx.extracted.push(fnLines);
    const eventArgs = events.map(
      (e, i) => `${paramNames[i]} = ${e.attr.value.kind === "expression" ? e.attr.value.code : "{ /* TODO */ }"}`
    );
    const allArgs = ["modifier = Modifier", ...eventArgs];
    lines.push(ind + `    ${fnName}(${allArgs.join(", ")})`);
  }
  lines.push(ind + "}");
  return lines;
}
function renderPrivateFunction(name, children, events, ctx) {
  const lines = [];
  lines.push("/**");
  lines.push(` * ${name} \u2014 \u63D0\u53D6\u7684\u533A\u57DF\u3002`);
  lines.push(" */");
  lines.push("@Composable");
  const params = ["modifier: Modifier = Modifier"];
  const eventParams = /* @__PURE__ */ new Map();
  const paramNames = [];
  const used = /* @__PURE__ */ new Set();
  for (const e of events) {
    const p = uniqueEventParamName(e, used);
    params.push(`${p}: ${eventParamType(e.attr)}`);
    eventParams.set(e.attr, p);
    paramNames.push(p);
  }
  lines.push(`private fun ${name}(${params.join(", ")}) {`);
  for (const child of children) {
    lines.push(...renderNode(child, ctx, { indent: 1, eventParams }));
  }
  lines.push("}");
  return { lines, paramNames };
}
function uniqueEventParamName(e, used) {
  const base = `handle${capitalize(e.composable)}${capitalize(
    e.attr.name.replace(/^on/, "")
  )}`;
  let name = base;
  let i = 2;
  while (used.has(name)) {
    name = `${base}${i}`;
    i += 1;
  }
  used.add(name);
  return name;
}
function collectEvents(roots) {
  const events = [];
  const walk = (node) => {
    for (const attr of node.attrs) {
      if (attr.name.startsWith("on")) {
        events.push({ attr, composable: node.composable });
      }
    }
    for (const child of node.children ?? []) walk(child);
    for (const slotChildren of Object.values(node.slots ?? {})) {
      for (const child of slotChildren) walk(child);
    }
  };
  for (const root of roots) walk(root);
  return events;
}
function eventParamType(attr) {
  if (attr.name === "onValueChange") return "(String) -> Unit";
  return "() -> Unit";
}
function renderValue(attr) {
  const v = attr.value;
  switch (v.kind) {
    case "literal":
      if (typeof v.value === "string") return `"${escapeString(v.value)}"`;
      if (attr.unit === "dp") return `${v.value}.dp`;
      if (attr.unit === "sp") return `${v.value}.sp`;
      return String(v.value);
    case "token":
      return v.token;
    case "expression":
      return v.code;
    case "resource":
      return `stringResource(R.string.${v.name})`;
  }
}
function collectImports(ir, imports) {
  for (const imp of ir.imports) imports.add(imp);
  for (const child of ir.children ?? []) collectImports(child, imports);
  for (const slotChildren of Object.values(ir.slots ?? {})) {
    for (const child of slotChildren) collectImports(child, imports);
  }
}
function hasArrangement(ir) {
  if ((ir.composable === "Column" || ir.composable === "Row") && ir.attrs.some(
    (a) => a.name === "spacing" || a.name === "verticalArrangement" || a.name === "horizontalArrangement"
  )) {
    return true;
  }
  for (const child of ir.children ?? []) {
    if (hasArrangement(child)) return true;
  }
  for (const slotChildren of Object.values(ir.slots ?? {})) {
    for (const child of slotChildren) {
      if (hasArrangement(child)) return true;
    }
  }
  return false;
}
function hasAlignment(ir) {
  if ((ir.composable === "Column" || ir.composable === "Row") && ir.attrs.some(
    (a) => a.name === "horizontalAlignment" || a.name === "verticalAlignment"
  )) {
    return true;
  }
  for (const child of ir.children ?? []) {
    if (hasAlignment(child)) return true;
  }
  for (const slotChildren of Object.values(ir.slots ?? {})) {
    for (const child of slotChildren) {
      if (hasAlignment(child)) return true;
    }
  }
  return false;
}
function arrangementValue(value, axis) {
  switch (value) {
    case "top":
      return axis === "vertical" ? "Arrangement.Top" : "Arrangement.Start";
    case "center":
      return "Arrangement.Center";
    case "bottom":
      return axis === "vertical" ? "Arrangement.Bottom" : "Arrangement.End";
    case "spaceBetween":
      return "Arrangement.SpaceBetween";
    case "spaceAround":
      return "Arrangement.SpaceAround";
    case "spaceEvenly":
      return "Arrangement.SpaceEvenly";
    default:
      return axis === "vertical" ? "Arrangement.Top" : "Arrangement.Start";
  }
}
function literalValue(v) {
  return v.kind === "literal" ? String(v.value) : "";
}
function alignmentValue(value, axis) {
  switch (value) {
    case "start":
      return axis === "horizontal" ? "Alignment.Start" : "Alignment.Top";
    case "center":
      return axis === "horizontal" ? "Alignment.CenterHorizontally" : "Alignment.CenterVertically";
    case "end":
      return axis === "horizontal" ? "Alignment.End" : "Alignment.Bottom";
    default:
      return axis === "horizontal" ? "Alignment.Start" : "Alignment.Top";
  }
}
function header() {
  return "// Generated by dsh-compose-studio. Do not edit manually.";
}
function kdoc(ir) {
  return ["/**", " * Generated screen.", ` * Root: ${ir.composable}`, " */"];
}
function postProcess(source) {
  return source.replace(/\n{3,}/g, "\n\n").replace(/[ \t]+$/gm, "").trim() + "\n";
}
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function escapeString(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

// src/server/codegen/export.ts
async function exportDocument(repo, doc, opts = {}) {
  const ir = buildIr(doc);
  const outputs = render(ir, {
    ...DEFAULT_GENERATE_OPTIONS,
    ...opts.generate
  });
  const baseDir = opts.targetDir ?? `.dsh-compose-studio/generated/${doc.id}`;
  const files = [];
  for (const out of outputs) {
    const relativePath = `${baseDir}/${out.path}`;
    if (!opts.overwrite && await repo.exists(relativePath)) {
      throw new Error(
        `\u6587\u4EF6\u5DF2\u5B58\u5728: ${relativePath}\uFF08\u8BBE\u7F6E overwrite=true \u8986\u76D6\uFF09`
      );
    }
    await repo.writeFile(relativePath, out.source);
    files.push({ path: relativePath, bytes: out.source.length });
  }
  return files;
}

// src/server/rpc.ts
function createStudioHandler(repository) {
  return async (req, res) => {
    const url = new URL(req.url ?? "/", "http://dsh.internal");
    const pathname = url.pathname;
    if (pathname === `${RPC_PREFIX}/${RPC_METHOD.PING}`) {
      sendJson(res, 200, {
        ok: true,
        protocol: PROTOCOL_VERSION,
        panel: MAIN_PANEL_ID,
        name: "dsh-compose-studio"
      });
      return;
    }
    if (req.method === "POST") {
      const body = await readBody(req);
      let payload;
      try {
        payload = JSON.parse(body);
      } catch {
        sendError(res, 400, "invalid JSON body");
        return;
      }
      try {
        if (pathname === `${RPC_PREFIX}/${RPC_METHOD.DOC_LOAD}`) {
          const doc = await repository.load(String(payload.id ?? ""));
          sendJson(res, 200, { doc });
          return;
        }
        if (pathname === `${RPC_PREFIX}/${RPC_METHOD.DOC_SAVE}`) {
          await repository.save(payload.doc);
          sendJson(res, 200, { ok: true });
          return;
        }
        if (pathname === `${RPC_PREFIX}/fs/list`) {
          const entries = await repository.listDir(String(payload.dir ?? "."));
          sendJson(res, 200, { entries });
          return;
        }
        if (pathname === `${RPC_PREFIX}/${RPC_METHOD.DOC_EXPORT}`) {
          const { doc, targetDir, overwrite } = payload;
          const files = await exportDocument(repository, doc, {
            targetDir,
            overwrite
          });
          sendJson(res, 200, { files });
          return;
        }
      } catch (err) {
        sendError(res, 400, err instanceof Error ? err.message : String(err));
        return;
      }
    }
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("not found");
  };
}
function readBody(req) {
  return new Promise((resolve3, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve3(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}
function sendJson(res, status, data) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(data));
}
function sendError(res, status, message) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify({ ok: false, error: message }));
}

// src/server/store/repository.ts
import * as fs from "node:fs/promises";
import * as path2 from "node:path";

// src/shared/validate.ts
function collectReferences(doc) {
  const parentCount = /* @__PURE__ */ new Map();
  const referenced = /* @__PURE__ */ new Set();
  const walk = (node) => {
    if (isContainerNode(node)) {
      for (const id of [...node.children, ...Object.values(node.slots ?? {}).flat()]) {
        referenced.add(id);
        parentCount.set(id, (parentCount.get(id) ?? 0) + 1);
      }
      for (const id of [...node.children, ...Object.values(node.slots ?? {}).flat()]) {
        const child = doc.nodes[id];
        if (child) walk(child);
      }
    }
  };
  walk(doc.root);
  return { parentCount, referenced };
}
function validateDocument(doc) {
  const base = validateBasicInvariants(doc);
  const { parentCount, referenced } = collectReferences(doc);
  for (const [id, count] of parentCount) {
    if (count > 1) base.duplicateParents.push(id);
  }
  for (const id of referenced) {
    if (!doc.nodes[id]) base.unresolvedChildren.push(id);
  }
  const duplicateChildren = /* @__PURE__ */ new Set();
  const walk = (node) => {
    if (isContainerNode(node)) {
      const seen = /* @__PURE__ */ new Set();
      for (const id of [...node.children, ...Object.values(node.slots ?? {}).flat()]) {
        if (seen.has(id)) duplicateChildren.add(id);
        seen.add(id);
      }
      for (const id of node.children) {
        const child = doc.nodes[id];
        if (child) walk(child);
      }
    }
  };
  walk(doc.root);
  base.duplicateChildren = [...duplicateChildren];
  return base;
}
function assertDocumentInvariants(doc) {
  const errors = validateDocument(doc);
  const messages = [];
  if (errors.rootNotContainer) messages.push("root \u5FC5\u987B\u662F\u5BB9\u5668\u8282\u70B9");
  if (errors.duplicateParents.length > 0)
    messages.push(`\u8282\u70B9\u6709\u591A\u4E2A\u7236\u8282\u70B9: ${errors.duplicateParents.join(", ")}`);
  if (errors.duplicateChildren.length > 0)
    messages.push(`children \u6709\u91CD\u590D id: ${errors.duplicateChildren.join(", ")}`);
  if (errors.unresolvedChildren.length > 0)
    messages.push(`children \u5F15\u7528\u65E0\u6CD5\u89E3\u6790: ${errors.unresolvedChildren.join(", ")}`);
  if (messages.length > 0) {
    throw new Error(`\u6587\u6863\u4E0D\u53D8\u5F0F\u6821\u9A8C\u5931\u8D25: ${messages.join("; ")}`);
  }
}
function isVersionSupported(version) {
  return version === DOCUMENT_VERSION;
}

// src/server/store/workspace.ts
import * as path from "node:path";
var WorkspaceFenceError = class extends Error {
  constructor(relative) {
    super(`\u8DEF\u5F84\u8D8A\u51FA\u5DE5\u4F5C\u533A: ${relative}`);
    this.name = "WorkspaceFenceError";
  }
};
function resolveSafePath(root, relative) {
  const rootResolved = path.resolve(root);
  const resolved = path.resolve(rootResolved, relative);
  if (resolved !== rootResolved && !resolved.startsWith(rootResolved + path.sep)) {
    throw new WorkspaceFenceError(relative);
  }
  return resolved;
}

// src/server/store/repository.ts
var STUDIO_DIR = ".dsh-compose-studio";
var DOC_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;
var DocumentRepository = class {
  workspaceRoot;
  constructor(workspaceRoot) {
    this.workspaceRoot = path2.resolve(workspaceRoot);
  }
  /** 文档文件路径（工作区内）。 */
  docPath(docId) {
    if (!DOC_ID_PATTERN.test(docId)) {
      throw new Error(`\u975E\u6CD5\u6587\u6863 id: ${docId}`);
    }
    return resolveSafePath(this.workspaceRoot, `${STUDIO_DIR}/${docId}.json`);
  }
  /** 加载文档（含版本校验 + 不变式校验）。 */
  async load(docId) {
    const filePath = this.docPath(docId);
    const content2 = await fs.readFile(filePath, "utf-8");
    const doc = JSON.parse(content2);
    if (!isVersionSupported(doc.version)) {
      throw new Error(
        `\u4E0D\u652F\u6301\u7684\u6587\u6863\u7248\u672C: ${doc.version}\uFF08\u5F53\u524D\u652F\u6301 v${DOCUMENT_VERSION}\uFF09`
      );
    }
    assertDocumentInvariants(doc);
    return doc;
  }
  /** 保存文档（含不变式校验）。 */
  async save(doc) {
    assertDocumentInvariants(doc);
    const filePath = this.docPath(doc.id);
    await fs.mkdir(path2.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(doc, null, 2), "utf-8");
  }
  /** 列出全部文档 id。 */
  async listDocs() {
    const dir = resolveSafePath(this.workspaceRoot, STUDIO_DIR);
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      return entries.filter((e) => e.isFile() && e.name.endsWith(".json")).map((e) => e.name.replace(/\.json$/, "")).sort();
    } catch {
      return [];
    }
  }
  /** 列出工作区目录内容（用于导出选择；含 fence）。 */
  async listDir(relativeDir) {
    const dir = resolveSafePath(this.workspaceRoot, relativeDir || ".");
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      return entries.map((e) => e.isDirectory() ? `${e.name}/` : e.name).sort();
    } catch {
      return [];
    }
  }
  /** 读取工作区文本文件（含 fence）。 */
  async readFile(relativePath) {
    const filePath = resolveSafePath(this.workspaceRoot, relativePath);
    return fs.readFile(filePath, "utf-8");
  }
  /** 判断工作区文件是否存在（含 fence）。 */
  async exists(relativePath) {
    try {
      await fs.access(resolveSafePath(this.workspaceRoot, relativePath));
      return true;
    } catch {
      return false;
    }
  }
  /** 写入工作区文本文件（含 fence；自动创建父目录）。 */
  async writeFile(relativePath, content2) {
    const filePath = resolveSafePath(this.workspaceRoot, relativePath);
    await fs.mkdir(path2.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content2, "utf-8");
  }
};

// src/server/tools.ts
import { defineTool } from "@deepseek-ai/dsh-tools";
function defineExportTool(repository) {
  return defineTool({
    name: "compose_studio_export",
    description: "Export a Compose Studio document as Kotlin source files to the workspace. Files are written to .dsh-compose-studio/generated/<docId>/ by default. Use when the user wants to save generated Compose code to their project.",
    parameters: {
      documentId: {
        type: "string",
        description: "Document id to export."
      },
      targetDir: {
        type: "string",
        description: "Target directory relative to workspace (default: .dsh-compose-studio/generated/<docId>)."
      },
      overwrite: {
        type: "boolean",
        description: "Overwrite existing files (default: false)."
      }
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          files: {
            type: "array",
            required: true,
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                path: { type: "string", required: true },
                bytes: { type: "number", required: true }
              }
            }
          }
        }
      },
      render: (_args, v) => [
        {
          type: "text",
          text: `Exported ${v.files.length} file(s):
` + v.files.map((f) => `  - ${f.path}`).join("\n")
        }
      ]
    },
    execute: async (args) => {
      const doc = await repository.load(String(args.documentId));
      const files = await exportDocument(repository, doc, {
        targetDir: args.targetDir,
        overwrite: Boolean(args.overwrite)
      });
      return { files };
    }
  });
}

// src/server/index.ts
function apply(ctx, config) {
  const workspaceRoot = config.workspaceRoot || process.cwd();
  const repository = new DocumentRepository(workspaceRoot);
  ctx.inject(["tools", "webServer"], (child) => {
    child.effect(
      () => child.tools.register(
        defineTool2({
          name: "compose_studio_open",
          description: "Open the Compose Studio visual editor in the DSH main panel. Use when the user wants to visually design, drag-and-drop, or inspect a Jetpack Compose screen, or when they ask to generate Compose UI from a description.",
          parameters: {
            documentId: {
              type: "string",
              description: "Optional document id to load. Omit to open a new document."
            }
          },
          output: {
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                opened: {
                  type: "boolean",
                  required: true,
                  description: "Whether the studio was opened."
                }
              }
            },
            render: (_args, v) => [
              {
                type: "text",
                text: v.opened ? "Compose Studio opened." : "Failed to open Compose Studio."
              }
            ]
          },
          execute: async () => {
            return { opened: true };
          }
        })
      ),
      "compose-studio: tool compose_studio_open"
    );
    child.effect(
      () => child.tools.register(defineExportTool(repository)),
      "compose-studio: tool compose_studio_export"
    );
    child.effect(
      () => child.webServer.register({
        kind: "prefix",
        path: RPC_PREFIX,
        handler: createStudioHandler(repository)
      }),
      "compose-studio: rpc"
    );
  });
}
export {
  ConfigSchema as Config,
  apply
};
//# sourceMappingURL=index.js.map
