import { describe, expect, it, afterEach } from "vitest";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { DocumentRepository, STUDIO_DIR } from "../store/repository.js";
import type { CanvasDocument, ContainerNode } from "../../shared/document.js";
import { createDefaultTheme } from "../../shared/theme.js";
import { BUILTIN_DEVICES } from "../../shared/device.js";

const tempDirs: string[] = [];

async function makeTempDir(): Promise<string> {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), "compose-studio-test-"));
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

describe("DocumentRepository", () => {
	it("save → 文件写入 .dsh-compose-studio/<docId>.json", async () => {
		const dir = await makeTempDir();
		const repo = new DocumentRepository(dir);
		await repo.save(makeDoc());
		const filePath = path.join(dir, STUDIO_DIR, "test-doc.json");
		await expect(fs.access(filePath)).resolves.toBeUndefined();
	});

	it("load → save 往返相等", async () => {
		const dir = await makeTempDir();
		const repo = new DocumentRepository(dir);
		const doc = makeDoc();
		await repo.save(doc);
		const loaded = await repo.load("test-doc");
		expect(loaded).toEqual(doc);
	});

	it("load 不存在的文档 → 抛错", async () => {
		const dir = await makeTempDir();
		const repo = new DocumentRepository(dir);
		await expect(repo.load("nope")).rejects.toThrow();
	});

	it("load 旧版本 → 明确错误", async () => {
		const dir = await makeTempDir();
		const repo = new DocumentRepository(dir);
		const oldDoc = makeDoc({ version: 0 as never });
		const filePath = path.join(dir, STUDIO_DIR, "test-doc.json");
		await fs.mkdir(path.dirname(filePath), { recursive: true });
		await fs.writeFile(filePath, JSON.stringify(oldDoc), "utf-8");
		await expect(repo.load("test-doc")).rejects.toThrow(/不支持的文档版本/);
	});

	it("save 损坏文档（根非容器）→ 抛错", async () => {
		const dir = await makeTempDir();
		const repo = new DocumentRepository(dir);
		const bad = makeDoc();
		bad.root = { id: "root", type: "m3.Text", props: {} } as never;
		await expect(repo.save(bad)).rejects.toThrow(/不变式/);
	});

	it("非法 docId（含 ..）→ 抛错", async () => {
		const dir = await makeTempDir();
		const repo = new DocumentRepository(dir);
		const doc = makeDoc({ id: "../evil" });
		await expect(repo.save(doc)).rejects.toThrow(/非法文档 id/);
	});

	it("listDocs 列出全部文档", async () => {
		const dir = await makeTempDir();
		const repo = new DocumentRepository(dir);
		await repo.save(makeDoc({ id: "a" }));
		await repo.save(makeDoc({ id: "b" }));
		const docs = await repo.listDocs();
		expect(docs.sort()).toEqual(["a", "b"]);
	});

	it("listDocs 空目录返回空数组", async () => {
		const dir = await makeTempDir();
		const repo = new DocumentRepository(dir);
		expect(await repo.listDocs()).toEqual([]);
	});

	it("listDir 含 fence（拒绝越界）", async () => {
		const dir = await makeTempDir();
		const repo = new DocumentRepository(dir);
		await expect(repo.listDir("../")).rejects.toThrow(/工作区/);
	});

	it("writeFile 含 fence", async () => {
		const dir = await makeTempDir();
		const repo = new DocumentRepository(dir);
		await expect(repo.writeFile("../evil.txt", "x")).rejects.toThrow(/工作区/);
	});
});
