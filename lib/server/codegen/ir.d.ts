import type { CanvasDocument } from "../../shared/document.js";
import type { IrNode } from "../../shared/ir.js";
/**
 * 构建 IR（树 walk，纯函数）。
 * 相同输入始终产生相同输出（可快照测试）。
 */
export declare function buildIr(doc: CanvasDocument): IrNode;
//# sourceMappingURL=ir.d.ts.map