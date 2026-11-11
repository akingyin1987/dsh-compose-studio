import type { CanvasDocument } from "../../shared/document.js";
/** 工作室目录（工作区内）。 */
export declare const STUDIO_DIR = ".dsh-compose-studio";
export declare class DocumentRepository {
    private readonly workspaceRoot;
    constructor(workspaceRoot: string);
    /** 文档文件路径（工作区内）。 */
    private docPath;
    /** 加载文档（含版本校验 + 不变式校验）。 */
    load(docId: string): Promise<CanvasDocument>;
    /** 保存文档（含不变式校验）。 */
    save(doc: CanvasDocument): Promise<void>;
    /** 列出全部文档 id。 */
    listDocs(): Promise<string[]>;
    /** 列出工作区目录内容（用于导出选择；含 fence）。 */
    listDir(relativeDir: string): Promise<string[]>;
    /** 读取工作区文本文件（含 fence）。 */
    readFile(relativePath: string): Promise<string>;
    /** 判断工作区文件是否存在（含 fence）。 */
    exists(relativePath: string): Promise<boolean>;
    /** 写入工作区文本文件（含 fence；自动创建父目录）。 */
    writeFile(relativePath: string, content: string): Promise<void>;
}
//# sourceMappingURL=repository.d.ts.map