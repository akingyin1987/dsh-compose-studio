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
- [x] 嵌套容器结构正确渲染（buildRenderTree 递归 + 缺失节点安全跳过）
- [x] 点击节点 → `selection/set` → 高亮（Canvas 组件 dispatch + RenderNodeView selected）
- [x] 缩放/网格开关生效（device.zoom/showGrid）

**Verification:**
- [x] Tests pass: `npm test`（42 passed，含 6 个 buildRenderTree 单测）
- [x] typecheck 通过
- [ ] Manual check: Phase 1 集成时手动验证选中与缩放

**Dependencies:** Task 5

**Files likely touched:**
- `src/client/canvas/Canvas.tsx`、`NodeView.tsx`、`devices.ts`

**Estimated scope:** Medium（3-5 文件）

---

### Task 8: Inspector 属性面板

**Description:** 按 PropSchema 动态生成表单（fields：string/number/enum/color/dp/spacing/text-style/event/slot）；编辑 → `node/updateProps` → canvas 实时刷新；处理空选/多选状态。

**Acceptance criteria:**
- [x] 全部 PropSchema kind 有对应字段组件（string/number/boolean/enum/color/dp/spacing/text-style/event/slot）
- [x] 属性编辑实时反映到画布（node/updateProps → reducer → Canvas 订阅）
- [x] 空选/多选状态显示正确（getSelectedNode + 空态提示）

**Verification:**
- [x] Tests pass: `npm test`（48 passed，含 getSelectedNode/getPropSchemas 单测）
- [x] typecheck 通过
- [ ] Manual check: 集成后手动验证属性编辑联动

**Dependencies:** Task 7

**Files likely touched:**
- `src/client/inspector/Inspector.tsx`、`PropField.tsx`、`fields/*`

**Estimated scope:** Large（建议按 8a 字段组件库 / 8b Inspector 组装执行）

---

### Task 9: 拖拽编排

**Description:** 实现 palette → canvas 拖放（落点计算：命中容器 + index）→ `node/add` + `node/move`；节点拖拽重排；删除父节点级联子树；全部操作可 undo/redo。

**Acceptance criteria:**
- [x] 拖放位置正确（容器内 index 计算准确）
- [x] 节点移动/重排正确（含拖入自身/子孙的环形防护）
- [x] 删除父节点级联删除子树（Delete 键 + Inspector 删除按钮入口）
- [x] 所有操作可 undo/redo（Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y + 顶栏按钮）

**Verification:**
- [x] Tests pass: `npm test`（reducer 层面 + drag 纯函数 24 个；共 72 passed）
- [x] typecheck / build 全绿
- [ ] Manual check: 拖拽添加、移动、删除、undo/redo（待 DSH 环境手动验证）

**Dependencies:** Task 6、Task 7

**Files likely touched:**
- `src/client/canvas/drag.ts`（新增：落点计算 / 容器解析 / 默认节点创建 / 环形防护）
- `src/client/canvas/Canvas.tsx`（拖放监听 + 落点指示条 + 新建/移动 dispatch）
- `src/client/canvas/PreviewRenderer.tsx`（data-node-id / draggable / 指示条渲染）
- `src/client/palette/ComponentPalette.tsx`（DND_MIME 单一来源）
- `src/client/inspector/Inspector.tsx`（删除按钮）
- `src/client/index.tsx`（Delete/undo/redo 快捷键 + 顶栏按钮）

**Estimated scope:** Large（建议按 9a 拖放落点 / 9b 重排与级联删除执行）

---

### Task 9b: Modifier 修饰符参数面板

**Description:** Inspector 为选中节点增加通用修饰符区域（宽/高/内边距/背景色），值存于 `node.props.modifier*`（前缀避免与组件自身属性冲突）；PreviewRenderer 将修饰符样式应用到所有组件渲染。

