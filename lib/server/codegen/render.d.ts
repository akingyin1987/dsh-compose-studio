import type { IrNode, GenerateOptions, FileOutput } from "../../shared/ir.js";
/** 渲染 IR → Kotlin 源文件（纯函数）。 */
export declare function render(ir: IrNode, options?: GenerateOptions): FileOutput[];
/** 后处理：移除多余空行、行尾空格，确保文件末尾换行。 */
export declare function postProcess(source: string): string;
//# sourceMappingURL=render.d.ts.map