// AI 聊天调整面板（Phase 3 LLM 辅助入口；当前为 UI 占位 + 消息记录）
import React, { useState } from "react";

export interface ChatMessage {
	id: number;
	role: "user" | "assistant";
	text: string;
}

/**
 * 聊天面板：底部输入框 + 消息历史。
 * Phase 3 将接入 ctx.llm：用户输入 → LLM 解析 → 调整文档（node/updateProps / add）。
 */
export function ChatPanel() {
	const [messages, setMessages] = useState<ChatMessage[]>([
		{
			id: 0,
			role: "assistant",
			text: "你好！描述你想要的 Compose 组件，我会帮你调整。例如：「添加一个登录表单」「把按钮改成红色」。（AI 功能 Phase 3 接入）",
		},
	]);
	const [text, setText] = useState("");
	const nextId = messages.length;

	const handleSend = (): void => {
		const trimmed = text.trim();
		if (!trimmed) return;
		setMessages([
			...messages,
			{ id: nextId, role: "user", text: trimmed },
			{
				id: nextId + 1,
				role: "assistant",
				text: "（Phase 3）AI 调整已收到，将在接入 LLM 后生成组件。",
			},
		]);
		setText("");
	};

	return (
		<div
			style={{
				borderTop: "1px solid #e0e0e0",
				background: "#fff",
				display: "flex",
				flexDirection: "column",
				maxHeight: 200,
			}}
		>
			{/* 消息历史 */}
			<div style={{ flex: 1, overflow: "auto", padding: "8px 12px" }}>
				{messages.map((m) => (
					<div
						key={m.id}
						style={{
							marginBottom: 6,
							fontSize: 12,
							textAlign: m.role === "user" ? "right" : "left",
						}}
					>
						<span
							style={{
								display: "inline-block",
								padding: "4px 10px",
								borderRadius: 8,
								background:
									m.role === "user" ? "#e3f2fd" : "#f5f5f5",
								maxWidth: "80%",
							}}
						>
							{m.text}
						</span>
					</div>
				))}
			</div>
			{/* 输入框 */}
			<div style={{ display: "flex", gap: 8, padding: "8px 12px" }}>
				<input
					type="text"
					value={text}
					placeholder="描述想要的组件，如「添加一个登录表单」…"
				 onChange={(e) => setText(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") handleSend();
					}}
					style={{
						flex: 1,
						padding: "8px 12px",
						border: "1px solid #d0d0d0",
						borderRadius: 6,
						fontSize: 13,
					}}
				/>
				<button
					onClick={handleSend}
					style={{
						padding: "8px 16px",
						border: "none",
						borderRadius: 6,
						background: "#6750A4",
						color: "#fff",
						fontSize: 13,
						cursor: "pointer",
					}}
				>
					发送
				</button>
			</div>
		</div>
	);
}
