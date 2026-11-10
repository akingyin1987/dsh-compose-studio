import React from "react";
export interface ChatMessage {
    id: number;
    role: "user" | "assistant";
    text: string;
}
/**
 * 聊天面板：底部输入框 + 消息历史。
 * Phase 3 将接入 ctx.llm：用户输入 → LLM 解析 → 调整文档（node/updateProps / add）。
 */
export declare function ChatPanel(): React.JSX.Element;
//# sourceMappingURL=ChatPanel.d.ts.map