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
var import_jsx_runtime = require("react/jsx-runtime");
function ComposeStudioPanel() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "div",
    {
      style: {
        display: "flex",
        height: "100%",
        fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
        color: "#222",
        background: "#fafafa"
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "div",
        {
          style: {
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            color: "#666"
          },
          children: "Compose Studio \u2014 Phase 0 skeleton"
        }
      )
    }
  );
}
function PanelIcon() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "span",
    {
      style: { display: "inline-flex", fontSize: 16, color: "currentColor" },
      children: "\u25C6"
    }
  );
}
function apply(ctx) {
  ctx.slots.inject("main", function* () {
    yield ctx.slots.register(
      {
        name: "main",
        key: "composeStudio",
        children: {}
      },
      ComposeStudioPanel
    );
  });
  ctx.slots.inject(
    "sidebar.panellist",
    () => ctx.slots.register(
      {
        name: "sidebar.panellist",
        id: "composeStudio",
        order: 80,
        label: () => "Compose Studio"
      },
      PanelIcon
    )
  );
}
var inject = ["slots", "layout", "locale"];
return module.exports;
  },
});
//# sourceMappingURL=client.js.map
