// 常用页面模板（登录 / 注册 / 列表 / 设置 / 个人资料 …）
// 每个模板是纯函数：给定文档 id / 名称 / 主题，产出完整 CanvasDocument。
// 模板节点 id 采用显式命名，保证可读、可测试、可持久化。
import type {
	CanvasDocument,
	ContainerNode,
	LeafNode,
	Node,
} from "../shared/document.js";
import type { ThemeSpec } from "../shared/theme.js";
import { BUILTIN_DEVICES } from "../shared/device.js";

export interface StudioTemplate {
	id: string;
	name: string;
	description: string;
	build: (docId: string, name: string, theme: ThemeSpec) => CanvasDocument;
}

// ===== 节点构造便捷函数 =====

function container(
	id: string,
	type: string,
	props: Record<string, unknown>,
	children: string[] = [],
): ContainerNode {
	return { id, type, props, children };
}

function leaf(
	id: string,
	type: string,
	props: Record<string, unknown>,
	text?: string,
): Node {
	const node: Node = { id, type, props } as Node;
	if (text !== undefined) (node as LeafNode).text = text;
	return node;
}

function makeDoc(
	root: ContainerNode,
	nodes: Record<string, Node>,
	docId: string,
	name: string,
	theme: ThemeSpec,
): CanvasDocument {
	return {
		version: 1,
		id: docId,
		name,
		createdAt: Date.now(),
		updatedAt: Date.now(),
		root,
		nodes,
		theme,
		devices: BUILTIN_DEVICES,
		activeDeviceId: "phone",
	};
}

// ===== 模板定义 =====

const blank: StudioTemplate = {
	id: "blank",
	name: "空白",
	description: "空白 Scaffold，从零开始搭建",
	build: (docId, name, theme) => {
		const root = container("root", "m3.Scaffold", {}, []);
		return makeDoc(root, { root }, docId, name, theme);
	},
};

const login: StudioTemplate = {
	id: "login",
	name: "登录",
	description: "邮箱 + 密码登录，含注册入口",
	build: (docId, name, theme) => {
		const root = container("root", "m3.Scaffold", {}, ["main"]);
		const main = container(
			"main",
			"layout.Column",
			{ spacing: 12, modifierPadding: 24 },
			[
				"logo",
				"title",
				"subtitle",
				"email",
				"password",
				"loginBtn",
				"forgotBtn",
				"spacer",
				"signupRow",
			],
		);
		const nodes: Record<string, Node> = {
			root,
			main,
			logo: leaf("logo", "content.Icon", { name: "star" }),
			title: leaf(
				"title",
				"m3.Text",
				{ text: "欢迎回来", style: { fontSize: 24 } },
				"欢迎回来",
			),
			subtitle: leaf(
				"subtitle",
				"m3.Text",
				{ text: "请登录您的账户", style: { fontSize: 14 } },
				"请登录您的账户",
			),
			email: leaf("email", "m3.OutlinedTextField", { label: "邮箱", value: "" }),
			password: leaf("password", "m3.OutlinedTextField", {
				label: "密码",
				value: "",
			}),
			loginBtn: container("loginBtn", "m3.Button", { text: "登录" }, []),
			forgotBtn: container("forgotBtn", "m3.TextButton", { text: "忘记密码？" }, []),
			spacer: leaf("spacer", "layout.Spacer", { width: 0, height: 8 }),
			signupRow: container("signupRow", "layout.Row", { spacing: 8 }, [
				"signupText",
				"signupBtn",
			]),
			signupText: leaf("signupText", "m3.Text", { text: "还没有账号？" }, "还没有账号？"),
			signupBtn: container("signupBtn", "m3.TextButton", { text: "注册" }, []),
		};
		return makeDoc(root, nodes, docId, name, theme);
	},
};

