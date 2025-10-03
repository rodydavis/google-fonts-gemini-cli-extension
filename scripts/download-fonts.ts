#!/usr/bin/env node
import "dotenv/config";
import { writeFile } from "fs/promises";

const apiKey = process.env.GOOGLE_FONTS_API_KEY;

if (!apiKey) {
  console.error("Error: GOOGLE_FONTS_API_KEY environment variable not set.");
  console.error(
    "Please create a .env file with GOOGLE_FONTS_API_KEY=<your-api-key>",
  );
  process.exit(1);
}

const url = `https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}`;

try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const json = await response.json();
  await writeFile("google-fonts.json", JSON.stringify(json, null, 2));
  console.log("Successfully fetched and saved google-fonts.json");
} catch (error) {
  console.error("Error fetching or parsing fonts:", error);
}
