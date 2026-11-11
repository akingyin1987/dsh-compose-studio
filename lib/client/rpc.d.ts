import type { CanvasDocument } from "../shared/document.js";
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
export declare class RpcClient {
    private readonly baseUrl;
    constructor(baseUrl?: string);
    private call;
    /** 加载文档。 */
    loadDocument(id: string): Promise<CanvasDocument>;
    /** 保存文档。 */
    saveDocument(doc: CanvasDocument): Promise<void>;
    /** 导出 Kotlin 文件。 */
    exportDocument(doc: CanvasDocument, opts?: ExportOptions): Promise<ExportedFile[]>;
    /** 列出工作区目录。 */
    listDir(dir?: string): Promise<string[]>;
}
//# sourceMappingURL=rpc.d.ts.map