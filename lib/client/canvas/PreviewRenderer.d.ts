import React from "react";
import type { RenderNode } from "./Canvas.js";
import { type DropTarget } from "./drag.js";
import { type PreviewPalette } from "../theme/palette.js";
/** 预览色板 Context：Canvas 提供，PreviewNode 消费（主题变化时整树重绘）。 */
export declare const PreviewPaletteContext: React.Context<PreviewPalette>;
export declare function PreviewNode({ node, onSelect, dropIndicator, showBorders, }: {
    node: RenderNode;
    onSelect: (id: string) => void;
    dropIndicator?: DropTarget | null;
    /** 显示容器边界虚线（默认开启）。 */
    showBorders?: boolean;
}): React.JSX.Element;
//# sourceMappingURL=PreviewRenderer.d.ts.map