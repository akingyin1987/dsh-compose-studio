# dsh-compose-studio 实施计划表

> 更新日期：2026-11-09
> 详细任务与验收见 `tasks/todo.md`；设计见 `docs/design.md`；本表为执行总览。

## 当前进展

**Phase 0（契约验证 Spike）——主体完成**

- ✅ 包骨架（package.json / cordis.patch.yml）
- ✅ 服务端工具 + RPC（`compose_studio_open` / `/compose-studio/ping`）
- ✅ Compose Web 工具链验证（Kotlin 2.1.21 + CMP 1.9.0）
- ✅ TS 构建测试工具链（T3，commit `3218e06`）
- ✅ 客户端契约实测修正（commit `c86e3b9`）：`sidebar.footer.action` + `shell.overlay`
- ⬜ React ↔ Compose Web 互操作验证（T1）
- ⬜ 包体积与加载策略验证（T2）

## 计划表

| 编号 | 任务 | 状态 | 依赖 | 验收标准 |
|---|---|---|---|---|
| T1 | 插件内 Compose Web 互操作验证 | ✅ | - | spike 验证页渲染（DOM 路径）；事件桥 + overlay 命中通过（autotest pass）；结论记录 |
| T2 | 客户端包体积与加载策略验证 | ✅ | T1 | 实测数据（DOM 412KB）+ 加载策略决策 |
| T3 | TypeScript 构建与测试工具链 | ✅ | - | typecheck/test/build 全绿；DSH 安装成功 |
| T4 | shared 契约层 | ✅ | T3 | 类型与 design.md 一致；不变式单测（11 tests） |
| T5 | 客户端 store + reducer + 历史栈 | ✅ | T4 | reducer 覆盖全部 Action；undo/redo + 合并 + 上限单测（27 tests） |
| T4.5 | Config schema（官方指南合规） | ✅ | T4 | schemastery schema + settings namespace 注册；默认值测试（36 tests） |
| T6 | ComponentCatalog + Palette | ✅ | T5 | 11 个 M3 组件；分类树 + 搜索 + 拖拽源（33 tests） |
| T7 | Canvas 与节点渲染 | ⬜ | T5 | 嵌套渲染；选中；缩放网格 |
| T8 | Inspector 属性面板 | ⬜ | T7 | PropSchema 全字段；实时联动 |
| T9 | 拖拽编排 | ⬜ | T6,T7 | 拖放/重排/级联删除；undo/redo |
| T10 | preview-runtime 包 | ⬜ | T4,T6 | renderPreview 渲染真实 M3；字体解析 |
| T11 | Canvas 接入 Compose Web 真实渲染 | ⬜ | T7,T10 | 真实 M3 替换占位；降级可用 |
| T12 | codegen IR（buildIr） | ⬜ | T4,T6 | 覆盖全部组件；快照测试 |
| T13 | IR → Kotlin 渲染 | ⬜ | T12 | 生成风格符合设计；快照覆盖 |
| T14 | 导出工具与工作区写入 | ⬜ | T13,T15 | 导出到工作区；越界拒绝 |
| T15 | 服务端 RPC + 文档存储 | ⬜ | T4 | load/save；版本校验 |
| T16 | 客户端自动保存与文档生命周期 | ⬜ | T15 | 1.5s 自动保存；新建/切换 |

## 检查点

| 检查点 | 位置 | 判定标准 | 状态 |
|---|---|---|---|
| CP1 | T1-T2 后 | Phase 0 完成；互操作与加载策略有结论 | ✅ |
| CP2 | T3-T5 后 | 工具链全绿；契约与 store 单测通过 | ✅ |
| CP3 | T6-T9 后 | 可视化编排闭环可演示 | ⬜ |
| CP4 | T10-T11 后 | 真实 M3 预览可演示 | ⬜ |
| CP5 | T12-T14 后 | 代码生成导出闭环 | ⬜ |
| CP6 | T15-T16 后 | MVP 完成 | ⬜ |

## 执行规则

1. 按编号顺序执行（依赖优先）；L 级任务按 `tasks/todo.md` 拆分建议执行
2. 每个任务完成后更新本表状态 + `tasks/todo.md` 勾选
3. 每个检查点向用户汇报，确认后继续
4. 阻塞问题（环境/依赖/契约）优先解决并记录