**Acceptance criteria:**
- [x] Inspector 显示"修饰符"区域：宽 (dp) / 高 (dp) / 内边距 (dp) / 背景色（含清除）
- [x] 属性编辑实时反映到画布（node/updateProps → PreviewRenderer 应用）
- [x] `getModifierStyle` 纯函数单测（含与 Image 自身 width 不冲突用例）
- [x] typecheck / `npm test`（74 passed）/ build 全绿

**Verification:**
- [x] Tests pass: `npm test`
- [ ] Manual check: 选中节点 → 修改宽/高/内边距/背景色 → 画布实时变化

**Dependencies:** Task 8（Inspector）

**Files likely touched:**
- `src/client/inspector/Inspector.tsx`（ModifierSection + MODIFIER_FIELDS）
- `src/client/canvas/drag.ts`（getModifierStyle 纯函数）
- `src/client/canvas/PreviewRenderer.tsx`（各 case 应用修饰符样式）
- `src/client/canvas/test/drag.test.ts`（+2 测试）

**Estimated scope:** Small

---

## Phase 1-C：预览 runtime

### Task 10: preview-runtime 包

**Description:** 在 `preview-runtime/` 搭建独立 Gradle 工程（由 spike 升级）：`renderPreview(container, request)` API（request 含 ir/theme/device/scale）、IR → Compose 组件映射（与 catalog 同源设计）、ThemeSpec/DeviceProfile 处理；补齐 `LocalFontFamilyResolver`；产物可经 npm 本地引用（`file:` 或等价方式）。

**Acceptance criteria:**
- [ ] `gradle jsBrowserProductionWebpack --no-daemon` 产出可加载 JS + WASM
- [ ] `renderPreview` 渲染真实 M3 组件到指定 DOM 容器
- [ ] 文本渲染正常（字体解析器工作，无 `LocalFontFamilyResolver` 异常）

**前置验证（2026-11-13，T10 启动前）：**
- [x] M3 编译验证：`material3-js` 1.9.0 成功打包（259 KiB），构建产物 JS 1.58 MB + WASM 8.4 MB
- [x] M3 运行时验证：**确认阻塞性问题** —— headless Chrome 加载 `MaterialTheme { Text(...) }` 抛
  `Uncaught Error: CompositionLocal LocalFontFamilyResolver not present`，root 未挂载
- [ ] **T10 必须先解决字体解析器**：CMP 1.9.0 Web 目标未提供 `LocalFontFamilyResolver`，
  需提供自定义实现（或改用不依赖 Compose 字体的渲染路径），否则真实 M3 渲染不可用
- 验证工具：`spike/compose-web-hello/verify/m3-check.html`（`python -m http.server` + headless Chrome，
  见文件内说明；结果写入 `document.body.dataset.m3`）

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
- [x] 覆盖全部内置组件 descriptor
- [x] 纯函数、可快照测试
- [x] `npm test` 全绿

**Verification:**
- [x] Tests pass: `npm test`（12 passed）

**Dependencies:** Task 4、Task 6

**Files likely touched:**
- `src/shared/ir.ts`（新增，双半共享 IR 类型）
- `src/server/codegen/ir.ts`（新增，buildIr 实现）
- `src/server/codegen/test/ir.test.ts`（新增）

**Estimated scope:** Medium（3-5 文件）

**完成说明**：IrNode 含 `renderKind`（slot 类型组件无子节点时生成空 lambda）；event 属性始终生成 TODO 占位；color 值 `#RRGGBB` → literal，否则 → token；modifier 链按 width→height→padding→background 顺序。

---

### Task 13: IR → Kotlin 渲染

**Description:** 实现 `render(ir)`：模板渲染、imports 汇总、Modifier 顺序、`@Composable` 拆分（页面 + private 子函数）；`postProcess` 格式化；每个内置组件 descriptor 快照测试。

**Acceptance criteria:**
- [x] 生成代码风格符合 `docs/design.md` 7.3 示例
- [x] 快照测试覆盖全部组件（52 个）
- [x] imports 无冗余/缺失
- [x] 注释规范（design.md 7.1.1）：文件头/KDoc/事件 TODO
- [x] 性能优化（design.md 7.1.2）：Modifier 顺序、Column/Row spacing → Arrangement

