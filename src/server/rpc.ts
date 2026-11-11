// 服务端 RPC 路由（docs/design.md 4.8）
// doc/load、doc/save、fs/list、doc/export（预留）、ping。
import type { IncomingMessage, ServerResponse } from "node:http";
import type { CanvasDocument } from "../shared/document.js";
import {
	RPC_PREFIX,
	RPC_METHOD,
	PROTOCOL_VERSION,
	MAIN_PANEL_ID,
} from "../shared/invariant.js";
import type { DocumentRepository } from "./store/repository.js";
import { exportDocument } from "./codegen/export.js";

/** 工作室 HTTP 路由处理器。 */
export function createStudioHandler(repository: DocumentRepository) {
	return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
		const url = new URL(req.url ?? "/", "http://dsh.internal");
		const pathname = url.pathname;

		// --- ping ---
		if (pathname === `${RPC_PREFIX}/${RPC_METHOD.PING}`) {
			sendJson(res, 200, {
				ok: true,
				protocol: PROTOCOL_VERSION,
				panel: MAIN_PANEL_ID,
				name: "dsh-compose-studio",
			});
			return;
		}

		if (req.method === "POST") {
			const body = await readBody(req);
			let payload: Record<string, unknown>;
			try {
				payload = JSON.parse(body) as Record<string, unknown>;
			} catch {
				sendError(res, 400, "invalid JSON body");
				return;
			}

			try {
				// --- doc/load ---
				if (pathname === `${RPC_PREFIX}/${RPC_METHOD.DOC_LOAD}`) {
					const doc = await repository.load(String(payload.id ?? ""));
					sendJson(res, 200, { doc });
					return;
				}

				// --- doc/save ---
				if (pathname === `${RPC_PREFIX}/${RPC_METHOD.DOC_SAVE}`) {
					await repository.save(payload.doc as CanvasDocument);
					sendJson(res, 200, { ok: true });
					return;
				}

				// --- fs/list ---
				if (pathname === `${RPC_PREFIX}/fs/list`) {
					const entries = await repository.listDir(String(payload.dir ?? "."));
					sendJson(res, 200, { entries });
					return;
				}

				// --- doc/export ---
				if (pathname === `${RPC_PREFIX}/${RPC_METHOD.DOC_EXPORT}`) {
					const { doc, targetDir, overwrite } = payload as {
						doc: CanvasDocument;
						targetDir?: string;
						overwrite?: boolean;
					};
					const files = await exportDocument(repository, doc, {
						targetDir,
						overwrite,
					});
					sendJson(res, 200, { files });
					return;
				}
			} catch (err) {
				sendError(res, 400, err instanceof Error ? err.message : String(err));
				return;
			}
		}

		res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
		res.end("not found");
	};
}

/** 读取请求体。 */
function readBody(req: IncomingMessage): Promise<string> {
	return new Promise((resolve, reject) => {
		const chunks: Buffer[] = [];
		req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
		req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
		req.on("error", reject);
	});
}

function sendJson(res: ServerResponse, status: number, data: unknown): void {
	res.writeHead(status, { "content-type": "application/json" });
	res.end(JSON.stringify(data));
}

function sendError(res: ServerResponse, status: number, message: string): void {
	res.writeHead(status, { "content-type": "application/json" });
	res.end(JSON.stringify({ ok: false, error: message }));
}
