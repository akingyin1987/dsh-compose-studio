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
    type: "Scaffold",
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
    ui: { leftWidth: 240, rightWidth: 320, inspectorTab: "props" }
  };
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
var DESCRIPTORS = [
  // ---- 布局 ----
  {
    id: "layout.Column",
    composable: "Column",
    fqn: "androidx.compose.foundation.layout.Column",
    category: "layout",
    brief: "\u5782\u76F4\u5E03\u5C40\u5BB9\u5668",
    icon: "columns",
    defaultProps: [
      { kind: "dp", key: "spacing", label: "\u95F4\u8DDD", default: 8 }
    ],
    codegen: {
      imports: ["androidx.compose.foundation.layout.Column"],
      render: "container"
    },
    preview: { kind: "container" },
    tags: ["column", "vertical", "layout", "\u6392\u5217"]
  },
  {
    id: "layout.Row",
    composable: "Row",
    fqn: "androidx.compose.foundation.layout.Row",
    category: "layout",
    brief: "\u6C34\u5E73\u5E03\u5C40\u5BB9\u5668",
    icon: "rows",
    defaultProps: [
      { kind: "dp", key: "spacing", label: "\u95F4\u8DDD", default: 8 }
    ],
    codegen: {
      imports: ["androidx.compose.foundation.layout.Row"],
      render: "container"
    },
    preview: { kind: "container" },
    tags: ["row", "horizontal", "layout"]
  },
  {
    id: "layout.Box",
    composable: "Box",
    fqn: "androidx.compose.foundation.layout.Box",
    category: "layout",
    brief: "\u5C42\u53E0\u5E03\u5C40\u5BB9\u5668",
    icon: "box",
    defaultProps: [],
    codegen: {
      imports: ["androidx.compose.foundation.layout.Box"],
      render: "container"
    },
    preview: { kind: "container" },
    tags: ["box", "stack", "layout"]
  },
  // ---- Material 3 ----
  {
    id: "m3.Text",
    composable: "Text",
    fqn: "androidx.compose.material3.Text",
    category: "material3",
    brief: "\u6587\u672C",
    icon: "type",
    defaultProps: [
      { kind: "string", key: "text", label: "\u6587\u672C", default: "Text" },
      { kind: "text-style", key: "style", label: "\u6837\u5F0F" }
    ],
    codegen: { imports: ["androidx.compose.material3.Text"], render: "leaf" },
    preview: { kind: "text", text: "Text" },
    tags: ["text", "label", "title", "\u6587\u672C"]
  },
  {
    id: "m3.Button",
    composable: "Button",
    fqn: "androidx.compose.material3.Button",
    category: "material3",
    brief: "\u6309\u94AE\uFF08\u542B content \u69FD\uFF09",
    icon: "mouse-pointer-click",
    defaultProps: [
      { kind: "event", key: "onClick", label: "\u70B9\u51FB", actions: ["onClick"] }
    ],
    defaultChildren: { slotProp: "content" },
    codegen: {
      imports: ["androidx.compose.material3.Button"],
      render: "slot",
      slotProp: "content"
    },
    preview: { kind: "button", text: "Button" },
    tags: ["button", "click", "action", "\u6309\u94AE"]
  },
  {
    id: "m3.TextField",
    composable: "TextField",
    fqn: "androidx.compose.material3.TextField",
    category: "material3",
    brief: "\u6587\u672C\u8F93\u5165\u6846",
    icon: "text-cursor-input",
    defaultProps: [
      { kind: "string", key: "label", label: "\u6807\u7B7E", default: "Label" },
      { kind: "string", key: "value", label: "\u503C", default: "" },
      {
        kind: "event",
        key: "onValueChange",
        label: "\u503C\u53D8\u5316",
        actions: ["onValueChange"]
      }
    ],
    codegen: { imports: ["androidx.compose.material3.TextField"], render: "leaf" },
    preview: { kind: "field", text: "TextField" },
    tags: ["textfield", "input", "\u8F93\u5165"]
  },
  {
    id: "m3.Card",
    composable: "Card",
    fqn: "androidx.compose.material3.Card",
    category: "material3",
    brief: "\u5361\u7247\u5BB9\u5668",
    icon: "square",
    defaultProps: [],
    defaultChildren: { slotProp: "content" },
    codegen: {
      imports: ["androidx.compose.material3.Card"],
      render: "slot",
      slotProp: "content"
    },
    preview: { kind: "container" },
    tags: ["card", "surface", "\u5361\u7247"]
  },
  {
    id: "m3.Scaffold",
    composable: "Scaffold",
    fqn: "androidx.compose.material3.Scaffold",
    category: "material3",
    brief: "Material 3 \u811A\u624B\u67B6\uFF08\u6839\u5BB9\u5668\uFF09",
    icon: "layout-template",
    defaultProps: [],
    defaultChildren: { slotProp: "content" },
    codegen: {
      imports: ["androidx.compose.material3.Scaffold"],
      render: "slot",
      slotProp: "content"
    },
    preview: { kind: "container" },
    tags: ["scaffold", "screen", "\u9875\u9762"]
  },
  {
    id: "m3.TopAppBar",
    composable: "TopAppBar",
    fqn: "androidx.compose.material3.TopAppBar",
    category: "material3",
    brief: "\u9876\u90E8\u5E94\u7528\u680F",
    icon: "panel-top",
    defaultProps: [
      { kind: "string", key: "title", label: "\u6807\u9898", default: "Title" }
    ],
    codegen: {
      imports: [
        "androidx.compose.material3.TopAppBar",
        "androidx.compose.material3.Text"
      ],
      render: "slot",
      slotProp: "title"
    },
    preview: { kind: "container" },
    tags: ["topbar", "appbar", "header", "\u9876\u680F"]
  },
  // ---- 内容 ----
  {
    id: "content.Image",
    composable: "Image",
    fqn: "androidx.compose.foundation.Image",
    category: "content",
    brief: "\u56FE\u7247",
    icon: "image",
    defaultProps: [
      { kind: "string", key: "url", label: "\u56FE\u7247\u5730\u5740", default: "" },
      { kind: "dp", key: "width", label: "\u5BBD", default: 100 },
      { kind: "dp", key: "height", label: "\u9AD8", default: 100 }
    ],
    codegen: { imports: ["androidx.compose.foundation.Image"], render: "leaf" },
    preview: { kind: "image" },
    tags: ["image", "picture", "\u56FE\u7247"]
  },
  {
    id: "content.Icon",
    composable: "Icon",
    fqn: "androidx.compose.material3.Icon",
    category: "content",
    brief: "\u56FE\u6807",
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
    codegen: { imports: ["androidx.compose.material3.Icon"], render: "leaf" },
    preview: { kind: "icon" },
    tags: ["icon", "\u56FE\u6807"]
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

// src/client/palette/ComponentPalette.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var DND_MIME = "application/x-compose-studio";
function DescriptorItem({ descriptor }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "div",
    {
      draggable: true,
      onDragStart: (e) => {
        e.dataTransfer.setData(DND_MIME, descriptor.id);
        e.dataTransfer.effectAllowed = "copy";
      },
      title: descriptor.brief,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        margin: "2px 0",
        borderRadius: 6,
        background: "#f5f5f5",
        cursor: "grab",
        fontSize: 13
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: "#888", fontSize: 11 }, children: "\u25C6" }),
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
        borderRight: "1px solid #e0e0e0",
        background: "#fff"
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { padding: 12 }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "input",
          {
            type: "text",
            placeholder: "\u641C\u7D22\u7EC4\u4EF6\u2026",
            value: query,
            onChange: (e) => setQuery(e.target.value),
            style: {
              width: "100%",
              padding: "6px 10px",
              border: "1px solid #d0d0d0",
              borderRadius: 6,
              fontSize: 13,
              boxSizing: "border-box"
            }
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { flex: 1, overflow: "auto", padding: "0 12px 12px" }, children: query ? results.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { color: "#999", fontSize: 12, padding: 8 }, children: "\u65E0\u5339\u914D\u7EC4\u4EF6" }) : results.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DescriptorItem, { descriptor: d }, d.id)) : CATALOG.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginBottom: 12 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "div",
            {
              style: {
                fontSize: 12,
                fontWeight: 600,
                color: "#666",
                marginBottom: 4
              },
              children: cat.label
            }
          ),
          cat.children.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DescriptorItem, { descriptor: d }, d.id))
        ] }, cat.id)) })
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
  button: {
    background: "#6750A4",
    color: "#FFFFFF",
    borderRadius: 20,
    padding: "8px 20px",
    fontSize: 14,
    fontWeight: 500,
    border: "none",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center"
  },
  card: {
    borderRadius: 12,
    border: "1px solid #E7E0EC",
    background: "#FFFBFE",
    padding: 12
  },
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
  textField: {
    border: "1px solid #79747E",
    borderRadius: 4,
    padding: "10px 12px",
    fontSize: 14,
    background: "#fff",
    minWidth: 160
  },
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
    minHeight: "100%",
    background: "#FFFBFE"
  }
};
function PreviewNode({
  node,
  onSelect
}) {
  const isRoot = node.depth === 0;
  const selected = node.selected;
  const wrapperStyle = {
    outline: selected ? "2px solid #1976d2" : void 0,
    outlineOffset: 1,
    cursor: "pointer",
    position: "relative"
  };
  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(node.id);
  };
  const children = node.children.length > 0 ? node.children.map((child) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(PreviewNode, { node: child, onSelect }, child.id)) : null;
  switch (node.type) {
    case "layout.Column":
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { ...wrapperStyle, display: "flex", flexDirection: "column", gap: Number(node.props.spacing ?? 8) }, onClick: handleClick, children });
    case "layout.Row":
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { ...wrapperStyle, display: "flex", gap: Number(node.props.spacing ?? 8), alignItems: "center" }, onClick: handleClick, children });
    case "layout.Box":
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: wrapperStyle, onClick: handleClick, children });
    case "m3.Text":
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { ...wrapperStyle, ...M3.text(Number(node.props.fontSize ?? 14), Number(node.props.fontWeight ?? 400)) }, onClick: handleClick, children: String(node.props.text ?? node.text ?? "Text") });
    case "m3.Button":
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { style: { ...wrapperStyle, ...M3.button }, onClick: (e) => {
        e.stopPropagation();
        onSelect(node.id);
      }, children: children ?? String(node.props.text ?? "Button") });
    case "m3.TextField":
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: wrapperStyle, onClick: handleClick, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "input",
        {
          style: M3.textField,
          placeholder: String(node.props.label ?? "TextField"),
          readOnly: true
        }
      ) });
    case "m3.Card":
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { ...wrapperStyle, ...M3.card }, onClick: handleClick, children });
    case "m3.Scaffold":
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { ...wrapperStyle, ...M3.scaffold }, onClick: handleClick, children });
    case "m3.TopAppBar":
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { ...wrapperStyle, ...M3.topBar }, onClick: handleClick, children: String(node.props.title ?? "Title") });
    case "content.Image": {
      const w = Number(node.props.width ?? 100);
      const h = Number(node.props.height ?? 100);
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { ...wrapperStyle, ...M3.image, width: w, height: h }, onClick: handleClick, children: "Image" });
    }
    case "content.Icon":
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: { ...wrapperStyle, ...M3.icon }, onClick: handleClick, children: String(node.props.name ?? "star") === "star" ? "\u2605" : String(node.props.name ?? "\u2605") });
    default:
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { style: { ...wrapperStyle, padding: 4, color: "#888", fontSize: 12 }, onClick: handleClick, children: node.type });
  }
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
function Canvas({
  state,
  dispatch
}) {
  const { document, device, selection } = state;
  const selectedIds = (0, import_react2.useMemo)(
    () => new Set(selection.ids),
    [selection.ids]
  );
  const tree = (0, import_react2.useMemo)(
    () => buildRenderTree(document, selectedIds),
    [document, selectedIds]
  );
  const activeDevice = getBuiltinDevice(device.activeId);
  const widthDp = activeDevice?.widthDp ?? 360;
  const heightDp = activeDevice?.heightDp ?? 800;
  const handleSelect = (id) => {
    dispatch({ type: "selection/set", ids: [id], anchorId: id });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
    "div",
    {
      style: {
        flex: 1,
        overflow: "auto",
        background: "#f0f2f5",
        padding: 24
      },
      onClick: () => dispatch({ type: "selection/set", ids: [], anchorId: null }),
      children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
        "div",
        {
          style: {
            transform: `scale(${device.zoom})`,
            transformOrigin: "top center",
            width: widthDp,
            minHeight: heightDp,
            margin: "0 auto",
            background: "#fff",
            border: "1px solid #d0d0d0",
            borderRadius: 8,
            padding: 8,
            boxSizing: "border-box",
            backgroundImage: device.showGrid ? "linear-gradient(#f5f5f5 1px, transparent 1px), linear-gradient(90deg, #f5f5f5 1px, transparent 1px)" : "none",
            backgroundSize: "20px 20px"
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(PreviewNode, { node: tree, onSelect: handleSelect })
        }
      )
    }
  );
}

