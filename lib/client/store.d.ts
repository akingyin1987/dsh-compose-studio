import type { CanvasDocument, Node } from "../shared/document.js";
import type { ThemeSpec } from "../shared/theme.js";
export declare const HISTORY_LIMIT = 100;
export declare const MERGE_WINDOW_MS = 800;
export interface StudioState {
    document: CanvasDocument;
    selection: {
        ids: string[];
        anchorId: string | null;
    };
    clipboard: ClipboardPayload | null;
    theme: ThemeSpec;
    device: {
        activeId: string;
        zoom: number;
        showGrid: boolean;
    };
    history: {
        undo: HistoryEntry[];
        redo: HistoryEntry[];
    };
    ui: {
        leftWidth: number;
        rightWidth: number;
        inspectorTab: "props" | "theme";
    };
}
export interface ClipboardPayload {
    nodes: Node[];
    fromIds: string[];
}
export interface HistoryEntry {
    action: Action;
    inverse: Action | null;
    label: string;
    ts: number;
}
/** 深Partial（theme/update 用）。 */
export type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
export type Action = {
    type: "node/add";
    parentId: string;
    node: Node;
    index?: number;
    ts?: number;
} | {
    type: "node/remove";
    id: string;
    ts?: number;
} | {
    type: "node/move";
    id: string;
    toParentId: string;
    index: number;
    fromParentId?: string;
    fromIndex?: number;
    ts?: number;
} | {
    type: "node/updateProps";
    id: string;
    patch: Record<string, unknown>;
    ts?: number;
} | {
    type: "node/rename";
    id: string;
    label: string;
    ts?: number;
} | {
    type: "node/restore";
    parentId: string;
    index?: number;
    subtree: Record<string, Node>;
    rootId: string;
    ts?: number;
} | {
    type: "selection/set";
    ids: string[];
    anchorId?: string | null;
    ts?: number;
} | {
    type: "theme/update";
    patch: DeepPartial<ThemeSpec>;
    ts?: number;
} | {
    type: "device/set";
    id: string;
    ts?: number;
} | {
    type: "canvas/zoom";
    zoom: number;
    ts?: number;
} | {
    type: "history/undo";
    ts?: number;
} | {
    type: "history/redo";
    ts?: number;
} | {
    type: "doc/new";
    docId: string;
    name?: string;
    ts?: number;
} | {
    type: "doc/load";
    doc: CanvasDocument;
    ts?: number;
} | {
    type: "doc/rename";
    name: string;
    ts?: number;
};
/** 创建初始状态（含示例文档：Scaffold > Column > [Text, Button]）。 */
export declare function createInitialState(): StudioState;
/** 创建空文档（根为 Scaffold）。 */
export declare function createEmptyDocument(id: string, name?: string): CanvasDocument;
/** 生成唯一文档 id。 */
export declare function generateDocId(): string;
export declare function pushHistory(undo: HistoryEntry[], entry: HistoryEntry): HistoryEntry[];
export declare function reducer(state: StudioState, action: Action): StudioState;
//# sourceMappingURL=store.d.ts.map