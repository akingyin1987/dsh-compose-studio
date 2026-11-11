import type { IncomingMessage, ServerResponse } from "node:http";
import type { DocumentRepository } from "./store/repository.js";
/** 工作室 HTTP 路由处理器。 */
export declare function createStudioHandler(repository: DocumentRepository): (req: IncomingMessage, res: ServerResponse) => Promise<void>;
//# sourceMappingURL=rpc.d.ts.map