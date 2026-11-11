import { describe, expect, it, afterEach } from "vitest";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { exportDocument } from "../export.js";
import { DocumentRepository, STUDIO_DIR } from "../../store/repository.js";
import type { CanvasDocument, ContainerNode } from "../../../shared/document.js";
import { createDefaultTheme, createThemeFromPreset } from "../../../shared/theme.js";
import { BUILTIN_DEVICES } from "../../../shared/device.js";

const tempDirs: string[] = [];

async function makeTempDir(): Promise<string> {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), "compose-studio-export-"));
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
		children: ["col"],
	};
	const col: ContainerNode = {
		id: "col",
		type: "layout.Column",
		props: { spacing: 8 },
		children: ["t1"],
	};
	const t1: ContainerNode = {
		id: "t1",
		type: "m3.Text",
		props: { text: "Hello" },
		children: [],
	};
	return {
		version: 1,
		id: "export-doc",
		name: "Export Test",
		createdAt: 0,
		updatedAt: 0,
		root,
		nodes: { root, col, t1 },
		theme: createDefaultTheme(),
		devices: BUILTIN_DEVICES,
		activeDeviceId: "phone",
		...overrides,
	};
}

describe("exportDocument", () => {
	it("写入文件到 .dsh-compose-studio/generated/<docId>/", async () => {
		const dir = await makeTempDir();
		const repo = new DocumentRepository(dir);
		const files = await exportDocument(repo, makeDoc());
		expect(files).toHaveLength(1);
		expect(files[0].path).toBe(
			`${STUDIO_DIR}/generated/export-doc/GeneratedScreen.kt`,
		);
		const content = await repo.readFile(files[0].path);
		expect(content).toContain("GeneratedScreen");
		expect(files[0].bytes).toBe(content.length);
	});

	it("overwrite=false 文件已存在 → 报错", async () => {
		const dir = await makeTempDir();
		const repo = new DocumentRepository(dir);
		await exportDocument(repo, makeDoc());
		await expect(exportDocument(repo, makeDoc())).rejects.toThrow(/已存在/);
	});

	it("overwrite=true 覆盖已有文件", async () => {
		const dir = await makeTempDir();
		const repo = new DocumentRepository(dir);
		await exportDocument(repo, makeDoc());
		const files = await exportDocument(repo, makeDoc(), { overwrite: true });
		expect(files).toHaveLength(1);
	});

	it("targetDir 自定义", async () => {
		const dir = await makeTempDir();
		const repo = new DocumentRepository(dir);
		const files = await exportDocument(repo, makeDoc(), {
			targetDir: "custom/output",
		});
		expect(files[0].path).toBe("custom/output/GeneratedScreen.kt");
	});

	it("路径 fence：targetDir 含 .. → 报错", async () => {
		const dir = await makeTempDir();
		const repo = new DocumentRepository(dir);
		await expect(
			exportDocument(repo, makeDoc(), { targetDir: "../evil" }),
		).rejects.toThrow(/工作区/);
	});

	it("生成的代码含 package 与 imports", async () => {
		const dir = await makeTempDir();
		const repo = new DocumentRepository(dir);
		const files = await exportDocument(repo, makeDoc(), {
			generate: { packageName: "com.example.test" },
		});
		const content = await repo.readFile(files[0].path);
		expect(content).toContain("package com.example.test");
		expect(content).toContain("import androidx.compose.material3.Scaffold");
		expect(content).toContain("import androidx.compose.material3.Text");
	});

	it("导出默认注入文档主题（GeneratedTheme）", async () => {
		const dir = await makeTempDir();
		const repo = new DocumentRepository(dir);
		const doc = makeDoc();
		doc.theme = createThemeFromPreset("purple-dark");
		const files = await exportDocument(repo, doc);
		expect(files).toHaveLength(1);
		const content = await repo.readFile(files[0].path);
		expect(content).toContain("GeneratedTheme");
		expect(content).toContain("darkColorScheme(");
		expect(content).toContain("primary = Color(0xFFD0BCFF)");
	});

	it("generate.theme 覆盖文档主题", async () => {
		const dir = await makeTempDir();
		const repo = new DocumentRepository(dir);
		const files = await exportDocument(repo, makeDoc(), {
			generate: { theme: createThemeFromPreset("green-light") },
		});
		const content = await repo.readFile(files[0].path);
		expect(content).toContain("lightColorScheme(");
		expect(content).toContain("primary = Color(0xFF2E7D32)");
	});
});
