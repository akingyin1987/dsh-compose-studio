# 实施计划：dsh-compose-studio

> 生成日期：2026-11-09
> 依据：`README.md`、`docs/design.md`、`CLAUDE.md` 及实际代码盘点
> 任务详情见 `tasks/todo.md`

## 1. 概述

在 DSH（DeepSeek Harness）内实现 Jetpack Compose 可视化拖拽编辑器：三栏布局（组件树 / 画布 / 属性面板）、Compose Web 真实渲染预览、纯函数代码生成导出，后续扩展 M3 主题与 LLM 辅助。当前 Phase 0（契约验证 Spike）主体完成，本计划覆盖 **Phase 0 收尾 + Phase 1 MVP 全部任务**，Phase 2/3 仅列概要。

## 2. 当前进展盘点（2026-11-09）

### Phase 0 清单对照（design.md 第 10 节）

| # | Phase 0 项 | 状态 | 证据 |
|---|---|---|---|
| 1 | 包骨架（package.json + cordis.patch.yml） | ✅ 完成 | 根目录文件存在 |
| 2 | 客户端注册 `main` keyed slot + `sidebar.panellist` 入口 | ✅ 完成 | `lib/client.js` |
| 3 | 服务端 `compose_studio_open` 工具 | ✅ 完成 | `lib/index.js` |
| 4 | 服务端 `/compose-studio/ping` 路由 | ✅ 完成 | `lib/index.js` |
| 5 | Compose Web 工具链验证（Kotlin/JS + M3 编译） | ✅ 完成 | `spike/compose-web-hello`（产物已清理，需重建） |
| 6 | M3 组件可用性验证 | ✅ 完成 | Button/Text/MaterialTheme 可编译（README 记录） |
| 7 | **React ↔ Compose Web 互操作验证**（overlay 命中 + 事件桥） | ❌ **未做** | 客户端仅有 React 占位，未挂载 Compose Web |
| 8 | **客户端包体积与加载性能验证** | ⚠️ **仅记录** | 只有产物体积数据（1.58MB + 8.4MB），未在插件环境实测 |

**结论**：Phase 0 交付物"可安装空壳插件"已达成；"插件内真实渲染 M3 Button 的预览 demo"未达成（M3 Button 只在独立 spike 工程中渲染过）。剩余 2 项即本计划 T1、T2。

### 未落地的基础设施（Phase 1 前置缺口）

- `node_modules` / lockfile 不存在；`package.json` 无 `dependencies` / `devDependencies`
- 无构建系统（`build.mjs`、`tsconfig.json` 不存在），无测试框架
- `lib/*.js` 是手写 Phase 0 骨架，非 TS 源码构建产物；design.md 规划的 `src/` 目录不存在
- spike 构建产物未保留（被 `.gitignore` 排除），后续任务需重新构建
- 宿主依赖（`@deepseek-ai/dsh-tools` 等）未在 `package.json` 声明，解析方式待确认

## 3. 架构决策（沿用 design.md 已决策 + 实施层补充）

| 决策 | 结论 | 理由 |
|---|---|---|
| 编辑器宿主 | `sidebar.footer.action`（入口）+ `shell.overlay`（浮层面板） | 实测：DSH 0.1.0-rc.7 无 main keyed slot；list slot 可安全注册 |
| 预览保真 | Compose Web 真实渲染 + React overlay 交互 | 与生成代码同源 |
| 客户端框架 | React（宿主一致，复用 primitives） | 宿主 `dsh-client-ui-*` 均为 React |
| 状态管理 | 单一数据源 + Reducer + 逆操作栈 | design.md 3/6 节 |
| 代码生成 | 服务端纯函数 `generate(doc, opts)` | 可测试、可离线 |
| 持久化 | 工作区文件 `.dsh-compose-studio/<docId>.json` | 可版本控制、可导出 |
| 实施层补充：源码形态 | `src/` TS 源码 → `build.mjs` 构建 → `lib/` 产物 | 保持 package.json 契约路径不变 |
| 实施层补充：任务顺序 | 先工具链（T3）后功能，预览 runtime 独立包并行推进 | 避免手写骨架返工 |

## 4. 任务列表（概览）

### Phase 0 收尾
- [x] T1: 插件内 Compose Web 互操作验证（spike 验证页：React overlay + 事件桥）
- [x] T2: 客户端包体积与加载策略验证

