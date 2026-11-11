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
    readonly label: "宽 (dp)";
    readonly kind: "dp";
}, {
    readonly key: "modifierHeight";
    readonly label: "高 (dp)";
    readonly kind: "dp";
}, {
    readonly key: "modifierPadding";
    readonly label: "内边距 (dp)";
    readonly kind: "dp";
}, {
    readonly key: "modifierBackground";
    readonly label: "背景色";
    readonly kind: "color";
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