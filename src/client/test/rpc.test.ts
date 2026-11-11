import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { RpcClient } from "../rpc.js";
import type { CanvasDocument } from "../../shared/document.js";

function mockFetch(status: number, data: unknown): ReturnType<typeof vi.fn> {
	return vi.fn().mockResolvedValue({
		ok: status >= 200 && status < 300,
		status,
		json: async () => data,
	});
}

function makeDoc(): CanvasDocument {
	return {
		version: 1,
		id: "d1",
		name: "Test",
		createdAt: 0,
		updatedAt: 0,
		root: { id: "root", type: "m3.Scaffold", props: {}, children: [] },
		nodes: {
			root: { id: "root", type: "m3.Scaffold", props: {}, children: [] },
		},
		theme: {} as CanvasDocument["theme"],
		devices: [],
		activeDeviceId: "phone",
	};
}

describe("RpcClient", () => {
	beforeEach(() => {
		vi.unstubAllGlobals();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("loadDocument 调用 doc/load", async () => {
		const client = new RpcClient();
		const doc = makeDoc();
		vi.stubGlobal("fetch", mockFetch(200, { doc }));
		const result = await client.loadDocument("d1");
		expect(result).toEqual(doc);
		expect(fetch).toHaveBeenCalledWith(
			"/compose-studio/doc/load",
			expect.objectContaining({ method: "POST" }),
		);
	});

	it("saveDocument 调用 doc/save", async () => {
		const client = new RpcClient();
		const doc = makeDoc();
		vi.stubGlobal("fetch", mockFetch(200, { ok: true }));
		await client.saveDocument(doc);
		const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
		expect(url).toBe("/compose-studio/doc/save");
		expect(JSON.parse(init.body)).toEqual({ doc });
	});

	it("exportDocument 调用 doc/export", async () => {
		const client = new RpcClient();
		vi.stubGlobal(
			"fetch",
			mockFetch(200, { files: [{ path: "a.kt", bytes: 10 }] }),
		);
		const files = await client.exportDocument(makeDoc(), { overwrite: true });
		expect(files).toHaveLength(1);
		expect(files[0].path).toBe("a.kt");
	});

	it("listDir 调用 fs/list", async () => {
		const client = new RpcClient();
		vi.stubGlobal("fetch", mockFetch(200, { entries: ["a/", "b.kt"] }));
		const entries = await client.listDir(".");
		expect(entries).toContain("a/");
		expect(entries).toContain("b.kt");
	});

	it("失败时抛 Error（含服务端错误信息）", async () => {
		const client = new RpcClient();
		vi.stubGlobal("fetch", mockFetch(400, { error: "文档不存在" }));
		await expect(client.loadDocument("nope")).rejects.toThrow("文档不存在");
	});

	it("baseUrl 去掉尾部斜杠", async () => {
		const client = new RpcClient("http://localhost:8080/");
		vi.stubGlobal("fetch", mockFetch(200, { doc: makeDoc() }));
		await client.loadDocument("d1");
		const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
		expect(url).toBe("http://localhost:8080/compose-studio/doc/load");
	});
});
