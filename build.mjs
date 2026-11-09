// dsh-compose-studio 构建脚本
//
// 1) tsc 生成 .d.ts（tsconfig.build.json，emitDeclarationOnly）
// 2) esbuild 打包 JS 产物：
//    - lib/index.js       服务端入口（ESM，宿主包 external）
//    - lib/invariant.js   双半共享常量（ESM）
//    - lib/client.js      客户端入口（__ModuleLoader__ 包装，react external）
import { build } from "esbuild";
import { execSync } from "node:child_process";
import { rmSync } from "node:fs";

rmSync("lib", { recursive: true, force: true });

// --- 1) 类型声明 ---
execSync("tsc -p tsconfig.build.json", { stdio: "inherit" });

// --- 2) 服务端入口 ---
await build({
  entryPoints: ["src/server/index.ts"],
  outfile: "lib/index.js",
  bundle: true,
  format: "esm",
  platform: "node",
  target: "node20",
  external: ["@deepseek-ai/*", "cordis", "schemastery", "react", "react-dom"],
  sourcemap: true,
  logLevel: "info",
});

// --- 3) 双半共享常量 ---
await build({
  entryPoints: ["src/shared/invariant.ts"],
  outfile: "lib/invariant.js",
  bundle: true,
  format: "esm",
  platform: "neutral",
  target: "es2022",
  sourcemap: true,
  logLevel: "info",
});

// --- 4) 客户端入口（__ModuleLoader__ 格式） ---
await build({
  entryPoints: ["src/client/index.tsx"],
  outfile: "lib/client.js",
  bundle: true,
  format: "cjs",
  platform: "browser",
  target: "es2022",
  jsx: "automatic",
  external: ["react", "react-dom"],
  banner: {
    js: `window.__ModuleLoader__.load({
  id: "dsh-compose-studio",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;`,
  },
  footer: {
    js: `return module.exports;
  },
});`,
  },
  sourcemap: true,
  logLevel: "info",
});

console.log("build complete: lib/index.js, lib/invariant.js, lib/client.js");
