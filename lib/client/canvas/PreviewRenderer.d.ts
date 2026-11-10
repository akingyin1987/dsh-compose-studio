import React from "react";
import type { RenderNode } from "./Canvas.js";
import { type DropTarget } from "./drag.js";
export declare function PreviewNode({ node, onSelect, dropIndicator, }: {
    node: RenderNode;
    onSelect: (id: string) => void;
    dropIndicator?: DropTarget | null;
}): React.JSX.Element;
//# sourceMappingURL=PreviewRenderer.d.ts.map