**Verification:**
- [x] Tests pass: `npm test`（render 11 断言 + 52 快照）

**Dependencies:** Task 12

**Files likely touched:**
- `src/server/codegen/render.ts`（新增）
- `src/server/codegen/test/render.test.ts`（新增，含快照）

**Estimated scope:** Medium（3-5 文件）

**完成说明**：根函数 `GeneratedScreen(modifier)`；slot 子节点提取为 `Generated<Slot>` private 函数（事件提升为 `handleXxx` 参数）；Column/Row spacing 渲染为 `verticalArrangement/horizontalArrangement = Arrangement.spacedBy(...)`。

---

### Task 14: 导出工具与工作区写入

**Description:** 实现 `compose_studio_export` 工具（targetDir、overwrite、用户确认 fence）+ `doc/export` RPC；生成文件写入 `.dsh-compose-studio/generated/` 隔离目录；路径限当前工作区内。

**Acceptance criteria:**
- [x] 工具可将 Kotlin 文件导出到指定目录
- [x] 覆盖已有文件需用户确认（overwrite=false 时报错）
- [x] 越出工作区的路径被拒绝并明确报错

**Verification:**
- [x] Tests pass: `npm test`（export 6 + rpc 8）
- [ ] Manual check: 导出到工作区并验证文件内容（待 DSH 环境）

**Dependencies:** Task 13、Task 15

**Files likely touched:**
- `src/server/codegen/export.ts`（新增）
- `src/server/tools.ts`（新增，defineExportTool）
- `src/server/rpc.ts`（doc/export 路由）
- `src/server/index.ts`（注册工具）
- `src/server/test/rpc.test.ts`、`src/server/codegen/test/export.test.ts`

**Estimated scope:** Medium（3-5 文件）

---

## Phase 1-E：持久化与 RPC

### Task 15: 服务端 RPC + 文档存储

**Description:** 实现 `doc/load`、`doc/save`、`fs/list` RPC（替换 ping 占位）；`Repository` 读写 `<workspace>/.dsh-compose-studio/<docId>.json`；workspace fence；加载时 schema 版本校验。

**Acceptance criteria:**
- [x] 客户端可 load/save 文档
- [x] 文档版本校验生效（不兼容版本有明确错误）
- [x] 路径限工作区内（resolveSafePath fence）

**Verification:**
- [x] Tests pass: `npm test`（workspace 5 + repository 9 + rpc 8）
- [ ] Manual check: 保存后重新加载文档（待 DSH 环境）

**Dependencies:** Task 4

**Files likely touched:**
- `src/server/store/workspace.ts`（新增，fence）
- `src/server/store/repository.ts`（新增，DocumentRepository）
- `src/server/rpc.ts`（新增，路由）
- `src/server/config.ts`（+workspaceRoot）
- `src/server/index.ts`（集成）
- `src/server/test/*`（新增）

**Estimated scope:** Medium（3-5 文件）

---

### Task 16: 客户端自动保存与文档生命周期

**Description:** 实现客户端 `rpc.ts`（调用服务端方法）；编辑后 debounce 1500ms 自动保存；新建/切换文档；保存失败提示。

**Acceptance criteria:**
- [x] 编辑后 1.5s 内自动保存（debounce，首次渲染跳过）
- [x] 新建/切换文档可用（doc/new、doc/load、doc/rename）
- [x] 保存失败有明确 UI 提示（保存中/已保存/保存失败）

**Verification:**
- [x] Tests pass: `npm test`（rpc 6 + store 5）
- [ ] Manual check: 编辑自动保存、切换文档、断服务端模拟失败提示（待 DSH 环境）

**Dependencies:** Task 15

**Files likely touched:**
- `src/client/rpc.ts`（新增，RpcClient）
- `src/client/store.ts`（+doc/new、doc/load、doc/rename、createEmptyDocument、generateDocId）
- `src/client/index.tsx`（自动保存、新建/打开/导出按钮、保存状态）
- `src/client/test/rpc.test.ts`（新增）

