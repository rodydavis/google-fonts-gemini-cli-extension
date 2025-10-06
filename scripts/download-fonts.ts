#!/usr/bin/env node
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