// src/client/inspector/Inspector.tsx
var import_jsx_runtime4 = require("react/jsx-runtime");
function FieldRow({
  label,
  children
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { marginBottom: 10 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 12, color: "#666", marginBottom: 4 }, children: label }),
    children
  ] });
}
var inputStyle = {
  width: "100%",
  padding: "5px 8px",
  border: "1px solid #d0d0d0",
  borderRadius: 4,
  fontSize: 13,
  boxSizing: "border-box"
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
          onChange: (e) => onChange(e.target.checked)
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
          style: { width: 40, height: 28, padding: 0 },
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
      return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(FieldRow, { label: schema.label, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { display: "flex", gap: 8 }, children: [
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
      return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(FieldRow, { label: schema.label, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { fontSize: 12, color: "#999" }, children: [
        "\u4E8B\u4EF6\uFF08",
        schema.actions.join(", "),
        "\uFF09\u2014 Phase 1 \u6682\u4E3A\u5360\u4F4D"
      ] }) });
    case "slot":
      return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(FieldRow, { label: schema.label, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { fontSize: 12, color: "#999" }, children: [
        "\u69FD\uFF08\u63A5\u53D7: ",
        schema.accepts.join(", "),
        "\uFF09"
      ] }) });
    default:
      return null;
  }
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
          padding: 16,
          color: "#999",
          fontSize: 13,
          textAlign: "center"
        },
        children: [
          "\u672A\u9009\u4E2D\u8282\u70B9",
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 11, marginTop: 4 }, children: "\u70B9\u51FB\u753B\u5E03\u4E2D\u7684\u8282\u70B9\u67E5\u770B\u5C5E\u6027" })
        ]
      }
    );
  }
  const descriptor = findDescriptor(node.type);
  const propSchemas = descriptor?.defaultProps ?? [];
  const handleChange = (key, value) => {
    dispatch({
      type: "node/updateProps",
      id: node.id,
      patch: { [key]: value }
    });
  };
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { style: { padding: 12 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
      "div",
      {
        style: {
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 8,
          paddingBottom: 8,
          borderBottom: "1px solid #eee"
        },
        children: [
          node.type,
          node.label ? ` \xB7 ${node.label}` : ""
        ]
      }
    ),
    propSchemas.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { style: { fontSize: 12, color: "#999" }, children: "\u8BE5\u7EC4\u4EF6\u65E0\u53EF\u914D\u7F6E\u5C5E\u6027" }) : propSchemas.map((schema) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      PropField,
      {
        schema,
        value: node.props[schema.key],
        onChange: (v) => handleChange(schema.key, v)
      },
      schema.key
    ))
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
        borderTop: "1px solid #e0e0e0",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        maxHeight: 200
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { style: { flex: 1, overflow: "auto", padding: "8px 12px" }, children: messages.map((m) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          "div",
          {
            style: {
              marginBottom: 6,
              fontSize: 12,
              textAlign: m.role === "user" ? "right" : "left"
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
              "span",
              {
                style: {
                  display: "inline-block",
                  padding: "4px 10px",
                  borderRadius: 8,
                  background: m.role === "user" ? "#e3f2fd" : "#f5f5f5",
                  maxWidth: "80%"
                },
                children: m.text
              }
            )
          },
          m.id
        )) }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { style: { display: "flex", gap: 8, padding: "8px 12px" }, children: [
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
                padding: "8px 12px",
                border: "1px solid #d0d0d0",
                borderRadius: 6,
                fontSize: 13
              }
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            "button",
            {
              onClick: handleSend,
              style: {
                padding: "8px 16px",
                border: "none",
                borderRadius: 6,
                background: "#6750A4",
                color: "#fff",
                fontSize: 13,
                cursor: "pointer"
              },
              children: "\u53D1\u9001"
            }
          )
        ] })
      ]
    }
  );
}

