import type { CanvasDocument } from "../shared/document.js";
import type { ThemeSpec } from "../shared/theme.js";
export interface StudioTemplate {
    id: string;
    name: string;
    description: string;
    build: (docId: string, name: string, theme: ThemeSpec) => CanvasDocument;
}
export declare const TEMPLATES: StudioTemplate[];
export declare function getTemplate(id: string): StudioTemplate | undefined;
/** 由模板构建文档（未知 id 抛错，由调用方决定回退）。 */
export declare function buildTemplateDocument(id: string, docId: string, name: string, theme: ThemeSpec): CanvasDocument;
//# sourceMappingURL=templates.d.ts.map