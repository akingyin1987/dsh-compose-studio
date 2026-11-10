# 任务清单：dsh-compose-studio

> 配套计划：`tasks/plan.md`
> 验证命令说明：Phase 1 工具链（T3）就绪前，`npm run typecheck/test/build` 不可用；spike 相关任务用 `gradle jsBrowserProductionWebpack --no-daemon`（在 `spike/compose-web-hello/` 或 `preview-runtime/` 下执行）。

## Phase 0 收尾

### Task 1: 插件内 Compose Web 互操作验证

**Description:** 在 `spike/compose-web-hello` 验证工程内搭建 React overlay + Compose Web 渲染的互操作验证页：Compose Web 渲染真实 M3 组件，React overlay 覆盖其上；点击组件触发 `onNodeActivate(nodeId)` 事件桥；overlay 命中测试基于文档模型几何（非 Compose 事件）。产出实现模式结论，作为 T11 的依据。

**Acceptance criteria:**
- [x] spike 中渲染 Compose Web（DOM API 路径），经 HTTP 服务加载运行
- [x] React overlay 收到 `compose-web:activate` 事件，并高亮对应节点区域（110x25）
- [x] 互操作实现模式记录到 `docs/design.md`（含 autotest 自动验收）

**Verification:**
- [x] 构建成功：`gradle jsBrowserProductionWebpack --no-daemon`（BUILD SUCCESSFUL）
- [x] autotest 通过：Chrome headless `index.html?autotest=1` → `data-autotest="pass"`（overlay highlight 110x25）
- ⚠️ M3 组件路径：CMP 1.9.0 Web 不提供 `FontFamilyResolver` 公共 API，Material3 Text 渲染受限；改用 DOM API 验证互操作核心机制，M3 路径记入 Phase 1

**Dependencies:** None

**Files likely touched:**
- `spike/compose-web-hello/`（新增宿主 HTML + React overlay 验证页）
- `docs/design.md`

**Estimated scope:** Medium（3-5 文件）

---

### Task 2: 客户端包体积与加载策略验证

**Description:** 在 DSH 客户端环境（或等效模拟环境）实际加载含 Compose Web 产物的插件，测量首屏加载时间、缓存命中效果；据此确定加载策略（动态 import / 预加载 / CDN / 本地缓存），写入文档。

**Acceptance criteria:**
- [x] 实测数据记录：DOM API 方案 JS 412KB（无 WASM），JS 下载 504ms，页面 1722ms（localhost）
- [x] 加载策略决策写入 `docs/design.md`：轻量路径直接打包；M3 路径（~10MB）按需动态 import + 缓存 + CDN
- [x] 动态 import 结论：M3 方案必须按需加载（编辑时），附策略说明

**Verification:**
- [x] 自动测量：验证页 `?autotest=1` 输出 `data-perf`（jsBytes/jsDurationMs/loadMs）
- [x] 对比 Material3 方案（1.58MB+8.4MB）体积差异（DOM API 减小 96%）

**Dependencies:** Task 1

**Files likely touched:**
- `docs/design.md`

**Estimated scope:** Small（1-2 文件）

---

## Phase 1-A：工具链与契约

### Task 3: TypeScript 构建与测试工具链

**Description:** 搭建 Phase 1 工程基础设施：`package.json` 补 `devDependencies`（typescript、vitest、esbuild 等）与 `dependencies`（宿主依赖声明策略）；新增 `tsconfig.json`、`build.mjs`（`src/` → `lib/`，含客户端 `__ModuleLoader__` 打包与 `.d.ts` 生成）、vitest 配置。将现有手写骨架（`lib/index.js`、`lib/client.js`、`lib/invariant.js`）迁移为 `src/` TS 源码（`src/server/index.ts`、`src/client/index.ts`、`src/shared/invariant.ts`），保持 `lib/` 产物路径与 `package.json` 契约（`main`/`exports`）一致。

**Acceptance criteria:**
- [x] `npm run typecheck`、`npm test`（至少 1 个 smoke test）、`npm run build` 全部通过
- [x] 构建产物 `lib/index.js`、`lib/client.js`、`lib/invariant.js` 路径与 `package.json` 声明一致
- [~] DSH 中安装插件后面板可打开（已安装到 `web` profile，link 验证通过；UI 面板打开待用户启动 DSH 确认）

**Verification:**
- [x] Tests pass: `npm test`（3 passed）
- [x] Build succeeds: `npm run build`（lib/index.js 2.4kb、lib/invariant.js 675b、lib/client.js 2.6kb + d.ts）
- [x] Manual check: `dsh plugin --profile web add link:E:/Development/develop/plugin/dsh-compose-studio` 安装成功，bundles 已含插件

