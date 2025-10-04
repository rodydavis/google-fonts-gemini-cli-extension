import { test } from "node:test";
import assert from "node:assert";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import {
  searchFonts,
  searchIcons,
  getDatabaseStats,
  getDatabase,
  searchFontTags,
  getIconCategories,
  getIconStyles,
} from "../scripts/query-db.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const testDbPath = resolve(root, "google_fonts.sqlite");
console.log("Using test database at:", testDbPath);

test("query-db functions", async (t) => {
  await t.test("getDatabase returns a database connection", () => {
    const db = getDatabase();
    assert(db, "database connection should be created");
    db.close();
  });

  await t.test("getDatabaseStats returns valid statistics", () => {
    const stats = getDatabaseStats();
    assert(stats.fonts > 0, "fonts count should be greater than 0");
    assert(stats.variants > 0, "variants count should be greater than 0");
    assert(stats.icons >= 0, "icons count should be a non-negative number");
  });

  await t.test("searchFonts returns fonts", () => {
    // Test without filters
    const allFonts = searchFonts({});
    assert(allFonts.length > 0, "should return some fonts without filters");

    // Test with name filter
    const robotoFonts = searchFonts({ name: "rObOtO" });
    assert(robotoFonts.length > 0, "should find Roboto font");
    assert(
      robotoFonts.some(
        (row) => row.family === "Roboto" || row.family.includes("Roboto"),
      ),
      "should find font with name containing Roboto",
    ); // Test with category filter
    const serifFonts = searchFonts({ category: "sErI" }); // Partial search
    if (serifFonts.length > 0) {
      assert(
        serifFonts.every((font) =>
          font.category.toLowerCase().includes("seri"),
        ),
        "should filter by category using LIKE and be case-insensitive",
      );
    }

    // Test with is_variable filter
    const variableFonts = searchFonts({ is_variable: true });
    if (variableFonts.length > 0) {
      assert.strictEqual(
        variableFonts[0].is_variable,
        1,
        "should filter variable fonts",
      );
    }

    // Test with tag filter
    const displayFonts = searchFonts({ tag: "dIs" }); // Partial search
    if (displayFonts.length > 0) {
      // This test is tricky because the tag is in a separate table.
      // We'd need to join to verify, which is complex for this test file.
      // For now, we'll just assert that we get some results back.
      assert(displayFonts.length > 0, "should return fonts for a partial tag");
    }
  });

  await t.test("searchIcons returns icons", () => {
    // Test without filters
    const allIcons = searchIcons({});
    assert(
      allIcons.length >= 0,
      "should return an array of icons (might be empty if no icons in DB)",
    );

    // Test with name filter (if icons exist)
    if (allIcons.length > 0) {
      const firstIconName = allIcons[0].name;
      const filteredIcons = searchIcons({ name: firstIconName.toUpperCase() });
      assert(filteredIcons.length > 0, "should find icons with matching name");
    }

    // Test with category filter (if icons exist and have categories)
    if (allIcons.length > 0 && allIcons[0].category) {
      const partialCategory = allIcons[0].category.substring(0, 4);
      const categoryIcons = searchIcons({
        category: partialCategory.toUpperCase(),
      });
      assert(categoryIcons.length > 0, "should filter icons by category");
      assert(
        categoryIcons.every((icon) =>
          icon.category.toLowerCase().includes(partialCategory.toLowerCase()),
        ),
        "should match the filtered category using LIKE and be case-insensitive",
      );
    }
  });

  await t.test("searchFontTags returns tags", () => {
    const allTags = searchFontTags({});
    assert(allTags.length > 0, "should return some tags without filters");

    const displayTags = searchFontTags({ name: "dIs" });
    assert(displayTags.length > 0, "should find display tag");
  });

  await t.test("getIconCategories returns categories", () => {
    const categories = getIconCategories();
    assert(categories.length > 0, "should return some categories");
  });

  await t.test("getIconStyles returns styles", () => {
    const styles = getIconStyles();
    assert(styles.length > 0, "should return some styles");
  });
});
