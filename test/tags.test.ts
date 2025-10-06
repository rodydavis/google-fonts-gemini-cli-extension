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

import { test } from "node:test";
import assert from "node:assert";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

test("tags", (t) => {
  const db = new DatabaseSync(resolve(root, "google_fonts.sqlite"));

  t.after(() => {
    db.close();
  });

  t.test("tables exist", () => {
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all() as { name: string }[];
    const tableNames = tables.map((t) => t.name);
    assert(tableNames.includes("tags"), "tags table should exist");
    assert(tableNames.includes("font_tags"), "font_tags table should exist");
    assert(
      tableNames.includes("variant_tags"),
      "variant_tags table should exist",
    );
  });

  t.test("tags table is populated", () => {
    const tagsCount = db
      .prepare("SELECT COUNT(*) as count FROM tags")
      .get() as { count: number };
    assert(tagsCount.count > 0, "tags count should be greater than 0");
  });

  t.test("font_tags table is populated", () => {
    const fontTagsCount = db
      .prepare("SELECT COUNT(*) as count FROM font_tags")
      .get() as { count: number };
    assert(fontTagsCount.count > 0, "font_tags count should be greater than 0");
  });

  t.test("variant_tags table is populated", () => {
    const variantTagsCount = db
      .prepare("SELECT COUNT(*) as count FROM variant_tags")
      .get() as { count: number };
    assert(
      variantTagsCount.count > 0,
      "variant_tags count should be greater than 0",
    );
  });

  t.test("finds tags for a specific font", () => {
    const font = db
      .prepare("SELECT id FROM fonts WHERE family = ?")
      .get("Roboto") as { id: number };
    const tags = db
      .prepare(
        "SELECT t.name FROM tags t JOIN font_tags ft ON t.id = ft.tag_id WHERE ft.font_id = ?",
      )
      .all(font.id) as { name: string }[];
    assert(tags.length > 0, "Roboto should have tags");
  });

  t.test("finds tags for a specific variant", () => {
    const font = db
      .prepare("SELECT id FROM fonts WHERE family = ?")
      .get("Abhaya Libre") as { id: number };
    const variant = db
      .prepare(
        "SELECT id FROM variants WHERE font_id = ? AND weight = ? AND style = ?",
      )
      .get(font.id, 400, "normal") as { id: number };
    const tags = db
      .prepare(
        "SELECT t.name FROM tags t JOIN variant_tags vt ON t.id = vt.tag_id WHERE vt.variant_id = ?",
      )
      .all(variant.id) as { name: string }[];
    assert(tags.length > 0, "Abhaya Libre regular should have tags");
  });
});
