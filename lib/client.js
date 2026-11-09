// dsh-compose-studio —— 客户端入口
// DSH 客户端通过 window.__ModuleLoader__.load 加载本文件。
// factory 接收 require，用于解析宿主提供的 React 等模块。
window.__ModuleLoader__.load({
	id: "dsh-compose-studio",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;

		var React = require("react");
		var e = React.createElement;

		// --- 主面板：三栏布局占位（Phase 0 骨架） ---
		function ComposeStudioPanel() {
			return e(
				"div",
				{
					style: {
						display: "flex",
						height: "100%",
						fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
						color: "#222",
						background: "#fafafa"
					}
				},
				e(
					"div",
					{
						style: {
							flex: 1,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontSize: 14,
							color: "#666"
						}
					},
					"Compose Studio — Phase 0 skeleton"
				)
			);
		}

		// --- 侧栏入口图标 ---
		function PanelIcon() {
			return e(
				"span",
				{ style: { display: "inline-flex", fontSize: 16, color: "currentColor" } },
				"◆"
			);
		}

		// --- 客户端插件入口 ---
		function apply(ctx) {
			// 主面板（keyed slot）
			ctx.slots.inject("main", function* () {
				yield ctx.slots.register(
					{
						name: "main",
						key: "composeStudio",
						children: {}
					},
					ComposeStudioPanel
				);
			});

			// 侧栏入口
			ctx.slots.inject("sidebar.panellist", () =>
				ctx.slots.register(
					{
						name: "sidebar.panellist",
						id: "composeStudio",
						order: 80,
						label: () => "Compose Studio"
					},
					PanelIcon
				)
			);
		}

		exports.apply = apply;
		exports.inject = ["slots", "layout", "locale"];
		return module.exports;
	}
});
