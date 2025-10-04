import { test } from "node:test";
import assert from "node:assert";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

test("icons", (t) => {
  const db = new DatabaseSync(resolve(root, "google_fonts.sqlite"));

  t.after(() => {
    db.close();
  });

  t.test("tables exist", () => {
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all() as { name: string }[];
    const tableNames = tables.map((t) => t.name);
    assert(tableNames.includes("icons"), "icons table should exist");
    assert(
      tableNames.includes("icon_variants"),
      "icon_variants table should exist",
    );
  });

  t.test("icons table is populated", () => {
    const iconsCount = db
      .prepare("SELECT COUNT(*) as count FROM icons")
      .get() as { count: number };
    assert(iconsCount.count > 0, "icons count should be greater than 0");
  });

  t.test("icon_variants table is populated", () => {
    const iconVariantsCount = db
      .prepare("SELECT COUNT(*) as count FROM icon_variants")
      .get() as { count: number };
    assert(
      iconVariantsCount.count > 0,
      "icon_variants count should be greater than 0",
    );
  });

  t.test("finds a specific icon", () => {
    const icon = db
      .prepare("SELECT * FROM icons WHERE name = ?")
      .get("123") as any;
    assert(icon, "icon should exist");
    assert.strictEqual(icon.name, "123", "icon name should be 123");
  });

  t.test("finds variants for a specific icon", () => {
    const icon = db
      .prepare("SELECT id FROM icons WHERE name = ?")
      .get("123") as { id: number };
    const variants = db
      .prepare("SELECT * FROM icon_variants WHERE icon_id = ?")
      .all(icon.id) as any[];
    assert(variants.length > 0, "123 should have variants");
  });
});
