import React from "react";
import type { RenderNode } from "./Canvas.js";
import { type DropTarget } from "./drag.js";
export declare function PreviewNode({ node, onSelect, dropIndicator, showBorders, }: {
    node: RenderNode;
    onSelect: (id: string) => void;
    dropIndicator?: DropTarget | null;
    /** 显示容器边界虚线（默认开启）。 */
    showBorders?: boolean;
}): React.JSX.Element;
//# sourceMappingURL=PreviewRenderer.d.ts.map