**Dependencies:** None（建议最先执行，避免后续返工）

**Files likely touched:**
- `package.json`、`tsconfig.json`、`build.mjs`、`vitest.config.*`
- `src/shared/invariant.ts`、`src/server/index.ts`、`src/client/index.ts`
- `lib/`（改为构建产物）

**Estimated scope:** Medium（3-5 文件）

---

### Task 4: shared 契约层

**Description:** 实现双半共享契约：`src/shared/contract.ts`（SLOT/RPC_PREFIX/PROTOCOL_VERSION，与 `lib/invariant.js` 对齐）、`document.ts`（CanvasDocument/Node/PropSchema 类型 + 不变式）、`theme.ts`（ThemeSpec/TextStyle）、`device.ts`（DeviceProfile + BUILTIN_DEVICES）、`validate.ts`（文档版本兼容校验）。

**Acceptance criteria:**
- [x] 类型定义与 `docs/design.md` 5.2-5.5 一致（document/theme/device/contract）
- [x] 不变式校验有单测：节点至多一个父节点、children 无重复且可解析、根为容器（11 tests）
- [x] `npm test` 全绿

**Verification:**
- [x] Tests pass: `npm test`（11 passed）
- [x] typecheck 通过

**设计补充**：CanvasDocument 增加 `nodes` 扁平表（design.md 5.3 的"树形 + id 引用"需要节点表解析 children 引用）

**Dependencies:** Task 3

**Files likely touched:**
- `src/shared/contract.ts`、`document.ts`、`theme.ts`、`device.ts`、`validate.ts`
- `src/shared/test/*`

**Estimated scope:** Medium（3-5 文件）

---

## Phase 1-B：客户端核心

### Task 5: 客户端 store + reducer + 历史栈

**Description:** 实现 `src/client/store.ts`：StudioState、Action 联合类型、纯函数 reducer（覆盖 design.md 6.1 全部 Action）、逆操作栈 undo/redo（连续 `node/updateProps` 800ms 内合并、历史上限 100 可配置）。

**Acceptance criteria:**
- [x] reducer 覆盖 design.md 6.1 全部 Action 类型（含 node/restore 子树恢复）
- [x] undo/redo 单测：含 800ms 合并策略与历史上限 100
- [x] `npm test` 全绿（27 tests）

**Verification:**
- [x] Tests pass: `npm test`（27 passed）
- [x] typecheck 通过

**Dependencies:** Task 4

**Files likely touched:**
- `src/client/store.ts`
- `src/client/test/store.test.ts`

**Estimated scope:** Medium（3-5 文件）

---

### Task 6: ComponentCatalog + Palette

**Description:** 定义内置 M3 组件目录（`catalog.ts`：Text/Button/TextField/Card/Column/Row/Box/Image/Icon/Scaffold/TopAppBar 等，每个含 PropSchema/CodegenHint/PreviewSpec）；实现 `ComponentPalette.tsx`（分类树 + 搜索 + 拖拽源，drag source 携带 descriptor id）。

**Acceptance criteria:**
- [x] catalog 覆盖 design.md Phase 1 列出的组件清单（11 个：布局 3 + M3 6 + 内容 2）
- [x] palette 可搜索；拖拽源数据含组件 descriptor id（DND_MIME）
- [x] catalog 数据结构有单测（6 个）

**Verification:**
- [x] Tests pass: `npm test`（33 passed）
- [x] typecheck 通过
- [ ] Manual check: palette 搜索与拖拽源可用（Phase 1 集成时手动验证）

**Dependencies:** Task 5

**Files likely touched:**
- `src/client/palette/catalog.ts`、`categoryTree.ts`、`ComponentPalette.tsx`

**Estimated scope:** Large（建议按 6a catalog 数据 / 6b palette UI 执行）

---

### Task 7: Canvas 与节点渲染（React 占位）

**Description:** 实现 `Canvas.tsx` 订阅 store、按文档树渲染 NodeView（React 占位渲染，几何来自文档模型）；节点选中高亮、缩放、网格开关。

**Acceptance criteria:**
- [ ] 嵌套容器结构正确渲染
- [ ] 点击节点 → `selection/set` → overlay 高亮
- [ ] 缩放/网格开关生效

**Verification:**
- [ ] Tests pass: `npm test`（store 集成）
- [ ] Manual check: 选中与缩放

**Dependencies:** Task 5

**Files likely touched:**
- `src/client/canvas/Canvas.tsx`、`NodeView.tsx`、`devices.ts`

