window.__ModuleLoader__.load({
  id: "dsh-compose-studio",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);
var import_react4 = require("react");

// src/shared/document.ts
function isContainerNode(node) {
  return Array.isArray(node.children);
}
function getSizeMode(props, key) {
  const mode = props[`${key}Mode`];
  return mode === "wrap" || mode === "match" || mode === "weight" ? mode : "fixed";
}

// src/shared/theme.ts
function createDefaultTheme() {
  const typography = () => ({});
  return {
    dark: false,
    colorScheme: {
      primary: "#6750A4",
      onPrimary: "#FFFFFF",
      primaryContainer: "#EADDFF",
      onPrimaryContainer: "#21005D",
      secondary: "#625B71",
      onSecondary: "#FFFFFF",
      secondaryContainer: "#E8DEF8",
      onSecondaryContainer: "#1D192B",
      tertiary: "#7D5260",
      onTertiary: "#FFFFFF",
      tertiaryContainer: "#FFD8E4",
      onTertiaryContainer: "#31111D",
      error: "#B3261E",
      onError: "#FFFFFF",
      errorContainer: "#F9DEDC",
      onErrorContainer: "#410E0B",
      background: "#FFFBFE",
      onBackground: "#1C1B1F",
      surface: "#FFFBFE",
      onSurface: "#1C1B1F",
      surfaceVariant: "#E7E0EC",
      onSurfaceVariant: "#49454F",
      outline: "#79747E",
      outlineVariant: "#CAC4D0",
      surfaceContainer: "#F3EDF7",
      surfaceContainerHigh: "#ECE6F0",
      surfaceContainerHighest: "#E6E0E9",
      surfaceContainerLow: "#F7F2FA",
      surfaceContainerLowest: "#FFFFFF",
      inverseSurface: "#313033",
      inverseOnSurface: "#F4EFF4",
      inversePrimary: "#D0BCFF",
      scrim: "#000000"
    },
    typography: {
      displayLarge: typography(),
      displayMedium: typography(),
      displaySmall: typography(),
      headlineLarge: typography(),
      headlineMedium: typography(),
      headlineSmall: typography(),
      titleLarge: typography(),
      titleMedium: typography(),
      titleSmall: typography(),
      bodyLarge: typography(),
      bodyMedium: typography(),
      bodySmall: typography(),
      labelLarge: typography(),
      labelMedium: typography(),
      labelSmall: typography()
    },
    shapes: { extraSmall: 4, small: 8, medium: 12, large: 16, extraLarge: 28 }
  };
}

// src/shared/device.ts
var BUILTIN_DEVICES = [
  {
    id: "phone",
    label: "Phone",
    platform: "phone",
    widthDp: 360,
    heightDp: 800,
    density: 2.75,
    frameRadiusPx: 32,
    showStatusBar: true
  },
  {
    id: "tablet",
    label: "Tablet",
    platform: "tablet",
    widthDp: 834,
    heightDp: 1194,
    density: 2,
    frameRadiusPx: 24,
    showStatusBar: true
  },
  {
    id: "cmp",
    label: "CMP",
    platform: "cmp",
    widthDp: 1200,
    heightDp: 800,
    density: 1,
    frameRadiusPx: 12,
    showStatusBar: false,
    cmpTarget: "desktop"
  }
];
function getBuiltinDevice(id) {
  return BUILTIN_DEVICES.find((d) => d.id === id);
}

// src/client/store.ts
var HISTORY_LIMIT = 100;
var MERGE_WINDOW_MS = 800;
var now = () => Date.now();
function createInitialState() {
  const root = {
    id: "root",
    type: "m3.Scaffold",
    props: {},
    children: ["col"]
  };
  const col = {
    id: "col",
    type: "Column",
    props: { spacing: 16 },
    children: ["title", "btn"]
  };
  const title = {
    id: "title",
    type: "m3.Text",
    props: { text: "Compose Studio" },
    text: "Compose Studio"
  };
  const btn = { id: "btn", type: "m3.Button", props: {} };
  const doc = {
    version: 1,
    id: "doc-initial",
    name: "Untitled",
    createdAt: now(),
    updatedAt: now(),
    root,
    nodes: { root, col, title, btn },
    theme: createDefaultTheme(),
    devices: BUILTIN_DEVICES,
    activeDeviceId: "phone"
  };
  return {
    document: doc,
    selection: { ids: [], anchorId: null },
    clipboard: null,
    theme: createDefaultTheme(),
    device: { activeId: "phone", zoom: 1, showGrid: false },
    history: { undo: [], redo: [] },
    ui: { leftWidth: 240, rightWidth: 320, inspectorTab: "props", showBorders: true }
  };
}
function createEmptyDocument(id, name = "Untitled") {
  const root = {
    id: "root",
    type: "m3.Scaffold",
    props: {},
    children: []
  };
  return {
    version: 1,
    id,
    name,
    createdAt: now(),
    updatedAt: now(),
    root,
    nodes: { root },
    theme: createDefaultTheme(),
    devices: BUILTIN_DEVICES,
    activeDeviceId: "phone"
  };
}
function generateDocId() {
  return `doc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
function syncRoot(doc) {
  const root = doc.nodes[doc.root.id];
  if (!root || !isContainerNode(root)) return doc;
  return root === doc.root ? doc : { ...doc, root };
}
function docAddNode(doc, parentId, node, index) {
  const parent = doc.nodes[parentId];
  if (!parent || !isContainerNode(parent)) return doc;
  const nodes = { ...doc.nodes, [node.id]: node };
  const children = [...parent.children];
  const at = index ?? children.length;
  children.splice(at, 0, node.id);
  return syncRoot({
    ...doc,
    nodes: { ...nodes, [parentId]: { ...parent, children } }
  });
}
function collectSubtreeIds(doc, id) {
  const result = /* @__PURE__ */ new Set();
  const walk = (node2) => {
    if (result.has(node2.id)) return;
    result.add(node2.id);
    if (isContainerNode(node2)) {
      for (const cid of node2.children) {
        const child = doc.nodes[cid];
        if (child) walk(child);
      }
    }
  };
  const node = doc.nodes[id];
  if (node) walk(node);
  return result;
}
function collectSubtreeNodes(doc, id) {
  const result = {};
  const walk = (node2) => {
    if (result[node2.id]) return;
    result[node2.id] = node2;
    if (isContainerNode(node2)) {
      for (const cid of node2.children) {
        const child = doc.nodes[cid];
        if (child) walk(child);
      }
    }
  };
  const node = doc.nodes[id];
  if (node) walk(node);
  return result;
}
function docRemoveNode(doc, id) {
  const toDelete = collectSubtreeIds(doc, id);
  const nodes = { ...doc.nodes };
  for (const delId of toDelete) delete nodes[delId];
  for (const node of Object.values(nodes)) {
    if (!isContainerNode(node)) continue;
    const children = node.children.filter((cid) => !toDelete.has(cid));
    if (children.length !== node.children.length) {
      nodes[node.id] = { ...node, children };
    }
    if (node.slots) {
      const slots = {};
      let changed = false;
      for (const [key, ids] of Object.entries(node.slots)) {
        const filtered = ids.filter((sid) => !toDelete.has(sid));
        slots[key] = filtered;
        if (filtered.length !== ids.length) changed = true;
      }
      if (changed) nodes[node.id] = { ...nodes[node.id], slots };
    }
  }
  return syncRoot({ ...doc, nodes });
}
function docMoveNode(doc, id, toParentId, index) {
  const fromParent = findParent(doc, id);
  const node = doc.nodes[id];
  if (!node) return doc;
  let next = doc;
  if (fromParent && isContainerNode(fromParent)) {
    const children2 = fromParent.children.filter((cid) => cid !== id);
    next = {
      ...next,
      nodes: { ...next.nodes, [fromParent.id]: { ...fromParent, children: children2 } }
    };
  }
  const toParent = next.nodes[toParentId];
  if (!toParent || !isContainerNode(toParent)) return doc;
  const children = [...toParent.children];
  children.splice(index, 0, id);
  return syncRoot({
    ...next,
    nodes: { ...next.nodes, [toParentId]: { ...toParent, children } }
  });
}
function findParent(doc, id) {
  for (const node of Object.values(doc.nodes)) {
    if (!isContainerNode(node)) continue;
    if (node.children.includes(id)) return node;
    for (const ids of Object.values(node.slots ?? {})) {
      if (ids.includes(id)) return node;
    }
  }
  return void 0;
}
function docUpdateProps(doc, id, patch) {
  const node = doc.nodes[id];
  if (!node) return doc;
  return syncRoot({
    ...doc,
    nodes: { ...doc.nodes, [id]: { ...node, props: { ...node.props, ...patch } } }
  });
}
function docRestoreSubtree(doc, parentId, index, subtree, rootId) {
  const parent = doc.nodes[parentId];
  if (!parent || !isContainerNode(parent)) return doc;
  const nodes = { ...doc.nodes, ...subtree };
  const children = [...parent.children];
  children.splice(index ?? children.length, 0, rootId);
  return syncRoot({
    ...doc,
    nodes: { ...nodes, [parentId]: { ...parent, children } }
  });
}
function invert(action, state) {
  switch (action.type) {
    case "node/add":
      return { type: "node/remove", id: action.node.id };
    case "node/remove": {
      const node = state.document.nodes[action.id];
      if (!node) return null;
      const parent = findParent(state.document, action.id);
      if (!parent) return null;
      const index = parent.children.indexOf(action.id);
      const subtree = collectSubtreeNodes(state.document, action.id);
      return {
        type: "node/restore",
        parentId: parent.id,
        index: index >= 0 ? index : void 0,
        subtree,
        rootId: action.id
      };
    }
    case "node/move": {
      if (!action.fromParentId || action.fromIndex === void 0) return null;
      return {
        type: "node/move",
        id: action.id,
        toParentId: action.fromParentId,
        index: action.fromIndex,
        fromParentId: action.toParentId,
        fromIndex: action.index
      };
    }
    case "node/updateProps": {
      const node = state.document.nodes[action.id];
      if (!node) return null;
      const original = {};
      for (const key of Object.keys(action.patch)) {
        original[key] = node.props[key];
      }
      return { type: "node/updateProps", id: action.id, patch: original };
    }
    case "node/rename": {
      const node = state.document.nodes[action.id];
      if (!node || node.label === void 0) return null;
      return { type: "node/rename", id: action.id, label: node.label };
    }
    case "node/restore": {
      return { type: "node/remove", id: action.rootId };
    }
    case "selection/set":
      return {
        type: "selection/set",
        ids: state.selection.ids,
        anchorId: state.selection.anchorId
      };
    case "device/set": {
      const prev = state.device.activeId;
      return { type: "device/set", id: prev };
    }
    case "canvas/zoom":
      return { type: "canvas/zoom", zoom: state.device.zoom };
    default:
      return null;
  }
}
function pushHistory(undo, entry) {
  if (entry.action.type === "node/updateProps" && undo.length > 0) {
    const last = undo[0];
    if (last.action.type === "node/updateProps" && last.action.id === entry.action.id && entry.ts - last.ts < MERGE_WINDOW_MS) {
      return [{ ...entry, inverse: last.inverse, label: entry.label }, ...undo.slice(1)];
    }
  }
  return [entry, ...undo].slice(0, HISTORY_LIMIT);
}
function reducer(state, action) {
  const ts = action.ts ?? now();
  switch (action.type) {
    case "node/add": {
      const next = docAddNode(state.document, action.parentId, action.node, action.index);
      if (next === state.document) return state;
      return withHistory(state, next, action, ts);
    }
    case "node/remove": {
      const next = docRemoveNode(state.document, action.id);
      if (next === state.document) return state;
      return withHistory(state, next, action, ts);
    }
    case "node/move": {
      const fromParent = findParent(state.document, action.id);
      const enriched = {
        ...action,
        fromParentId: action.fromParentId ?? fromParent?.id,
        fromIndex: action.fromIndex ?? (fromParent ? fromParent.children.indexOf(action.id) : void 0)
      };
      const next = docMoveNode(state.document, action.id, action.toParentId, action.index);
      if (next === state.document) return state;
      return withHistory(state, next, enriched, ts);
    }
    case "node/updateProps": {
      const next = docUpdateProps(state.document, action.id, action.patch);
      if (next === state.document) return state;
      return withHistory(state, next, action, ts);
    }
    case "node/rename": {
      const node = state.document.nodes[action.id];
      if (!node) return state;
      const next = syncRoot({
        ...state.document,
        nodes: { ...state.document.nodes, [action.id]: { ...node, label: action.label } }
      });
      return withHistory(state, next, action, ts);
    }
    case "node/restore": {
      const next = docRestoreSubtree(
        state.document,
        action.parentId,
        action.index,
        action.subtree,
        action.rootId
      );
      if (next === state.document) return state;
      return withHistory(state, next, action, ts);
    }
    case "selection/set":
      return {
        ...state,
        selection: { ids: action.ids, anchorId: action.anchorId ?? null }
      };
    case "theme/update":
      return { ...state, theme: deepMerge(state.theme, action.patch) };
    case "device/set":
      return { ...state, device: { ...state.device, activeId: action.id } };
    case "canvas/zoom":
      return { ...state, device: { ...state.device, zoom: action.zoom } };
    case "history/undo": {
      const [entry, ...rest] = state.history.undo;
      if (!entry || !entry.inverse) return state;
      const base = {
        ...state,
        history: { undo: rest, redo: [entry, ...state.history.redo] }
      };
      return applyWithoutHistory(base, entry.inverse);
    }
    case "history/redo": {
      const [entry, ...rest] = state.history.redo;
      if (!entry) return state;
      const base = {
        ...state,
        history: { undo: [entry, ...state.history.undo], redo: rest }
      };
      return applyWithoutHistory(base, entry.action);
    }
    case "doc/new": {
      const doc = createEmptyDocument(action.docId, action.name);
      return {
        ...state,
        document: doc,
        selection: { ids: [], anchorId: null },
        history: { undo: [], redo: [] }
      };
    }
    case "doc/load":
      return {
        ...state,
        document: action.doc,
        selection: { ids: [], anchorId: null },
        history: { undo: [], redo: [] }
      };
    case "doc/rename":
      return {
        ...state,
        document: { ...state.document, name: action.name }
      };
    case "ui/toggleBorders":
      return {
        ...state,
        ui: { ...state.ui, showBorders: !state.ui.showBorders }
      };
    default:
      return state;
  }
}
function withHistory(state, nextDoc, action, ts) {
  const inverse = invert(action, state);
  const entry = { action, inverse, label: action.type, ts };
  return {
    ...state,
    document: nextDoc,
    history: { undo: pushHistory(state.history.undo, entry), redo: [] }
  };
}
function applyWithoutHistory(state, action) {
  const tmp = reducer({ ...state, history: { undo: [], redo: [] } }, action);
  return { ...tmp, history: state.history };
}
function deepMerge(base, patch) {
  if (typeof patch !== "object" || patch === null || Array.isArray(patch)) {
    return patch;
  }
  const result = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (value === void 0) continue;
    const baseValue = result[key];
    if (typeof value === "object" && value !== null && !Array.isArray(value) && typeof baseValue === "object" && baseValue !== null && !Array.isArray(baseValue)) {
      result[key] = deepMerge(baseValue, value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// src/client/palette/ComponentPalette.tsx
var import_react = require("react");

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
var PALETTE_GROUPS = [
  {
    id: "buttons",
    label: "\u6309\u94AE",
    descriptors: [
      "m3.Button",
      "m3.FilledTonalButton",
      "m3.OutlinedButton",
      "m3.TextButton",
      "m3.ElevatedButton",
      "m3.SegmentedButton",
      "m3.IconButton",
      "m3.FloatingActionButton",
      "m3.ExtendedFloatingActionButton"
    ]
  },
  {
    id: "selection",
    label: "\u9009\u62E9\u63A7\u4EF6",
    descriptors: ["m3.Checkbox", "m3.RadioButton", "m3.Switch", "m3.Slider"]
  },
  {
    id: "text",
    label: "\u6587\u672C",
    descriptors: ["m3.Text", "content.BasicText"]
  },
  {
    id: "input",
    label: "\u8F93\u5165",
    descriptors: [
      "m3.TextField",
      "m3.OutlinedTextField",
      "m3.DatePicker",
      "m3.TimePicker"
    ]
  },
  {
    id: "containers",
    label: "\u5BB9\u5668",
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
      "m3.Scaffold"
    ]
  },
  {
    id: "appbars",
    label: "\u9876\u680F / \u5E95\u680F",
    descriptors: ["m3.TopAppBar", "m3.ModalBottomSheet"]
  },
  {
    id: "navigation",
    label: "\u5BFC\u822A",
    descriptors: ["m3.NavigationBar", "m3.NavigationRail", "m3.TabRow"]
  },
  {
    id: "chips",
    label: "\u6807\u7B7E",
    descriptors: ["m3.AssistChip", "m3.FilterChip"]
  },
  {
    id: "progress",
    label: "\u8FDB\u5EA6",
    descriptors: [
      "m3.CircularProgressIndicator",
      "m3.LinearProgressIndicator"
    ]
  },
  {
    id: "feedback",
    label: "\u53CD\u9988",
    descriptors: ["m3.Snackbar", "m3.AlertDialog", "m3.Badge", "m3.PlainTooltip"]
  },
  {
    id: "list",
    label: "\u5217\u8868 / \u83DC\u5355",
    descriptors: ["m3.ListItem", "m3.DropdownMenu"]
  },
  {
    id: "content",
    label: "\u5185\u5BB9",
    descriptors: [
      "content.Image",
      "content.Icon",
      "content.Canvas",
      "m3.HorizontalDivider",
      "m3.VerticalDivider"
    ]
  }
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
function searchDescriptors(query) {
  const q = query.toLowerCase().trim();
  if (!q) return DESCRIPTORS;
  return DESCRIPTORS.filter(
    (d) => d.brief.toLowerCase().includes(q) || d.composable.toLowerCase().includes(q) || d.fqn.toLowerCase().includes(q) || d.tags.some((t) => t.includes(q))
  );
}

// src/client/canvas/drag.ts
var DND_MIME = "application/x-compose-studio";
function axisOf(nodeType) {
  return nodeType === "layout.Row" || nodeType === "layout.FlowRow" || nodeType === "layout.LazyRow" ? "horizontal" : "vertical";
}
function computeInsertIndex(axis, children, x, y) {
  const pos = axis === "vertical" ? y : x;
  for (let i = 0; i < children.length; i++) {
    const mid = (children[i].start + children[i].end) / 2;
    if (pos < mid) return i;
  }
  return children.length;
}
function findParentId(doc, id) {
  for (const node of Object.values(doc.nodes)) {
    if (!isContainerNode(node)) continue;
    if (node.children.includes(id)) return node.id;
    for (const ids of Object.values(node.slots ?? {})) {
      if (ids.includes(id)) return node.id;
    }
  }
  return null;
}
function resolveContainerId(doc, hitId) {
  if (!hitId) return null;
  const hitNode = doc.nodes[hitId];
  if (hitNode && isContainerNode(hitNode)) return hitNode.id;
  return findParentId(doc, hitId);
}
function isInSubtree(doc, id, subtreeRootId) {
  if (id === subtreeRootId) return true;
  const root = doc.nodes[subtreeRootId];
  if (!root || !isContainerNode(root)) return false;
  const walk = (node) => {
    if (node.id === id) return true;
    if (!isContainerNode(node)) return false;
    return node.children.some((cid) => {
      const child = doc.nodes[cid];
      return child ? walk(child) : false;
    });
  };
  return walk(root);
}
function sizeValue(raw, mode) {
  switch (mode) {
    case "wrap":
      return "auto";
    case "match":
      return "100%";
    case "weight":
      return void 0;
    case "fixed":
      return raw != null ? Number(raw) : void 0;
  }
}
function getModifierStyle(props) {
  const widthMode = getSizeMode(props, "modifierWidth");
  const heightMode = getSizeMode(props, "modifierHeight");
  let flex;
  if (widthMode === "weight" && props.modifierWidth != null) {
    flex = Number(props.modifierWidth);
  } else if (heightMode === "weight" && props.modifierHeight != null) {
    flex = Number(props.modifierHeight);
  }
  return {
    width: sizeValue(props.modifierWidth, widthMode),
    height: sizeValue(props.modifierHeight, heightMode),
    padding: props.modifierPadding != null ? Number(props.modifierPadding) : void 0,
    background: typeof props.modifierBackground === "string" ? props.modifierBackground : void 0,
    flex
  };
}
function createNodeFromDescriptor(descriptor, takenIds) {
  const props = {};
  for (const schema of descriptor.defaultProps) {
    if ("default" in schema && schema.default !== void 0) {
      props[schema.key] = schema.default;
    }
  }
  const base = descriptor.id.replace(/[^A-Za-z0-9]+/g, "-");
  let seq = 1;
  let id = `${base}-${seq}`;
  while (takenIds.has(id)) {
    seq += 1;
    id = `${base}-${seq}`;
  }
  if (descriptor.codegen.render === "leaf") {
    const node2 = { id, type: descriptor.id, props };
    if (descriptor.preview.kind === "text" && typeof props.text === "string") {
      node2.text = props.text;
    }
    return node2;
  }
  const node = { id, type: descriptor.id, props, children: [] };
  return node;
}

// src/client/debug.ts
var STUDIO_DEBUG_EVENT = "studio:debug";
function studioDebug(msg) {
  window.dispatchEvent(new CustomEvent(STUDIO_DEBUG_EVENT, { detail: msg }));
}

// src/client/theme/ui.ts
var UI = {
  // 表面
  bg: "#0F172A",
  // 主背景（深蓝黑）
  surface: "#1B2336",
  // 面板/卡片
  surfaceAlt: "#272F42",
  // 次级表面（hover/输入框）
  border: "#334155",
  // 边框/分隔线
  borderSubtle: "#1E293B",
  // 弱分隔线
  // 文本
  text: "#F8FAFC",
  // 主文本
  textMuted: "#94A3B8",
  // 次文本
  textFaint: "#64748B",
  // 弱化文本
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
    lg: "0 8px 24px rgba(0,0,0,0.5)"
  },
  // 过渡
  transition: "150ms ease"
};

// src/client/palette/ComponentPalette.tsx
var import_jsx_runtime = require("react/jsx-runtime");
function DescriptorItem({ descriptor }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "div",
    {
      draggable: true,
      onDragStart: (e) => {
        e.dataTransfer.setData(DND_MIME, descriptor.id);
        e.dataTransfer.effectAllowed = "copy";
        studioDebug(`dragstart palette ${descriptor.id}`);
      },
      title: descriptor.brief,
      style: {
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
        transition: `background ${UI.transition}, border-color ${UI.transition}`
      },
      onMouseEnter: (e) => {
        e.currentTarget.style.background = UI.surfaceAlt;
        e.currentTarget.style.borderColor = UI.border;
      },
      onMouseLeave: (e) => {
        e.currentTarget.style.background = UI.surface;
        e.currentTarget.style.borderColor = UI.borderSubtle;
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: UI.primaryHover, fontSize: 11 }, children: "\u25C6" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: descriptor.composable })
      ]
    }
  );
}
function ComponentPalette() {
  const [query, setQuery] = (0, import_react.useState)("");
  const results = (0, import_react.useMemo)(() => searchDescriptors(query), [query]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderRight: `1px solid ${UI.border}`,
        background: UI.surface,
        fontFamily: UI.fontSans
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "div",
          {
            style: {
              padding: `${UI.space.md}px ${UI.space.lg}px ${UI.space.sm}px`,
              fontSize: 12,
              fontWeight: 600,
              color: UI.textMuted,
              letterSpacing: "0.05em",
              textTransform: "uppercase"
            },
            children: "\u7EC4\u4EF6"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { padding: `0 ${UI.space.md}px ${UI.space.md}px` }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "input",
          {
            type: "text",
            placeholder: "\u641C\u7D22\u7EC4\u4EF6\u2026",
            value: query,
            onChange: (e) => setQuery(e.target.value),
            style: {
              width: "100%",
              padding: `${UI.space.sm}px ${UI.space.md}px`,
              border: `1px solid ${UI.border}`,
              borderRadius: UI.radius.md,
              fontSize: 13,
              background: UI.surfaceAlt,
              color: UI.text,
              boxSizing: "border-box",
              outline: "none",
              transition: `border-color ${UI.transition}`
            },
            onFocus: (e) => {
              e.currentTarget.style.borderColor = UI.focus;
            },
            onBlur: (e) => {
              e.currentTarget.style.borderColor = UI.border;
            }
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { flex: 1, overflow: "auto", padding: `0 ${UI.space.md}px ${UI.space.md}px` }, children: query ? results.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { color: UI.textFaint, fontSize: 12, padding: UI.space.sm }, children: "\u65E0\u5339\u914D\u7EC4\u4EF6" }) : results.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DescriptorItem, { descriptor: d }, d.id)) : PALETTE_GROUPS.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginBottom: UI.space.md }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "div",
            {
              style: {
                fontSize: 11,
                fontWeight: 600,
                color: UI.textFaint,
                marginBottom: UI.space.xs,
                paddingLeft: UI.space.xs,
                letterSpacing: "0.04em"
              },
              children: group.label
            }
          ),
          group.descriptors.map((id) => {
            const d = findDescriptor(id);
            return d ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DescriptorItem, { descriptor: d }, id) : null;
          })
        ] }, group.id)) })
      ]
    }
  );
}

// src/client/canvas/Canvas.tsx
var import_react2 = require("react");

// src/client/canvas/PreviewRenderer.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
var M3 = {
  text: (size = 14, weight = 400) => ({
    fontSize: size,
    fontWeight: weight,
    color: "#1C1B1F",
    lineHeight: 1.4
  }),
  button: (variant = "filled") => {
    const base = {
      borderRadius: 20,
      height: 40,
      padding: "0 24px",
      fontSize: 14,
      fontWeight: 500,
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      border: "none",
      fontFamily: "inherit",
      letterSpacing: 0.1
    };
    switch (variant) {
      // Filled：实心 primary 背景 + onPrimary 文字 + 轻阴影（高强调）
      case "filled":
        return {
          ...base,
          background: "#6750A4",
          color: "#FFFFFF",
          boxShadow: "0 1px 2px rgba(0,0,0,0.15)"
        };
      // Filled tonal：secondaryContainer 背景 + onSecondaryContainer 文字
      case "tonal":
        return { ...base, background: "#E8DEF8", color: "#1D192B" };
      // Elevated：surface 背景 + primary 文字 + 明显阴影
      case "elevated":
        return {
          ...base,
          background: "#F7F2FA",
          color: "#6750A4",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
        };
      // Outlined：透明 + outline 边框 + primary 文字（中等强调）
      case "outlined":
        return {
          ...base,
          background: "transparent",
          color: "#6750A4",
          border: "1px solid #79747E"
        };
      // Text：透明 + primary 文字（低强调）
      case "text":
        return {
          ...base,
          background: "transparent",
          color: "#6750A4",
          padding: "0 12px"
        };
      default:
        return {
          ...base,
          background: "#6750A4",
          color: "#FFFFFF",
          boxShadow: "0 1px 2px rgba(0,0,0,0.15)"
        };
    }
  },
  card: (variant = "filled") => ({
    borderRadius: 12,
    border: variant === "outlined" ? "1px solid #79747E" : "1px solid #E7E0EC",
    background: variant === "elevated" ? "#F7F2FA" : "#FFFBFE",
    padding: 12,
    boxShadow: variant === "elevated" ? "0 1px 3px rgba(0,0,0,0.15)" : void 0
  }),
  topBar: {
    height: 56,
    background: "#FFFBFE",
    borderBottom: "1px solid #E7E0EC",
    display: "flex",
    alignItems: "center",
    padding: "0 16px",
    fontSize: 20,
    fontWeight: 500
  },
  textField: (outlined = false) => ({
    border: outlined ? "1px solid #79747E" : "none",
    borderBottom: outlined ? void 0 : "1px solid #79747E",
    borderRadius: outlined ? 4 : 0,
    padding: "10px 12px",
    fontSize: 14,
    background: "#fff",
    minWidth: 160
  }),
  image: {
    background: "#E7E0EC",
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#49454F",
    fontSize: 12
  },
  icon: {
    width: 24,
    height: 24,
    color: "#49454F",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18
  },
  scaffold: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    minHeight: "100%",
    background: "#FFFBFE"
  },
  surface: {
    borderRadius: 12,
    padding: 12,
    background: "#F7F2FA"
  },
  divider: { background: "#CAC4D0" },
  toggle: (checked) => ({
    width: 18,
    height: 18,
    borderRadius: checked ? 9 : 2,
    background: checked ? "#6750A4" : "transparent",
    border: "2px solid #79747E",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: 12
  }),
  slider: (value) => ({
    flex: 1,
    height: 4,
    borderRadius: 2,
    background: `linear-gradient(to right, #6750A4 ${value}%, #E7E0EC ${value}%)`,
    position: "relative"
  }),
  chip: (selected = false) => ({
    padding: "4px 12px",
    borderRadius: 8,
    fontSize: 12,
    background: selected ? "#E8DEF8" : "transparent",
    border: "1px solid #79747E",
    display: "inline-flex",
    alignItems: "center"
  }),
  progress: (value, linear = false) => linear ? { height: 4, borderRadius: 2, background: `linear-gradient(to right, #6750A4 ${value}%, #E7E0EC ${value}%)` } : { width: 36, height: 36, borderRadius: "50%", background: `conic-gradient(#6750A4 ${value * 3.6}deg, #E7E0EC 0deg)` },
  navigation: (vertical = false) => ({
    display: "flex",
    flexDirection: vertical ? "column" : "row",
    gap: 8,
    padding: 8,
    background: "#F3EDF7"
  }),
  dialog: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "#FFFBFE",
    borderRadius: 28,
    padding: 24,
    minWidth: 280,
    boxShadow: "0 4px 24px rgba(0,0,0,0.2)"
  },
  tooltip: {
    position: "fixed",
    bottom: 20,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#313033",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: 4,
    fontSize: 12
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    background: "#B3261E",
    color: "#fff",
    fontSize: 11,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 6px"
  },
  tab: (active = false) => ({
    padding: "8px 16px",
    fontSize: 14,
    fontWeight: active ? 600 : 400,
    color: active ? "#6750A4" : "#49454F",
    borderBottom: active ? "2px solid #6750A4" : "2px solid transparent"
  }),
  canvas: {
    background: "#F7F2FA",
    borderRadius: 4,
    border: "1px dashed #CAC4D0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#79747E",
    fontSize: 12
  },
  spacer: { background: "rgba(103,80,164,0.08)", borderRadius: 2 },
  listItem: {
    display: "flex",
    flexDirection: "column",
    padding: "12px 16px",
    borderBottom: "1px solid #E7E0EC"
  },
  menu: {
    background: "#FFFBFE",
    borderRadius: 4,
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    padding: 8,
    minWidth: 180
  },
  snackbar: {
    position: "fixed",
    bottom: 16,
    left: 16,
    right: 16,
    background: "#313033",
    color: "#fff",
    padding: "12px 16px",
    borderRadius: 4,
    fontSize: 14,
    display: "flex",
    justifyContent: "space-between"
  }
};
function arrangementCss(value) {
  switch (value) {
    case "top":
    case "start":
      return "flex-start";
    case "center":
      return "center";
    case "bottom":
    case "end":
      return "flex-end";
    case "spaceBetween":
      return "space-between";
    case "spaceAround":
      return "space-around";
    case "spaceEvenly":
      return "space-evenly";
    default:
      return "flex-start";
  }
}
function alignmentCss(value) {
  switch (value) {
    case "start":
      return "flex-start";
    case "center":
      return "center";
    case "end":
      return "flex-end";
    default:
      return "flex-start";
  }
}
function indicatorStyle(nodeType) {
  const axis = axisOf(nodeType);
  return axis === "vertical" ? { height: 2, width: "100%", background: "#1976d2", borderRadius: 1, flexShrink: 0 } : { width: 2, alignSelf: "stretch", background: "#1976d2", borderRadius: 1, flexShrink: 0 };
}
var containerPlaceholder = {
  border: "1px dashed #CAC4D0",
  borderRadius: 4,
  padding: "12px 16px",
  color: "#79747E",
  fontSize: 12,
  textAlign: "center",
  width: "100%",
  boxSizing: "border-box"
};
var CONTAINER_MIN_HEIGHT = 60;
function renderContainerChildren(node, childrenContent, label) {
  if (node.children.length === 0) {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: containerPlaceholder, children: label });
  }
  return childrenContent;
}
var BUTTON_VARIANTS = {
  "m3.Button": "filled",
  "m3.FilledTonalButton": "tonal",
  "m3.OutlinedButton": "outlined",
  "m3.TextButton": "text",
  "m3.ElevatedButton": "elevated",
  "m3.SegmentedButton": "outlined"
};
var CARD_VARIANTS = {
  "m3.Card": "filled",
  "m3.ElevatedCard": "elevated",
  "m3.OutlinedCard": "outlined"
};
var BUTTON_LABELS = {
  "m3.Button": "Filled",
  "m3.FilledTonalButton": "Tonal",
  "m3.OutlinedButton": "Outlined",
  "m3.TextButton": "Text",
  "m3.ElevatedButton": "Elevated",
  "m3.SegmentedButton": "Option"
};
function PreviewNode({
  node,
  onSelect,
  dropIndicator,
  showBorders = true
}) {
  const isRoot = node.depth === 0;
  const selected = node.selected;
  const modStyle = getModifierStyle(node.props);
  const containerOutline = selected || !node.isContainer ? void 0 : showBorders ? "1px dashed rgba(25,118,210,0.55)" : void 0;
  const wrapperStyle = {
    outline: selected ? "2px solid #1976d2" : containerOutline,
    outlineOffset: selected ? 1 : -1,
    cursor: "pointer",
    position: "relative",
    ...modStyle
  };
  const nodeAttrs = {
    "data-node-id": node.id,
    ...node.isContainer ? { "data-container": "1" } : {}
  };
  const draggable = !isRoot;
  const dragProps = draggable ? {
    draggable: true,
    onDragStart: (e) => {
      e.stopPropagation();
      e.dataTransfer.setData(DND_MIME, node.id);
      e.dataTransfer.effectAllowed = "move";
      studioDebug(`dragstart node ${node.id}`);
    }
  } : {};
  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(node.id);
  };
  const showIndicator = dropIndicator != null && dropIndicator.parentId === node.id;
  const renderChildren = () => {
    const items = [];
    node.children.forEach((child, i) => {
      if (showIndicator && dropIndicator.index === i) {
        items.push(/* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: indicatorStyle(node.type) }, `ind-${i}`));
      }
      items.push(
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          PreviewNode,
          {
            node: child,
            onSelect,
            dropIndicator,
            showBorders
          },
          child.id
        )
      );
    });
    if (showIndicator && dropIndicator.index === node.children.length) {
      items.push(/* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: indicatorStyle(node.type) }, "ind-end"));
    }
    return items;
  };
  const childrenContent = renderChildren();
  const spacerProps = node.props;
  switch (node.type) {
    case "layout.Column":
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "div",
        {
          ...nodeAttrs,
          ...dragProps,
          style: {
            ...wrapperStyle,
            display: "flex",
            flexDirection: "column",
            gap: Number(node.props.spacing ?? 8),
            justifyContent: arrangementCss(node.props.verticalArrangement),
            alignItems: alignmentCss(node.props.horizontalAlignment),
            minHeight: CONTAINER_MIN_HEIGHT
          },
          onClick: handleClick,
          children: renderContainerChildren(node, childrenContent, "Column\uFF08\u62D6\u62FD\u7EC4\u4EF6\u5230\u6B64\u5904\uFF09")
        }
      );
    case "layout.Row":
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "div",
        {
          ...nodeAttrs,
          ...dragProps,
          style: {
            ...wrapperStyle,
            display: "flex",
            gap: Number(node.props.spacing ?? 8),
            justifyContent: arrangementCss(node.props.horizontalArrangement),
            alignItems: alignmentCss(node.props.verticalAlignment),
            minHeight: CONTAINER_MIN_HEIGHT
          },
          onClick: handleClick,
          children: renderContainerChildren(node, childrenContent, "Row\uFF08\u62D6\u62FD\u7EC4\u4EF6\u5230\u6B64\u5904\uFF09")
        }
      );
    case "layout.FlowRow":
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "div",
        {
          ...nodeAttrs,
          ...dragProps,
          style: { ...wrapperStyle, display: "flex", flexWrap: "wrap", gap: Number(node.props.spacing ?? 8), alignItems: "center", minHeight: CONTAINER_MIN_HEIGHT },
          onClick: handleClick,
          children: renderContainerChildren(node, childrenContent, "FlowRow\uFF08\u62D6\u62FD\u7EC4\u4EF6\u5230\u6B64\u5904\uFF09")
        }
      );
    case "layout.FlowColumn":
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "div",
        {
          ...nodeAttrs,
          ...dragProps,
          style: { ...wrapperStyle, display: "flex", flexDirection: "column", flexWrap: "wrap", gap: Number(node.props.spacing ?? 8), minHeight: CONTAINER_MIN_HEIGHT },
          onClick: handleClick,
          children: renderContainerChildren(node, childrenContent, "FlowColumn\uFF08\u62D6\u62FD\u7EC4\u4EF6\u5230\u6B64\u5904\uFF09")
        }
      );
    case "layout.LazyColumn":
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "div",
        {
          ...nodeAttrs,
          ...dragProps,
          style: { ...wrapperStyle, display: "flex", flexDirection: "column", gap: Number(node.props.spacing ?? 8), overflow: "auto", minHeight: CONTAINER_MIN_HEIGHT },
          onClick: handleClick,
          children: renderContainerChildren(node, childrenContent, "LazyColumn\uFF08\u62D6\u62FD\u7EC4\u4EF6\u5230\u6B64\u5904\uFF09")
        }
      );
    case "layout.LazyRow":
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "div",
        {
          ...nodeAttrs,
          ...dragProps,
          style: { ...wrapperStyle, display: "flex", gap: Number(node.props.spacing ?? 8), overflow: "auto", minHeight: CONTAINER_MIN_HEIGHT },
          onClick: handleClick,
          children: renderContainerChildren(node, childrenContent, "LazyRow\uFF08\u62D6\u62FD\u7EC4\u4EF6\u5230\u6B64\u5904\uFF09")
        }
      );
    case "layout.Box":
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "div",
        {
          ...nodeAttrs,
          ...dragProps,
          style: { ...wrapperStyle, minHeight: CONTAINER_MIN_HEIGHT, position: "relative" },
          onClick: handleClick,
          children: renderContainerChildren(node, childrenContent, "Box\uFF08\u62D6\u62FD\u7EC4\u4EF6\u5230\u6B64\u5904\uFF09")
        }
      );
    case "layout.Spacer":
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "div",
        {
          ...nodeAttrs,
          ...dragProps,
          style: {
            ...wrapperStyle,
            ...M3.spacer,
            width: Number(spacerProps.width ?? 0),
            height: Number(spacerProps.height ?? 8),
            flexShrink: 0
          },
          onClick: handleClick
        }
      );
  }
  if (node.type.startsWith("m3.")) {
    switch (node.type) {
      case "m3.Text":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "div",
          {
            ...nodeAttrs,
            ...dragProps,
            style: { ...wrapperStyle, ...M3.text(Number(node.props.fontSize ?? 14), Number(node.props.fontWeight ?? 400)) },
            onClick: handleClick,
            children: String(node.props.text ?? node.text ?? "Text")
          }
        );
      case "m3.Button":
      case "m3.FilledTonalButton":
      case "m3.OutlinedButton":
      case "m3.TextButton":
      case "m3.ElevatedButton":
      case "m3.SegmentedButton": {
        const variant = BUTTON_VARIANTS[node.type] ?? "filled";
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "button",
          {
            ...nodeAttrs,
            ...dragProps,
            style: { ...M3.button(variant), ...wrapperStyle },
            onClick: (e) => {
              e.stopPropagation();
              onSelect(node.id);
            },
            children: node.children.length > 0 ? childrenContent : String(
              node.props.text ?? BUTTON_LABELS[node.type] ?? "Button"
            )
          }
        );
      }
      case "m3.IconButton":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "button",
          {
            ...nodeAttrs,
            ...dragProps,
            style: { ...wrapperStyle, width: 40, height: 40, borderRadius: "50%", border: "none", background: "transparent", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" },
            onClick: (e) => {
              e.stopPropagation();
              onSelect(node.id);
            },
            children: node.children.length > 0 ? childrenContent : "\u2605"
          }
        );
      case "m3.FloatingActionButton":
      case "m3.ExtendedFloatingActionButton":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "button",
          {
            ...nodeAttrs,
            ...dragProps,
            style: { ...wrapperStyle, width: node.type === "m3.ExtendedFloatingActionButton" ? void 0 : 56, height: 56, borderRadius: 16, border: "none", background: "#E8DEF8", color: "#6750A4", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.15)", padding: node.type === "m3.ExtendedFloatingActionButton" ? "0 16px" : 0 },
            onClick: (e) => {
              e.stopPropagation();
              onSelect(node.id);
            },
            children: childrenContent
          }
        );
      case "m3.Card":
      case "m3.ElevatedCard":
      case "m3.OutlinedCard": {
        const variant = CARD_VARIANTS[node.type] ?? "filled";
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { ...nodeAttrs, ...dragProps, style: { ...M3.card(variant), ...wrapperStyle }, onClick: handleClick, children: childrenContent });
      }
      case "m3.Checkbox":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { ...nodeAttrs, ...dragProps, style: { ...wrapperStyle, display: "flex", alignItems: "center", gap: 8 }, onClick: handleClick, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: M3.toggle(Boolean(node.props.checked)), children: Boolean(node.props.checked) ? "\u2713" : "" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: M3.text(14), children: String(node.props.label ?? "") })
        ] });
      case "m3.RadioButton":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { ...nodeAttrs, ...dragProps, style: { ...wrapperStyle, display: "flex", alignItems: "center", gap: 8 }, onClick: handleClick, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { ...M3.toggle(Boolean(node.props.selected)), borderRadius: "50%" } }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: M3.text(14), children: String(node.props.label ?? "") })
        ] });
      case "m3.Switch":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { ...nodeAttrs, ...dragProps, style: { ...wrapperStyle, display: "flex", alignItems: "center", gap: 8 }, onClick: handleClick, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { width: 52, height: 32, borderRadius: 16, background: Boolean(node.props.checked) ? "#6750A4" : "#E7E0EC", position: "relative", transition: "background 0.2s" }, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { width: 24, height: 24, borderRadius: "50%", background: "#fff", position: "absolute", top: 4, left: Boolean(node.props.checked) ? 24 : 4, boxShadow: "0 1px 3px rgba(0,0,0,0.2)" } }) }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: M3.text(14), children: String(node.props.label ?? "") })
        ] });
      case "m3.Slider":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { ...nodeAttrs, ...dragProps, style: { ...wrapperStyle, display: "flex", alignItems: "center", gap: 12, padding: "0 8px" }, onClick: handleClick, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: M3.slider(Number(node.props.value ?? 50)) }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: M3.text(12), children: String(node.props.value ?? 50) })
        ] });
      case "m3.AssistChip":
      case "m3.FilterChip":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { ...nodeAttrs, ...dragProps, style: wrapperStyle, onClick: handleClick, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { style: M3.chip(Boolean(node.props.selected)), children: [
          String(node.props.label ?? "Chip"),
          node.type === "m3.FilterChip" ? " \u2713" : ""
        ] }) });
      case "m3.AlertDialog":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { ...nodeAttrs, ...dragProps, style: { ...wrapperStyle, ...M3.dialog }, onClick: handleClick, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { fontSize: 20, fontWeight: 500, marginBottom: 12 }, children: String(node.props.title ?? "Dialog") }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: M3.text(14), children: String(node.props.text ?? "") }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { style: M3.button("text"), children: "Cancel" }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { style: M3.button("filled"), children: "OK" })
          ] })
        ] });
      case "m3.HorizontalDivider":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { ...nodeAttrs, ...dragProps, style: { ...wrapperStyle, ...M3.divider, height: Number(node.props.thickness ?? 1), width: "100%" }, onClick: handleClick });
      case "m3.VerticalDivider":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { ...nodeAttrs, ...dragProps, style: { ...wrapperStyle, ...M3.divider, width: Number(node.props.thickness ?? 1), alignSelf: "stretch" }, onClick: handleClick });
      case "m3.ListItem":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { ...nodeAttrs, ...dragProps, style: { ...wrapperStyle, ...M3.listItem }, onClick: handleClick, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: { fontSize: 16, fontWeight: 500 }, children: String(node.props.headline ?? "List item") }),
          Boolean(node.props.supporting) && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: M3.text(12), children: String(node.props.supporting) })
        ] });
      case "m3.DropdownMenu":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { ...nodeAttrs, ...dragProps, style: { ...wrapperStyle, ...M3.menu }, onClick: handleClick, children: childrenContent });
      case "m3.NavigationBar":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { ...nodeAttrs, ...dragProps, style: { ...wrapperStyle, ...M3.navigation(false) }, onClick: handleClick, children: childrenContent });
      case "m3.NavigationRail":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { ...nodeAttrs, ...dragProps, style: { ...wrapperStyle, ...M3.navigation(true) }, onClick: handleClick, children: childrenContent });
      case "m3.CircularProgressIndicator":
      case "m3.LinearProgressIndicator": {
        const linear = node.type === "m3.LinearProgressIndicator";
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { ...nodeAttrs, ...dragProps, style: { ...wrapperStyle, display: "flex", alignItems: "center", padding: 8 }, onClick: handleClick, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: M3.progress(Number(node.props.progress ?? 50), linear) }) });
      }
      case "m3.Snackbar":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { ...nodeAttrs, ...dragProps, style: { ...wrapperStyle, ...M3.snackbar }, onClick: handleClick, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: String(node.props.message ?? "Snackbar") }),
          Boolean(node.props.actionLabel) && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: { color: "#D0BCFF", fontWeight: 500 }, children: String(node.props.actionLabel) })
        ] });
      case "m3.TabRow":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { ...nodeAttrs, ...dragProps, style: { ...wrapperStyle, display: "flex", borderBottom: "1px solid #E7E0EC" }, onClick: handleClick, children: childrenContent });
      case "m3.TextField":
      case "m3.OutlinedTextField": {
        const outlined = node.type === "m3.OutlinedTextField";
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { ...nodeAttrs, ...dragProps, style: wrapperStyle, onClick: handleClick, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "input",
          {
            style: M3.textField(outlined),
            placeholder: String(node.props.label ?? "TextField"),
            readOnly: true
          }
        ) });
      }
      case "m3.TopAppBar":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { ...nodeAttrs, ...dragProps, style: { ...wrapperStyle, ...M3.topBar }, onClick: handleClick, children: String(node.props.title ?? "Title") });
      case "m3.Badge":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { ...nodeAttrs, ...dragProps, style: { ...wrapperStyle, display: "inline-flex", alignItems: "center", gap: 4 }, onClick: handleClick, children: [
          childrenContent,
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: M3.badge, children: "1" })
        ] });
      case "m3.ModalBottomSheet":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { ...nodeAttrs, ...dragProps, style: { ...wrapperStyle, ...M3.card("elevated"), position: "fixed", bottom: 0, left: 0, right: 0, borderRadius: "16px 16px 0 0", boxShadow: "0 -2px 16px rgba(0,0,0,0.2)" }, onClick: handleClick, children: childrenContent });
      case "m3.DatePicker":
      case "m3.TimePicker":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { ...nodeAttrs, ...dragProps, style: wrapperStyle, onClick: handleClick, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "input",
          {
            style: M3.textField(true),
            placeholder: node.type === "m3.DatePicker" ? "Select date" : "Select time",
            readOnly: true
          }
        ) });
      case "m3.PlainTooltip":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { ...nodeAttrs, ...dragProps, style: { ...wrapperStyle, ...M3.tooltip }, onClick: handleClick, children: String(node.props.text ?? "Tooltip") });
      case "m3.Surface":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { ...nodeAttrs, ...dragProps, style: { ...M3.surface, background: String(node.props.color ?? "#F7F2FA"), ...wrapperStyle }, onClick: handleClick, children: childrenContent });
      case "m3.Scaffold": {
        const isTopBar = (n) => n.type === "m3.TopAppBar";
        const isBottomBar = (n) => n.type === "m3.BottomAppBar";
        const isFab = (n) => n.type === "m3.FloatingActionButton" || n.type === "m3.ExtendedFloatingActionButton";
        const topBar = node.children.filter(isTopBar);
        const bottomBar = node.children.filter(isBottomBar);
        const fab = node.children.filter(isFab);
        const content2 = node.children.filter(
          (n) => !isTopBar(n) && !isBottomBar(n) && !isFab(n)
        );
        const slotStyle = {
          border: "1px dashed #E7E0EC",
          borderRadius: 4,
          minHeight: 44,
          padding: 4
        };
        const renderSlot = (nodes, label) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: slotStyle, children: nodes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: containerPlaceholder, children: label }) : nodes.map((n) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          PreviewNode,
          {
            node: n,
            onSelect,
            dropIndicator
          },
          n.id
        )) });
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
          "div",
          {
            ...nodeAttrs,
            ...dragProps,
            style: {
              ...wrapperStyle,
              ...M3.scaffold,
              minHeight: "100%",
              position: "relative"
            },
            onClick: handleClick,
            children: [
              renderSlot(topBar, "TopAppBar\uFF08\u62D6\u5165\u9876\u680F\uFF09"),
              /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { flex: 1, display: "flex", flexDirection: "column" }, children: renderSlot(content2, "Content\uFF08\u62D6\u62FD\u7EC4\u4EF6\u5230\u6B64\u5904\uFF09") }),
              renderSlot(bottomBar, "BottomAppBar\uFF08\u62D6\u5165\u5E95\u680F\uFF09"),
              fab.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { position: "absolute", bottom: 16, right: 16 }, children: fab.map((n) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                PreviewNode,
                {
                  node: n,
                  onSelect,
                  dropIndicator
                },
                n.id
              )) })
            ]
          }
        );
      }
    }
  }
  switch (node.type) {
    case "content.Image": {
      const w = Number(node.props.width ?? 100);
      const h = Number(node.props.height ?? 100);
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { ...nodeAttrs, ...dragProps, style: { ...wrapperStyle, ...M3.image, width: w, height: h }, onClick: handleClick, children: "Image" });
    }
    case "content.Icon":
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { ...nodeAttrs, ...dragProps, style: { ...wrapperStyle, ...M3.icon }, onClick: handleClick, children: String(node.props.name ?? "star") === "star" ? "\u2605" : String(node.props.name ?? "\u2605") });
    case "content.Canvas":
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "div",
        {
          ...nodeAttrs,
          ...dragProps,
          style: { ...wrapperStyle, ...M3.canvas, width: Number(node.props.width ?? 200), height: Number(node.props.height ?? 200) },
          onClick: handleClick,
          children: "Canvas"
        }
      );
    case "content.BasicText":
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { ...nodeAttrs, ...dragProps, style: { ...wrapperStyle, ...M3.text() }, onClick: handleClick, children: String(node.props.text ?? "Basic") });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    "div",
    {
      ...nodeAttrs,
      ...dragProps,
      style: {
        ...wrapperStyle,
        padding: 4,
        color: "#888",
        fontSize: 12,
        minHeight: CONTAINER_MIN_HEIGHT
      },
      onClick: handleClick,
      children: node.children.length > 0 ? childrenContent : node.type
    }
  );
}

// src/client/canvas/Canvas.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
function buildRenderTree(doc, selectedIds) {
  const build = (node, depth) => {
    const isContainer = isContainerNode(node);
    const children = isContainer ? node.children.map((id) => doc.nodes[id]).filter((n) => Boolean(n)).map((n) => build(n, depth + 1)) : [];
    return {
      id: node.id,
      type: node.type,
      label: node.label,
      depth,
      selected: selectedIds.has(node.id),
      isContainer,
      children,
      props: node.props,
      text: isContainer ? void 0 : node.text
    };
  };
  return build(doc.root, 0);
}
function measureChildren(containerEl, axis) {
  const childEls = Array.from(containerEl.children).filter(
    (el) => el instanceof HTMLElement && el.hasAttribute("data-node-id")
  );
  return childEls.map((el) => {
    const r = el.getBoundingClientRect();
    return {
      id: el.getAttribute("data-node-id"),
      start: axis === "vertical" ? r.top : r.left,
      end: axis === "vertical" ? r.bottom : r.right
    };
  });
}
function Canvas({
  state,
  dispatch
}) {
  const { document, device, selection } = state;
  const selectedIds = (0, import_react2.useMemo)(() => new Set(selection.ids), [selection.ids]);
  const tree = (0, import_react2.useMemo)(
    () => buildRenderTree(document, selectedIds),
    [document, selectedIds]
  );
  const activeDevice = getBuiltinDevice(device.activeId);
  const widthDp = activeDevice?.widthDp ?? 360;
  const heightDp = activeDevice?.heightDp ?? 800;
  const frameRef = (0, import_react2.useRef)(null);
  const [dropIndicator, setDropIndicator] = (0, import_react2.useState)(null);
  const [debugMsg, setDebugMsg] = (0, import_react2.useState)("");
  (0, import_react2.useEffect)(() => {
    const onDebug = (e) => setDebugMsg(e.detail);
    window.addEventListener(STUDIO_DEBUG_EVENT, onDebug);
    return () => window.removeEventListener(STUDIO_DEBUG_EVENT, onDebug);
  }, []);
  const handleSelect = (id) => {
    dispatch({ type: "selection/set", ids: [id], anchorId: id });
  };
  const updateDropTarget = (e) => {
    const hitEl = e.target.closest("[data-node-id]");
    const hitId = hitEl?.getAttribute("data-node-id") ?? null;
    const parentId = resolveContainerId(document, hitId) ?? document.root.id;
    const parent = document.nodes[parentId];
    if (!parent || !isContainerNode(parent)) return;
    const axis = axisOf(parent.type);
    const containerEl = hitEl?.closest("[data-container]") ?? frameRef.current?.querySelector(
      `[data-node-id="${parentId}"]`
    );
    if (!containerEl) return;
    const geoms = measureChildren(containerEl, axis);
    const index = computeInsertIndex(axis, geoms, e.clientX, e.clientY);
    setDropIndicator({ parentId, index });
  };
  const handleDragOver = (e) => {
    const types = Array.from(e.dataTransfer.types ?? []);
    const hitId = e.target.closest("[data-node-id]")?.getAttribute(
      "data-node-id"
    ) ?? "(frame)";
    studioDebug(`dragover ${JSON.stringify(types)} @${hitId}`);
    if (!types.includes(DND_MIME)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    updateDropTarget(e);
  };
  const handleDragLeave = (e) => {
    if (frameRef.current && !frameRef.current.contains(e.relatedTarget)) {
      setDropIndicator(null);
    }
  };
  const handleDrop = (e) => {
    const types = Array.from(e.dataTransfer.types ?? []);
    if (!types.includes(DND_MIME)) return;
    e.preventDefault();
    const payload = e.dataTransfer.getData(DND_MIME);
    const target = dropIndicator;
    studioDebug(`drop ${JSON.stringify(payload)} \u2192 ${target ? `${target.parentId}[${target.index}]` : "none"}`);
    setDropIndicator(null);
    if (!payload) return;
    const descriptor = findDescriptor(payload);
    if (descriptor) {
      const node = createNodeFromDescriptor(
        descriptor,
        new Set(Object.keys(document.nodes))
      );
      dispatch({
        type: "node/add",
        parentId: target?.parentId ?? document.root.id,
        node,
        index: target?.index
      });
      dispatch({ type: "selection/set", ids: [node.id], anchorId: node.id });
      return;
    }
    if (document.nodes[payload] && payload !== document.root.id) {
      const toParentId = target?.parentId ?? document.root.id;
      if (!isInSubtree(document, toParentId, payload)) {
        dispatch({
          type: "node/move",
          id: payload,
          toParentId,
          index: target?.index ?? 0
        });
        dispatch({ type: "selection/set", ids: [payload], anchorId: payload });
      }
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "div",
    {
      style: {
        flex: 1,
        overflow: "auto",
        background: UI.bg,
        padding: UI.space.xl
      },
      onClick: () => dispatch({ type: "selection/set", ids: [], anchorId: null }),
      children: [
        debugMsg && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "div",
          {
            style: {
              margin: "0 auto 8px",
              padding: "4px 10px",
              background: UI.accentBg,
              color: UI.accent,
              fontSize: 11,
              borderRadius: UI.radius.sm,
              width: "fit-content",
              maxWidth: "100%"
            },
            children: debugMsg
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "div",
          {
            ref: frameRef,
            onDragOver: handleDragOver,
            onDragLeave: handleDragLeave,
            onDrop: handleDrop,
            style: {
              transform: `scale(${device.zoom})`,
              transformOrigin: "top center",
              width: widthDp,
              height: heightDp,
              minHeight: heightDp,
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              background: "#FFFFFF",
              borderRadius: UI.radius.xl,
              boxShadow: UI.shadow.lg,
              border: `1px solid ${UI.border}`,
              padding: UI.space.md,
              boxSizing: "border-box",
              backgroundImage: device.showGrid ? "linear-gradient(#f1f5f9 1px, transparent 1px), linear-gradient(90deg, #f1f5f9 1px, transparent 1px)" : "none",
              backgroundSize: "20px 20px"
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              PreviewNode,
              {
                node: tree,
                onSelect: handleSelect,
                dropIndicator,
                showBorders: state.ui.showBorders
              }
            )
          }
        )
      ]
    }
  );
}

// src/client/inspector/Inspector.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
function FieldRow({
  label,
  children
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { marginBottom: UI.space.md }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "div",
      {
        style: {
          fontSize: 12,
          color: UI.textMuted,
          marginBottom: UI.space.xs
        },
        children: label
      }
    ),
    children
  ] });
}
var inputStyle = {
  width: "100%",
  padding: `${UI.space.sm}px ${UI.space.md}px`,
  border: `1px solid ${UI.border}`,
  borderRadius: UI.radius.md,
  fontSize: 13,
  background: UI.surfaceAlt,
  color: UI.text,
  boxSizing: "border-box",
  outline: "none",
  fontFamily: UI.fontSans
};
function PropField({
  schema,
  value,
  onChange
}) {
  switch (schema.kind) {
    case "string":
      return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(FieldRow, { label: schema.label, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "input",
        {
          type: "text",
          style: inputStyle,
          value: typeof value === "string" ? value : schema.default ?? "",
          onChange: (e) => onChange(e.target.value)
        }
      ) });
    case "number":
      return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(FieldRow, { label: schema.label, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "input",
        {
          type: "number",
          style: inputStyle,
          value: typeof value === "number" ? value : schema.default ?? 0,
          min: schema.min,
          max: schema.max,
          step: schema.step,
          onChange: (e) => onChange(Number(e.target.value))
        }
      ) });
    case "boolean":
      return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(FieldRow, { label: schema.label, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "input",
        {
          type: "checkbox",
          checked: typeof value === "boolean" ? value : schema.default ?? false,
          onChange: (e) => onChange(e.target.checked),
          style: { accentColor: UI.primary }
        }
      ) });
    case "enum":
      return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(FieldRow, { label: schema.label, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "select",
        {
          style: inputStyle,
          value: typeof value === "string" ? value : schema.default ?? "",
          onChange: (e) => onChange(e.target.value),
          children: schema.options.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("option", { value: opt.value, children: opt.label }, opt.value))
        }
      ) });
    case "color":
      return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(FieldRow, { label: schema.label, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "input",
        {
          type: "color",
          style: { width: 40, height: 28, padding: 0, border: `1px solid ${UI.border}` },
          value: typeof value === "string" ? value : schema.default ?? "#000000",
          onChange: (e) => onChange(e.target.value)
        }
      ) });
    case "dp":
      return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(FieldRow, { label: schema.label, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "input",
        {
          type: "number",
          style: inputStyle,
          value: typeof value === "number" ? value : schema.default ?? 0,
          min: schema.min,
          max: schema.max,
          onChange: (e) => onChange(Number(e.target.value))
        }
      ) });
    case "spacing": {
      const v = value ?? schema.default ?? { x: 0, y: 0 };
      return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(FieldRow, { label: schema.label, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", gap: UI.space.sm }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "input",
          {
            type: "number",
            style: inputStyle,
            value: v.x,
            onChange: (e) => onChange({ ...v, x: Number(e.target.value) })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          "input",
          {
            type: "number",
            style: inputStyle,
            value: v.y,
            onChange: (e) => onChange({ ...v, y: Number(e.target.value) })
          }
        )
      ] }) });
    }
    case "text-style": {
      const v = value ?? schema.default ?? {};
      return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(FieldRow, { label: schema.label, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "input",
        {
          type: "number",
          style: inputStyle,
          placeholder: "fontSize (sp)",
          value: v.fontSize ?? "",
          onChange: (e) => onChange({ ...v, fontSize: Number(e.target.value) })
        }
      ) });
    }
    case "event":
      return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(FieldRow, { label: schema.label, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { fontSize: 12, color: UI.textFaint }, children: [
        "\u4E8B\u4EF6\uFF08",
        schema.actions.join(", "),
        "\uFF09\u2014 Phase 1 \u5360\u4F4D"
      ] }) });
    case "slot":
      return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(FieldRow, { label: schema.label, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { fontSize: 12, color: UI.textFaint }, children: [
        "\u69FD\uFF08\u63A5\u53D7: ",
        schema.accepts.join(", "),
        "\uFF09"
      ] }) });
    default:
      return null;
  }
}
var MODIFIER_FIELDS = [
  { key: "modifierWidth", label: "\u5BBD", kind: "size" },
  { key: "modifierHeight", label: "\u9AD8", kind: "size" },
  { key: "modifierPadding", label: "\u5185\u8FB9\u8DDD (dp)", kind: "dp" },
  { key: "modifierBackground", label: "\u80CC\u666F\u8272", kind: "color" }
];
var SIZE_MODE_OPTIONS = [
  { value: "fixed", label: "\u56FA\u5B9A (dp)" },
  { value: "wrap", label: "\u5305\u88F9\u5185\u5BB9" },
  { value: "match", label: "\u586B\u5145\u7236\u5BB9\u5668" },
  { value: "weight", label: "\u6743\u91CD (weight)" }
];
function ModifierSection({
  node,
  dispatch
}) {
  const props = node.props;
  const setProp = (key, value) => {
    dispatch({ type: "node/updateProps", id: node.id, patch: { [key]: value } });
  };
  const modifierValue = (key) => {
    const v = props[key];
    return typeof v === "number" ? v : typeof v === "string" ? v : "";
  };
  const renderSizeField = (field) => {
    const mode = getSizeMode(props, field.key);
    const raw = props[field.key];
    const numValue = typeof raw === "number" ? raw : "";
    const showNumber = mode === "fixed" || mode === "weight";
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", gap: UI.space.sm, alignItems: "center" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "select",
        {
          value: mode,
          onChange: (e) => setProp(`${field.key}Mode`, e.target.value),
          style: { ...inputStyle, width: 110 },
          children: SIZE_MODE_OPTIONS.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("option", { value: opt.value, children: opt.label }, opt.value))
        }
      ),
      showNumber && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "input",
        {
          type: "number",
          style: { ...inputStyle, width: 70 },
          value: numValue,
          placeholder: mode === "weight" ? "1" : "dp",
          onChange: (e) => {
            const v = e.target.value;
            setProp(field.key, v === "" ? void 0 : Number(v));
          }
        }
      )
    ] });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { marginBottom: UI.space.md }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "div",
      {
        style: {
          fontSize: 12,
          fontWeight: 600,
          color: UI.textMuted,
          marginBottom: UI.space.sm,
          paddingTop: UI.space.sm,
          borderTop: `1px solid ${UI.border}`
        },
        children: "\u4FEE\u9970\u7B26"
      }
    ),
    MODIFIER_FIELDS.map((field) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(FieldRow, { label: field.label, children: field.kind === "size" ? renderSizeField(field) : field.kind === "dp" ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "input",
      {
        type: "number",
        style: { ...inputStyle, width: 90 },
        value: modifierValue(field.key),
        placeholder: "auto",
        onChange: (e) => {
          const raw = e.target.value;
          setProp(field.key, raw === "" ? void 0 : Number(raw));
        }
      }
    ) : /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", gap: UI.space.sm, alignItems: "center" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "input",
        {
          type: "color",
          style: {
            width: 36,
            height: 28,
            padding: 0,
            border: `1px solid ${UI.border}`
          },
          value: modifierValue(field.key) || "#ffffff",
          onChange: (e) => setProp(field.key, e.target.value)
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "button",
        {
          onClick: () => setProp(field.key, void 0),
          title: "\u6E05\u9664\u80CC\u666F",
          style: {
            border: `1px solid ${UI.border}`,
            background: "transparent",
            color: UI.textMuted,
            borderRadius: UI.radius.sm,
            fontSize: 11,
            padding: "2px 8px",
            cursor: "pointer",
            fontFamily: UI.fontSans
          },
          children: "\u6E05\u9664"
        }
      )
    ] }) }, field.key))
  ] });
}
function Inspector({
  state,
  dispatch
}) {
  const { selection, document } = state;
  const selectedId = selection.anchorId;
  const node = selectedId ? document.nodes[selectedId] ?? null : null;
  if (!node) {
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
      "div",
      {
        style: {
          padding: UI.space.xl,
          color: UI.textFaint,
          fontSize: 13,
          textAlign: "center",
          fontFamily: UI.fontSans
        },
        children: [
          "\u672A\u9009\u4E2D\u8282\u70B9",
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 11, marginTop: UI.space.xs }, children: "\u70B9\u51FB\u753B\u5E03\u4E2D\u7684\u8282\u70B9\u67E5\u770B\u5C5E\u6027" })
        ]
      }
    );
  }
  const descriptor = findDescriptor(node.type);
  const propSchemas = descriptor?.defaultProps ?? [];
  const isRoot = node.id === document.root.id;
  const handleChange = (key, value) => {
    dispatch({ type: "node/updateProps", id: node.id, patch: { [key]: value } });
  };
  const handleDelete = () => {
    if (isRoot) return;
    dispatch({ type: "node/remove", id: node.id });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { padding: UI.space.md, fontFamily: UI.fontSans }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
      "div",
      {
        style: {
          fontSize: 13,
          fontWeight: 600,
          color: UI.text,
          marginBottom: UI.space.md,
          paddingBottom: UI.space.sm,
          borderBottom: `1px solid ${UI.border}`
        },
        children: [
          node.type,
          node.label ? ` \xB7 ${node.label}` : ""
        ]
      }
    ),
    propSchemas.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 12, color: UI.textFaint }, children: "\u8BE5\u7EC4\u4EF6\u65E0\u53EF\u914D\u7F6E\u5C5E\u6027" }) : propSchemas.map((schema) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      PropField,
      {
        schema,
        value: node.props[schema.key],
        onChange: (v) => handleChange(schema.key, v)
      },
      schema.key
    )),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(ModifierSection, { node, dispatch }),
    !isRoot && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "button",
      {
        onClick: handleDelete,
        style: {
          width: "100%",
          marginTop: UI.space.lg,
          padding: `${UI.space.sm}px ${UI.space.md}px`,
          border: `1px solid ${UI.destructive}`,
          borderRadius: UI.radius.md,
          background: "transparent",
          color: UI.destructive,
          fontSize: 13,
          cursor: "pointer",
          fontFamily: UI.fontSans
        },
        children: "\u5220\u9664\u8282\u70B9"
      }
    )
  ] });
}

// src/client/chat/ChatPanel.tsx
var import_react3 = require("react");
var import_jsx_runtime5 = require("react/jsx-runtime");
function ChatPanel() {
  const [messages, setMessages] = (0, import_react3.useState)([
    {
      id: 0,
      role: "assistant",
      text: "\u4F60\u597D\uFF01\u63CF\u8FF0\u4F60\u60F3\u8981\u7684 Compose \u7EC4\u4EF6\uFF0C\u6211\u4F1A\u5E2E\u4F60\u8C03\u6574\u3002\u4F8B\u5982\uFF1A\u300C\u6DFB\u52A0\u4E00\u4E2A\u767B\u5F55\u8868\u5355\u300D\u300C\u628A\u6309\u94AE\u6539\u6210\u7EA2\u8272\u300D\u3002\uFF08AI \u529F\u80FD Phase 3 \u63A5\u5165\uFF09"
    }
  ]);
  const [text, setText] = (0, import_react3.useState)("");
  const nextId = messages.length;
  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages([
      ...messages,
      { id: nextId, role: "user", text: trimmed },
      {
        id: nextId + 1,
        role: "assistant",
        text: "\uFF08Phase 3\uFF09AI \u8C03\u6574\u5DF2\u6536\u5230\uFF0C\u5C06\u5728\u63A5\u5165 LLM \u540E\u751F\u6210\u7EC4\u4EF6\u3002"
      }
    ]);
    setText("");
  };
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
    "div",
    {
      style: {
        borderTop: `1px solid ${UI.border}`,
        background: UI.surface,
        display: "flex",
        flexDirection: "column",
        maxHeight: 200,
        fontFamily: UI.fontSans
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          "div",
          {
            style: {
              padding: `${UI.space.sm}px ${UI.space.lg}px ${UI.space.xs}px`,
              fontSize: 11,
              fontWeight: 600,
              color: UI.textMuted,
              letterSpacing: "0.05em",
              textTransform: "uppercase"
            },
            children: "AI \u8C03\u6574"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { flex: 1, overflow: "auto", padding: `0 ${UI.space.lg}px` }, children: messages.map((m) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          "div",
          {
            style: {
              marginBottom: UI.space.sm,
              fontSize: 12,
              textAlign: m.role === "user" ? "right" : "left"
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
              "span",
              {
                style: {
                  display: "inline-block",
                  padding: `${UI.space.xs}px ${UI.space.md}px`,
                  borderRadius: UI.radius.lg,
                  background: m.role === "user" ? UI.primary : UI.surfaceAlt,
                  color: m.role === "user" ? UI.onPrimary : UI.text,
                  maxWidth: "80%",
                  border: m.role === "user" ? "none" : `1px solid ${UI.borderSubtle}`
                },
                children: m.text
              }
            )
          },
          m.id
        )) }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
          "div",
          {
            style: {
              display: "flex",
              gap: UI.space.sm,
              padding: `${UI.space.sm}px ${UI.space.lg}px ${UI.space.md}px`
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
                "input",
                {
                  type: "text",
                  value: text,
                  placeholder: "\u63CF\u8FF0\u60F3\u8981\u7684\u7EC4\u4EF6\uFF0C\u5982\u300C\u6DFB\u52A0\u4E00\u4E2A\u767B\u5F55\u8868\u5355\u300D\u2026",
                  onChange: (e) => setText(e.target.value),
                  onKeyDown: (e) => {
                    if (e.key === "Enter") handleSend();
                  },
                  style: {
                    flex: 1,
                    padding: `${UI.space.sm}px ${UI.space.md}px`,
                    border: `1px solid ${UI.border}`,
                    borderRadius: UI.radius.md,
                    background: UI.surfaceAlt,
                    color: UI.text,
                    fontSize: 13,
                    outline: "none",
                    fontFamily: UI.fontSans
                  },
                  onFocus: (e) => {
                    e.currentTarget.style.borderColor = UI.focus;
                  },
                  onBlur: (e) => {
                    e.currentTarget.style.borderColor = UI.border;
                  }
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
                "button",
                {
                  onClick: handleSend,
                  style: {
                    padding: `${UI.space.sm}px ${UI.space.lg}px`,
                    border: "none",
                    borderRadius: UI.radius.md,
                    background: UI.primary,
                    color: UI.onPrimary,
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: UI.fontSans,
                    transition: `background ${UI.transition}`
                  },
                  onMouseEnter: (e) => {
                    e.currentTarget.style.background = UI.primaryHover;
                  },
                  onMouseLeave: (e) => {
                    e.currentTarget.style.background = UI.primary;
                  },
                  children: "\u53D1\u9001"
                }
              )
            ]
          }
        )
      ]
    }
  );
}

// src/shared/invariant.ts
var RPC_PREFIX = "/compose-studio";
var RPC_METHOD = {
  PING: "ping",
  DOC_LOAD: "doc/load",
  DOC_SAVE: "doc/save",
  DOC_EXPORT: "doc/export",
  CODEGEN_GENERATE: "codegen/generate",
  LLM_GENERATE: "llm/generate",
  THEME_RESOLVE: "theme/resolve"
};

// src/client/rpc.ts
var RpcClient = class {
  baseUrl;
  constructor(baseUrl = "") {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }
  async call(method, payload) {
    const res = await fetch(`${this.baseUrl}${RPC_PREFIX}/${method}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error ?? `RPC ${method} \u5931\u8D25 (${res.status})`);
    }
    return data;
  }
  /** 加载文档。 */
  async loadDocument(id) {
    const data = await this.call(RPC_METHOD.DOC_LOAD, { id });
    return data.doc;
  }
  /** 保存文档。 */
  async saveDocument(doc) {
    await this.call(RPC_METHOD.DOC_SAVE, { doc });
  }
  /** 导出 Kotlin 文件。 */
  async exportDocument(doc, opts = {}) {
    const data = await this.call(RPC_METHOD.DOC_EXPORT, { doc, ...opts });
    return data.files;
  }
  /** 列出工作区目录。 */
  async listDir(dir) {
    const data = await this.call("fs/list", { dir });
    return data.entries;
  }
};

// src/client/index.tsx
var import_jsx_runtime6 = require("react/jsx-runtime");
var PANEL_ID = "composeStudio";
function ComposeStudioPanel({ onBack }) {
  const [state, dispatch] = (0, import_react4.useReducer)(reducer, null, createInitialState);
  const rpc = (0, import_react4.useRef)(null);
  if (!rpc.current) rpc.current = new RpcClient();
  const [saveState, setSaveState] = (0, import_react4.useState)(
    "idle"
  );
  const firstRender = (0, import_react4.useRef)(true);
  const saveTimer = (0, import_react4.useRef)(void 0);
  (0, import_react4.useEffect)(() => {
    const onKeyDown = (e) => {
      const target = e.target;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      const selectedId = state.selection.anchorId;
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId && selectedId !== state.document.root.id) {
        e.preventDefault();
        dispatch({ type: "node/remove", id: selectedId });
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        dispatch({ type: e.shiftKey ? "history/redo" : "history/undo" });
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        dispatch({ type: "history/redo" });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [state.selection.anchorId, state.document.root.id]);
  (0, import_react4.useEffect)(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (saveTimer.current !== void 0) {
      window.clearTimeout(saveTimer.current);
    }
    setSaveState("idle");
    saveTimer.current = window.setTimeout(() => {
      setSaveState("saving");
      rpc.current?.saveDocument(state.document).then(() => setSaveState("saved")).catch((e) => {
        console.error("\u81EA\u52A8\u4FDD\u5B58\u5931\u8D25", e);
        setSaveState("error");
      });
    }, 1500);
    return () => {
      if (saveTimer.current !== void 0) {
        window.clearTimeout(saveTimer.current);
      }
    };
  }, [state.document]);
  const handleNew = (0, import_react4.useCallback)(() => {
    dispatch({
      type: "doc/new",
      docId: generateDocId(),
      name: "Untitled"
    });
  }, []);
  const handleLoad = (0, import_react4.useCallback)(async () => {
    const id = window.prompt("\u8F93\u5165\u6587\u6863 id\uFF1A");
    if (!id) return;
    try {
      const doc = await rpc.current?.loadDocument(id);
      if (doc) {
        dispatch({ type: "doc/load", doc });
        setSaveState("idle");
      }
    } catch (e) {
      window.alert(`\u52A0\u8F7D\u5931\u8D25: ${e instanceof Error ? e.message : String(e)}`);
    }
  }, []);
  const handleExport = (0, import_react4.useCallback)(async () => {
    try {
      const files = await rpc.current?.exportDocument(state.document);
      if (files) {
        window.alert(
          `\u5BFC\u51FA ${files.length} \u4E2A\u6587\u4EF6:
${files.map((f) => f.path).join("\n")}`
        );
      }
    } catch (e) {
      window.alert(`\u5BFC\u51FA\u5931\u8D25: ${e instanceof Error ? e.message : String(e)}`);
    }
  }, [state.document]);
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: UI.bg,
        color: UI.text,
        fontFamily: UI.fontSans,
        overflow: "hidden"
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { display: "flex", flex: 1, minHeight: 0 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
            "div",
            {
              style: { width: 240, flexShrink: 0, overflow: "hidden" },
              children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(ComponentPalette, {})
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { flex: 1, display: "flex", flexDirection: "column" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
              "div",
              {
                style: {
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  padding: `0 ${UI.space.lg}px`,
                  borderBottom: `1px solid ${UI.border}`,
                  background: UI.surface,
                  gap: UI.space.md
                },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                    "button",
                    {
                      onClick: onBack,
                      style: {
                        border: `1px solid ${UI.border}`,
                        background: UI.surfaceAlt,
                        color: UI.text,
                        borderRadius: UI.radius.md,
                        padding: `${UI.space.xs}px ${UI.space.md}px`,
                        fontSize: 13,
                        cursor: "pointer",
                        fontFamily: UI.fontSans
                      },
                      children: "\u2190 \u8FD4\u56DE\u4F1A\u8BDD"
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { fontSize: 14, fontWeight: 600 }, children: "Compose Studio" }),
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                    "span",
                    {
                      style: {
                        fontSize: 12,
                        color: saveState === "error" ? UI.destructive : saveState === "saving" ? UI.textMuted : UI.textFaint
                      },
                      children: saveState === "saving" ? "\u4FDD\u5B58\u4E2D\u2026" : saveState === "saved" ? "\u5DF2\u4FDD\u5B58" : saveState === "error" ? "\u4FDD\u5B58\u5931\u8D25" : ""
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { marginLeft: "auto", display: "flex", gap: UI.space.sm }, children: [
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                      "button",
                      {
                        onClick: handleNew,
                        title: "\u65B0\u5EFA\u6587\u6863",
                        style: {
                          border: `1px solid ${UI.border}`,
                          background: UI.surfaceAlt,
                          color: UI.text,
                          borderRadius: UI.radius.md,
                          padding: `${UI.space.xs}px ${UI.space.sm}px`,
                          fontSize: 13,
                          cursor: "pointer",
                          fontFamily: UI.fontSans
                        },
                        children: "\u65B0\u5EFA"
                      }
                    ),
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                      "button",
                      {
                        onClick: handleLoad,
                        title: "\u6253\u5F00\u6587\u6863",
                        style: {
                          border: `1px solid ${UI.border}`,
                          background: UI.surfaceAlt,
                          color: UI.text,
                          borderRadius: UI.radius.md,
                          padding: `${UI.space.xs}px ${UI.space.sm}px`,
                          fontSize: 13,
                          cursor: "pointer",
                          fontFamily: UI.fontSans
                        },
                        children: "\u6253\u5F00"
                      }
                    ),
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                      "button",
                      {
                        onClick: handleExport,
                        title: "\u5BFC\u51FA Kotlin \u5230\u5DE5\u4F5C\u533A",
                        style: {
                          border: `1px solid ${UI.border}`,
                          background: UI.surfaceAlt,
                          color: UI.text,
                          borderRadius: UI.radius.md,
                          padding: `${UI.space.xs}px ${UI.space.sm}px`,
                          fontSize: 13,
                          cursor: "pointer",
                          fontFamily: UI.fontSans
                        },
                        children: "\u5BFC\u51FA"
                      }
                    ),
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                      "button",
                      {
                        onClick: () => dispatch({ type: "ui/toggleBorders" }),
                        title: "\u663E\u793A/\u9690\u85CF\u5BB9\u5668\u8FB9\u754C",
                        style: {
                          border: `1px solid ${state.ui.showBorders ? UI.primary : UI.border}`,
                          background: state.ui.showBorders ? UI.primaryContainer : UI.surfaceAlt,
                          color: state.ui.showBorders ? UI.primary : UI.textMuted,
                          borderRadius: UI.radius.md,
                          padding: `${UI.space.xs}px ${UI.space.sm}px`,
                          fontSize: 13,
                          cursor: "pointer",
                          fontFamily: UI.fontSans
                        },
                        children: state.ui.showBorders ? "\u8FB9\u754C\u2713" : "\u8FB9\u754C"
                      }
                    ),
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                      "button",
                      {
                        onClick: () => dispatch({ type: "history/undo" }),
                        disabled: state.history.undo.length === 0,
                        title: "\u64A4\u9500\uFF08Ctrl+Z\uFF09",
                        style: {
                          border: `1px solid ${UI.border}`,
                          background: UI.surfaceAlt,
                          color: state.history.undo.length === 0 ? UI.textFaint : UI.text,
                          borderRadius: UI.radius.md,
                          padding: `${UI.space.xs}px ${UI.space.sm}px`,
                          fontSize: 13,
                          cursor: state.history.undo.length === 0 ? "default" : "pointer",
                          fontFamily: UI.fontSans,
                          opacity: state.history.undo.length === 0 ? 0.5 : 1
                        },
                        children: "\u21B6 \u64A4\u9500"
                      }
                    ),
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                      "button",
                      {
                        onClick: () => dispatch({ type: "history/redo" }),
                        disabled: state.history.redo.length === 0,
                        title: "\u91CD\u505A\uFF08Ctrl+Shift+Z\uFF09",
                        style: {
                          border: `1px solid ${UI.border}`,
                          background: UI.surfaceAlt,
                          color: state.history.redo.length === 0 ? UI.textFaint : UI.text,
                          borderRadius: UI.radius.md,
                          padding: `${UI.space.xs}px ${UI.space.sm}px`,
                          fontSize: 13,
                          cursor: state.history.redo.length === 0 ? "default" : "pointer",
                          fontFamily: UI.fontSans,
                          opacity: state.history.redo.length === 0 ? 0.5 : 1
                        },
                        children: "\u21B7 \u91CD\u505A"
                      }
                    )
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Canvas, { state, dispatch })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
            "div",
            {
              style: {
                width: 320,
                flexShrink: 0,
                borderLeft: `1px solid ${UI.border}`,
                background: UI.surface,
                overflow: "auto"
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Inspector, { state, dispatch })
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(ChatPanel, {})
      ]
    }
  );
}
function PanelIcon({ onClick }) {
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
    "button",
    {
      onClick: (e) => {
        e.stopPropagation();
        onClick();
      },
      title: "Compose Studio\uFF08\u53EF\u89C6\u5316\u7F16\u8F91\u5668\uFF09",
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "4px 8px",
        borderRadius: 6,
        border: "none",
        background: "transparent",
        color: "currentColor",
        cursor: "pointer",
        fontSize: 12,
        lineHeight: 1
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
          "svg",
          {
            width: "14",
            height: "14",
            viewBox: "0 0 16 16",
            fill: "currentColor",
            style: { flexShrink: 0 },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("rect", { x: "1", y: "1", width: "14", height: "4.5", rx: "1.5", opacity: "0.9" }),
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("rect", { x: "1", y: "7", width: "6", height: "8", rx: "1.5", opacity: "0.65" }),
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("rect", { x: "9", y: "7", width: "6", height: "8", rx: "1.5", opacity: "0.65" })
            ]
          }
        ),
        "Studio"
      ]
    }
  );
}
function apply(ctx) {
  ctx.effect(
    () => ctx.slots.inject(
      "main",
      () => ctx.slots.register(
        { name: "main", key: PANEL_ID },
        () => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          ComposeStudioPanel,
          {
            onBack: () => ctx.layout.selectPanel(null)
          }
        )
      )
    ),
    "compose-studio: main panel"
  );
  ctx.effect(
    () => ctx.slots.inject(
      "sidebar.footer.action",
      () => ctx.slots.register(
        {
          name: "sidebar.footer.action",
          id: PANEL_ID,
          order: 80
        },
        () => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          PanelIcon,
          {
            onClick: () => ctx.layout.selectPanel(PANEL_ID)
          }
        )
      )
    ),
    "compose-studio: sidebar entry"
  );
}
var inject = ["slots", "layout"];
return module.exports;
  },
});
//# sourceMappingURL=client.js.map
