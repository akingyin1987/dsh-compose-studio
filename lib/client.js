window.__ModuleLoader__.load({
  id: "dsh-compose-studio",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);
var import_react = __toESM(require("react"), 1);
var import_jsx_runtime = require("react/jsx-runtime");
var OPEN_EVENT = "compose-studio:open";
function ComposeStudioPanel() {
  const [visible, setVisible] = import_react.default.useState(true);
  import_react.default.useEffect(() => {
    const handler = () => setVisible(true);
    window.addEventListener(OPEN_EVENT, handler);
    return () => window.removeEventListener(OPEN_EVENT, handler);
  }, []);
  if (!visible) return null;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "div",
    {
      onClick: () => setVisible(false),
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.4)"
      },
      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "div",
        {
          onClick: (e) => e.stopPropagation(),
          style: {
            width: "80%",
            height: "80%",
            borderRadius: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
            color: "#222",
            background: "#fafafa",
            overflow: "hidden"
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
              children: "Compose Studio \u2014 Phase 0 skeleton\uFF08\u70B9\u51FB\u906E\u7F69\u5173\u95ED\uFF09"
            }
          )
        }
      )
    }
  );
}
function PanelIcon() {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "span",
    {
      onClick: () => window.dispatchEvent(new CustomEvent(OPEN_EVENT)),
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
  ctx.effect(
    () => ctx.slots.register(
      {
        name: "sidebar.footer.action",
        id: "composeStudio",
        order: 80
      },
      PanelIcon
    ),
    "compose-studio: sidebar entry"
  );
  ctx.effect(
    () => ctx.slots.register(
      {
        name: "shell.overlay",
        id: "composeStudio",
        order: 80
      },
      ComposeStudioPanel
    ),
    "compose-studio: overlay panel"
  );
}
var inject = ["slots"];
return module.exports;
  },
});
//# sourceMappingURL=client.js.map