// src/client/index.tsx
var import_jsx_runtime6 = require("react/jsx-runtime");
function ComposeStudioPanel({ onClose }) {
  const [state, dispatch] = (0, import_react4.useReducer)(reducer, null, createInitialState);
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: "#fafafa",
        overflow: "hidden"
      },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { style: { display: "flex", flex: 1, minHeight: 0 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
            "div",
            {
              style: {
                width: 240,
                flexShrink: 0,
                borderRight: "1px solid #e0e0e0",
                background: "#fff",
                overflow: "hidden"
              },
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
                  padding: "0 16px",
                  borderBottom: "1px solid #e0e0e0",
                  background: "#fff",
                  gap: 12
                },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
                    "button",
                    {
                      onClick: onClose,
                      style: {
                        border: "1px solid #d0d0d0",
                        background: "#fff",
                        borderRadius: 6,
                        padding: "4px 12px",
                        fontSize: 13,
                        cursor: "pointer"
                      },
                      children: "\u2190 \u8FD4\u56DE\u4F1A\u8BDD"
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { style: { fontSize: 14, fontWeight: 600 }, children: "Compose Studio" })
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
                borderLeft: "1px solid #e0e0e0",
                background: "#fff",
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
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
    "span",
    {
      onClick: (e) => {
        e.stopPropagation();
        onClick();
      },
      title: "Compose Studio",
      style: {
        display: "inline-flex",
        fontSize: 16,
        color: "currentColor",
        cursor: "pointer"
      },
      children: "\u25C6"
    }
  );
}
function apply(ctx) {
  console.log("[compose-studio] apply called");
  try {
    let disposeEditor = null;
    const closeEditor = () => {
      disposeEditor?.();
      disposeEditor = null;
    };
    const openEditor = () => {
      if (disposeEditor) return;
      disposeEditor = ctx.slots.inject(
        "conversation",
        () => ctx.slots.register(
          {
            name: "conversation"
          },
          // wrapper：注入 onClose（slot 组件参数由框架注入）
          () => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(ComposeStudioPanel, { onClose: closeEditor })
        )
      );
    };
    ctx.effect(
      () => ctx.slots.inject(
        "sidebar.footer.action",
        () => ctx.slots.register(
          {
            name: "sidebar.footer.action",
            id: "composeStudio",
            order: 80
          },
          () => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(PanelIcon, { onClick: openEditor })
        )
      ),
      "compose-studio: sidebar entry"
    );
    console.log("[compose-studio] apply OK");
  } catch (e) {
    console.error("[compose-studio] apply FAILED:", e);
    throw e;
  }
}
var inject = ["slots"];
return module.exports;
  },
});
//# sourceMappingURL=client.js.map
