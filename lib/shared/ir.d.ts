/** 中间表示节点（代码生成的抽象语法树）。 */
export interface IrNode {
    /** Composable 函数名，如 "Button"。 */
    composable: string;
    /** 该节点需要的 import 符号（FQN）。 */
    imports: string[];
    /** 属性（按源码顺序；modifier 始终在最后）。 */
    attrs: IrAttr[];
    /** 默认子节点。 */
    children?: IrNode[];
    /** 命名槽（如 Scaffold 的 content、TopAppBar 的 title）。 */
    slots?: Record<string, IrNode[]>;
    /** 生成注释（节点语义分区）。 */
    comments?: string[];
    /** 渲染方式（来自 descriptor.codegen.render；slot 类型无子节点时生成空 lambda）。 */
    renderKind?: "leaf" | "container" | "slot";
}
export interface IrAttr {
    /** 参数名，如 "onClick"、"text"、"modifier"。 */
    name: string;
    value: IrValue;
    /** 数值单位（dp/sp）；render 阶段据此添加后缀。 */
    unit?: "dp" | "sp";
}
export type IrValue = {
    kind: "literal";
    value: string | number | boolean;
} | {
    kind: "token";
    token: string;
} | {
    kind: "expression";
    code: string;
} | {
    kind: "resource";
    name: string;
};
/** 代码生成选项（docs/design.md 9）。 */
export interface GenerateOptions {
    packageName: string;
    composeBom: string;
    usePreviewAnnotation: boolean;
    addModifierDefault: boolean;
    minify: boolean;
}
export interface FileOutput {
    path: string;
    source: string;
}
export declare const DEFAULT_GENERATE_OPTIONS: GenerateOptions;
//# sourceMappingURL=ir.d.ts.map