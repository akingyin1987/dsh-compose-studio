# DSH Compose Studio 插件设计文档

> 版本：v0.1（草案）
> 日期：2026-11-08
> 状态：架构设计 / 头脑风暴
> 目标框架：DSH（DeepSeek Harness）≥ 0.1.5

---

## 0. 术语表

| 术语 | 含义 |
|---|---|
| DSH | DeepSeek Harness，基于 Cordis 的插件化 Agent Harness |
| Profile | DSH 启动配置单元，由若干 bundle 层叠 + patch 覆盖组成 |
| Bundle | 一组插件包，声明在 profile `package.json` 的 `dsh.profile.bundles` |
| Cordis | DSH 使用的插件框架（`@deepseek-ai/cordis`），提供服务/生命周期/插槽 |
| Slot | 客户端 UI 插槽，插件通过 `ctx.slots.register/inject` 注册界面 |
| Tool | 通过 `defineTool` 注册给模型调用的工具 |
| Half | 插件的双半：服务端（Node.js）与客户端（浏览器） |
| M3 | Material 3 设计规范 |
| CMP | Compose Multiplatform |
| IR | 中间表示（Intermediate Representation），代码生成的抽象语法树 |

---

## 1. 背景与目标

### 1.1 DSH 插件体系速览（调研结论）

通过对本机 `~/.dsh` 与 `@deepseek-ai/dsh` 包的实际调研，确认以下事实：

1. **启动模型**：`dsh --profile <name>` 启动一个 profile；profile 位于 `~/.dsh/profiles/<name>/`，含 `cordis.yml`（空入口列表）、`cordis.patch.yml`（用户覆盖层）、`package.json`（声明 bundles）。
2. **层叠组合**：最终配置树 = 各 bundle 的 `cordis.patch.yml` 依次叠加 → profile 的 `cordis.patch.yml` → `--patch` 覆盖层。
3. **插件包契约**：npm 包在 `package.json` 的 `dsh` 字段声明：
   - `dsh.bundle.patch`：指向插件自带 `cordis.patch.yml`（挂载声明）；
   - `dsh.client.platform`：`"web"`；
   - `dsh.client.inject`：客户端依赖的宿主包（如 `dsh-client-ui-slots`、`dsh-client-ui-primitives`、`dsh-client-locale`）。
4. **双半入口**：
   - 服务端：`main` → `lib/index.js`（ESM，Cordis 插件 `apply(ctx)`）；
   - 客户端：`exports["./client"]` → `lib/client.js`，由 `window.__ModuleLoader__.load({ id, factory })` 加载。
5. **客户端 UI 契约**（2026-11-09 实测修订）：`ctx.effect(() => ctx.slots.register(options, Component))`；`SlotMap` 通过 `declare module '@deepseek-ai/dsh-client-ui-slots'` 扩充（interface 合并）。list slot（`shell.overlay`、`sidebar.footer.action`）可安全注册；single slot（`root`/`sidebar`/`conversation`/`details`）被宿主占用，注册会 shadow。
6. **服务端能力**：`ctx.tools.register(defineTool({...}))`、`ctx.webServer.register({ kind: "prefix", path, handler })`、`ctx.llm.stream(options)`、`ctx.effect(disposer, label)`、schemastery `z` 配置 schema。
7. **社区先例**：`dsh-better-sidebar`、`dsh-whale-widget`、`dsh-at-file`、`dsh-context`、`dsh-cost-meter`、`@nanmicoder/dsh-agent-teams` 等（均为 npm 发布的 DSH 插件）。

### 1.2 插件定位

**dsh-compose-studio** 是一个 DSH 客户端插件，在 DSH Web/Desktop 界面内提供 **Android Jetpack Compose 可视化拖拽编辑器**，并以 LLM 为辅助生成高质量 Compose 代码。

### 1.3 功能目标

| 编号 | 功能 | 优先级 |
|---|---|---|
| F1 | 三栏可视化编辑面板（组件树 / 画布 / 属性面板） | P0 |
| F2 | 画布内拖拽放置、选中、位置与尺寸调整 | P0 |
| F3 | 多端预览（手机 / 平板 / CMP） | P1 |
| F4 | Material 3 主题预览与动态调整 | P1 |
| F5 | LLM 辅助封装/生成 Compose 组件代码 | P1 |
| F6 | 代码导出到工作区、可测试性设计 | P0 |
| F7 | 文档持久化（自动保存 / 版本） | P1 |

### 1.4 设计原则

1. **契约优先**：先固定 Slot / Tool / Config / 文档模型契约，再实现。
2. **双半分离**：服务端只做"能力提供"（工具、RPC、代码生成、LLM），客户端只做"交互与呈现"；两者通过版本化 RPC 通信。
3. **单一数据源**：画布文档为不可变对象，所有编辑经 Reducer；属性面板与画布订阅同一 store。
4. **纯函数代码生成**：`generate(doc, options)` 无副作用、可快照测试。
5. **渐进增强**：无 LLM 时仍是完整可视化编辑器；无网络时仍可本地生成。
6. **最小权限**：仅在当前工作区边界内写文件，导出前需用户确认。

---

## 2. 总体架构

