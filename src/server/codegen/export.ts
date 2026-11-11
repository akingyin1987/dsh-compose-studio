// 导出工具：IR → Kotlin 文件写入工作区（docs/design.md 7.2）
// 生成文件写入 .dsh-compose-studio/generated/ 隔离目录；路径限工作区内。
import type { CanvasDocument } from "../../shared/document.js";
import type { GenerateOptions, FileOutput } from "../../shared/ir.js";
import { DEFAULT_GENERATE_OPTIONS } from "../../shared/ir.js";
import type { DocumentRepository } from "../store/repository.js";
import { buildIr } from "./ir.js";
import { render } from "./render.js";

export interface ExportOptions {
	/** 目标目录（相对工作区；默认 .dsh-compose-studio/generated/<docId>）。 */
	targetDir?: string;
	/** 覆盖已有文件（默认 false，存在时报错）。 */
	overwrite?: boolean;
	/** 代码生成选项。 */
	generate?: Partial<GenerateOptions>;
}

export interface ExportedFile {
	path: string;
	bytes: number;
}

/**
 * 导出文档为 Kotlin 文件（写入工作区）。
 * @throws 路径越出工作区或文件已存在（未 overwrite）时
 */
export async function exportDocument(
	repo: DocumentRepository,
	doc: CanvasDocument,
	opts: ExportOptions = {},
): Promise<ExportedFile[]> {
	const ir = buildIr(doc);
	const outputs: FileOutput[] = render(ir, {
		...DEFAULT_GENERATE_OPTIONS,
		...opts.generate,
	});
	const baseDir = opts.targetDir ?? `.dsh-compose-studio/generated/${doc.id}`;
	const files: ExportedFile[] = [];
	for (const out of outputs) {
		const relativePath = `${baseDir}/${out.path}`;
		if (!opts.overwrite && (await repo.exists(relativePath))) {
			throw new Error(
				`文件已存在: ${relativePath}（设置 overwrite=true 覆盖）`,
			);
		}
		await repo.writeFile(relativePath, out.source);
		files.push({ path: relativePath, bytes: out.source.length });
	}
	return files;
}
