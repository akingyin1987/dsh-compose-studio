import { describe, expect, it } from "vitest";
import Schema from "@deepseek-ai/schemastery";
import { ConfigSchema } from "../config.js";

describe("ConfigSchema", () => {
	it("空输入解析出全部默认值", () => {
		const [result] = Schema.resolve({}, ConfigSchema, {});
		expect(result.defaultDevice).toBe("phone");
		expect(result.themePreset).toBe("material3");
		expect(result.codegen.language).toBe("kotlin");
		expect(result.codegen.composeBom).toBe("2024.09.00");
		expect(result.llm.enabled).toBe(true);
		expect(result.llm.maxTokens).toBe(4096);
		expect(result.persistence.autoSaveMs).toBe(1500);
		expect(result.persistence.historyLimit).toBe(100);
	});

	it("用户值覆盖默认值", () => {
		const [result] = Schema.resolve(
			{ defaultDevice: "tablet", persistence: { autoSaveMs: 3000 } },
			ConfigSchema,
			{},
		);
		expect(result.defaultDevice).toBe("tablet");
		expect(result.persistence.autoSaveMs).toBe(3000);
		// 未覆盖的保留默认
		expect(result.persistence.historyLimit).toBe(100);
	});

	it("非法类型校验失败（抛错或返回 undefined）", () => {
		let error: unknown = null;
		let result: unknown = "sentinel";
		try {
			[result] = Schema.resolve(
				{ persistence: { autoSaveMs: "not-a-number" } },
				ConfigSchema,
				{},
			);
		} catch (e) {
			error = e;
		}
		expect(error !== null || result === undefined).toBe(true);
	});
});
