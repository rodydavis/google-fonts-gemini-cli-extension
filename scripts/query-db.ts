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
  if (name) {
    where.push(`family LIKE '%${name}%' COLLATE NOCASE`);
  }
  if (category) {
    where.push(`category LIKE '%${category}%' COLLATE NOCASE`);
  }
  if (is_variable !== undefined) {
    where.push(`is_variable = ${is_variable ? 1 : 0}`);
  }
  if (tag) {
    query +=
      " INNER JOIN font_tags ON fonts.id = font_tags.font_id INNER JOIN tags ON font_tags.tag_id = tags.id";
    where.push(`tags.name LIKE '%${tag}%' COLLATE NOCASE`);
  }
  if (where.length > 0) {
    query += " WHERE " + where.join(" AND ");
  }
  const stmt = db.prepare(query);
  const rows = stmt.all();
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
  if (name) {
    where.push(`name LIKE '%${name}%' COLLATE NOCASE`);
  }
  if (category) {
    where.push(`category LIKE '%${category}%' COLLATE NOCASE`);
  }
  if (where.length > 0) {
    query += " WHERE " + where.join(" AND ");
  }
  const stmt = db.prepare(query);
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
  const stats = getDatabaseStats();
  console.log(`Fonts: ${stats.fonts}`);
  console.log(`Variants: ${stats.variants}`);
  console.log(`Icons: ${stats.icons}`);
}

// Only run main when script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
