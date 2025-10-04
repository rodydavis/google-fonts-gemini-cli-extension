import { test } from "node:test";
import assert from "node:assert";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

test("data integrity", (t) => {
  const db = new DatabaseSync(resolve(root, "google_fonts.sqlite"));

  t.after(() => {
    db.close();
  });

  t.test("variants have valid font_id", () => {
    const invalidVariants = db
      .prepare(
        "SELECT v.id FROM variants v LEFT JOIN fonts f ON v.font_id = f.id WHERE f.id IS NULL",
      )
      .all();
    assert.strictEqual(invalidVariants.length, 0, "All variants should have a valid font_id");
  });

  t.test("font_tags have valid font_id and tag_id", () => {
    const invalidFontTags = db
      .prepare(
        "SELECT ft.font_id FROM font_tags ft LEFT JOIN fonts f ON ft.font_id = f.id WHERE f.id IS NULL",
      )
      .all();
    assert.strictEqual(invalidFontTags.length, 0, "All font_tags should have a valid font_id");

    const invalidTagTags = db
      .prepare(
        "SELECT ft.tag_id FROM font_tags ft LEFT JOIN tags t ON ft.tag_id = t.id WHERE t.id IS NULL",
      )
      .all();
    assert.strictEqual(invalidTagTags.length, 0, "All font_tags should have a valid tag_id");
  });

  t.test("variant_tags have valid variant_id and tag_id", () => {
    const invalidVariantTags = db
      .prepare(
        "SELECT vt.variant_id FROM variant_tags vt LEFT JOIN variants v ON vt.variant_id = v.id WHERE v.id IS NULL",
      )
      .all();
    assert.strictEqual(invalidVariantTags.length, 0, "All variant_tags should have a valid variant_id");

    const invalidTagTags = db
      .prepare(
        "SELECT vt.tag_id FROM variant_tags vt LEFT JOIN tags t ON vt.tag_id = t.id WHERE t.id IS NULL",
      )
      .all();
    assert.strictEqual(invalidTagTags.length, 0, "All variant_tags should have a valid tag_id");
  });

  t.test("icon_variants have valid icon_id", () => {
    const invalidIconVariants = db
      .prepare(
        "SELECT iv.id FROM icon_variants iv LEFT JOIN icons i ON iv.icon_id = i.id WHERE i.id IS NULL",
      )
      .all();
    assert.strictEqual(invalidIconVariants.length, 0, "All icon_variants should have a valid icon_id");
  });
});
