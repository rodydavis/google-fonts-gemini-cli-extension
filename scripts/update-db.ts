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
import { createReadStream, readFileSync, unlinkSync } from "fs";
import Papa from "papaparse";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

interface Font {
  family: string;
  subsets: string[];
  variants: string[];
  files: Record<string, string>;
  category: string;
  version: string;
  lastModified: string;
  defaultVariant?: string;
  isVariable: boolean;
}

interface IconVariant {
  style: string;
  paths: string[];
}

interface Icon {
  name: string;
  category: string;
  variants: IconVariant[];
  codepoint?: string;
}

async function main() {
  const dbPath = resolve(root, "google_fonts.sqlite");
  try {
    unlinkSync(dbPath);
  } catch (err: any) {
    if (err.code !== "ENOENT") {
      throw err;
    }
  }
  const db = new DatabaseSync(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS fonts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      family TEXT NOT NULL UNIQUE,
      subsets TEXT,
      category TEXT,
      version TEXT,
      last_modified TEXT,
      default_variant TEXT,
      is_variable BOOLEAN
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      font_id INTEGER,
      name TEXT NOT NULL,
      style TEXT NOT NULL,
      weight INTEGER NOT NULL,
      local_path TEXT,
      url TEXT,
      format TEXT,
      FOREIGN KEY (font_id) REFERENCES fonts (id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS font_tags (
      font_id INTEGER,
      tag_id INTEGER,
      value REAL,
      FOREIGN KEY (font_id) REFERENCES fonts (id),
      FOREIGN KEY (tag_id) REFERENCES tags (id),
      PRIMARY KEY (font_id, tag_id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS variant_tags (
      variant_id INTEGER,
      tag_id INTEGER,
      value REAL,
      FOREIGN KEY (variant_id) REFERENCES variants (id),
      FOREIGN KEY (tag_id) REFERENCES tags (id),
      PRIMARY KEY (variant_id, tag_id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS icons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      category TEXT,
      codepoint TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS icon_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      icon_id INTEGER,
      style TEXT NOT NULL,
      path TEXT NOT NULL,
      FOREIGN KEY (icon_id) REFERENCES icons (id)
    )
  `);

  const fontsJson = readFileSync(resolve(root, "google-fonts.json"), "utf-8");
  const fonts: Font[] = JSON.parse(fontsJson).items;

  const insertFont = db.prepare(
    "INSERT OR IGNORE INTO fonts (family, subsets, category, version, last_modified, default_variant, is_variable) VALUES (?, ?, ?, ?, ?, ?, ?)",
  );
  const insertVariant = db.prepare(
    "INSERT OR IGNORE INTO variants (font_id, name, style, weight, local_path, url, format) VALUES (?, ?, ?, ?, ?, ?, ?)",
  );
  const selectFont = db.prepare("SELECT id FROM fonts WHERE family = ?");

  for (const font of fonts) {
    const {
      family,
      subsets,
      category,
      version,
      lastModified,
      defaultVariant,
      isVariable,
    } = font;
    let font_id = selectFont.get(family) as { id: number } | undefined;
    if (!font_id) {
      const info = insertFont.run(
        family,
        subsets.join(","),
        category,
        version,
        lastModified,
        defaultVariant ?? "regular",
        isVariable ? 1 : 0,
      );
      font_id = { id: info.lastInsertRowid as number };
    }

    for (const variantName of font.variants) {
      const style = variantName.includes("italic") ? "italic" : "normal";
      const weight =
        variantName === "regular" || variantName === "italic"
          ? 400
          : parseInt(variantName.replace("italic", ""));
      const url = font.files[variantName];
      insertVariant.run(
        font_id.id,
        variantName,
        style,
        weight,
        url,
        url,
        "woff2",
      );
    }
  }

  const insertTag = db.prepare(
    "INSERT OR IGNORE INTO tags (name, description) VALUES (?, ?)",
  );
  const selectTag = db.prepare("SELECT id FROM tags WHERE name = ?");
  const tagsMetadata = readFileSync(
    resolve(root, "third_party/fonts/tags/tags_metadata.csv"),
    "utf-8",
  );
  const tags = Papa.parse(tagsMetadata).data as string[][];
  for (const tag of tags) {
    if (tag && tag.length >= 4 && tag[0] && tag[3]) {
      insertTag.run(tag[0], tag[3]);
    }
  }

  const insertFontTag = db.prepare(
    "INSERT OR IGNORE INTO font_tags (font_id, tag_id, value) VALUES (?, ?, ?)",
  );
  const familiesStream = createReadStream(
    resolve(root, "third_party/fonts/tags/all/families.csv"),
  );
  await new Promise<void>((resolve) => {
    Papa.parse(familiesStream, {
      worker: true,
      step: (results) => {
        const row = results.data as string[];
        if (row && row.length >= 4 && row[0] && row[2] && row[3]) {
          const font = selectFont.get(row[0]) as { id: number } | undefined;
          if (font) {
            const tag = selectTag.get(row[2]) as { id: number } | undefined;
            if (tag) {
              insertFontTag.run(font.id, tag.id, parseFloat(row[3]));
            }
          }
        }
      },
      complete: () => {
        resolve();
      },
    });
  });

  const insertVariantTag = db.prepare(
    "INSERT OR IGNORE INTO variant_tags (variant_id, tag_id, value) VALUES (?, ?, ?)",
  );
  const selectVariant = db.prepare(
    "SELECT id FROM variants WHERE font_id = ? AND weight = ? AND style = ?",
  );
  const quantStream = createReadStream(
    resolve(root, "third_party/fonts/tags/all/quant.csv"),
  );
  await new Promise<void>((resolve) => {
    Papa.parse(quantStream, {
      worker: true,
      step: (results) => {
        const row = results.data as string[];
        if (row && row.length >= 4 && row[0] && row[1] && row[2] && row[3]) {
          const font = selectFont.get(row[0]) as { id: number } | undefined;
          if (font) {
            const style = row[1].includes("ital") ? "italic" : "normal";
            const weight = parseInt(row[1].split("@")[1]);
            const variant = selectVariant.get(font.id, weight, style) as
              | { id: number }
              | undefined;
            if (variant) {
              const tag = selectTag.get(row[2]) as { id: number } | undefined;
              if (tag) {
                insertVariantTag.run(variant.id, tag.id, parseFloat(row[3]));
              }
            }
          }
        }
      },
      complete: () => {
        resolve();
      },
    });
  });

  const iconsJson = readFileSync(resolve(root, "icons.json"), "utf-8");
  const icons: Icon[] = JSON.parse(iconsJson);

  const insertIcon = db.prepare(
    "INSERT OR IGNORE INTO icons (name, category, codepoint) VALUES (?, ?, ?)",
  );
  const selectIcon = db.prepare("SELECT id FROM icons WHERE name = ?");
  const insertIconVariant = db.prepare(
    "INSERT OR IGNORE INTO icon_variants (icon_id, style, path) VALUES (?, ?, ?)",
  );

  for (const icon of icons) {
    const { name, category, variants, codepoint } = icon;
    let icon_id = selectIcon.get(name) as { id: number } | undefined;
    if (!icon_id) {
      const info = insertIcon.run(name, category, codepoint ?? null);
      icon_id = { id: info.lastInsertRowid as number };
    }

    for (const variant of variants) {
      for (const path of variant.paths) {
        insertIconVariant.run(icon_id.id, variant.style, path);
      }
    }
  }

  db.close();
}

main();
