import { describe, expect, it } from "vitest";
import {
	RPC_PREFIX,
	PROTOCOL_VERSION,
	MAIN_PANEL_ID,
	RPC_METHOD,
} from "../invariant.js";

describe("invariant 契约常量", () => {
	it("暴露双半共享常量", () => {
		expect(RPC_PREFIX).toBe("/compose-studio");
		expect(PROTOCOL_VERSION).toBe(1);
		expect(MAIN_PANEL_ID).toBe("composeStudio");
	});

	it("RPC 方法名预留完整", () => {
		expect(RPC_METHOD.PING).toBe("ping");
		expect(RPC_METHOD.DOC_LOAD).toBe("doc/load");
		expect(RPC_METHOD.DOC_SAVE).toBe("doc/save");
		expect(RPC_METHOD.DOC_EXPORT).toBe("doc/export");
		expect(RPC_METHOD.CODEGEN_GENERATE).toBe("codegen/generate");
		expect(RPC_METHOD.LLM_GENERATE).toBe("llm/generate");
		expect(RPC_METHOD.THEME_RESOLVE).toBe("theme/resolve");
	});
});
