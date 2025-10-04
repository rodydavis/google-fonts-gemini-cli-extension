import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { readFileSync } from "fs";

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
  popularity: number;
  defaultVariant: string;
  isVariable: boolean;
}

function main() {
  const db = new DatabaseSync(resolve(root, "google_fonts.sqlite"));

  db.exec(`
    CREATE TABLE IF NOT EXISTS fonts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      family TEXT NOT NULL UNIQUE,
      subsets TEXT,
      category TEXT,
      version TEXT,
      last_modified TEXT,
      popularity INTEGER,
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

  const fontsJson = readFileSync(resolve(root, "google-fonts.json"), "utf-8");
  const fonts: Font[] = JSON.parse(fontsJson).items;

  const insertFont = db.prepare(
    "INSERT OR IGNORE INTO fonts (family, subsets, category, version, last_modified, popularity, default_variant, is_variable) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
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
      popularity,
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
        popularity,
        defaultVariant,
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

  db.close();
}

main();
