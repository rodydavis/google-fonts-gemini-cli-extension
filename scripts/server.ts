/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  searchFonts,
  searchIcons,
  searchFontTags,
  getIconCategories,
  getIconStyles,
} from "./query-db.ts";

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

server.registerTool(
  "search_font_tags",
  {
    description: "Searches for font tags in the Google Fonts database.",
    inputSchema: z.object({
      name: z.string().optional(),
    }).shape,
  },
  async ({ name }) => {
    const rows = searchFontTags({ name });
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
  "get_icon_categories",
  {
    description:
      "Gets all icon categories from the Google Fonts icons database.",
    inputSchema: z.object({}).shape,
  },
  async () => {
    const rows = getIconCategories();
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
  "get_icon_styles",
  {
    description: "Gets all icon styles from the Google Fonts icons database.",
    inputSchema: z.object({}).shape,
  },
  async () => {
    const rows = getIconStyles();
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
