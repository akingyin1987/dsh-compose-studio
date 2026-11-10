import Schema from "@deepseek-ai/schemastery";
export declare const CONFIG_NAMESPACE = "compose-studio";
/**
 * 可调参数全部通过 Config schema 暴露（避免硬编码）。
 * 默认值与 design.md 4.7 一致。
 */
export declare const ConfigSchema: Schema<Schemastery.ObjectS<{
    defaultDevice: Schema<string, string>;
    themePreset: Schema<string, string>;
    codegen: Schema<Schemastery.ObjectS<{
        language: Schema<string, string>;
        composeBom: Schema<string, string>;
        packageName: Schema<string, string>;
        usePreviewAnnotation: Schema<boolean, boolean>;
        addModifierDefault: Schema<boolean, boolean>;
    }>, Schemastery.ObjectT<{
        language: Schema<string, string>;
        composeBom: Schema<string, string>;
        packageName: Schema<string, string>;
        usePreviewAnnotation: Schema<boolean, boolean>;
        addModifierDefault: Schema<boolean, boolean>;
    }>>;
    llm: Schema<Schemastery.ObjectS<{
        enabled: Schema<boolean, boolean>;
        model: Schema<string, string>;
        maxTokens: Schema<number, number>;
        temperature: Schema<number, number>;
    }>, Schemastery.ObjectT<{
        enabled: Schema<boolean, boolean>;
        model: Schema<string, string>;
        maxTokens: Schema<number, number>;
        temperature: Schema<number, number>;
    }>>;
    persistence: Schema<Schemastery.ObjectS<{
        autoSaveMs: Schema<number, number>;
        historyLimit: Schema<number, number>;
    }>, Schemastery.ObjectT<{
        autoSaveMs: Schema<number, number>;
        historyLimit: Schema<number, number>;
    }>>;
}>, Schemastery.ObjectT<{
    defaultDevice: Schema<string, string>;
    themePreset: Schema<string, string>;
    codegen: Schema<Schemastery.ObjectS<{
        language: Schema<string, string>;
        composeBom: Schema<string, string>;
        packageName: Schema<string, string>;
        usePreviewAnnotation: Schema<boolean, boolean>;
        addModifierDefault: Schema<boolean, boolean>;
    }>, Schemastery.ObjectT<{
        language: Schema<string, string>;
        composeBom: Schema<string, string>;
        packageName: Schema<string, string>;
        usePreviewAnnotation: Schema<boolean, boolean>;
        addModifierDefault: Schema<boolean, boolean>;
    }>>;
    llm: Schema<Schemastery.ObjectS<{
        enabled: Schema<boolean, boolean>;
        model: Schema<string, string>;
        maxTokens: Schema<number, number>;
        temperature: Schema<number, number>;
    }>, Schemastery.ObjectT<{
        enabled: Schema<boolean, boolean>;
        model: Schema<string, string>;
        maxTokens: Schema<number, number>;
        temperature: Schema<number, number>;
    }>>;
    persistence: Schema<Schemastery.ObjectS<{
        autoSaveMs: Schema<number, number>;
        historyLimit: Schema<number, number>;
    }>, Schemastery.ObjectT<{
        autoSaveMs: Schema<number, number>;
        historyLimit: Schema<number, number>;
    }>>;
}>>;
/** 解析后的配置类型（由 schema 推导）。 */
export type Config = Schemastery.TypeT<typeof ConfigSchema>;
//# sourceMappingURL=config.d.ts.map