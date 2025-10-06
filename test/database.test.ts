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
import { execSync } from "child_process";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

test("database scripts", (t) => {
  t.test("updates the database", () => {
    execSync("npm run update-db");
  });

  t.test("queries the database", () => {
    const db = new DatabaseSync(resolve(root, "google_fonts.sqlite"));
    const fontsCount = db
      .prepare("SELECT COUNT(*) as count FROM fonts")
      .get() as { count: number };
    const variantsCount = db
      .prepare("SELECT COUNT(*) as count FROM variants")
      .get() as { count: number };
    assert(fontsCount.count > 0, "fonts count should be greater than 0");
    assert(variantsCount.count > 0, "variants count should be greater than 0");
    db.close();
  });

  t.test("finds a specific font", () => {
    const db = new DatabaseSync(resolve(root, "google_fonts.sqlite"));
    const font = db
      .prepare("SELECT * FROM fonts WHERE family = ?")
      .get("Roboto") as any;
    assert(font, "font should exist");
    assert.strictEqual(font.family, "Roboto", "font family should be Roboto");
    db.close();
  });

  t.test("finds a specific icon", () => {
    const db = new DatabaseSync(resolve(root, "google_fonts.sqlite"));
    const icon = db
      .prepare("SELECT * FROM icons WHERE name = ?")
      .get("search") as any;
    assert(icon, "icon should exist");
    assert.strictEqual(icon.name, "search", "icon name should be search");
    assert.strictEqual(icon.codepoint, "e8b6", "icon codepoint should be e8b6");
    db.close();
  });
});
