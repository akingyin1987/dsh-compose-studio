// IR → Kotlin 渲染（docs/design.md 7.3）
// render(ir, options) → FileOutput[]；纯函数、可快照测试。
// 包含：模板渲染、imports 汇总、Modifier 顺序、@Composable 拆分、postProcess 格式化。
import type {
	IrNode,
	IrAttr,
	GenerateOptions,
	FileOutput,
} from "../../shared/ir.js";
import { DEFAULT_GENERATE_OPTIONS } from "../../shared/ir.js";

interface RenderContext {
	options: GenerateOptions;
	imports: Set<string>;
	extracted: string[][];
}

interface RenderOptions {
	isRoot?: boolean;
	indent: number;
	/** 当前函数的事件参数映射（attr → 唯一参数名；子节点事件引用这些参数）。 */
	eventParams?: Map<IrAttr, string>;
}

/** 渲染 IR → Kotlin 源文件（纯函数）。 */
export function render(
	ir: IrNode,
	options: GenerateOptions = DEFAULT_GENERATE_OPTIONS,
): FileOutput[] {
	const ctx: RenderContext = { options, imports: new Set(), extracted: [] };
	collectImports(ir, ctx.imports);
	ctx.imports.add("androidx.compose.runtime.Composable");
	ctx.imports.add("androidx.compose.ui.Modifier");
	if (hasArrangement(ir)) {
		ctx.imports.add("androidx.compose.foundation.layout.Arrangement");
	}

	const lines: string[] = [
		header(),
		`package ${options.packageName}`,
		"",
		...[...ctx.imports].sort().map((i) => `import ${i}`),
		"",
		...kdoc(ir),
		"@Composable",
		"fun GeneratedScreen(modifier: Modifier = Modifier) {",
		...renderNode(ir, ctx, { isRoot: true, indent: 1 }),
		"}",
	];

	for (const fn of ctx.extracted) {
		lines.push("");
		lines.push(...fn);
	}

	return [{ path: "GeneratedScreen.kt", source: postProcess(lines.join("\n")) }];
}

/** 渲染单个节点（递归子节点）。 */
function renderNode(ir: IrNode, ctx: RenderContext, opts: RenderOptions): string[] {
	const ind = "    ".repeat(opts.indent);
	const lines: string[] = [];

	if (ir.comments) {
		lines.push(...ir.comments.map((c) => ind + c));
	}

	const args: string[] = [];
	for (const attr of ir.attrs) {
		// Column/Row spacing → Arrangement（官方语法）
		if (ir.composable === "Column" && attr.name === "spacing") {
			args.push(`verticalArrangement = Arrangement.spacedBy(${renderValue(attr)})`);
			continue;
		}
		if (ir.composable === "Row" && attr.name === "spacing") {
			args.push(`horizontalArrangement = Arrangement.spacedBy(${renderValue(attr)})`);
			continue;
		}
		// modifier：根节点用函数参数，子节点内联
		if (attr.name === "modifier") {
			args.push(`modifier = ${opts.isRoot ? "modifier" : renderValue(attr)}`);
			continue;
		}
		// 事件参数引用（提升后由父函数传入）
		if (attr.name.startsWith("on") && opts.eventParams?.has(attr)) {
			args.push(`${attr.name} = ${opts.eventParams.get(attr)}`);
			continue;
		}
		args.push(`${attr.name} = ${renderValue(attr)}`);
	}

	const sig = `${ir.composable}(${args.join(", ")})`;
	const children = ir.children ?? [];
	const slotEntries = Object.entries(ir.slots ?? {}).filter(([, v]) => v.length > 0);

	if (children.length === 0 && slotEntries.length === 0) {
		// slot 类型组件（如 Button）即使无子节点也要生成 content lambda
		lines.push(ind + (ir.renderKind === "slot" ? `${sig} { }` : sig));
		return lines;
	}

	lines.push(ind + sig + " {");

	for (const child of children) {
		lines.push(
			...renderNode(child, ctx, {
				indent: opts.indent + 1,
				eventParams: opts.eventParams,
			}),
		);
	}

	// slot 子节点提取为独立 @Composable 函数
	for (const [slotName, slotChildren] of slotEntries) {
		const fnName = opts.isRoot
			? `Generated${capitalize(slotName)}`
			: `Generated${capitalize(ir.composable)}${capitalize(slotName)}`;
		const events = collectEvents(slotChildren);
		const { lines: fnLines, paramNames } = renderPrivateFunction(
			fnName,
			slotChildren,
			events,
			ctx,
		);
		ctx.extracted.push(fnLines);
		const eventArgs = events.map(
			(e, i) =>
				`${paramNames[i]} = ${e.attr.value.kind === "expression" ? e.attr.value.code : "{ /* TODO */ }"}`,
		);
		const allArgs = ["modifier = Modifier", ...eventArgs];
		lines.push(ind + "    " + `${fnName}(${allArgs.join(", ")})`);
	}

	lines.push(ind + "}");
	return lines;
}