```
┌──────────────────────────────────────────────────────────────────┐
│                        DSH Host (Cordis)                          │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────────┐  │
│  │ dsh-tools   │  │ dsh-llm     │  │ dsh-webServer / ws       │  │
│  │ (ToolRuntime)│  │ (LlmRuntime)│  │ (HTTP + WebSocket)       │  │
│  └──────┬──────┘  └──────┬──────┘  └────────────┬─────────────┘  │
│         │                │                      │                 │
│  ┌──────┴────────────────┴──────────────────────┴──────────────┐  │
│  │           Server Half — lib/index.js (Cordis Plugin)         │  │
│  │  ┌────────────┐ ┌────────────┐ ┌──────────┐ ┌────────────┐  │  │
│  │  │ Tool       │ │ RpcRouter  │ │ Codegen  │ │ LlmGateway │  │  │
│  │  │ Registry   │ │ /compose-  │ │ Engine   │ │ (prompt/   │  │  │
│  │  │            │ │ studio/*   │ │ (pure)   │ │  stream)   │  │  │
│  │  └────────────┘ └────────────┘ └──────────┘ └────────────┘  │  │
│  │  ┌────────────┐ ┌────────────┐ ┌──────────┐                │  │
│  │  │ Config     │ │ Workspace  │ │ Document │                │  │
│  │  │ Schema     │ │ FileStore  │ │ Repository│               │  │
│  │  └────────────┘ └────────────┘ └──────────┘                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │           Client Half — lib/client.js (React)                │ │
│  │  slot: "main" key=composeStudio                              │ │
│  │  ┌───────────┬───────────────────────────┬────────────────┐  │ │
│  │  │ Component │        Canvas              │   Inspector    │  │ │
│  │  │ Palette   │  ┌──────────────────────┐ │ (prop forms)   │  │ │
│  │  │ (tree)    │  │ React Overlay        │ │                │  │ │
│  │  │           │  │ (select/dnd/handles) │ │                │  │ │
│  │  │           │  ├──────────────────────┤ │                │  │ │
│  │  │           │  │ Compose Web Surface  │ │                │  │ │
│  │  │           │  │ (real M3 render)     │ │                │  │ │
│  │  │           │  └──────────────────────┘ │                │  │ │
│  │  └───────────┴───────────────────────────┴────────────────┘  │ │
│  │  ┌────────────────────────────────────────────────────────┐  │ │
│  │  │ Store (document / selection / theme / device / history) │  │ │
│  │  └────────────────────────────────────────────────────────┘  │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Preview Runtime — @dsh-compose-studio/preview-runtime        │ │
│  │  (Kotlin/JS + Compose for Web, 发布为 npm 包)                 │ │
│  │  renderPreview(ir, theme, device) → HTMLElement / WebComponent│ │
│  └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### 2.1 关键设计决策（头脑风暴结论）

| 决策点 | 选项 | 结论 | 理由 |
|---|---|---|---|
| 编辑器宿主 | A. 主面板（main slot） B. 右侧栏 tab | **C. list slot 浮层**（实测修正） | DSH 0.1.0-rc.7 无 main keyed slot（臆测）；用 `sidebar.footer.action` 入口 + `shell.overlay` 浮层实现 |
| 预览保真 | A. React 模拟 B. Compose Web 真实渲染 | **B Compose Web 真实渲染** | 预览与生成的 Compose 代码**同源**，避免"预览好看、真机不同"；用户明确要求高保真 |
| 客户端框架 | React（宿主一致） / 自研 | **React** | 宿主 `dsh-client-ui-*` 均为 React，primitives 可直接复用；预览层用 React overlay 覆盖 Compose Web |
| 状态管理 | 自研 store / dsh-client-store | **dsh-client-store** | 宿主提供的响应式快照 store，与 slot 订阅机制一致 |
| 文档模型 | 树形节点 / 扁平 map | **树形 + id 引用** | 直观、易序列化、易做 undo |
| 代码生成位置 | 服务端 / 客户端 | **服务端（纯函数）** | 可复用、可测试、可离线；客户端只做预览 |
| LLM 调用 | 插件直连 / 经 `ctx.llm` | **经 `ctx.llm`** | 复用宿主的模型路由、鉴权、重试、计量 |
| 持久化 | 工作区文件 / DSH storage | **工作区文件** | 用户可版本控制、可导出；DSH storage 仅缓存 UI 偏好 |
| MVP 范围 | 编排闭环 / 主题优先 / LLM 优先 | **编排+代码生成闭环** | 先跑通端到端价值，主题与 LLM 后置 |

---

## 3. 模块划分

```
dsh-compose-studio/
├── package.json
├── cordis.patch.yml
├── tsconfig.json
├── build.mjs
├── lib/
│   ├── index.js            # 服务端入口（Cordis apply）
│   ├── client.js           # 客户端入口（__ModuleLoader__）
│   ├── invariant.js        # 双半共享常量（slot 名、事件名、版本）
│   └── types/              # 生成的 .d.ts
├── src/
│   ├── shared/             # 双半共享：契约、文档模型、schema 校验
│   │   ├── contract.ts     # Slot 名 / 事件名 / RPC 方法名 / 版本
│   │   ├── document.ts     # CanvasDocument / Node / PropSchema 类型
│   │   ├── theme.ts        # ThemeSpec / M3 token 定义
│   │   ├── device.ts       # DeviceProfile 预设
│   │   └── validate.ts     # 文档校验（版本兼容）
│   ├── server/
│   │   ├── index.ts        # apply(ctx)：注册工具、RPC、schema
│   │   ├── config.ts       # schemastery 配置 schema + 默认值
│   │   ├── tools.ts        # defineTool 定义
│   │   ├── rpc.ts          # HTTP + WebSocket 路由
│   │   ├── codegen/
│   │   │   ├── index.ts    # generate(doc, opts) → FileOutput[]
│   │   │   ├── ir.ts       # IR 构建
│   │   │   ├── render.ts   # IR → Kotlin 源码
│   │   │   ├── templates/  # 组件模板片段
│   │   │   └── test/       # 快照测试
│   │   ├── llm/
│   │   │   ├── gateway.ts  # ctx.llm 封装
│   │   │   ├── prompts.ts  # system / few-shot
│   │   │   └── parse.ts    # 流式输出 → 结构化
│   │   └── store/
│   │       ├── repository.ts # 文档读写
│   │       └── workspace.ts  # 工作区文件读写（含 fence）
│   └── client/
│       ├── index.ts        # apply(ctx)：注册 main/panellist slot
│       ├── store.ts        # 客户端 store（document/selection/theme/device/history）
│       ├── palette/
│       │   ├── ComponentPalette.tsx
│       │   └── categoryTree.ts
│       ├── canvas/
│       │   ├── Canvas.tsx
│       │   ├── NodeView.tsx
│       │   ├── TransformHandles.tsx
│       │   ├── drag.ts
│       │   └── devices.ts
│       ├── inspector/
│       │   ├── Inspector.tsx
│       │   ├── PropField.tsx
│       │   └── fields/     # string/number/enum/color/dp/event/slot
│       ├── theme/
│       │   ├── ThemePanel.tsx
│       │   └── m3Tokens.ts
│       ├── preview/
│       │   ├── PreviewHost.tsx   # 挂载 Compose Web surface + React overlay
│       │   └── bridge.ts         # IR/theme/device → runtime 序列化
│       └── rpc.ts          # 客户端 RPC 客户端
├── preview-runtime/        # 独立包：@dsh-compose-studio/preview-runtime
│   ├── build.gradle.kts    # Kotlin/JS + Compose for Web
│   ├── src/commonMain/kotlin/
│   │   ├── Render.kt       # renderPreview(ir, theme, device)
│   │   ├── components/     # 与生成的 Compose 代码同源的组件实现
│   │   └── theme/          # M3 token 解析
│   └── package.json        # 发布为 npm（kotlin/JS 产物）
└── README.md
```

### 3.1 模块职责

| 模块 | 职责 | 关键契约 |
|---|---|---|
| M0 shared/contract | 双半共享常量与版本 | `SLOT_MAIN`、`SLOT_PANELLIST`、`RPC_PREFIX`、`PROTOCOL_VERSION` |
| M1 palette | 组件分类树、搜索、拖拽源 | `ComponentCatalog` |
| M2 canvas | 画布渲染、拖放、选中、变换 | `CanvasDocument` |
| M3 inspector | 属性表单、实时绑定 | `PropSchema` |
| M4 theme | M3 主题编辑与预览 | `ThemeSpec` |
| M5 codegen | IR 构建 + Kotlin 渲染 | `generate(doc, opts)` |
| M6 llm | LLM 网关、prompt、流式解析 | `compose_studio_generate` |
| M7 preview | 组件 → 预览映射契约 | `PreviewSpec` |
| M8 store | 文档持久化、导出 | `Repository` |
| M9 preview-runtime | Compose Web 真实渲染运行时（独立 npm 包，Kotlin/JS） | `renderPreview(ir, theme, device)` |

---

## 4. 插件与 DSH 的交互契约

### 4.1 包清单（package.json）

```jsonc
{
  "name": "dsh-compose-studio",
  "version": "0.1.0",
  "description": "Visual drag-and-drop editor for Jetpack Compose, inside DSH",
  "type": "module",
  "main": "lib/index.js",
  "types": "lib/types/invariant.d.ts",
  "exports": {
    ".": { "types": "./lib/types/invariant.d.ts", "default": "./lib/index.js" },
    "./client": { "types": "./lib/types/client/index.d.ts", "default": "./lib/client.js" },
    "./invariant": { "default": "./lib/invariant.js" },
    "./package.json": "./package.json"
  },
  "engines": { "node": ">=20" },
  "dsh": {
    "bundle": { "patch": "./cordis.patch.yml" },
    "client": {
      "platform": "web",
      "inject": [
        "@deepseek-ai/dsh-client-ui-slots",
        "@deepseek-ai/dsh-client-ui-primitives",
        "@deepseek-ai/dsh-client-locale",
        "@deepseek-ai/dsh-client-store"
      ]
    }
  },
  "files": ["lib", "cordis.patch.yml", "README.md", "LICENSE"],
  "scripts": {
    "build": "node build.mjs",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  }
}
```

### 4.2 cordis.patch.yml（挂载声明）

```yaml
# 插件自挂载：dsh plugin --profile <name> add dsh-compose-studio 时自动追加到 bundles
- insert:
    - id: compose-studio
      name: dsh-compose-studio
