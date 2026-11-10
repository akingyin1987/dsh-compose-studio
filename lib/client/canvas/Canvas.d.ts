import React from "react";
import type { CanvasDocument, Node, ContainerNode } from "../../shared/document.js";
import type { StudioState, Action } from "../store.js";
export interface RenderNode {
    id: string;
    type: string;
    label?: string;
    depth: number;
    selected: boolean;
    isContainer: boolean;
    children: RenderNode[];
    props: Record<string, unknown>;
    text?: string;
}
export declare function buildRenderTree(doc: CanvasDocument, selectedIds: Set<string>): RenderNode;
export declare function Canvas({ state, dispatch, }: {
    state: StudioState;
    dispatch: (action: Action) => void;
}): React.JSX.Element;
/** 容器类型集合（判断容器用）。 */
export declare function isContainerType(node: Node): node is ContainerNode;
//# sourceMappingURL=Canvas.d.ts.map