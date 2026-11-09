import type { ClientContext } from "@deepseek-ai/dsh-client-runtime/client";
declare module "@deepseek-ai/dsh-client-ui-slots" {
    interface SlotMap {
        /** 全局浮层（list，additive）：编辑器面板容器。 */
        "shell.overlay": {
            kind: "list";
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
export declare function apply(ctx: ClientContext): void;
export declare const inject: string[];
//# sourceMappingURL=index.d.ts.map