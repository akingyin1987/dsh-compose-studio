# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

**dsh-compose-studio** 是 DSH（DeepSeek Harness，基于 Cordis 的插件化 Agent Harness）的客户端插件，在 DSH 界面内提供 Android Jetpack Compose 可视化拖拽编辑器（组件树 / 画布 / 属性面板三栏），支持 Material 3 主题配置与 LLM 辅助代码生成。

当前处于 **Phase 0 已完成、Phase 1 工具链就绪** 阶段（T3 完成）：插件骨架、Compose Web 工具链验证、TS 构建/测试设施均已落地，可视化编辑功能（Phase 1）尚未实现。路线图见 `tasks/plan.md`，任务状态见 `tasks/todo.md`。

## 常用命令

### Compose Web Spike 构建（当前唯一可运行的开发命令）

```bash
cd spike/compose-web-hello
gradle jsBrowserProductionWebpack --no-daemon
# 产物：build/kotlin-webpack/js/productionExecutable/compose-web-hello.js（~1.58 MB）+ skiko.wasm（~8.4 MB）
```

环境要求：JDK ≥ 17（已验证 Corretto 21）、Gradle（已验证 9.7.1）、Node ≥ 20。`gradle.properties` 已配置 `-Xmx4g`，不要调低——Kotlin/JS IR 编译器在 `body lowering` 阶段会 OOM。

### 本地安装插件到 DSH

```bash
dsh plugin --profile <name> add link:<本仓库绝对路径>
```

### npm scripts（T3 起已就绪）

```bash
npm run typecheck   # tsc --noEmit（覆盖 src/ 全部源码）
npm test            # vitest run
npm run build       # node build.mjs：tsc 生成 d.ts + esbuild 打包 JS
```

构建产物：`lib/index.js`（服务端 ESM）、`lib/invariant.js`（共享）、`lib/client.js`（客户端 `__ModuleLoader__` 格式）。源码在 `src/`（TS/TSX），`lib/` 为构建产物——**不要手改 `lib/`**。

## 架构

### DSH 插件双半结构

插件分为服务端与客户端两半，契约集中在 `lib/invariant.js`（双半共享，不得引入 Node 或浏览器专有 API）：

- **服务端** `lib/index.js`（源码 `src/server/index.ts`）：ESM Cordis 插件，`apply(ctx)` 注册能力。
  - `compose_studio_open` 工具（`defineTool`），供模型调用打开编辑器。
  - RPC 路由：`ctx.webServer.register({ kind: "prefix", path: "/compose-studio" })`，当前仅实现 `/compose-studio/ping`。
  - `inject = ["tools", "webServer", "llm", "workspace"]`。
- **客户端** `lib/client.js`（源码 `src/client/index.tsx`）：由 DSH 客户端通过 `window.__ModuleLoader__.load({ id, factory })` 加载，factory 内通过 `require("react")` 获取宿主提供的 React（esbuild 打包为 `__ModuleLoader__` 格式）。
  - 真实 slot 机制（DSH 0.1.0-rc.7）：`ctx.effect(() => ctx.slots.register(options, Component))`；`SlotMap` 通过 `declare module "@deepseek-ai/dsh-client-ui-slots"` 扩充。
  - 注册 `sidebar.footer.action`（list slot，id=composeStudio）→ 侧栏入口。
  - 注册 `shell.overlay`（list slot，id=composeStudio）→ 编辑器浮层（Phase 0 占位）。
  - `inject = ["slots"]`（locale/layout 服务 Phase 1 再引入）。
  - ⚠️ 原设计稿的 `main` keyed slot / `sidebar.panellist` / `composeStudio.*` 子 slot 均为臆测，已废弃（见 design.md 实测修正）。

### 契约常量（lib/invariant.js）

`RPC_PREFIX`、`PROTOCOL_VERSION`（破坏性变更时递增）、`MAIN_PANEL_ID`、`SLOT`、`RPC_METHOD`（源码 `src/shared/invariant.ts`）。设计文档中规划但代码未实现的 RPC 方法（`doc/load`、`doc/save`、`codegen/generate`、`llm/generate`、`theme/resolve`）已在 `RPC_METHOD` 中预留命名。

### 插件清单与挂载

