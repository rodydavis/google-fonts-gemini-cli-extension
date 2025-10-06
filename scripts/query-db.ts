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

import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const dbPath = resolve(root, "google_fonts.sqlite");

/**
 * Get a connected database instance
 */
export function getDatabase(): DatabaseSync {
  return new DatabaseSync(dbPath);
}

/**
 * Search for fonts in the database
 */
export function searchFonts({
  name,
  tag,
  category,
  is_variable,
}: {
  name?: string;
  tag?: string;
  category?: string;
  is_variable?: boolean;
}) {
  const db = getDatabase();
  let query = "SELECT * FROM fonts";
  const where = [];
  const params = [];
  if (name) {
    where.push(`family LIKE ? COLLATE NOCASE`);
    params.push(`%${name}%`);
  }
  if (category) {
    where.push(`category LIKE ? COLLATE NOCASE`);
    params.push(`%${category}%`);
  }
  if (is_variable !== undefined) {
    where.push(`is_variable = ?`);
    params.push(is_variable ? 1 : 0);
  }
  if (tag) {
    query +=
      " INNER JOIN font_tags ON fonts.id = font_tags.font_id INNER JOIN tags ON font_tags.tag_id = tags.id";
    where.push(`tags.name LIKE ? COLLATE NOCASE`);
    params.push(`%${tag}%`);
  }
  if (where.length > 0) {
    query += " WHERE " + where.join(" AND ");
  }
  const stmt = db.prepare(query);
  const rows = stmt.all(...params);
  db.close();
  return rows;
}

/**
 * Search for icons in the database
 */
export function searchIcons({
  name,
  category,
}: {
  name?: string;
  category?: string;
}) {
  const db = getDatabase();
  let query = "SELECT * FROM icons";
  const where = [];
  const params = [];
  if (name) {
    where.push(`name LIKE ? COLLATE NOCASE`);
    params.push(`%${name}%`);
  }
  if (category) {
    where.push(`category LIKE ? COLLATE NOCASE`);
    params.push(`%${category}%`);
  }
  if (where.length > 0) {
    query += " WHERE " + where.join(" AND ");
  }
  const stmt = db.prepare(query);
  const rows = stmt.all(...params);
  db.close();
  return rows;
}

/**
 * Search for font tags in the database
 */
export function searchFontTags({ name }: { name?: string }) {
  const db = getDatabase();
  let query = "SELECT name FROM tags";
  const params = [];
  if (name) {
    query += ` WHERE name LIKE ? COLLATE NOCASE`;
    params.push(`%${name}%`);
  }
  const stmt = db.prepare(query);
  const rows = stmt.all(...params);
  db.close();
  return rows;
}

/**
 * Get all icon categories
 */
export function getIconCategories() {
  const db = getDatabase();
  const stmt = db.prepare("SELECT DISTINCT category FROM icons");
  const rows = stmt.all();
  db.close();
  return rows;
}

/**
 * Get all icon styles
 */
export function getIconStyles() {
  const db = getDatabase();
  const stmt = db.prepare("SELECT DISTINCT style FROM icon_variants");
  const rows = stmt.all();
  db.close();
  return rows;
}

/**
 * Get database statistics
 */
export function getDatabaseStats() {
  const db = getDatabase();
  const fontsCount = db
    .prepare("SELECT COUNT(*) as count FROM fonts")
    .get() as { count: number };
  const variantsCount = db
    .prepare("SELECT COUNT(*) as count FROM variants")
    .get() as { count: number };
  const iconsCount = db
    .prepare("SELECT COUNT(*) as count FROM icons")
    .get() as { count: number };
  db.close();
  return {
    fonts: fontsCount.count,
    variants: variantsCount.count,
    icons: iconsCount.count,
  };
}

// For CLI usage
function main() {
  const command = process.argv[2];
  const arg = process.argv[3];

  if (command === "search-fonts" && arg) {
    const fonts = searchFonts({ name: arg });
    console.log(JSON.stringify(fonts));
  } else if (command === "search-icons" && arg) {
    const icons = searchIcons({ name: arg });
    console.log(JSON.stringify(icons));
  } else {
    const stats = getDatabaseStats();
    console.log(`Fonts: ${stats.fonts}`);
    console.log(`Variants: ${stats.variants}`);
    console.log(`Icons: ${stats.icons}`);
  }
}

// Only run main when script is executed directly
if (
  import.meta.url.startsWith("file://") &&
  process.argv[1] === fileURLToPath(import.meta.url)
) {
  main();
}