```

### 4.3 服务端入口（lib/index.js）

```js
import { defineTool } from "@deepseek-ai/dsh-tools";
import z from "@deepseek-ai/schemastery";

// 注意：DSH 0.1.0-rc.7 无 "workspace" Cordis 服务（宿主为 workspaceRegistry，
// 且非 inject 声明式服务）。Phase 1 需要工作区读写时再调研正确服务名。
export const inject = ["tools", "webServer", "llm"];

export function apply(ctx) {
  // 1) 配置 schema
  ctx.effect(() => ctx.settings.register("compose-studio", ConfigSchema), "compose-studio: config");

  // 2) 工具
  ctx.effect(() => ctx.tools.register(defineTool({
    name: "compose_studio_open",
    description: "Open the Compose visual editor ...",
    parameters: { documentId: { type: "string", required: false, description: "..." } },
    output: { schema: { type: "object", properties: { opened: { type: "boolean", required: true } } },
              render: (args, v) => [{ type: "text", text: v.opened ? "Compose Studio opened." : "Failed." }] },
    execute: async (args) => { /* select main panel */ return { opened: true }; }
  })), "compose-studio: tool open");

  // 3) RPC 路由
  ctx.effect(() => ctx.webServer.register({
    kind: "prefix",
    path: "/compose-studio",
    handler: createStudioHandler(ctx)
  }), "compose-studio: rpc");
}
```

### 4.4 客户端入口（lib/client.js）

```js
window.__ModuleLoader__.load({
  id: "dsh-compose-studio",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    // ... bundled React app ...
    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
```

```ts
// src/client/index.tsx（源码形态，基于 DSH 0.1.0-rc.7 真实契约）
import type { ClientContext } from "@deepseek-ai/dsh-client-runtime/client";

// 扩充 SlotMap：声明本插件使用的 slot（interface 合并，与宿主声明一致）
declare module "@deepseek-ai/dsh-client-ui-slots" {
  interface SlotMap {
    "shell.overlay": { kind: "list"; scope: "root" };
    "sidebar.footer.action": { kind: "list"; scope: "root" };
  }
}

export const inject = ["slots"];

export function apply(ctx: ClientContext): void {
  // 侧栏入口（sidebar.footer.action，list slot，additive）
  ctx.effect(
    () => ctx.slots.register(
      { name: "sidebar.footer.action", id: "composeStudio", order: 80 },
      PanelIcon
    ),
    "compose-studio: sidebar entry"
  );

  // 编辑器浮层（shell.overlay，list slot，additive）
  ctx.effect(
    () => ctx.slots.register(
      { name: "shell.overlay", id: "composeStudio", order: 80 },
      ComposeStudioPanel
    ),
    "compose-studio: overlay panel"
  );
}
```

**实测修正（2026-11-09）**：原设计稿的 `ctx.slots.inject("main", ...)`、
`sidebar.panellist` keyed slot、`composeStudio.*` 子 slot 均为臆测，DSH 0.1.0-rc.7
中不存在。真实机制见 4.5。

### 4.5 Slot 契约（declare module 扩充）

```ts
// src/shared/invariant.ts（实测修订：移除臆测的 slot 名）
export const RPC_PREFIX = "/compose-studio";
export const PROTOCOL_VERSION = 1;
export const MAIN_PANEL_ID = "composeStudio";
// RPC 方法名保持预留（doc/load、doc/save、codegen/generate、llm/generate、theme/resolve）
```

```ts
// 真实 Slot 机制（DSH 0.1.0-rc.7 实测）：
// - SlotMap 通过 declare module "@deepseek-ai/dsh-client-ui-slots" 扩充（interface 合并）
// - ctx.slots.register(options, Component) 注册；ctx.effect 管理生命周期
// - list slot（additive，可安全注册）：shell.overlay、sidebar.footer.action
// - single slot（独占，注册会 shadow 宿主）：root（AppFrame 占用）、sidebar、conversation、details
// - 内置 slot 由宿主插件声明，本插件只注册 list 类型 slot
//
// 本插件注册：
// - sidebar.footer.action（id=composeStudio, order=80）→ 侧栏入口图标
// - shell.overlay（id=composeStudio, order=80）→ 编辑器浮层面板
```

**实测修正（2026-11-09）**：原稿的 `SLOT` 常量（main / sidebar.panellist /
composeStudio.*）为臆测，DSH 0.1.0-rc.7 中不存在这些 slot。真实机制已在上文修正。

### 4.6 Tool 契约

| Tool 名称 | 用途 | 关键参数 | 输出 |
|---|---|---|---|
| `compose_studio_open` | 打开/聚焦编辑器 | `documentId?` | `{ opened }` |
| `compose_studio_export` | 导出 Kotlin 到工作区 | `targetDir`, `overwrite` | `{ files: [{path, bytes}] }` |
| `compose_studio_generate` | LLM 生成组件代码 | `prompt`, `anchorNodeId?` | `{ ir, files, explanation }` |
| `compose_studio_apply_theme` | 应用主题到当前文档 | `theme` | `{ applied }` |
| `compose_studio_preview_snapshot` | 生成预览快照（截图/文本） | `deviceId` | `{ snapshot }` |

### 4.7 配置 schema（schemastery）

```ts
// src/server/config.ts
export const ConfigSchema = z.object({
  defaultDevice: z.union([z.const("phone"), z.const("tablet"), z.const("cmp")]).default("phone"),
  themePreset: z.string().default("material3"),
  codegen: z.object({
    language: z.union([z.const("kotlin")]).default("kotlin"),
    composeBom: z.string().default("2024.09.00"),
    packageName: z.string().default("com.example.generated"),
    usePreviewAnnotation: z.boolean().default(true),
    addModifierDefault: z.boolean().default(true),
  }).default({}),
  llm: z.object({
    enabled: z.boolean().default(true),
    model: z.string().optional(),
    maxTokens: z.number().default(4096),
    temperature: z.number().default(0.2),
  }).default({}),
  persistence: z.object({
    autoSaveMs: z.number().default(1500),
    historyLimit: z.number().default(100),
  }).default({}),
});
```

### 4.8 RPC 契约（服务端 ↔ 客户端）

采用 DSH 的 `ctx.webServer.register({ kind: "prefix", path: "/compose-studio" })` + WebSocket 通道（参考 `dsh-better-sidebar` 的 `/sidebar/api` 模式）。

| 方法 | 方向 | 载荷 | 说明 |
|---|---|---|---|
| `doc/load` | C→S | `{ id }` | 加载文档 |
| `doc/save` | C→S | `{ doc }` | 保存文档 |
| `doc/export` | C→S | `{ targetDir }` | 导出 Kotlin |
| `codegen/generate` | C→S | `{ doc, options }` | 同步代码生成 |
| `llm/generate` | C→S | `{ prompt, context }` | 流式生成（WS 推送增量） |
| `theme/resolve` | C→S | `{ theme }` | 解析 M3 token 为具体值 |
| `fs/list` | C→S | `{ dir }` | 工作区目录（用于导出选择） |

---

## 5. 核心数据结构

### 5.1 组件目录（ComponentCatalog）

```ts
interface ComponentCategory {
  id: string;                 // "layout" | "material3" | "text" | "input" | ...
  label: string;              // 多语言 key
  icon?: string;
  children: ComponentDescriptor[];
}

interface ComponentDescriptor {
  id: string;                 // 稳定 id，如 "m3.Button"
  composable: string;         // "Button"
  fqn: string;                // "androidx.compose.material3.Button"
  category: string;
  brief: string;              // 一句话说明
  docsUrl?: string;
  icon?: string;              // 预览图标（lucide 名或内置）
  defaultProps: PropSchema[]; // 默认属性集
  defaultChildren?: ChildrenSchema; // 子节点规则
  codegen: CodegenHint;       // 代码生成提示
  preview: PreviewSpec;       // 预览渲染映射
  tags: string[];             // 搜索标签
}

interface CodegenHint {
  imports: string[];          // 需要 import 的符号
  render: "leaf" | "container" | "slot";  // 渲染方式
  slotProp?: string;          // children 对应的参数名
  modifierFirst?: boolean;
  wrapperTemplate?: string;   // 可选包装模板
}
```

### 5.2 属性 Schema（PropSchema）

```ts
type PropSchema =
  | { kind: "string";  key: string; label: string; default?: string;  maxLength?: number; multiline?: boolean }
  | { kind: "boolean"; key: string; label: string; default?: boolean }
  | { kind: "number";  key: string; label: string; default?: number; min?: number; max?: number; step?: number; unit?: string }
  | { kind: "enum";    key: string; label: string; options: { value: string; label: string }[]; default?: string }
  | { kind: "color";   key: string; label: string; default?: string }   // #RRGGBB / token 名
  | { kind: "dp";      key: string; label: string; default?: number; min?: number; max?: number }
  | { kind: "spacing"; key: string; label: string; default?: { x: number; y: number } }
  | { kind: "text-style"; key: string; label: string; default?: TextStyleSpec }
  | { kind: "event";   key: string; label: string; actions: string[] }   // onClick / onValueChange ...
  | { kind: "slot";    key: string; label: string; accepts: string[] };  // children 槽（如 Button.Content）
```

### 5.3 画布文档模型（CanvasDocument）

```ts
interface CanvasDocument {
  version: 1;
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  root: ContainerNode;
  theme: ThemeSpec;
  devices: DeviceProfile[];
  activeDeviceId: string;
}

interface NodeBase {
  id: string;             // 文档内唯一
  type: string;           // 对应 ComponentDescriptor.id
  label?: string;         // 可选语义名（用于代码生成命名）
}

interface ContainerNode extends NodeBase {
  type: "Column" | "Row" | "Box" | "Scaffold" | "LazyColumn" | ...;
  props: Record<string, unknown>;
  children: string[];     // 有序子节点 id
  slots?: Record<string, string[]>; // 命名槽（如 topBar / content）
}

interface LeafNode extends NodeBase {
  type: string;
  props: Record<string, unknown>;
  text?: string;          // Text 的内容
}
```

**不变式（Invariants）**
- 任意节点至多一个父节点；`children` 中无重复 id。
- 根节点必须是容器节点。
- 删除父节点时级联删除子树。
- 所有 `children` 引用必须可解析（load 时校验）。

### 5.4 主题模型（ThemeSpec，Material 3）

```ts
interface ThemeSpec {
  dark: boolean;
  colorScheme: {
    primary: string; onPrimary: string; primaryContainer: string; onPrimaryContainer: string;
    secondary: string; onSecondary: string; secondaryContainer: string; onSecondaryContainer: string;
    tertiary: string; onTertiary: string; tertiaryContainer: string; onTertiaryContainer: string;
    error: string; onError: string; errorContainer: string; onErrorContainer: string;
    background: string; onBackground: string;
    surface: string; onSurface: string; surfaceVariant: string; onSurfaceVariant: string;
    outline: string; outlineVariant: string;
    surfaceContainer: string; surfaceContainerHigh: string; surfaceContainerHighest: string;
    surfaceContainerLow: string; surfaceContainerLowest: string;
    inverseSurface: string; inverseOnSurface: string; inversePrimary: string;
    scrim: string;
  };
  typography: {
    displayLarge: TextStyle; displayMedium: TextStyle; displaySmall: TextStyle;
    headlineLarge: TextStyle; headlineMedium: TextStyle; headlineSmall: TextStyle;
    titleLarge: TextStyle; titleMedium: TextStyle; titleSmall: TextStyle;
    bodyLarge: TextStyle; bodyMedium: TextStyle; bodySmall: TextStyle;
    labelLarge: TextStyle; labelMedium: TextStyle; labelSmall: TextStyle;
  };
  shapes: { extraSmall: number; small: number; medium: number; large: number; extraLarge: number };
}

interface TextStyle {
  fontFamily?: string;      // 默认 "Roboto"
  fontSize?: number;       // sp
  fontWeight?: "W100" | ... | "W900";
  lineHeight?: number;
  letterSpacing?: number;
  textDecoration?: "none" | "lineThrough";
}
```

### 5.5 设备配置（DeviceProfile）

```ts
interface DeviceProfile {
  id: string;
  label: string;
  platform: "phone" | "tablet" | "cmp";
  widthDp: number;
  heightDp: number;
  density: number;          // 像素密度
  frameRadiusPx: number;    // 外框圆角
  showStatusBar: boolean;
  // CMP 额外
  cmpTarget?: "android" | "ios" | "desktop" | "web";
}

const BUILTIN_DEVICES: DeviceProfile[] = [
  { id: "phone",  label: "Phone",  platform: "phone",  widthDp: 360, heightDp: 800, density: 2.75, frameRadiusPx: 32, showStatusBar: true },
  { id: "tablet", label: "Tablet", platform: "tablet", widthDp: 834, heightDp: 1194, density: 2.0, frameRadiusPx: 24, showStatusBar: true },
  { id: "cmp",    label: "CMP",    platform: "cmp",    widthDp: 1200, heightDp: 800, density: 1.0, frameRadiusPx: 12, showStatusBar: false, cmpTarget: "desktop" },
];
```

### 5.6 代码生成 IR

```ts
interface IrNode {
  composable: string;             // "Button"
  imports: string[];              // 该节点引入的符号
  attrs: IrAttr[];                // 属性（按源码顺序）
  children?: IrNode[];            // 子节点
  slotName?: string;              // 命名字槽（如 content = {}）
  comments?: string[];            // 生成注释
}

interface IrAttr {
  name: string;                   // "onClick"
  value: IrValue;                 // 字面量或表达式
}

type IrValue =
  | { kind: "literal"; value: string | number | boolean }
  | { kind: "token"; token: string }                 // MaterialTheme.colorScheme.primary
  | { kind: "expression"; code: string }             // 用户事件表达式
  | { kind: "resource"; name: string };              // stringResource(R.string.xxx)
```

---

## 6. 数据流设计

### 6.1 客户端状态（单一数据源）

```ts
interface StudioState {
  document: CanvasDocument;
  selection: { ids: string[]; anchorId: string | null };
  clipboard: ClipboardPayload | null;
  theme: ThemeSpec;
  device: { activeId: string; zoom: number; showGrid: boolean };
  history: { undo: Action[]; redo: Action[] };
  ui: { leftWidth: number; rightWidth: number; inspectorTab: "props" | "theme" };
}

type Action =
  | { type: "node/add"; parentId: string; node: Node; index?: number }
  | { type: "node/remove"; id: string }
  | { type: "node/move"; id: string; toParentId: string; index: number }
  | { type: "node/updateProps"; id: string; patch: Record<string, unknown> }
  | { type: "node/rename"; id: string; label: string }
  | { type: "selection/set"; ids: string[]; anchorId?: string }
  | { type: "theme/update"; patch: DeepPartial<ThemeSpec> }
  | { type: "device/set"; id: string }
  | { type: "canvas/zoom"; zoom: number }
  | { type: "history/undo" }
  | { type: "history/redo" };
```

### 6.2 数据流路径

```
用户操作（拖拽 / 属性编辑 / 主题调整）
        │
        ▼
   dispatch(Action) ──► Reducer（纯函数）──► 新 StudioState
        │                                       │
        │                                       ├──► Canvas 订阅重绘
        │                                       ├──► Inspector 订阅刷新
        │                                       └──► History 记录（可 undo）
        │
        └──（debounce 1.5s）──► RPC doc/save ──► 服务端 Repository ──► 工作区文件
```

### 6.3 实时反馈机制

- **属性 → 画布**：`node/updateProps` 修改文档 → canvas 订阅 → 重绘对应节点。
- **主题 → 预览**：`theme/update` → 预览 renderer 读取 `ThemeSpec` → 重新解析 token。
- **设备 → 画布**：`device/set` → 画布容器尺寸/外框变化。
- **拖拽 → 结构**：拖放完成时一次性 dispatch `node/add` + `node/move`，过程中使用本地临时状态避免高频提交。

### 6.4 撤销/重做

- 采用 **逆操作栈**：每个 Action 携带 `invert(state)` 元数据。
- 合并策略：连续 `node/updateProps` 在 800ms 内合并为一次历史项。
- 历史上限：100 步（可配置）。

### 6.5 持久化

- 文档文件：`<workspace>/.dsh-compose-studio/<docId>.json`。
- 自动保存：debounce 1500ms；保存前做 schema 版本校验。
- 迁移：`version` 字段 + 幂等迁移函数（v1 → v2 ...）。

### 6.6 预览渲染设计（Compose Web 真实渲染）

**目标**：画布预览与导出的 Compose 代码**同源**，避免保真差异。

**分层**：

```
┌─────────────────────────────────────────────┐
│ React Overlay（交互层）                       │
│  - 选中框 / 拖拽手柄 / 缩放控件                │
│  - 命中测试（基于节点几何，非 Compose 事件）   │
│  - 属性面板联动                              │
├─────────────────────────────────────────────┤
│ Compose Web Surface（渲染层）                 │
│  - @dsh-compose-studio/preview-runtime        │
│  - 接收 IR + ThemeSpec + DeviceProfile        │
│  - 用 Compose for Web 渲染真实 M3 组件        │
│  - 挂载于 <div> 容器（DOM 互操作）             │
└─────────────────────────────────────────────┘
```

**渲染流程**：

```
CanvasDocument
   │ buildIr(doc)            （纯函数，与服务端 codegen 共用 ir.ts）
   ▼
IrNode
   │ 序列化（JSON）
   ▼
preview-runtime: renderPreview(ir, theme, device)
   │ Kotlin/JS → Compose for Web
   ▼
HTMLElement（真实 M3 外观）
```

**关键契约**：

```ts
// preview-runtime 导出的 JS API
export function renderPreview(
  container: HTMLElement,
  request: {
    ir: IrNode;
    theme: ThemeSpec;
    device: DeviceProfile;
    scale: number;
  }
): PreviewHandle;

export interface PreviewHandle {
  update(request): void;       // 属性/主题热更新（不重建实例）
  remount(): void;             // 结构变化时重建
  dispose(): void;
  // 事件桥：点击组件 → 通知 React overlay 选中对应节点
  onNodeActivate?: (nodeId: string) => void;
}
```

**同源保证**：

- `preview-runtime` 的组件实现与代码生成模板**共享同一套设计 token 与布局规则**（同一份 `components/` 定义）。
- 预览使用与真机相同的 M3 组件语义（`Button`、`Scaffold`、`Text` 等）。
- 布局参数（dp、sp、Arrangement、Alignment）与生成的 Kotlin 代码逐值对应。

**性能**：

- 属性/主题变化走 `handle.update()`（增量），结构变化走 `remount()`。
- 大文档采用视口裁剪（只渲染可见区域节点）。
- Compose Web 产物按组件懒加载（动态 import）。

**降级策略**：

- 若 Compose Web 运行时加载失败，回退到 React 轻量映射（保留交互，降低保真）。
- 降级状态在 UI 明确提示，避免误导。

---

## 7. 代码生成设计

### 7.1 目标

生成满足以下条件的 Kotlin/Compose 代码：

1. **高封装性**：一个页面一个 `@Composable`，复杂区域拆分为 `private @Composable` 子函数。
2. **良好可扩展性**：状态提升（state hoisting）、参数化、插槽化。
3. **可读性**：命名清晰、结构分层、必要注释。
4. **可维护性**：无魔法字符串、资源与代码分离、单一职责。
5. **可测试设计**：UI 与逻辑分离，关键映射函数为纯函数。
6. **Compose 官方最佳实践**：`Modifier` 顺序、`remember`/`derivedStateOf`、避免重组浪费、M3 组件优先。

### 7.2 生成管线

```
CanvasDocument
     │
     ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌──────────────┐
│ Validate    │──►│ Build IR    │──►│ Render      │──►│ Post-process │
│ (invariants)│   │ (tree walk) │   │ (templates) │   │ (imports,fmt)│
└─────────────┘   └─────────────┘   └─────────────┘   └──────────────┘
                                                              │
                                                              ▼
                                                    Map<filePath, source>
```

### 7.3 生成示例

输入（画布）：`Scaffold > Column(padding=16dp) > [Button("Submit"), Text("Hello")]`

输出：

```kotlin
// Generated by dsh-compose-studio. Do not edit manually.
package com.example.generated

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

/**
 * Generated screen.
 * Root: Scaffold
 */
@Composable
fun GeneratedScreen(modifier: Modifier = Modifier) {
    Scaffold(modifier = modifier) { innerPadding ->
        GeneratedContent(
            modifier = Modifier.padding(innerPadding),
            onSubmitClick = { /* TODO: handle click */ }
        )
    }
}

@Composable
private fun GeneratedContent(
    modifier: Modifier = Modifier,
    onSubmitClick: () -> Unit
) {
    Column(
        modifier = modifier.padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Button(onClick = onSubmitClick) {
            Text(text = "Submit")
        }
        Text(text = "Hello")
    }
}
```

### 7.4 可测试性

- `buildIr(doc)`、`render(ir)`、`postProcess(files)` 均为纯函数。
- 单测：对每个内置组件 descriptor 做快照测试（`__snapshots__`）。
- 属性映射表（PropSchema → Kotlin 参数）集中定义，便于全覆盖。
- 生成后可选用 Kotlin 编译器做语法校验（可选，服务端不依赖）。

---

## 8. LLM 辅助设计

### 8.1 能力

| 能力 | 说明 |
|---|---|
| 自然语言生成组件 | "一个登录页，顶部 Logo，中间输入框，底部按钮" → 组件树 |
| 组件封装建议 | 对选中节点生成可复用封装代码 |
| 主题生成 | "深色、蓝紫色调" → ThemeSpec |
| 代码解释 | 解释当前生成的代码结构 |
| 重构建议 | 识别重复结构并建议提取 |

### 8.2 工具与上下文

```ts
// 服务端 LLM 网关
async function generateFromPrompt(ctx, prompt, document, anchorNodeId) {
  const system = buildSystemPrompt();          // Compose/M3 规范 + 输出格式约束
  const fewShot = FEW_SHOT_EXAMPLES;           // 3~5 个示例
  const context = {
    catalog: compactCatalog(document),          // 可用组件清单（精简）
    currentTree: simplifyTree(document.root),   // 当前结构
    anchorNode: findNode(document, anchorNodeId),
    theme: document.theme,
  };
  const stream = ctx.llm.stream({
    messages: [
      { role: "system", content: system },
      ...fewShot,
      { role: "user", content: JSON.stringify({ prompt, context }) }
    ],
    maxTokens: ctx.config.llm.maxTokens,
    temperature: ctx.config.llm.temperature,
  });
  return parseStream(stream);                   // 流式 → IrNode / ThemeSpec
}
```

### 8.3 输出约束（Structured Output）

- 强制 JSON Schema：`{ kind: "componentTree" | "theme", ir?: IrNode, theme?: ThemeSpec, explanation: string }`。
- 校验失败时自动重试一次（带纠错提示）。
- 生成结果先进入"待确认"状态，用户点击"应用"才写入文档（防止误覆盖）。

### 8.4 安全

- LLM 调用经 `ctx.llm`，复用宿主的模型路由与鉴权。
- 生成代码仅写入工作区 `.dsh-compose-studio/generated/` 隔离目录，导出需用户显式确认。
- Prompt 中不注入工作区敏感文件内容，仅注入组件目录与当前树结构。

---

## 9. 接口定义（TypeScript 汇总）

```ts
// ===== shared/contract.ts =====
export const RPC_PREFIX = "/compose-studio";
export const PROTOCOL_VERSION = 1;
export const SLOT = { /* 见 4.5 */ } as const;

// ===== shared/document.ts =====
export type Node = ContainerNode | LeafNode;
export interface CanvasDocument { /* 见 5.3 */ }
export interface ComponentDescriptor { /* 见 5.1 */ }
export type PropSchema = /* 见 5.2 */;

// ===== shared/theme.ts =====
export interface ThemeSpec { /* 见 5.4 */ }
export interface TextStyle { /* 见 5.4 */ }

// ===== shared/device.ts =====
export interface DeviceProfile { /* 见 5.5 */ }

// ===== server/codegen =====
export interface GenerateOptions {
  packageName: string;
  composeBom: string;
  usePreviewAnnotation: boolean;
  addModifierDefault: boolean;
  minify: boolean;
}
export interface FileOutput { path: string; source: string; }
export function generate(doc: CanvasDocument, opts: GenerateOptions): FileOutput[];

// ===== server/llm =====
export interface LlmGenerateRequest {
  prompt: string;
  documentId?: string;
  anchorNodeId?: string;
  mode: "componentTree" | "theme" | "explain";
}
export type LlmGenerateEvent =
  | { type: "start" }
  | { type: "delta"; text: string }
  | { type: "result"; ir?: IrNode; theme?: ThemeSpec; explanation: string }
  | { type: "error"; message: string };

// ===== client/store =====
export interface StudioState { /* 见 6.1 */ }
export type Action = /* 见 6.1 */;
export function reducer(state: StudioState, action: Action): StudioState;
```

---

## 10. 后续开发路线

### Phase 0 — 契约验证 Spike（1~2 周）

目标：用最小代码跑通全部契约，验证可行性；**重点验证 Compose Web 工具链**。

- [ ] 创建 `dsh-compose-studio` 包骨架（package.json + cordis.patch.yml）。
- [ ] 客户端注册 `main` keyed slot（key=`composeStudio`）+ `sidebar.panellist` 入口，显示空白面板。
- [ ] 服务端注册一个 `compose_studio_open` 工具，点击侧栏图标能打开面板。
- [ ] 服务端 `ctx.webServer.register` 一个 `/compose-studio/ping` 路由，客户端可调用。
- [ ] **Compose Web 工具链验证**：Kotlin/JS + Compose for Web 编译一个 Hello World 并在插件画布中挂载。
- [ ] **M3 组件可用性验证**：确认 Compose for Web 的 material3 组件（Button/Text/TextField/Scaffold 等）在 Web 目标可用；若不可用，验证自建组件库方案。
- [ ] **React ↔ Compose Web 互操作验证**：overlay 命中测试与 runtime 事件桥。
- [ ] 验证客户端包体积与加载性能（含 Compose Web 产物）。

**交付**：可安装的"空壳插件" + 一个真实渲染 M3 Button 的预览 demo，证明契约与工具链正确。

### Phase 1 — MVP 可视化编辑（3~4 周）

- [ ] 组件目录：内置 M3 基础组件（Text/Button/TextField/Card/Column/Row/Box/Image/Icon/Scaffold/TopAppBar 等）。
- [ ] 左侧分类树 + 搜索 + 拖拽源。
- [ ] 中间画布：**Compose Web 真实渲染预览**（挂载 preview-runtime）+ React overlay 交互层。
- [ ] 节点选中、拖放、位置/尺寸调整（overlay 命中 + 手柄）。
- [ ] 右侧属性面板：按 PropSchema 动态生成表单，实时反馈（走 `handle.update()`）。
- [ ] 文档模型 + Reducer + 撤销/重做。
- [ ] 代码生成：IR → Kotlin，导出到工作区。
- [ ] 预览降级：runtime 加载失败时回退 React 轻量映射。
- [ ] 基础单测（IR/render 快照）。

**交付**：可用的可视化编排 → **高保真预览** → Compose 代码生成闭环。

### Phase 2 — 主题与多端（1~2 周）

- [ ] ThemePanel：M3 colorScheme / typography / shapes 编辑。
- [ ] 实时主题预览（token 解析）。
- [ ] 多设备预览：手机 / 平板 / CMP，可切换、缩放、网格。
- [ ] 主题预设（light/dark/brand）。

### Phase 3 — LLM 辅助（2~3 周）

- [ ] `compose_studio_generate` 工具 + 流式 UI。
- [ ] Prompt 工程与 few-shot 库。
- [ ] 结构化输出校验与重试。
- [ ] 生成结果"待确认"交互。
- [ ] 组件封装建议、主题生成。

### Phase 4 — 加固与发布（1~2 周）

- [ ] 文档模型版本迁移。
- [ ] 完整单测/集成测试。
- [ ] 性能优化（大文档、虚拟化画布）。
- [ ] 可访问性（键盘操作、ARIA）。
- [ ] 发布到 npm + 编写 README/文档。

### Phase 5 — 生态扩展（持续）

- [ ] 用户自定义组件目录（从项目扫描 Composable）。
- [ ] 反向工程：Kotlin 代码 → 画布模型（导入）。
- [ ] 与 Android 模拟器/设备实时预览联动。
- [ ] 多文档/多页面管理。

---

## 10.1 Phase 0 — 验证结果（2026-11-09）

### 已验证 ✅

| 验证项 | 结果 |
|---|---|
| Kotlin/JS + Compose for Web 工具链 | ✅ 编译成功 |
| Material3 组件（Button/Text/MaterialTheme） | ✅ 可编译进 Web 目标 |
| 插件骨架（package.json / cordis.patch.yml / 双半入口） | ✅ 已落地 |
| DSH 交互契约（Slot / Tool / RPC） | ✅ 契约已确认（调研 + 骨架实现） |

**版本组合（已验证可用）**：Kotlin `2.1.21` + Compose Multiplatform `1.9.0` + Compose Compiler `2.1.21` + Gradle `9.7.1` + JDK 21。

**产物体积**：`compose-web-hello.js` **1.58 MB**（minified）+ `skiko.wasm` **8.4 MB**。

### 关键约束 ⚠️

1. **Maven 镜像不完整**：`material3-js` 仅 `1.9.0` 在三种国内镜像（腾讯 / 阿里云 / 华为）完整可用；
   `1.11.x / 1.12.x` 普遍缺失。**必须固定 Compose Multiplatform = 1.9.0**。
   配置 `dependencyResolutionManagement` 时需并列多个镜像，让 Gradle 自动回退。
2. **Gradle 堆内存**：Kotlin/JS IR 编译器在 `body lowering` 阶段会 `OutOfMemoryError`，
   需 `org.gradle.jvmargs=-Xmx4g`（本机 31.5GB 内存）。
3. **Compose Web 运行时字体**：渲染文本需 `LocalFontFamilyResolver`，否则抛
   `CompositionLocal LocalFontFamilyResolver not present`。Phase 1 需补上字体解析器。
4. **WASM 加载**：Skiko WASM 需通过 HTTP(S) 加载，`file://` 会被 CORS 拦截。
5. **产物体积**：~10MB（含 WASM）。需按需加载 / 浏览器缓存 / CDN 托管。

### T1 验证结果（2026-11-10）

| 验证项 | 结果 |
|---|---|
| Compose Web 渲染（DOM API） | ✅ 通过（HTTP 服务加载，WASM 正常） |
| 事件桥（DOM 点击 → `compose-web:activate` → React overlay） | ✅ 通过 |
| overlay 命中测试（DOM 矩形） | ✅ 通过（highlight 110x25） |
| 自动验收（Chrome headless autotest） | ✅ pass（`index.html?autotest=1`） |
| M3 组件（Material3 Text） | ⚠️ 受限：CMP 1.9.0 Web 无 FontFamilyResolver 公共 API |

**实现模式**（供 Phase 1 preview-runtime 参考）：
- 渲染：`renderComposable(rootElementId)` 挂载；Web 目标用 Skiko WASM
- 事件桥：Compose Web 侧 `window.dispatchEvent(CustomEvent)`；React overlay 监听并高亮
- 命中测试：基于节点 DOM 矩形（`getBoundingClientRect`），非 Compose 事件
- 自动验收：autotest 模式（派发点击序列 → 检查 highlight → 写 `data-autotest`）

### 对设计的影响

- 预览 runtime 方案（Compose Web 真实渲染）**技术可行**，但需接受 ~10MB 级产物与镜像约束。
- 风险表中「Compose Web M3 组件覆盖不足」风险**已降级**：1.9.0 的 material3-js 完整可用。
- 新增风险：**镜像供应链**——生产环境需自建缓存或锁定版本。

### 验证命令

```bash
cd spike/compose-web-hello
gradle jsBrowserProductionWebpack --no-daemon
# 产物：build/kotlin-webpack/js/productionExecutable/compose-web-hello.js
```

---

## 11. 风险与对策

| 风险 | 影响 | 对策 |
|---|---|---|
| DSH Slot 契约随版本变动 | 插件失效 | 契约集中在 `shared/contract.ts`；按 `PROTOCOL_VERSION` 适配；CI 多版本测试 |
| **Compose Web M3 组件覆盖不足** | 预览保真受限 | Phase 0 先验证；不足处自建组件库补齐；仍不可用时降级 React 映射 |
| **Kotlin/JS 产物体积 / 加载慢** | 首屏慢 | 产物按需动态 import、按组件拆分、浏览器缓存、CDN 托管 runtime |
| **Compose Web 与 React overlay 命中偏差** | 选中/拖拽不准 | 命中测试以文档模型几何为准（overlay 自绘），runtime 仅负责渲染 |
| 客户端包体积过大 | 加载慢 | 按需 import、组件目录懒加载、构建时 tree-shake |
| LLM 生成质量不稳定 | 用户体验差 | 结构化输出约束 + 校验重试 + 用户确认；few-shot 持续优化 |
| 文档模型向后兼容 | 旧文档打不开 | `version` + 幂等迁移；加载时校验 |
| 沙箱/权限限制写文件 | 导出失败 | 仅在当前工作区写；导出前确认；错误信息明确 |
| 大文档性能 | 画布卡顿 | 节点虚拟化、history 合并、debounce 保存 |
| 与 better-sidebar 等插件的 slot 冲突 | UI 异常 | 使用独立 key/id；遵循 slot scope 规则 |

---

## 12. 附录

### 12.1 参考插件（本机已安装）

| 插件 | 作者 | 参考价值 |
|---|---|---|
| `dsh-better-sidebar` | omdsh-dev | 侧栏 tab/fileViewer 注册、RPC 路由、服务暴露 |
| `dsh-whale-widget` | MeteorNOX | 最简 bundle patch 挂载、客户端浮层 |
| `dsh-at-file` | — | `@path` 输入触发、客户端注入 |
| `dsh-context` | — | 上下文面板 |
| `dsh-cost-meter` | — | 计量展示 |
| `@nanmicoder/dsh-agent-teams` | — | 多 agent 面板 |

### 12.2 关键 API 摘录（调研确认）

```ts
// Slot 注册（客户端）
ctx.slots.inject("main", function* () {
  yield ctx.slots.register({ name: "main", key: "conversation", children: {...} }, Panel);
});
ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
  name: "sidebar.panellist", id: "composeStudio", order: 80, label: () => t("...")
}, Icon));

// Tool 注册（服务端）
ctx.tools.register(defineTool({ name, description, parameters, output, execute }));

// RPC 路由（服务端）
ctx.webServer.register({ kind: "prefix", path: "/compose-studio", handler });

// LLM 流（服务端）
for await (const chunk of ctx.llm.stream({ messages, maxTokens, temperature })) { ... }
```

### 12.3 官方规范依据

- Material 3 规范：https://m3.material.io/
- Compose 官方最佳实践：https://developer.android.com/jetpack/compose
- Compose 性能指南：https://developer.android.com/jetpack/compose/performance
- Compose 测试指南：https://developer.android.com/jetpack/compose/testing
- DSH 仓库：https://github.com/deepseek-ai/deepseek-harness

---

## 13. 待讨论问题（Open Questions）

### 已决策（2026-11-08）

1. ✅ **编辑器宿主**：主面板（`main` keyed slot + `sidebar.panellist`）。
2. ✅ **预览保真度**：集成 Compose Web 真实渲染（React overlay 负责交互，runtime 负责渲染）。
3. ✅ **MVP 范围**：编排 + 代码生成闭环；主题、多端、LLM 后置。
4. ✅ **插件命名**：`dsh-compose-studio`。

### 仍待讨论

5. **代码反向**：是否需要 Kotlin → 画布模型的导入能力？（建议 Phase 5）
6. **协作**：是否需要多会话共享文档（实时协同）？
7. **组件目录来源**：内置静态目录 vs 从用户项目扫描 `@Composable`？（建议先内置，后支持扫描）
8. **主题持久化粒度**：全局主题 vs 文档级主题？（建议文档级 + 全局预设）
9. **LLM 模型选择**：默认使用当前 DSH 会话模型，还是允许单独配置？（建议默认继承，可覆盖）
10. **导出格式**：单文件 vs 多文件（组件拆分）？是否生成测试文件？（建议多文件 + 可选测试）
11. **预览 runtime 分发**：npm 包 vs 插件内置 bundle？（建议 npm，便于缓存与复用）

---

*本文档为设计草案，后续将在 Phase 0 Spike 中验证并修订。*