**Estimated scope:** Medium（3-5 文件）

---

### Task 8: Inspector 属性面板

**Description:** 按 PropSchema 动态生成表单（fields：string/number/enum/color/dp/spacing/text-style/event/slot）；编辑 → `node/updateProps` → canvas 实时刷新；处理空选/多选状态。

**Acceptance criteria:**
- [ ] 全部 PropSchema kind 有对应字段组件
- [ ] 属性编辑实时反映到画布
- [ ] 空选/多选状态显示正确

**Verification:**
- [ ] Tests pass: `npm test`
- [ ] Manual check: 编辑属性后画布刷新

**Dependencies:** Task 7

**Files likely touched:**
- `src/client/inspector/Inspector.tsx`、`PropField.tsx`、`fields/*`

**Estimated scope:** Large（建议按 8a 字段组件库 / 8b Inspector 组装执行）

---

### Task 9: 拖拽编排

**Description:** 实现 palette → canvas 拖放（落点计算：命中容器 + index）→ `node/add` + `node/move`；节点拖拽重排；删除父节点级联子树；全部操作可 undo/redo。

**Acceptance criteria:**
- [ ] 拖放位置正确（容器内 index 计算准确）
- [ ] 节点移动/重排正确
- [ ] 删除父节点级联删除子树
- [ ] 所有操作可 undo/redo

**Verification:**
- [ ] Tests pass: `npm test`（reducer 层面）
- [ ] Manual check: 拖拽添加、移动、删除

**Dependencies:** Task 6、Task 7

**Files likely touched:**
- `src/client/canvas/drag.ts`

**Estimated scope:** Large（建议按 9a 拖放落点 / 9b 重排与级联删除执行）

---

## Phase 1-C：预览 runtime

### Task 10: preview-runtime 包

**Description:** 在 `preview-runtime/` 搭建独立 Gradle 工程（由 spike 升级）：`renderPreview(container, request)` API（request 含 ir/theme/device/scale）、IR → Compose 组件映射（与 catalog 同源设计）、ThemeSpec/DeviceProfile 处理；补齐 `LocalFontFamilyResolver`；产物可经 npm 本地引用（`file:` 或等价方式）。

**Acceptance criteria:**
- [ ] `gradle jsBrowserProductionWebpack --no-daemon` 产出可加载 JS + WASM
- [ ] `renderPreview` 渲染真实 M3 组件到指定 DOM 容器
- [ ] 文本渲染正常（字体解析器工作，无 `LocalFontFamilyResolver` 异常）

**Verification:**
- [ ] Build succeeds: `cd preview-runtime && gradle jsBrowserProductionWebpack --no-daemon`
- [ ] Manual check: 浏览器中挂载渲染

**Dependencies:** Task 4（IR 契约）、Task 6（组件映射同源）

**Files likely touched:**
- `preview-runtime/build.gradle.kts`、`settings.gradle.kts`、`gradle.properties`
- `preview-runtime/src/commonMain/kotlin/*`
- `preview-runtime/package.json`

**Estimated scope:** Large（建议按 10a 包骨架 + renderPreview / 10b 组件映射层执行）

---

### Task 11: Canvas 接入 Compose Web 真实渲染

**Description:** 实现 `PreviewHost.tsx` 挂载 preview-runtime + React overlay（选中框/手柄）；`bridge.ts` 序列化 IR/theme/device；`handle.update()` 增量更新、`remount()` 结构重建；runtime 加载失败时降级 React 占位渲染并明确提示。

**Acceptance criteria:**
- [ ] 画布显示真实 M3 渲染（替换 T7 的 React 占位）
- [ ] overlay 命中与 Compose 渲染对齐（以文档模型几何为准）
- [ ] 降级路径可用且有 UI 提示

**Verification:**
- [ ] Manual check: 画布真实渲染、属性热更新、结构变化重建、降级提示

**Dependencies:** Task 7、Task 10

**Files likely touched:**
- `src/client/preview/PreviewHost.tsx`、`bridge.ts`

**Estimated scope:** Large（建议按 11a 挂载与 bridge / 11b overlay 对齐与降级执行）

---

## Phase 1-D：代码生成

### Task 12: codegen IR（buildIr）

**Description:** 实现纯函数 `buildIr(doc)`：树 walk → IrNode；PropSchema → IrValue（literal/token/expression/resource 分类）；与客户端预览共用 `ir.ts`。

**Acceptance criteria:**
- [ ] 覆盖全部内置组件 descriptor
- [ ] 纯函数、可快照测试
- [ ] `npm test` 全绿