**Estimated scope:** Medium（3-5 文件）

---

## 主题与模板（2026-11-11）

### Task 17: 主题模型扩展（ThemeSpec 预设 + 色角色）

**Description:** 在 `src/shared/theme.ts` 扩展主题模型：新增 6 套主题预设（紫/蓝/绿 × 浅色/深色）、`createThemeFromPreset`、`findMatchingPreset`、`getVariantPreset`，以及覆盖全部 33 个 colorScheme 字段的 `COLOR_ROLE_GROUPS`（供 ThemePanel 渲染配置表单）。

**Acceptance criteria:**
- [x] `THEME_PRESETS` 6 套，色板字段完整且为合法 `#RRGGBB`
- [x] 浅色/深色成对（同 `baseId`），可互相切换
- [x] `createDefaultTheme()` 与 `purple-light` 预设一致（向后兼容）
- [x] `COLOR_ROLE_GROUPS` 覆盖全部字段且无重复
- [x] `npm test` 全绿（theme.test.ts）

**Verification:**
- [x] Tests pass: `npm test`（shared/test/theme.test.ts）
- [x] typecheck 通过

**Dependencies:** None

**Files likely touched:**
- `src/shared/theme.ts`、`src/shared/test/theme.test.ts`

**Estimated scope:** Medium

---

### Task 18: ThemePanel 与 Inspector 标签页

**Description:** 新增 `src/client/theme/ThemePanel.tsx`：预设卡片选择、深色/浅色切换、按 `COLOR_ROLE_GROUPS` 分组的颜色配置表单；Inspector 增加「属性 / 主题」标签页（新 action `ui/setInspectorTab`）。`theme/update` 同时更新 `state.theme` 与 `document.theme`，保证预览 / 持久化 / 导出一致。

**Acceptance criteria:**
- [x] Inspector 顶部「属性 / 主题」标签可切换
- [x] 主题标签页含实时预览条、6 套预设卡片、深色切换、全量 colorScheme 颜色编辑
- [x] `theme/update` 同步 `document.theme`（单测断言）
- [x] 切换深色优先匹配同色相族预设，无匹配时仅翻转 `dark` 标记
- [x] `npm test` 全绿（store.test.ts 更新）

**Verification:**
- [x] Tests pass: `npm test`
- [x] typecheck 通过
- [ ] Manual check: 主题切换后画布 / 预览 / 导出同步变化（待 DSH 环境）

**Dependencies:** Task 17

**Files likely touched:**
- `src/client/theme/ThemePanel.tsx`（新增）
- `src/client/inspector/Inspector.tsx`（标签页）
- `src/client/store.ts`（theme/update 同步、ui/setInspectorTab）
- `src/client/test/store.test.ts`

**Estimated scope:** Medium

---

### Task 19: 预览主题化（组件默认使用当前主题）

**Description:** 新增 `src/client/theme/palette.ts`（`ThemeSpec` → `PreviewPalette`），PreviewRenderer 改为由色板生成 M3 样式（React Context 提供），全部 52 个组件占位渲染使用主题色；Canvas 设备框背景 / 网格跟随主题。

**Acceptance criteria:**
- [x] `PreviewPaletteContext` 提供当前主题色板，PreviewNode 消费
- [x] Button / Text / Card / TopAppBar / TextField / Switch / Slider / Chip / Progress / Navigation / Dialog / Snackbar / Badge / Tab / Surface / Image / Icon / Scaffold 等全部使用主题色
- [x] 设备框背景 = `colorScheme.background`，网格线使用主题 `outlineVariant`
- [x] `withAlpha` 单测
- [x] 既有测试无回归

**Verification:**
- [x] Tests pass: `npm test`（palette.test.ts + 既有 208 测试无回归）
- [x] typecheck 通过
- [ ] Manual check: 切换主题后画布所有组件颜色变化（待 DSH 环境）

**Dependencies:** Task 18

