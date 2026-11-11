// 配置 Schema（docs/design.md 4.7；DSH 插件 AI 指南第 7 节）
import Schema from "@deepseek-ai/schemastery";

export const CONFIG_NAMESPACE = "compose-studio";

/**
 * 可调参数全部通过 Config schema 暴露（避免硬编码）。
 * 默认值与 design.md 4.7 一致。
 */
export const ConfigSchema = Schema.object({
	defaultDevice: Schema.string().default("phone"),
	themePreset: Schema.string().default("material3"),
	/** 工作区根目录（空 = 进程 cwd）。文档与导出均限制在此目录内。 */
	workspaceRoot: Schema.string().default(""),
	codegen: Schema.object({
		language: Schema.string().default("kotlin"),
		composeBom: Schema.string().default("2024.09.00"),
		packageName: Schema.string().default("com.example.generated"),
		usePreviewAnnotation: Schema.boolean().default(true),
		addModifierDefault: Schema.boolean().default(true),
	}).default({
		language: "kotlin",
		composeBom: "2024.09.00",
		packageName: "com.example.generated",
		usePreviewAnnotation: true,
		addModifierDefault: true,
	}),
	llm: Schema.object({
		enabled: Schema.boolean().default(true),
		model: Schema.string().default(""),
		maxTokens: Schema.number().default(4096),
		temperature: Schema.number().default(0.2),
	}).default({
		enabled: true,
		model: "",
		maxTokens: 4096,
		temperature: 0.2,
	}),
	persistence: Schema.object({
		autoSaveMs: Schema.number().default(1500),
		historyLimit: Schema.number().default(100),
	}).default({
		autoSaveMs: 1500,
		historyLimit: 100,
	}),
});

/** 解析后的配置类型（由 schema 推导）。 */
export type Config = Schemastery.TypeT<typeof ConfigSchema>;