**Verification:**
- [ ] Tests pass: `npm test`

**Dependencies:** Task 4、Task 6

**Files likely touched:**
- `src/server/codegen/ir.ts`
- `src/server/codegen/test/*`

**Estimated scope:** Medium（3-5 文件）

---

### Task 13: IR → Kotlin 渲染

**Description:** 实现 `render(ir)`：模板渲染、imports 汇总、Modifier 顺序、`@Composable` 拆分（页面 + private 子函数）；`postProcess` 格式化；每个内置组件 descriptor 快照测试。

**Acceptance criteria:**
- [ ] 生成代码风格符合 `docs/design.md` 7.3 示例
- [ ] 快照测试覆盖全部组件
- [ ] imports 无冗余/缺失

**Verification:**
- [ ] Tests pass: `npm test`

**Dependencies:** Task 12

**Files likely touched:**
- `src/server/codegen/render.ts`、`templates/*`
- `src/server/codegen/test/*`

**Estimated scope:** Medium（3-5 文件）

---

### Task 14: 导出工具与工作区写入

**Description:** 实现 `compose_studio_export` 工具（targetDir、overwrite、用户确认 fence）+ `doc/export` RPC；生成文件写入 `.dsh-compose-studio/generated/` 隔离目录；路径限当前工作区内。

**Acceptance criteria:**
- [ ] 工具可将 Kotlin 文件导出到指定目录
- [ ] 覆盖已有文件需用户确认
- [ ] 越出工作区的路径被拒绝并明确报错

**Verification:**
- [ ] Tests pass: `npm test`
- [ ] Manual check: 导出到工作区并验证文件内容

**Dependencies:** Task 13、Task 15

**Files likely touched:**
- `src/server/tools.ts`、`rpc.ts`、`store/workspace.ts`

**Estimated scope:** Medium（3-5 文件）

---

## Phase 1-E：持久化与 RPC

### Task 15: 服务端 RPC + 文档存储

**Description:** 实现 `doc/load`、`doc/save`、`fs/list` RPC（替换 ping 占位）；`Repository` 读写 `<workspace>/.dsh-compose-studio/<docId>.json`；workspace fence；加载时 schema 版本校验。

**Acceptance criteria:**
- [ ] 客户端可 load/save 文档
- [ ] 文档版本校验生效（不兼容版本有明确错误）
- [ ] 路径限工作区内

**Verification:**
- [ ] Tests pass: `npm test`
- [ ] Manual check: 保存后重新加载文档

**Dependencies:** Task 4

**Files likely touched:**
- `src/server/rpc.ts`、`store/repository.ts`、`store/workspace.ts`

**Estimated scope:** Medium（3-5 文件）

---

### Task 16: 客户端自动保存与文档生命周期

**Description:** 实现客户端 `rpc.ts`（调用服务端方法）；编辑后 debounce 1500ms 自动保存；新建/切换文档；保存失败提示。

**Acceptance criteria:**
- [ ] 编辑后 1.5s 内自动保存
- [ ] 新建/切换文档可用
- [ ] 保存失败有明确 UI 提示

**Verification:**
- [ ] Manual check: 编辑自动保存、切换文档、断服务端模拟失败提示

**Dependencies:** Task 15

**Files likely touched:**
- `src/client/rpc.ts`
- `src/client/store.ts`（集成）

**Estimated scope:** Medium（3-5 文件）

---

## 检查点

### Checkpoint CP1（T1-T2 后）：Phase 0 完成
- [ ] 互操作验证通过，结论已记录
- [ ] 加载策略决策已记录
- [ ] 与用户确认是否进入 Phase 1

### Checkpoint CP2（T3-T5 后）：工具链与契约
- [ ] `npm run typecheck` / `npm test` / `npm run build` 全绿
- [ ] 契约层与 store 单测通过
- [ ] 插件在 DSH 中可安装、面板可打开

### Checkpoint CP3（T6-T9 后）：可视化编排闭环
- [ ] 可通过拖拽编排组件（React 占位渲染）
- [ ] 属性面板实时联动
- [ ] undo/redo 可用

### Checkpoint CP4（T10-T11 后）：高保真预览
- [ ] 真实 M3 渲染替换占位
- [ ] 降级路径验证

### Checkpoint CP5（T12-T14 后）：代码生成闭环
- [ ] 快照测试全绿
- [ ] 导出到工作区可用

### Checkpoint CP6（T15-T16 后）：MVP 完成
- [ ] 端到端：编排 → 预览 → 生成 → 导出 → 持久化
- [ ] 与用户确认 Phase 2 启动
