import { describe, expect, it } from "vitest";
import {
	TEMPLATES,
	buildTemplateDocument,
} from "../../../client/templates.js";
import { buildIr } from "../ir.js";
import { render } from "../render.js";
import { DEFAULT_GENERATE_OPTIONS } from "../../../shared/ir.js";
import { createThemeFromPreset } from "../../../shared/theme.js";

describe("模板代码生成", () => {
	for (const template of TEMPLATES) {
		it(`${template.id} 生成合法 Kotlin`, () => {
			const doc = buildTemplateDocument(
				template.id,
				`doc-${template.id}`,
				template.name,
				createThemeFromPreset("purple-light"),
			);
			const [file] = render(buildIr(doc), {
				...DEFAULT_GENERATE_OPTIONS,
				theme: doc.theme,
			});
			expect(file.source).toContain("fun GeneratedScreen");
			expect(file.source).toContain("GeneratedTheme {");
			// 无未定义 / NaN 泄漏
			expect(file.source).not.toContain("undefined");
			expect(file.source).not.toContain("NaN");
		});
	}

	it("登录模板生成 Button / TextField", () => {
		const doc = buildTemplateDocument("login", "doc-login", "登录", createThemeFromPreset("blue-dark"));
		const [file] = render(buildIr(doc), {
			...DEFAULT_GENERATE_OPTIONS,
			theme: doc.theme,
		});
		expect(file.source).toContain("OutlinedTextField(");
		expect(file.source).toContain("Button(");
		expect(file.source).toContain("darkColorScheme(");
	});
});