### Phase 1-A：工具链与契约
- [x] T3: TypeScript 构建与测试工具链（src/ → lib/）
- [x] T4: shared 契约层（contract/document/theme/device/validate）

### Phase 1-B：客户端核心
- [x] T5: 客户端 store + reducer + 历史栈
- [x] T6: ComponentCatalog + Palette
- [x] T7: Canvas 与节点渲染（React 占位）
- [x] T8: Inspector 属性面板
- [x] T9: 拖拽编排
- [x] T9b: Modifier 修饰符参数面板（宽/高/内边距/背景色）

### Phase 1-C：预览 runtime
- [ ] T10: preview-runtime 包（Kotlin/JS，renderPreview）
- [ ] T11: Canvas 接入 Compose Web 真实渲染

### Phase 1-D：代码生成
- [ ] T12: codegen IR（buildIr）
- [ ] T13: IR → Kotlin 渲染
- [ ] T14: 导出工具与工作区写入

### Phase 1-E：持久化与 RPC
- [ ] T15: 服务端 RPC（doc/load、doc/save、fs/list）+ 文档存储
- [ ] T16: 客户端自动保存与文档生命周期

### 后续阶段概要（不展开任务）
- Phase 2：ThemePanel（M3 colorScheme/typography/shapes）、多设备预览、主题预设
- Phase 3：`compose_studio_generate` 工具 + 流式 UI + prompt 工程 + 结构化输出
- Phase 4：文档迁移、完整测试、性能、可访问性、发布

## 5. 检查点

| 检查点 | 位置 | 判定标准 |
|---|---|---|
| CP1 | T1-T2 后 | Phase 0 完成；互操作与加载策略有书面结论 |
| CP2 | T3-T5 后 | `npm run typecheck/test/build` 全绿；契约与 store 单测通过 |
| CP3 | T6-T9 后 | 可视化编排闭环可手动演示（React 占位渲染） |
| CP4 | T10-T11 后 | 真实 M3 预览可演示，降级路径可用 |
| CP5 | T12-T14 后 | 代码生成 → 导出闭环可演示 |
| CP6 | T15-T16 后 | MVP 完成：编排 → 高保真预览 → 代码生成 → 持久化 |

## 6. 风险与缓解

| 风险 | 影响 | 缓解 |
|---|---|---|
| Compose Multiplatform 镜像仅 1.9.0 可用 | 高 | 锁定 1.9.0；生产环境自建缓存 |
| Gradle 堆不足导致 IR 编译 OOM | 中 | `gradle.properties` 已设 `-Xmx4g`，勿调低 |
| Compose Web 文本渲染缺字体解析器 | 中 | T10 验收含 `LocalFontFamilyResolver` |
| React overlay 与 Compose 渲染命中偏差 | 中 | 命中以文档模型几何为准（overlay 自绘） |
| 宿主依赖（`@deepseek-ai/*`）解析方式未确认 | 中 | T3 验证 `inject` 机制；必要时补 peerDependencies |
| DSH Slot 契约随版本变动 | 中 | 契约集中 `shared/contract.ts`，`PROTOCOL_VERSION` 版本化 |
| 包体积 ~10MB（JS+WASM） | 中 | T2 确定加载策略（动态 import / 缓存 / CDN） |
| 大文档性能 | 低 | Phase 4 虚拟化；history 合并 + debounce |

## 7. 开放问题（沿用 design.md 第 13 节）

1. 预览 runtime 分发：npm 包 vs 插件内置（建议 npm）
2. 组件目录来源：内置静态 vs 扫描用户项目 `@Composable`
3. LLM 模型选择：继承会话模型 vs 单独配置
4. 导出格式：单文件 vs 多文件；是否生成测试文件
5. 协作：是否需要多会话实时协同
6. 代码反向：Kotlin → 画布模型导入（建议 Phase 5）

## 8. 计划验证

- [x] 每个任务有验收标准（见 todo.md）
- [x] 每个任务有验证步骤
- [x] 依赖已识别并排序
- [x] 任务记录于 `tasks/todo.md`
- [x] 未覆盖任何既有未完成计划（tasks/ 原不存在）
- [x] 无任务超过 ~5 文件（L 级任务标注拆分建议）
- [x] 检查点已设置
- [ ] **待用户确认**：任务粒度、执行顺序、Phase 0 收尾是否优先
