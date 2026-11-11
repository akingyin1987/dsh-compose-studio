import type { CanvasDocument } from "../../shared/document.js";
import type { GenerateOptions } from "../../shared/ir.js";
import type { DocumentRepository } from "../store/repository.js";
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
export declare function exportDocument(repo: DocumentRepository, doc: CanvasDocument, opts?: ExportOptions): Promise<ExportedFile[]>;
//# sourceMappingURL=export.d.ts.map