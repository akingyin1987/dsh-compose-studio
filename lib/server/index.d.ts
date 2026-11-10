import type { Context } from "@deepseek-ai/cordis";
import "@deepseek-ai/dsh-host-webserver";
import "@deepseek-ai/dsh-llm";
import "@deepseek-ai/dsh-settings";
import { ConfigSchema, type Config } from "./config.js";
export { ConfigSchema as Config };
/**
 * Cordis 插件入口。
 * @param ctx - 宿主上下文。
 * @param config - 解析后的配置（由 ConfigSchema 校验）。
 */
export declare function apply(ctx: Context, config: Config): void;
//# sourceMappingURL=index.d.ts.map