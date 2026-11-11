import { describe, expect, it } from "vitest";
import * as path from "node:path";
import {
	resolveSafePath,
	isPathSafe,
	WorkspaceFenceError,
} from "../store/workspace.js";

describe("workspace fence", () => {
	const root = path.resolve("/tmp/workspace");

	it("允许工作区内路径", () => {
		expect(resolveSafePath(root, "a/b.txt")).toBe(
			path.resolve(root, "a/b.txt"),
		);
		expect(resolveSafePath(root, ".dsh-compose-studio/doc.json")).toBe(
			path.resolve(root, ".dsh-compose-studio/doc.json"),
		);
	});

	it("允许根目录自身", () => {
		expect(resolveSafePath(root, ".")).toBe(root);
	});

	it("拒绝 .. 越界", () => {
		expect(() => resolveSafePath(root, "../etc/passwd")).toThrow(
			WorkspaceFenceError,
		);
		expect(() => resolveSafePath(root, "a/../../etc/passwd")).toThrow(
			WorkspaceFenceError,
		);
	});

	it("拒绝绝对路径越界", () => {
		expect(() => resolveSafePath(root, "/etc/passwd")).toThrow(
			WorkspaceFenceError,
		);
	});

	it("isPathSafe 不抛异常", () => {
		expect(isPathSafe(root, "a/b.txt")).toBe(true);
		expect(isPathSafe(root, "../etc/passwd")).toBe(false);
	});
});
