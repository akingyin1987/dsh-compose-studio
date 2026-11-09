// 递归收集 @deepseek-ai 宿主包依赖链中缺失的包（开发期临时工具）
// 用法：node scripts/collect-host-deps.mjs
import fs from "node:fs";
import path from "node:path";

const nm = path.join(process.cwd(), "node_modules", "@deepseek-ai");

function listInstalled() {
	try {
		return new Set(fs.readdirSync(nm));
	} catch {
		return new Set();
	}
}

const installed = listInstalled();
const missing = new Map(); // name -> range

function collect(name) {
	const pkgDir = path.join(nm, name);
	let pkg;
	try {
		pkg = JSON.parse(
			fs.readFileSync(path.join(pkgDir, "package.json"), "utf8")
		);
	} catch {
		return;
	}
	const deps = {
		...pkg.dependencies,
		...pkg.peerDependencies,
		...pkg.optionalDependencies,
	};
	for (const [dep, range] of Object.entries(deps)) {
		if (!dep.startsWith("@deepseek-ai/")) continue;
		const dirName = dep.slice("@deepseek-ai/".length);
		if (!installed.has(dirName) && !missing.has(dep)) {
			missing.set(dep, range);
		}
	}
}

// 从所有已安装包出发收集
for (const name of installed) collect(name);

if (missing.size === 0) {
	console.log("NO_MISSING");
} else {
	console.log(
		[...missing.entries()].map(([n, v]) => `${n}@${v}`).join(" ")
	);
}