- `package.json` 的 `dsh` 字段：`dsh.bundle.patch` → `cordis.patch.yml`（挂载声明，`dsh plugin add` 时自动追加到 profile 的 bundles）；`dsh.client.platform = "web"`；`dsh.client.inject` 声明宿主依赖包（`dsh-client-locale` / `dsh-client-ui-slots` / `dsh-client-ui-primitives` / `dsh-client-modules`）。
- 客户端入口通过 `exports["./client"]` 暴露。

### 依赖策略

- **peerDependencies**：宿主运行时提供的包（`@deepseek-ai/*` 服务端/客户端包、react），与社区插件（dsh-better-sidebar）一致。
- **devDependencies**：同版本安装用于类型检查，外加构建工具（typescript、vitest、esbuild）。
- **`.npmrc`**：`legacy-peer-deps=true`——宿主生态存在 peer 版本错配（cordis 4.0.1 与 cordis-plugin-include 1.1.0），忽略以避免安装失败。
- 宿主包版本锚定本机 DSH 0.1.0-rc.7：`@deepseek-ai/*@0.1.0-rc.8`、`cordis@4.0.1`、`schemastery@3.18.1`、`react@18.3.1`；升级 DSH 时需同步核对。
- 服务端 Context 类型扩充需 side-effect import 触发（`import "@deepseek-ai/dsh-host-webserver"` 等，见 `src/server/index.ts`）。
- 客户端类型包：`dsh-client-runtime`（ClientContext）、`dsh-client-ui-slots`（SlotMap）、`dsh-client-ui-primitives`，均已锚定 0.1.0-rc.8。
- devDeps 包含完整宿主包链（服务端 + 客户端，由 `scripts/collect-host-deps.mjs` 迭代收集）；这些包**不进入发布产物**（`files` 只含 lib/ 等）。

### 预览运行时（设计蓝图，Phase 1 落地）

画布预览采用 **Compose Web 真实渲染**，与生成的 Compose 代码同源：

- `@dsh-compose-studio/preview-runtime`（Kotlin/JS + Compose for Web，独立 npm 包）接收 IR + ThemeSpec + DeviceProfile，导出 `renderPreview(container, request)`，支持增量 `update()` 与结构变化 `remount()`。
- React overlay 覆盖在 Compose Web surface 之上负责交互（选中/拖拽/手柄），命中测试以文档模型几何为准，runtime 仅负责渲染。
- `spike/compose-web-hello` 是工具链验证工程，也是 preview-runtime 的雏形。

### Compose Web 版本约束（重要）

- **Compose Multiplatform 必须固定 1.9.0**：国内 Maven 镜像（腾讯/阿里云/华为云）仅 1.9.0 的 `material3-js` 完整可用，1.11/1.12 缺失。
- Kotlin 2.1.21 + Compose Compiler 2.1.21；`settings.gradle.kts` 已配置三个国内镜像 + `mavenCentral()`/`google()` 回退。
- 运行时注意：Compose Web 渲染文本需 `LocalFontFamilyResolver`（否则抛 `CompositionLocal ... not present`）；Skiko WASM 必须经 HTTP(S) 加载，`file://` 会被 CORS 拦截。

## 文档

- `README.md`：项目状态、Phase 0 验证结果、构建环境要求。
- `docs/design.md`：完整设计文档（架构、数据模型、契约、路线图、风险）。
- `tasks/plan.md`：实施计划（进展盘点、任务分解、风险、开放问题）。
- `tasks/todo.md`：任务清单与验收状态。
- **注意**：design.md 中 `preview-runtime/` 等目录尚未创建；`types` 字段指向的 `lib/invariant.d.ts` 仍悬空（实际 d.ts 在 `lib/shared/invariant.d.ts`），Phase 1 修正。

## 设计原则（源自 docs/design.md，实现时需遵守）

1. 契约优先：Slot / Tool / Config / 文档模型契约先固定。
2. 双半分离：服务端只做能力提供（工具 / RPC / 代码生成 / LLM），客户端只做交互与呈现，通过版本化 RPC 通信。
3. 单一数据源：画布文档不可变，Reducer + 逆操作栈。
4. 纯函数代码生成：`generate(doc, opts)` 无副作用、可快照测试。
5. 同源预览：预览运行时与生成的 Compose 代码共享组件定义。
