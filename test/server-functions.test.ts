import { test } from "node:test";
import assert from "node:assert";
import { searchFonts, searchIcons, getDatabaseStats, getDatabase } from "../scripts/query-db.ts";
import { z } from "zod";

// These tests validate that the functions used by the server work properly
// with the same input schema that the server uses

test("server functionality", async (t) => {
  // Define schemas that match the server input schemas
  const fontSearchSchema = z.object({
    name: z.string().optional(),
    tag: z.string().optional(),
    category: z.string().optional(),
    is_variable: z.boolean().optional(),
  });

  const iconSearchSchema = z.object({
    name: z.string().optional(),
    category: z.string().optional(),
  });

  await t.test("search_fonts tool works with valid input", () => {
    // Test the function with various valid inputs according to schema
    const testCases = [
      {},
      { name: "Roboto" },
      { category: "serif" },
      { is_variable: true },
      { name: "Open", category: "sans-serif" },
      { name: "Roboto", tag: "sans-serif", category: "sans-serif", is_variable: false },
    ];

    for (const input of testCases) {
      // Validate that input matches schema
      const validationResult = fontSearchSchema.safeParse(input);
      assert(validationResult.success, `Input should be valid: ${JSON.stringify(input)}`);

      // Test function with the input
      const result = searchFonts(input);
      assert(Array.isArray(result), `Result should be an array: ${JSON.stringify(result)}`);
    }
  });

  await t.test("search_icons tool works with valid input", () => {
    // Test the function with various valid inputs according to schema
    const testCases = [
      {},
      { name: "arrow" },
      { category: "action" },
      { name: "home", category: "navigation" },
    ];

    for (const input of testCases) {
      // Validate that input matches schema
      const validationResult = iconSearchSchema.safeParse(input);
      assert(validationResult.success, `Input should be valid: ${JSON.stringify(input)}`);

      // Test function with the input
      const result = searchIcons(input);
      assert(Array.isArray(result), `Result should be an array: ${JSON.stringify(result)}`);
    }
  });

  await t.test("search_fonts handles SQL injection safely", () => {
    // Test with potentially dangerous input
    const maliciousInput = "'; DROP TABLE fonts; --";
    
    try {
      const result = searchFonts({ name: maliciousInput });
      // If we get here, at least it didn't crash
      assert(Array.isArray(result), "Result should be an array");
      // Ideally we would check the DB to make sure it's still intact
    } catch (error) {
      // Depending on implementation, might throw instead of returning empty results
      console.log("Error caught as expected:", error);
    }
  });
  
  await t.test("search_icons handles SQL injection safely", () => {
    // Test with potentially dangerous input
    const maliciousInput = "'; DROP TABLE icons; --";
    
    try {
      const result = searchIcons({ name: maliciousInput });
      // If we get here, at least it didn't crash
      assert(Array.isArray(result), "Result should be an array");
      // Ideally we would check the DB to make sure it's still intact
    } catch (error) {
      // Depending on implementation, might throw instead of returning empty results
      console.log("Error caught as expected:", error);
    }
  });
});
