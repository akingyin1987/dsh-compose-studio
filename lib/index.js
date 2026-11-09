// src/server/index.ts
import { defineTool } from "@deepseek-ai/dsh-tools";
import "@deepseek-ai/dsh-host-webserver";
import "@deepseek-ai/dsh-llm";
import "@deepseek-ai/dsh-workspace";

// src/shared/invariant.ts
var RPC_PREFIX = "/compose-studio";
var PROTOCOL_VERSION = 1;
var MAIN_PANEL_ID = "composeStudio";

// src/server/index.ts
var inject = ["tools", "webServer", "llm"];
function apply(ctx) {
  ctx.effect(
    () => ctx.tools.register(
      defineTool({
        name: "compose_studio_open",
        description: "Open the Compose Studio visual editor in the DSH main panel. Use when the user wants to visually design, drag-and-drop, or inspect a Jetpack Compose screen, or when they ask to generate Compose UI from a description.",
        parameters: {
          documentId: {
            type: "string",
            description: "Optional document id to load. Omit to open a new document."
          }
        },
        output: {
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              opened: {
                type: "boolean",
                required: true,
                description: "Whether the studio was opened."
              }
            }
          },
          render: (_args, v) => [
            {
              type: "text",
              text: v.opened ? "Compose Studio opened." : "Failed to open Compose Studio."
            }
          ]
        },
        execute: async () => {
          return { opened: true };
        }
      })
    ),
    "compose-studio: tool compose_studio_open"
  );
  ctx.effect(
    () => ctx.webServer.register({
      kind: "prefix",
      path: RPC_PREFIX,
      handler: async (req, res) => {
        const pathname = new URL(
          req.url ?? "/",
          "http://dsh.internal"
        ).pathname;
        if (pathname === `${RPC_PREFIX}/ping`) {
          res.writeHead(200, { "content-type": "application/json" });
          res.end(
            JSON.stringify({
              ok: true,
              protocol: PROTOCOL_VERSION,
              panel: MAIN_PANEL_ID,
              name: "dsh-compose-studio"
            })
          );
          return;
        }
        res.writeHead(404, {
          "content-type": "text/plain; charset=utf-8"
        });
        res.end("not found");
      }
    }),
    "compose-studio: rpc"
  );
}
export {
  apply,
  inject
};
//# sourceMappingURL=index.js.map
