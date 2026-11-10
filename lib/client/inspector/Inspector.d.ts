import React from "react";
import type { PropSchema } from "../../shared/document.js";
import type { StudioState, Action } from "../store.js";
export declare function PropField({ schema, value, onChange, }: {
    schema: PropSchema;
    value: unknown;
    onChange: (value: unknown) => void;
}): React.JSX.Element | null;
/** 获取当前选中的节点（无选中返回 null）。 */
export declare function getSelectedNode(state: StudioState): import("../../shared/document.js").Node | null;
/** 获取节点的可配置属性 schema（无 descriptor 返回空数组）。 */
export declare function getPropSchemas(node: import("../../shared/document.js").Node): PropSchema[];
export declare function Inspector({ state, dispatch, }: {
    state: StudioState;
    dispatch: (action: Action) => void;
}): React.JSX.Element;
//# sourceMappingURL=Inspector.d.ts.map