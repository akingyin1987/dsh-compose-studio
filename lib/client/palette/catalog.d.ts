import type { PropSchema } from "../../shared/document.js";
export interface CodegenHint {
    imports: string[];
    render: "leaf" | "container" | "slot";
    slotProp?: string;
    modifierFirst?: boolean;
    wrapperTemplate?: string;
}
export interface PreviewSpec {
    kind: "text" | "button" | "container" | "image" | "icon" | "field" | "progress" | "toggle" | "divider" | "card" | "appbar" | "navigation" | "dialog" | "tooltip" | "badge" | "tab" | "canvas" | "spacer" | "slider" | "chip";
    text?: string;
}
export interface ChildrenSchema {
    accepts?: string[];
    slotProp?: string;
}
export interface ComponentDescriptor {
    /** 稳定 id，如 "m3.Button"。 */
    id: string;
    composable: string;
    fqn: string;
    category: string;
    brief: string;
    docsUrl?: string;
    icon?: string;
    defaultProps: PropSchema[];
    defaultChildren?: ChildrenSchema;
    codegen: CodegenHint;
    preview: PreviewSpec;
    tags: string[];
}
export interface ComponentCategory {
    id: string;
    label: string;
    icon?: string;
    children: ComponentDescriptor[];
}
export declare const CATALOG: ComponentCategory[];
export declare const ALL_DESCRIPTORS: ComponentDescriptor[];
export declare function findDescriptor(id: string): ComponentDescriptor | undefined;
export declare function searchDescriptors(query: string): ComponentDescriptor[];
//# sourceMappingURL=catalog.d.ts.map