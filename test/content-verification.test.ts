import { test } from "node:test";
import assert from "node:assert";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

test("content verification", (t) => {
  const db = new DatabaseSync(resolve(root, "google_fonts.sqlite"));

  t.after(() => {
    db.close();
  });

  t.test("font has correct number of variants", () => {
    const font = db
      .prepare("SELECT id FROM fonts WHERE family = ?")
      .get("Roboto") as { id: number };
    const variantsCount = db
      .prepare("SELECT COUNT(*) as count FROM variants WHERE font_id = ?")
      .get(font.id) as { count: number };
    assert.strictEqual(
      variantsCount.count,
      18,
      "Roboto should have 18 variants",
    );
  });

  t.test("font has correct category", () => {
    const font = db
      .prepare("SELECT category FROM fonts WHERE family = ?")
      .get("Roboto") as { category: string };
    assert.strictEqual(
      font.category,
      "sans-serif",
      "Roboto category should be sans-serif",
    );
  });

  t.test("icon has correct category", () => {
    const icon = db
      .prepare("SELECT category FROM icons WHERE name = ?")
      .get("123") as { category: string };
    assert.strictEqual(
      icon.category,
      "action",
      "123 icon category should be action",
    );
  });

  t.test("icon has correct number of variants", () => {
    const icon = db
      .prepare("SELECT id FROM icons WHERE name = ?")
      .get("123") as { id: number };
    const variantsCount = db
      .prepare("SELECT COUNT(*) as count FROM icon_variants WHERE icon_id = ?")
      .get(icon.id) as { count: number };
    assert.strictEqual(variantsCount.count, 10, "123 should have 10 variants");
  });

  t.test("icon variant has correct path", () => {
    const icon = db
      .prepare("SELECT id FROM icons WHERE name = ?")
      .get("123") as { id: number };
    const variant = db
      .prepare(
        "SELECT path FROM icon_variants WHERE icon_id = ? AND style = ? AND path LIKE '%24px.svg'",
      )
      .get(icon.id, "materialicons") as { path: string };
    assert.strictEqual(
      variant.path,
      "action/123/materialicons/24px.svg",
      "123 materialicons variant path should be correct",
    );
  });
});