/** 渲染提取的 private @Composable 函数；返回函数行与事件参数名（供调用处传参）。 */
function renderPrivateFunction(
	name: string,
	children: IrNode[],
	events: { attr: IrAttr; composable: string }[],
	ctx: RenderContext,
): { lines: string[]; paramNames: string[] } {
	const lines: string[] = [];
	lines.push("/**");
	lines.push(` * ${name} — 提取的区域。`);
	lines.push(" */");
	lines.push("@Composable");

	const params = ["modifier: Modifier = Modifier"];
	const eventParams = new Map<IrAttr, string>();
	const paramNames: string[] = [];
	const used = new Set<string>();
	for (const e of events) {
		const p = uniqueEventParamName(e, used);
		params.push(`${p}: ${eventParamType(e.attr)}`);
		eventParams.set(e.attr, p);
		paramNames.push(p);
	}
	lines.push(`private fun ${name}(${params.join(", ")}) {`);

	for (const child of children) {
		lines.push(...renderNode(child, ctx, { indent: 1, eventParams }));
	}

	lines.push("}");
	return { lines, paramNames };
}

/** 事件参数名：handle<Composable><Event>，重名时加序号。 */
function uniqueEventParamName(
	e: { attr: IrAttr; composable: string },
	used: Set<string>,
): string {
	const base = `handle${capitalize(e.composable)}${capitalize(
		e.attr.name.replace(/^on/, ""),
	)}`;
	let name = base;
	let i = 2;
	while (used.has(name)) {
		name = `${base}${i}`;
		i += 1;
	}
	used.add(name);
	return name;
}

/** 收集子树中的事件属性。 */
function collectEvents(roots: IrNode[]): { attr: IrAttr; composable: string }[] {
	const events: { attr: IrAttr; composable: string }[] = [];
	const walk = (node: IrNode): void => {
		for (const attr of node.attrs) {
			if (attr.name.startsWith("on")) {
				events.push({ attr, composable: node.composable });
			}
		}
		for (const child of node.children ?? []) walk(child);
		for (const slotChildren of Object.values(node.slots ?? {})) {
			for (const child of slotChildren) walk(child);
		}
	};
	for (const root of roots) walk(root);
	return events;
}

/** 事件参数类型。 */
function eventParamType(attr: IrAttr): string {
	if (attr.name === "onValueChange") return "(String) -> Unit";
	return "() -> Unit";
}

/** 属性值 → Kotlin 语法。 */
function renderValue(attr: IrAttr): string {
	const v = attr.value;
	switch (v.kind) {
		case "literal":
			if (typeof v.value === "string") return `"${escapeString(v.value)}"`;
			if (attr.unit === "dp") return `${v.value}.dp`;
			if (attr.unit === "sp") return `${v.value}.sp`;
			return String(v.value);
		case "token":
			return v.token;
		case "expression":
			return v.code;
		case "resource":
			return `stringResource(R.string.${v.name})`;
	}
}

/** 收集全部 import（去重）。 */
function collectImports(ir: IrNode, imports: Set<string>): void {
	for (const imp of ir.imports) imports.add(imp);
	for (const child of ir.children ?? []) collectImports(child, imports);
	for (const slotChildren of Object.values(ir.slots ?? {})) {
		for (const child of slotChildren) collectImports(child, imports);
	}
}

/** 是否需要 Arrangement（Column/Row spacing）。 */
function hasArrangement(ir: IrNode): boolean {
	if (
		(ir.composable === "Column" || ir.composable === "Row") &&
		ir.attrs.some((a) => a.name === "spacing")
	) {
		return true;
	}
	for (const child of ir.children ?? []) {
		if (hasArrangement(child)) return true;
	}
	for (const slotChildren of Object.values(ir.slots ?? {})) {
		for (const child of slotChildren) {
			if (hasArrangement(child)) return true;
		}
	}
	return false;
}

function header(): string {
	return "// Generated by dsh-compose-studio. Do not edit manually.";
}

function kdoc(ir: IrNode): string[] {
	return ["/**", " * Generated screen.", ` * Root: ${ir.composable}`, " */"];
}

/** 后处理：移除多余空行、行尾空格，确保文件末尾换行。 */
export function postProcess(source: string): string {
	return source
		.replace(/\n{3,}/g, "\n\n")
		.replace(/[ \t]+$/gm, "")
		.trim() + "\n";
}

function capitalize(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1);
}

function escapeString(s: string): string {
	return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