**Files likely touched:**
- `src/client/theme/palette.ts`（新增）
- `src/client/canvas/PreviewRenderer.tsx`
- `src/client/canvas/Canvas.tsx`
- `src/client/theme/test/palette.test.ts`（新增）

**Estimated scope:** Medium

---

### Task 20: 代码生成注入主题

**Description:** `GenerateOptions` 增加 `theme?: ThemeSpec`；新增 `src/server/codegen/theme.ts` 生成 `GeneratedColorScheme`（light/darkColorScheme）与 `GeneratedTheme` Composable；`render` 在提供主题时包裹 `GeneratedScreen` 内容；`exportDocument` 默认注入 `doc.theme`。生成的组件因此默认使用当前主题。

**Acceptance criteria:**
- [x] 提供 theme 时生成 `GeneratedTheme` + `lightColorScheme`/`darkColorScheme`
- [x] `GeneratedScreen` 内容包裹在 `GeneratedTheme { ... }` 内
- [x] 未提供 theme 时输出与之前完全一致（既有 52 快照无回归）
- [x] `exportDocument` 默认注入文档主题，`generate.theme` 可覆盖
- [x] colorScheme 覆盖全部 33 个色角色；`colorToKotlin` 处理 6/8 位 hex
- [x] 快照 + 单测全绿

**Verification:**
- [x] Tests pass: `npm test`（theme.test.ts + export.test.ts 更新）
- [x] typecheck / build 全绿
- [ ] Manual check: 导出的 Kotlin 在 Android 项目中编译并应用主题（待验证）

**Dependencies:** Task 17

**Files likely touched:**
- `src/shared/ir.ts`（GenerateOptions.theme）
- `src/server/codegen/theme.ts`（新增）
- `src/server/codegen/render.ts`、`src/server/codegen/export.ts`
- `src/server/codegen/test/theme.test.ts`（新增）、`export.test.ts`

**Estimated scope:** Medium

---

### Task 21: 页面模板库（登录 / 列表 / 设置等）

**Description:** 新增 `src/client/templates.ts`：6 个常用页面模板（空白 / 登录 / 注册 / 列表 / 设置 / 个人资料），每个模板是纯函数 `(docId, name, theme) => CanvasDocument`；`doc/new` action 支持 `template` 字段；顶栏「新建」改为模板选择器（含「空白」）。

**Acceptance criteria:**
- [x] 模板覆盖空白 / 登录 / 注册 / 列表 / 设置 / 个人资料
- [x] 每个模板产出文档通过完整不变式校验，且无孤立节点
- [x] 模板文档继承当前主题
- [x] 未知模板 id 回退空白（不抛错）
- [x] 顶栏「新建 ▾」列出模板，点击创建对应文档
- [x] 模板单测全绿

**Verification:**
- [x] Tests pass: `npm test`（templates.test.ts + store.test.ts 更新）
- [x] typecheck / build 全绿
- [ ] Manual check: 选择模板后画布正确渲染（待 DSH 环境）

**Dependencies:** Task 18（主题继承）

**Files likely touched:**
- `src/client/templates.ts`（新增）
- `src/client/index.tsx`（模板选择器）
- `src/client/store.ts`（doc/new template）
- `src/client/test/templates.test.ts`（新增）

**Estimated scope:** Medium

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
- [x] 可通过拖拽编排组件（React 占位渲染）
- [x] 属性面板实时联动
- [x] undo/redo 可用
- ⚠️ 待 DSH 环境手动演示验证（各任务 Manual check 未完成）

### Checkpoint CP4（T10-T11 后）：高保真预览
- [ ] 真实 M3 渲染替换占位
- [ ] 降级路径验证

### Checkpoint CP5（T12-T14 后）：代码生成闭环
- [ ] 快照测试全绿
- [ ] 导出到工作区可用

### Checkpoint CP6（T15-T16 后）：MVP 完成
- [ ] 端到端：编排 → 预览 → 生成 → 导出 → 持久化
- [ ] 与用户确认 Phase 2 启动