const signup: StudioTemplate = {
	id: "signup",
	name: "注册",
	description: "账号注册，含姓名 / 邮箱 / 密码",
	build: (docId, name, theme) => {
		const root = container("root", "m3.Scaffold", {}, ["main"]);
		const main = container(
			"main",
			"layout.Column",
			{ spacing: 12, modifierPadding: 24 },
			[
				"logo",
				"title",
				"subtitle",
				"nameField",
				"email",
				"password",
				"confirm",
				"signupBtn",
				"loginRow",
			],
		);
		const nodes: Record<string, Node> = {
			root,
			main,
			logo: leaf("logo", "content.Icon", { name: "star" }),
			title: leaf(
				"title",
				"m3.Text",
				{ text: "创建账号", style: { fontSize: 24 } },
				"创建账号",
			),
			subtitle: leaf(
				"subtitle",
				"m3.Text",
				{ text: "请填写以下信息完成注册", style: { fontSize: 14 } },
				"请填写以下信息完成注册",
			),
			nameField: leaf("nameField", "m3.OutlinedTextField", { label: "姓名", value: "" }),
			email: leaf("email", "m3.OutlinedTextField", { label: "邮箱", value: "" }),
			password: leaf("password", "m3.OutlinedTextField", { label: "密码", value: "" }),
			confirm: leaf("confirm", "m3.OutlinedTextField", { label: "确认密码", value: "" }),
			signupBtn: container("signupBtn", "m3.Button", { text: "注册" }, []),
			loginRow: container("loginRow", "layout.Row", { spacing: 8 }, [
				"loginText",
				"loginBtn",
			]),
			loginText: leaf("loginText", "m3.Text", { text: "已有账号？" }, "已有账号？"),
			loginBtn: container("loginBtn", "m3.TextButton", { text: "登录" }, []),
		};
		return makeDoc(root, nodes, docId, name, theme);
	},
};

const list: StudioTemplate = {
	id: "list",
	name: "列表",
	description: "顶栏 + LazyColumn 消息列表",
	build: (docId, name, theme) => {
		const root = container("root", "m3.Scaffold", {}, ["bar", "list"]);
		const bar = container("bar", "m3.TopAppBar", { title: "消息" }, []);
		const items = Array.from({ length: 5 }, (_, i) => `item${i + 1}`);
		const list = container("list", "layout.LazyColumn", { spacing: 4 }, items);
		const nodes: Record<string, Node> = { root, bar, list };
		const headlines = ["张三", "李四", "王五", "产品资讯", "系统通知"];
		const supportings = [
			"今晚一起吃饭吗？",
			"方案已经发你邮箱了",
			"明天会议室见",
			"Compose 1.9 正式发布",
			"您有一条新的提醒",
		];
		for (let i = 0; i < items.length; i++) {
			nodes[items[i]] = leaf(items[i], "m3.ListItem", {
				headline: headlines[i],
				supporting: supportings[i],
			});
		}
		return makeDoc(root, nodes, docId, name, theme);
	},
};

const settings: StudioTemplate = {
	id: "settings",
	name: "设置",
	description: "顶栏 + 设置项列表（含开关）",
	build: (docId, name, theme) => {
		const root = container("root", "m3.Scaffold", {}, ["bar", "col"]);
		const bar = container("bar", "m3.TopAppBar", { title: "设置" }, []);
		const col = container(
			"col",
			"layout.Column",
			{ spacing: 8 },
			[
				"accountItem",
				"divider1",
				"notifRow",
				"darkRow",
				"divider2",
				"aboutItem",
			],
		);
		const notifRow = container(
			"notifRow",
			"layout.Row",
			{ spacing: 12, modifierPadding: 16 },
			["notifText", "notifSwitch"],
		);
		const darkRow = container(
			"darkRow",
			"layout.Row",
			{ spacing: 12, modifierPadding: 16 },
			["darkText", "darkSwitch"],
		);
		const nodes: Record<string, Node> = {
			root,
			bar,
			col,
			accountItem: leaf("accountItem", "m3.ListItem", {
				headline: "账号与安全",
				supporting: "管理您的账户",
			}),
			divider1: leaf("divider1", "m3.HorizontalDivider", {}),
			notifRow,
			notifText: leaf("notifText", "m3.Text", { text: "消息通知" }, "消息通知"),
			notifSwitch: leaf("notifSwitch", "m3.Switch", { checked: true }),
			darkRow,
			darkText: leaf("darkText", "m3.Text", { text: "深色模式" }, "深色模式"),
			darkSwitch: leaf("darkSwitch", "m3.Switch", { checked: false }),
			divider2: leaf("divider2", "m3.HorizontalDivider", {}),
			aboutItem: leaf("aboutItem", "m3.ListItem", {
				headline: "关于",
				supporting: "版本 1.0.0",
			}),
		};
		return makeDoc(root, nodes, docId, name, theme);
	},
};

