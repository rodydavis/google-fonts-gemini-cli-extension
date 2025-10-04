import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { searchFonts, searchIcons } from "./query-db.js";

const server = new McpServer({
  name: "google-fonts-server",
  version: "1.0.0",
});

server.registerTool(
  "search_fonts",
  {
    description: "Searches the Google Fonts database.",
    inputSchema: z.object({
      name: z.string().optional(),
      tag: z.string().optional(),
      category: z.string().optional(),
      is_variable: z.boolean().optional(),
    }).shape,
  },
  async ({ name, tag, category, is_variable }) => {
    const rows = searchFonts({ name, tag, category, is_variable });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(rows),
        },
      ],
    };
  },
);

server.registerTool(
  "search_icons",
  {
    description: "Searches the Google Fonts icons database.",
    inputSchema: z.object({
      name: z.string().optional(),
      category: z.string().optional(),
    }).shape,
  },
  async ({ name, category }) => {
    const rows = searchIcons({ name, category });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(rows),
        },
      ],
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
