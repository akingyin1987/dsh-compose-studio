// 工作区文件读写（含 fence，docs/design.md 6.5）
// 所有文件操作限制在工作区根目录内，防止路径穿越。
import * as path from "node:path";

/** 路径越出工作区错误。 */
export class WorkspaceFenceError extends Error {
	constructor(relative: string) {
		super(`路径越出工作区: ${relative}`);
		this.name = "WorkspaceFenceError";
	}
}

/**
 * 解析安全路径（限工作区内）。
 * @param root 工作区根目录（绝对路径）
 * @param relative 相对路径
 * @throws WorkspaceFenceError 路径越出工作区时
 */
export function resolveSafePath(root: string, relative: string): string {
	const rootResolved = path.resolve(root);
	const resolved = path.resolve(rootResolved, relative);
	if (resolved !== rootResolved && !resolved.startsWith(rootResolved + path.sep)) {
		throw new WorkspaceFenceError(relative);
	}
	return resolved;
}

/** 检查相对路径是否在工作区内（不抛异常）。 */
export function isPathSafe(root: string, relative: string): boolean {
	try {
		resolveSafePath(root, relative);
		return true;
	} catch {
		return false;
	}
}
