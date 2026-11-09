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
interface ClientSlotContext {
    slots: {
        inject(name: string, factory: () => unknown): void;
        register(options: Record<string, unknown>, component: unknown): unknown;
    };
}
export declare function apply(ctx: ClientSlotContext): void;
export declare const inject: string[];
export {};
//# sourceMappingURL=index.d.ts.map