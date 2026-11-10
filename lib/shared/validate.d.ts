import type { CanvasDocument, InvariantErrors } from "./document.js";
/**
 * 完整不变式校验：
 * - 任意节点至多一个父节点
 * - children 无重复 id 且全部可解析
 * - 根节点必须是容器节点
 */
export declare function validateDocument(doc: CanvasDocument): InvariantErrors;
export declare function isDocumentValid(doc: CanvasDocument): boolean;
/** 断言不变式（加载/保存前调用）。 */
export declare function assertDocumentInvariants(doc: CanvasDocument): void;
/** 版本兼容校验（当前仅 v1）。 */
export declare function isVersionSupported(version: number): boolean;
//# sourceMappingURL=validate.d.ts.map