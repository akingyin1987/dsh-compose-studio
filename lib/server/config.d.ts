import Schema from "@deepseek-ai/schemastery";
export declare const CONFIG_NAMESPACE = "compose-studio";
/**
 * 可调参数全部通过 Config schema 暴露（避免硬编码）。
 * 默认值与 design.md 4.7 一致。
 */
export declare const ConfigSchema: Schema<Schemastery.ObjectS<NoInfer<{
    defaultDevice: Schema<string, string, "defined">;
    themePreset: Schema<string, string, "defined">;
    codegen: Schema<Schemastery.ObjectS<NoInfer<{
        language: Schema<string, string, "defined">;
        composeBom: Schema<string, string, "defined">;
        packageName: Schema<string, string, "defined">;
        usePreviewAnnotation: Schema<boolean, boolean, "defined">;
        addModifierDefault: Schema<boolean, boolean, "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        language: Schema<string, string, "defined">;
        composeBom: Schema<string, string, "defined">;
        packageName: Schema<string, string, "defined">;
        usePreviewAnnotation: Schema<boolean, boolean, "defined">;
        addModifierDefault: Schema<boolean, boolean, "defined">;
    }>>, "defined">;
    llm: Schema<Schemastery.ObjectS<NoInfer<{
        enabled: Schema<boolean, boolean, "defined">;
        model: Schema<string, string, "defined">;
        maxTokens: Schema<number, number, "defined">;
        temperature: Schema<number, number, "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        enabled: Schema<boolean, boolean, "defined">;
        model: Schema<string, string, "defined">;
        maxTokens: Schema<number, number, "defined">;
        temperature: Schema<number, number, "defined">;
    }>>, "defined">;
    persistence: Schema<Schemastery.ObjectS<NoInfer<{
        autoSaveMs: Schema<number, number, "defined">;
        historyLimit: Schema<number, number, "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        autoSaveMs: Schema<number, number, "defined">;
        historyLimit: Schema<number, number, "defined">;
    }>>, "defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    defaultDevice: Schema<string, string, "defined">;
    themePreset: Schema<string, string, "defined">;
    codegen: Schema<Schemastery.ObjectS<NoInfer<{
        language: Schema<string, string, "defined">;
        composeBom: Schema<string, string, "defined">;
        packageName: Schema<string, string, "defined">;
        usePreviewAnnotation: Schema<boolean, boolean, "defined">;
        addModifierDefault: Schema<boolean, boolean, "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        language: Schema<string, string, "defined">;
        composeBom: Schema<string, string, "defined">;
        packageName: Schema<string, string, "defined">;
        usePreviewAnnotation: Schema<boolean, boolean, "defined">;
        addModifierDefault: Schema<boolean, boolean, "defined">;
    }>>, "defined">;
    llm: Schema<Schemastery.ObjectS<NoInfer<{
        enabled: Schema<boolean, boolean, "defined">;
        model: Schema<string, string, "defined">;
        maxTokens: Schema<number, number, "defined">;
        temperature: Schema<number, number, "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        enabled: Schema<boolean, boolean, "defined">;
        model: Schema<string, string, "defined">;
        maxTokens: Schema<number, number, "defined">;
        temperature: Schema<number, number, "defined">;
    }>>, "defined">;
    persistence: Schema<Schemastery.ObjectS<NoInfer<{
        autoSaveMs: Schema<number, number, "defined">;
        historyLimit: Schema<number, number, "defined">;
    }>>, Schemastery.ObjectT<NoInfer<{
        autoSaveMs: Schema<number, number, "defined">;
        historyLimit: Schema<number, number, "defined">;
    }>>, "defined">;
}>>, "plain">;
/** 解析后的配置类型（由 schema 推导）。 */
export type Config = Schemastery.TypeT<typeof ConfigSchema>;
//# sourceMappingURL=config.d.ts.map