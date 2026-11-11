import type { CanvasDocument, Node } from "../../shared/document.js";
import type { ComponentDescriptor } from "../palette/catalog.js";
/** 拖拽数据类型（palette 与 canvas 共用；payload 为 descriptor id 或节点 id）。 */
export declare const DND_MIME = "application/x-compose-studio";
export type Axis = "vertical" | "horizontal";
/** 子节点在主轴上的几何（start/end 已由调用方按轴取好坐标）。 */
export interface ChildGeometry {
    id: string;
    start: number;
    end: number;
}
export interface DropTarget {
    parentId: string;
    index: number;
}
/** 节点主轴（Row/FlowRow/LazyRow 水平，其余垂直）。 */
export declare function axisOf(nodeType: string): Axis;
/**
 * 计算插入 index：返回第一个中点超过指针位置的子元素下标。
 * pointer 与几何同坐标系（clientX/clientY），axis 决定用哪个分量。
 */
export declare function computeInsertIndex(axis: Axis, children: ChildGeometry[], x: number, y: number): number;
/** 在文档中查找节点的父容器 id（遍历 children 与 slots）。 */
export declare function findParentId(doc: CanvasDocument, id: string): string | null;
/**
 * 解析落点容器：命中容器 → 用其自身；命中叶子 → 用父容器；未命中 → null。
 */
export declare function resolveContainerId(doc: CanvasDocument, hitId: string | null): string | null;
/**
 * 解析完整落点（容器 + index）。
 * childGeometries 为命中容器内直接子节点的几何（顺序与文档 children 一致）。
 */
export declare function resolveDropTarget(doc: CanvasDocument, hitId: string | null, axis: Axis, childGeometries: ChildGeometry[], x: number, y: number): DropTarget | null;
/** 判断 id 是否在 subtreeRootId 的子树中（含自身）；用于禁止把容器拖入自身/子孙。 */
export declare function isInSubtree(doc: CanvasDocument, id: string, subtreeRootId: string): boolean;
/** 修饰符样式（宽/高/内边距/背景色/权重）。 */
export interface ModifierStyle {
    width?: number | string;
    height?: number | string;
    padding?: number;
    background?: string;
    flex?: number;
}
/** 从节点 props 读取修饰符样式（宽/高/内边距/背景色/权重，纯函数）。
 * key 带 modifier 前缀，避免与组件自身属性（如 Image 的 width）冲突。
 * 尺寸模式：props.modifierWidthMode / modifierHeightMode（fixed/wrap/match/weight）。 */
export declare function getModifierStyle(props: Record<string, unknown>): ModifierStyle;
/** 由 descriptor 创建默认节点（id 在 takenIds 中唯一，按序号递增）。 */
export declare function createNodeFromDescriptor(descriptor: ComponentDescriptor, takenIds: Set<string>): Node;
//# sourceMappingURL=drag.d.ts.map