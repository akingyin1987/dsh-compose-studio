import React from "react";
import type { PropSchema } from "../../shared/document.js";
import type { StudioState, Action } from "../store.js";
export declare function PropField({ schema, value, onChange, }: {
    schema: PropSchema;
    value: unknown;
    onChange: (value: unknown) => void;
}): React.JSX.Element | null;
export declare function getSelectedNode(state: StudioState): import("../../shared/document.js").Node | null;
export declare function getPropSchemas(node: import("../../shared/document.js").Node): PropSchema[];
export declare function Inspector({ state, dispatch, }: {
    state: StudioState;
    dispatch: (action: Action) => void;
}): React.JSX.Element;
//# sourceMappingURL=Inspector.d.ts.map