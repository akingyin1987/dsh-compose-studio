import { describe, expect, it, afterEach } from "vitest";
import { EventEmitter } from "node:events";
import type { IncomingMessage, ServerResponse } from "node:http";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { createStudioHandler } from "../rpc.js";
import { DocumentRepository } from "../store/repository.js";
import type { CanvasDocument, ContainerNode } from "../../shared/document.js";
import { createDefaultTheme } from "../../shared/theme.js";
import { BUILTIN_DEVICES } from "../../shared/device.js";

const tempDirs: string[] = [];

async function makeTempDir(): Promise<string> {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), "compose-studio-rpc-"));
	tempDirs.push(dir);
	return dir;
}

afterEach(async () => {
	while (tempDirs.length > 0) {
		await fs.rm(tempDirs.pop()!, { recursive: true, force: true });
	}
});

function makeDoc(overrides?: Partial<CanvasDocument>): CanvasDocument {
	const root: ContainerNode = {
		id: "root",
		type: "m3.Scaffold",
		props: {},
		children: [],
	};
	return {
		version: 1,
		id: "test-doc",
		name: "Test",
		createdAt: 0,
		updatedAt: 0,
		root,
		nodes: { root },
		theme: createDefaultTheme(),
		devices: BUILTIN_DEVICES,
		activeDeviceId: "phone",
		...overrides,
	};
}

/** 模拟 IncomingMessage。 */
function mockReq(
	method: string,
	url: string,
	body?: string,
): IncomingMessage {
	const req = new EventEmitter() as IncomingMessage;
	req.method = method;
	req.url = url;
	if (body !== undefined) {
		process.nextTick(() => {
			req.emit("data", Buffer.from(body));
			req.emit("end");
		});
	}
	return req;
}

/** 模拟 ServerResponse（捕获 statusCode 与 body）。 */
function mockRes(): ServerResponse & { statusCode: number; body: string } {
	const res = {
		statusCode: 0,
		headers: {} as Record<string, string>,
		body: "",
		writeHead(status: number, headers?: Record<string, string>) {
			this.statusCode = status;
			this.headers = headers ?? {};
			return this;
		},
		end(chunk?: string) {
			this.body = chunk ?? "";
			return this;
		},
	};
	return res as unknown as ServerResponse & { statusCode: number; body: string };
}

describe("createStudioHandler", () => {
	it("ping → 200 ok", async () => {
		const dir = await makeTempDir();
		const handler = createStudioHandler(new DocumentRepository(dir));
		const req = mockReq("GET", "/compose-studio/ping");
		const res = mockRes();
		await handler(req, res);
		expect(res.statusCode).toBe(200);
		expect(JSON.parse(res.body).ok).toBe(true);
	});

	it("doc/save → 200 ok", async () => {
		const dir = await makeTempDir();
		const handler = createStudioHandler(new DocumentRepository(dir));
		const req = mockReq(
			"POST",
			"/compose-studio/doc/save",
			JSON.stringify({ doc: makeDoc() }),
		);
		const res = mockRes();
		await handler(req, res);
		expect(res.statusCode).toBe(200);
		expect(JSON.parse(res.body).ok).toBe(true);
	});

	it("doc/load → 返回文档", async () => {
		const dir = await makeTempDir();
		const repo = new DocumentRepository(dir);
		await repo.save(makeDoc());
		const handler = createStudioHandler(repo);
		const req = mockReq(
			"POST",
			"/compose-studio/doc/load",
			JSON.stringify({ id: "test-doc" }),
		);
		const res = mockRes();
		await handler(req, res);
		expect(res.statusCode).toBe(200);
		expect(JSON.parse(res.body).doc.id).toBe("test-doc");
	});

	it("doc/load 不存在 → 400", async () => {
		const dir = await makeTempDir();
		const handler = createStudioHandler(new DocumentRepository(dir));
		const req = mockReq(
			"POST",
			"/compose-studio/doc/load",
			JSON.stringify({ id: "nope" }),
		);
		const res = mockRes();
		await handler(req, res);
		expect(res.statusCode).toBe(400);
	});

	it("fs/list → 返回 entries", async () => {
		const dir = await makeTempDir();
		const repo = new DocumentRepository(dir);
		await repo.save(makeDoc());
		const handler = createStudioHandler(repo);
		const req = mockReq(
			"POST",
			"/compose-studio/fs/list",
			JSON.stringify({ dir: "." }),
		);
		const res = mockRes();
		await handler(req, res);
		expect(res.statusCode).toBe(200);
		expect(JSON.parse(res.body).entries).toContain(".dsh-compose-studio/");
	});

	it("无效 JSON → 400", async () => {
		const dir = await makeTempDir();
		const handler = createStudioHandler(new DocumentRepository(dir));
		const req = mockReq("POST", "/compose-studio/doc/save", "not-json");
		const res = mockRes();
		await handler(req, res);
		expect(res.statusCode).toBe(400);
	});

	it("未知路径 → 404", async () => {
		const dir = await makeTempDir();
		const handler = createStudioHandler(new DocumentRepository(dir));
		const req = mockReq("GET", "/compose-studio/nope");
		const res = mockRes();
		await handler(req, res);
		expect(res.statusCode).toBe(404);
	});

	it("doc/export → 200 files", async () => {
		const dir = await makeTempDir();
		const handler = createStudioHandler(new DocumentRepository(dir));
		const req = mockReq(
			"POST",
			"/compose-studio/doc/export",
			JSON.stringify({ doc: makeDoc() }),
		);
		const res = mockRes();
		await handler(req, res);
		expect(res.statusCode).toBe(200);
		const body = JSON.parse(res.body);
		expect(body.files).toHaveLength(1);
		expect(body.files[0].path).toContain("GeneratedScreen.kt");
	});

	it("doc/export overwrite=false 已存在 → 400", async () => {
		const dir = await makeTempDir();
		const repo = new DocumentRepository(dir);
		await repo.save(makeDoc());
		const handler = createStudioHandler(repo);
		// 第一次导出
		const req1 = mockReq(
			"POST",
			"/compose-studio/doc/export",
			JSON.stringify({ doc: makeDoc() }),
		);
		const res1 = mockRes();
		await handler(req1, res1);
		expect(res1.statusCode).toBe(200);
		// 第二次导出（不覆盖）
		const req2 = mockReq(
			"POST",
			"/compose-studio/doc/export",
			JSON.stringify({ doc: makeDoc() }),
		);
		const res2 = mockRes();
		await handler(req2, res2);
		expect(res2.statusCode).toBe(400);
	});
});
