# dsh-compose-studio

> DSH（DeepSeek Harness）插件：在 DSH 界面内提供 **Android Jetpack Compose 可视化拖拽编辑器**，
> 支持 Material 3 主题配置与 LLM 辅助代码生成。

---

## 项目状态

| 阶段 | 状态 | 说明 |
|---|---|---|
| Phase 0 — 契约验证 Spike | ✅ 主体完成 | 插件骨架 + Compose Web 工具链 + TS 构建链（T3）；客户端契约已按实测修正 |
| Phase 1 — MVP 可视化编辑 | ⬜ 待启动 | 组件树 / 画布 / 属性面板 / 代码生成（计划见 `tasks/plan.md`） |
| Phase 2 — 主题与多端 | ⬜ 待启动 | M3 主题、手机/平板/CMP 预览 |
| Phase 3 — LLM 辅助 | ⬜ 待启动 | 自然语言生成组件树 |

完整设计见 [`docs/design.md`](docs/design.md)，实施计划见 [`tasks/plan.md`](tasks/plan.md)。

---

## 目录结构

```
dsh-compose-studio/
├── package.json            # DSH 插件清单（dsh.bundle.patch / dsh.client）
├── cordis.patch.yml        # 挂载声明（dsh plugin add 时自动追加到 profile）
├── build.mjs               # 构建脚本（tsc 生成 d.ts + esbuild 打包）
├── tsconfig.json           # 类型检查配置（覆盖 src/）
├── tsconfig.build.json     # 构建配置（emitDeclarationOnly）
├── src/                    # TS 源码（勿手改 lib/，它是构建产物）
│   ├── shared/invariant.ts # 双半共享常量（RPC / 版本）
│   ├── server/index.ts     # 服务端入口（Cordis apply：工具 + RPC）
│   └── client/index.tsx    # 客户端入口（__ModuleLoader__，React + slot 注册）
├── lib/                    # 构建产物（index.js / client.js / invariant.js + d.ts）
├── spike/
│   └── compose-web-hello/  # Phase 0 工具链验证工程（Kotlin/JS + Compose Web）
├── tasks/
│   ├── plan.md             # 实施计划
│   └── todo.md             # 任务清单与验收状态
├── docs/
│   └── design.md           # 完整设计文档（客户端契约已按实测修正）
└── README.md
```

---

## 安装（开发中）

```bash
# 在 DSH profile 中安装本地插件（link: 后需接本仓库的绝对路径，
# 因为 dsh 命令的执行目录不确定，不要写死具体值）
dsh plugin --profile <你的 profile> add link:<本仓库绝对路径>
```

---

## Phase 0 验证结果（2026-11-09）

### Compose Web 工具链 ✅

- **Kotlin 2.1.21 + Compose Multiplatform 1.9.0 + Compose Compiler 2.1.21**
- 在受限网络环境下，通过国内 Maven 镜像（腾讯云 / 阿里云 / 华为云）成功解析全部依赖。
- 产物：`compose-web-hello.js` **1.58 MB**（minified）+ `skiko.wasm` **8.4 MB**（Skiko 图形引擎）。
- 验证命令：

```bash
cd spike/compose-web-hello
gradle jsBrowserProductionWebpack --no-daemon
```

### 关键约束与发现

| 项 | 结论 |
|---|---|
| Compose Web M3 组件 | ✅ `material3-js` 1.9.0 可编译（Button/Text/MaterialTheme 等） |
| 产物体积 | ⚠️ JS 1.58 MB + WASM 8.4 MB；需按需加载 / 缓存策略 |
| Maven 镜像 | ⚠️ `material3-js` 仅 1.9.0 完整可用；1.11/1.12 缺失，需固定 1.9.0 |
| 运行时字体 | ⚠️ Compose Web 需 `LocalFontFamilyResolver`（Phase 0 骨架待补） |
| WASM 加载 | ⚠️ 需 HTTP 服务（file:// 会被 CORS 拦截） |

### 构建环境要求

- Node.js ≥ 20（已验证 v24）
- JDK ≥ 17（已验证 Corretto 21）
- Gradle（已验证 9.7.1）
- **Gradle 堆内存 ≥ 4GB**（Kotlin/JS IR 编译器在 `body lowering` 阶段会 OOM）

---

## 设计原则

1. **契约优先**：Slot / Tool / Config / 文档模型契约先固定。
2. **双半分离**：服务端提供能力（工具 / RPC / 代码生成 / LLM），客户端负责交互。
3. **单一数据源**：画布文档不可变，Reducer + 逆操作栈。
4. **纯函数代码生成**：`generate(doc, opts)` 可快照测试。
5. **同源预览**：预览运行时与生成的 Compose 代码共享组件定义。

---

## License

MIT