const profile: StudioTemplate = {
	id: "profile",
	name: "个人资料",
	description: "头像 + 统计卡片 + 菜单列表",
	build: (docId, name, theme) => {
		const root = container("root", "m3.Scaffold", {}, ["bar", "col"]);
		const bar = container("bar", "m3.TopAppBar", { title: "个人资料" }, []);
		const col = container(
			"col",
			"layout.Column",
			{ spacing: 16, modifierPadding: 16 },
			["headerRow", "statsCard", "menuList"],
		);
		const headerRow = container("headerRow", "layout.Row", { spacing: 16 }, [
			"avatar",
			"infoCol",
		]);
		const infoCol = container("infoCol", "layout.Column", { spacing: 4 }, [
			"nameText",
			"emailText",
		]);
		const statsCard = container("statsCard", "m3.Card", {}, ["statsRow"]);
		const statsRow = container("statsRow", "layout.Row", { spacing: 8 }, [
			"stat1",
			"stat2",
			"stat3",
		]);
		const stat = (id: string, value: string, label: string): ContainerNode =>
			container(
				id,
				"layout.Column",
				{
					spacing: 4,
					horizontalAlignment: "center",
					modifierWidthMode: "weight",
					modifierWidth: 1,
				},
				[`${id}Value`, `${id}Label`],
			);
		const menuList = container("menuList", "layout.Column", {}, [
			"menuItem1",
			"menuDivider",
			"menuItem2",
			"menuItem3",
		]);
		const nodes: Record<string, Node> = {
			root,
			bar,
			col,
			headerRow,
			avatar: leaf("avatar", "content.Image", {
				url: "",
				width: 64,
				height: 64,
			}),
			infoCol,
			nameText: leaf(
				"nameText",
				"m3.Text",
				{ text: "张三", style: { fontSize: 18 } },
				"张三",
			),
			emailText: leaf(
				"emailText",
				"m3.Text",
				{ text: "zhangsan@example.com", style: { fontSize: 12 } },
				"zhangsan@example.com",
			),
			statsCard,
			statsRow,
			stat1: stat("stat1", "128", "动态"),
			stat1Value: leaf("stat1Value", "m3.Text", { text: "128", style: { fontSize: 18 } }, "128"),
			stat1Label: leaf("stat1Label", "m3.Text", { text: "动态", style: { fontSize: 12 } }, "动态"),
			stat2: stat("stat2", "328", "关注"),
			stat2Value: leaf("stat2Value", "m3.Text", { text: "328", style: { fontSize: 18 } }, "328"),
			stat2Label: leaf("stat2Label", "m3.Text", { text: "关注", style: { fontSize: 12 } }, "关注"),
			stat3: stat("stat3", "1.2k", "粉丝"),
			stat3Value: leaf("stat3Value", "m3.Text", { text: "1.2k", style: { fontSize: 18 } }, "1.2k"),
			stat3Label: leaf("stat3Label", "m3.Text", { text: "粉丝", style: { fontSize: 12 } }, "粉丝"),
			menuList,
			menuItem1: leaf("menuItem1", "m3.ListItem", { headline: "账号与安全", supporting: "" }),
			menuDivider: leaf("menuDivider", "m3.HorizontalDivider", {}),
			menuItem2: leaf("menuItem2", "m3.ListItem", { headline: "通知设置", supporting: "" }),
			menuItem3: leaf("menuItem3", "m3.ListItem", { headline: "隐私政策", supporting: "" }),
		};
		return makeDoc(root, nodes, docId, name, theme);
	},
};

export const TEMPLATES: StudioTemplate[] = [
	blank,
	login,
	signup,
	list,
	settings,
	profile,
];

export function getTemplate(id: string): StudioTemplate | undefined {
	return TEMPLATES.find((t) => t.id === id);
}

/** 由模板构建文档（未知 id 抛错，由调用方决定回退）。 */
export function buildTemplateDocument(
	id: string,
	docId: string,
	name: string,
	theme: ThemeSpec,
): CanvasDocument {
	const template = getTemplate(id);
	if (!template) throw new Error(`未知模板: ${id}`);
	return template.build(docId, name, theme);
}
