// AI 聊天调整面板（Phase 3 LLM 入口）—— Dark Mode 设计
import React, { useState } from "react";
import { UI } from "../theme/ui.js";

export interface ChatMessage {
	id: number;
	role: "user" | "assistant";
	text: string;
}

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
				borderTop: `1px solid ${UI.border}`,
				background: UI.surface,
				display: "flex",
				flexDirection: "column",
				maxHeight: 200,
				fontFamily: UI.fontSans,
			}}
		>
			{/* 标题 */}
			<div
				style={{
					padding: `${UI.space.sm}px ${UI.space.lg}px ${UI.space.xs}px`,
					fontSize: 11,
					fontWeight: 600,
					color: UI.textMuted,
					letterSpacing: "0.05em",
					textTransform: "uppercase",
				}}
			>
				AI 调整
			</div>
			{/* 消息历史 */}
			<div style={{ flex: 1, overflow: "auto", padding: `0 ${UI.space.lg}px` }}>
				{messages.map((m) => (
					<div
						key={m.id}
						style={{
							marginBottom: UI.space.sm,
							fontSize: 12,
							textAlign: m.role === "user" ? "right" : "left",
						}}
					>
						<span
							style={{
								display: "inline-block",
								padding: `${UI.space.xs}px ${UI.space.md}px`,
								borderRadius: UI.radius.lg,
								background:
									m.role === "user" ? UI.primary : UI.surfaceAlt,
								color: m.role === "user" ? UI.onPrimary : UI.text,
								maxWidth: "80%",
								border:
									m.role === "user"
										? "none"
										: `1px solid ${UI.borderSubtle}`,
							}}
						>
							{m.text}
						</span>
					</div>
				))}
			</div>
			{/* 输入框 */}
			<div
				style={{
					display: "flex",
					gap: UI.space.sm,
					padding: `${UI.space.sm}px ${UI.space.lg}px ${UI.space.md}px`,
				}}
			>
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
						padding: `${UI.space.sm}px ${UI.space.md}px`,
						border: `1px solid ${UI.border}`,
						borderRadius: UI.radius.md,
						background: UI.surfaceAlt,
						color: UI.text,
						fontSize: 13,
						outline: "none",
						fontFamily: UI.fontSans,
					}}
					onFocus={(e) => {
						e.currentTarget.style.borderColor = UI.focus;
					}}
					onBlur={(e) => {
						e.currentTarget.style.borderColor = UI.border;
					}}
				/>
				<button
					onClick={handleSend}
					style={{
						padding: `${UI.space.sm}px ${UI.space.lg}px`,
						border: "none",
						borderRadius: UI.radius.md,
						background: UI.primary,
						color: UI.onPrimary,
						fontSize: 13,
						cursor: "pointer",
						fontFamily: UI.fontSans,
						transition: `background ${UI.transition}`,
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.background = UI.primaryHover;
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.background = UI.primary;
					}}
				>
					发送
				</button>
			</div>
		</div>
	);
}
