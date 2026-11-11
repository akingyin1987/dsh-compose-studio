import React from "react";
import type { PropSchema } from "../../shared/document.js";
import type { StudioState, Action } from "../store.js";
export declare function PropField({ schema, value, onChange, }: {
    schema: PropSchema;
    value: unknown;
    onChange: (value: unknown) => void;
}): React.JSX.Element | null;
/** 通用 Modifier 字段（所有组件可用；存于 node.props，modifier 前缀避免冲突）。 */
export declare const MODIFIER_FIELDS: readonly [{
    readonly key: "modifierWidth";
    readonly label: "宽";
    readonly kind: "size";
}, {
    readonly key: "modifierHeight";
    readonly label: "高";
    readonly kind: "size";
}, {
    readonly key: "modifierPadding";
    readonly label: "内边距 (dp)";
    readonly kind: "dp";
}, {
    readonly key: "modifierBackground";
    readonly label: "背景色";
    readonly kind: "color";
}];
/** 尺寸模式选项。 */
export declare const SIZE_MODE_OPTIONS: readonly [{
    readonly value: "fixed";
    readonly label: "固定 (dp)";
}, {
    readonly value: "wrap";
    readonly label: "包裹内容";
}, {
    readonly value: "match";
    readonly label: "填充父容器";
}, {
    readonly value: "weight";
    readonly label: "权重 (weight)";
}];
/** 从 props 读取修饰符样式（纯函数，可测试）。 */
export { getModifierStyle } from "../canvas/drag.js";
export declare function getSelectedNode(state: StudioState): import("../../shared/document.js").Node | null;
export declare function getPropSchemas(node: import("../../shared/document.js").Node): PropSchema[];
export declare function Inspector({ state, dispatch, }: {
    state: StudioState;
    dispatch: (action: Action) => void;
}): React.JSX.Element;
//# sourceMappingURL=Inspector.d.ts.map