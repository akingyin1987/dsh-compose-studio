// 客户端 RPC（调用服务端 /compose-studio/* 方法）
import type { CanvasDocument } from "../shared/document.js";
import { RPC_PREFIX, RPC_METHOD } from "../shared/invariant.js";

export interface ExportedFile {
	path: string;
	bytes: number;
}

export interface ExportOptions {
	targetDir?: string;
	overwrite?: boolean;
}

/**
 * 工作室 RPC 客户端。
 * 通过 fetch 调用服务端路由；失败时抛 Error（含服务端错误信息）。
 */
export class RpcClient {
	private readonly baseUrl: string;

	constructor(baseUrl = "") {
		this.baseUrl = baseUrl.replace(/\/$/, "");
	}

	private async call(method: string, payload: unknown): Promise<unknown> {
		const res = await fetch(`${this.baseUrl}${RPC_PREFIX}/${method}`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(payload),
		});
		const data = (await res.json()) as { error?: string };
		if (!res.ok) {
			throw new Error(data.error ?? `RPC ${method} 失败 (${res.status})`);
		}
		return data;
	}

	/** 加载文档。 */
	async loadDocument(id: string): Promise<CanvasDocument> {
		const data = (await this.call(RPC_METHOD.DOC_LOAD, { id })) as {
			doc: CanvasDocument;
		};
		return data.doc;
	}

	/** 保存文档。 */
	async saveDocument(doc: CanvasDocument): Promise<void> {
		await this.call(RPC_METHOD.DOC_SAVE, { doc });
	}

	/** 导出 Kotlin 文件。 */
	async exportDocument(
		doc: CanvasDocument,
		opts: ExportOptions = {},
	): Promise<ExportedFile[]> {
		const data = (await this.call(RPC_METHOD.DOC_EXPORT, { doc, ...opts })) as {
			files: ExportedFile[];
		};
		return data.files;
	}

	/** 列出工作区目录。 */
	async listDir(dir?: string): Promise<string[]> {
		const data = (await this.call("fs/list", { dir })) as { entries: string[] };
		return data.entries;
	}
}
