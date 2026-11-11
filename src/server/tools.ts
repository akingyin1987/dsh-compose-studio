// 服务端工具定义（docs/design.md 4.6）
import { defineTool } from "@deepseek-ai/dsh-tools";
import type { DocumentRepository } from "./store/repository.js";
import { exportDocument } from "./codegen/export.js";

/** 定义 compose_studio_export 工具。 */
export function defineExportTool(repository: DocumentRepository) {
	return defineTool({
		name: "compose_studio_export",
		description:
			"Export a Compose Studio document as Kotlin source files to the workspace. " +
			"Files are written to .dsh-compose-studio/generated/<docId>/ by default. " +
			"Use when the user wants to save generated Compose code to their project.",
		parameters: {
			documentId: {
				type: "string",
				description: "Document id to export.",
			},
			targetDir: {
				type: "string",
				description:
					"Target directory relative to workspace (default: .dsh-compose-studio/generated/<docId>).",
			},
			overwrite: {
				type: "boolean",
				description: "Overwrite existing files (default: false).",
			},
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					files: {
						type: "array",
						required: true,
						items: {
							type: "object",
							additionalProperties: false,
							properties: {
								path: { type: "string", required: true },
								bytes: { type: "number", required: true },
							},
						},
					},
				},
			},
			render: (_args, v) => [
				{
					type: "text",
					text:
						`Exported ${v.files.length} file(s):\n` +
						v.files.map((f: { path: string }) => `  - ${f.path}`).join("\n"),
				},
			],
		},
		execute: async (args) => {
			const doc = await repository.load(String(args.documentId));
			const files = await exportDocument(repository, doc, {
				targetDir: args.targetDir as string | undefined,
				overwrite: Boolean(args.overwrite),
			});
			return { files };
		},
	});
}
