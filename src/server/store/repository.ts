// 文档存储（docs/design.md 6.5：<workspace>/.dsh-compose-studio/<docId>.json）
import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { CanvasDocument } from "../../shared/document.js";
import { DOCUMENT_VERSION } from "../../shared/document.js";
import { isVersionSupported, assertDocumentInvariants } from "../../shared/validate.js";
import { resolveSafePath } from "./workspace.js";

/** 工作室目录（工作区内）。 */
export const STUDIO_DIR = ".dsh-compose-studio";

/** 文档 id 合法字符（防止路径穿越）。 */
const DOC_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

export class DocumentRepository {
	private readonly workspaceRoot: string;

	constructor(workspaceRoot: string) {
		this.workspaceRoot = path.resolve(workspaceRoot);
	}

	/** 文档文件路径（工作区内）。 */
	private docPath(docId: string): string {
		if (!DOC_ID_PATTERN.test(docId)) {
			throw new Error(`非法文档 id: ${docId}`);
		}
		return resolveSafePath(this.workspaceRoot, `${STUDIO_DIR}/${docId}.json`);
	}

	/** 加载文档（含版本校验 + 不变式校验）。 */
	async load(docId: string): Promise<CanvasDocument> {
		const filePath = this.docPath(docId);
		const content = await fs.readFile(filePath, "utf-8");
		const doc = JSON.parse(content) as CanvasDocument;
		if (!isVersionSupported(doc.version)) {
			throw new Error(
				`不支持的文档版本: ${doc.version}（当前支持 v${DOCUMENT_VERSION}）`,
			);
		}
		assertDocumentInvariants(doc);
		return doc;
	}

	/** 保存文档（含不变式校验）。 */
	async save(doc: CanvasDocument): Promise<void> {
		assertDocumentInvariants(doc);
		const filePath = this.docPath(doc.id);
		await fs.mkdir(path.dirname(filePath), { recursive: true });
		await fs.writeFile(filePath, JSON.stringify(doc, null, 2), "utf-8");
	}

	/** 列出全部文档 id。 */
	async listDocs(): Promise<string[]> {
		const dir = resolveSafePath(this.workspaceRoot, STUDIO_DIR);
		try {
			const entries = await fs.readdir(dir, { withFileTypes: true });
			return entries
				.filter((e) => e.isFile() && e.name.endsWith(".json"))
				.map((e) => e.name.replace(/\.json$/, ""))
				.sort();
		} catch {
			return [];
		}
	}

	/** 列出工作区目录内容（用于导出选择；含 fence）。 */
	async listDir(relativeDir: string): Promise<string[]> {
		const dir = resolveSafePath(this.workspaceRoot, relativeDir || ".");
		try {
			const entries = await fs.readdir(dir, { withFileTypes: true });
			return entries.map((e) => (e.isDirectory() ? `${e.name}/` : e.name)).sort();
		} catch {
			return [];
		}
	}

	/** 读取工作区文本文件（含 fence）。 */
	async readFile(relativePath: string): Promise<string> {
		const filePath = resolveSafePath(this.workspaceRoot, relativePath);
		return fs.readFile(filePath, "utf-8");
	}

	/** 判断工作区文件是否存在（含 fence）。 */
	async exists(relativePath: string): Promise<boolean> {
		try {
			await fs.access(resolveSafePath(this.workspaceRoot, relativePath));
			return true;
		} catch {
			return false;
		}
	}

	/** 写入工作区文本文件（含 fence；自动创建父目录）。 */
	async writeFile(relativePath: string, content: string): Promise<void> {
		const filePath = resolveSafePath(this.workspaceRoot, relativePath);
		await fs.mkdir(path.dirname(filePath), { recursive: true });
		await fs.writeFile(filePath, content, "utf-8");
	}
}
