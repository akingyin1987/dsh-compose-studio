// src/server/index.ts
import { defineTool } from "@deepseek-ai/dsh-tools";
import "@deepseek-ai/dsh-host-webserver";
import "@deepseek-ai/dsh-llm";
import "@deepseek-ai/dsh-settings";

// src/shared/invariant.ts
var RPC_PREFIX = "/compose-studio";
var PROTOCOL_VERSION = 1;
var MAIN_PANEL_ID = "composeStudio";

// src/server/config.ts
import Schema from "@deepseek-ai/schemastery";
var ConfigSchema = Schema.object({
  defaultDevice: Schema.string().default("phone"),
  themePreset: Schema.string().default("material3"),
  codegen: Schema.object({
    language: Schema.string().default("kotlin"),
    composeBom: Schema.string().default("2024.09.00"),
    packageName: Schema.string().default("com.example.generated"),
    usePreviewAnnotation: Schema.boolean().default(true),
    addModifierDefault: Schema.boolean().default(true)
  }).default({
    language: "kotlin",
    composeBom: "2024.09.00",
    packageName: "com.example.generated",
    usePreviewAnnotation: true,
    addModifierDefault: true
  }),
  llm: Schema.object({
    enabled: Schema.boolean().default(true),
    model: Schema.string().default(""),
    maxTokens: Schema.number().default(4096),
    temperature: Schema.number().default(0.2)
  }).default({
    enabled: true,
    model: "",
    maxTokens: 4096,
    temperature: 0.2
  }),
  persistence: Schema.object({
    autoSaveMs: Schema.number().default(1500),
    historyLimit: Schema.number().default(100)
  }).default({
    autoSaveMs: 1500,
    historyLimit: 100
  })
});

// src/server/index.ts
function apply(ctx, config) {
  void config;
  ctx.inject(["tools", "webServer"], (child) => {
    child.effect(
      () => child.tools.register(
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
    child.effect(
      () => child.webServer.register({
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
  });
}
export {
  ConfigSchema as Config,
  apply
};
//# sourceMappingURL=index.js.map
