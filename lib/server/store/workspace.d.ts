/** 路径越出工作区错误。 */
export declare class WorkspaceFenceError extends Error {
    constructor(relative: string);
}
/**
 * 解析安全路径（限工作区内）。
 * @param root 工作区根目录（绝对路径）
 * @param relative 相对路径
 * @throws WorkspaceFenceError 路径越出工作区时
 */
export declare function resolveSafePath(root: string, relative: string): string;
/** 检查相对路径是否在工作区内（不抛异常）。 */
export declare function isPathSafe(root: string, relative: string): boolean;
//# sourceMappingURL=workspace.d.ts.map