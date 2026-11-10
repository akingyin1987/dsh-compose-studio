import type { ClientContext } from "@deepseek-ai/dsh-client-runtime/client";
declare module "@deepseek-ai/dsh-client-ui-slots" {
    interface SlotMap {
        /** 主面板（keyed，root）：编辑器 panel（key=composeStudio）。 */
        main: {
            kind: "keyed";
            scope: "root";
        };
        /** 侧栏底部动作区（list）：编辑器入口。 */
        "sidebar.footer.action": {
            kind: "list";
            scope: "root";
        };
    }
}
declare global {
    interface Window {
        __ModuleLoader__: {
            load(options: {
                id: string;
                factory: (require: (id: string) => unknown) => unknown;
            }): void;
        };
    }
}
interface LayoutService {
    selectPanel(panelId: string | null): void;
}
declare module "@deepseek-ai/cordis" {
    interface Context {
        layout: LayoutService;
    }
}
export declare function apply(ctx: ClientContext): void;
export declare const inject: string[];
export {};
//# sourceMappingURL=index.d.ts.map