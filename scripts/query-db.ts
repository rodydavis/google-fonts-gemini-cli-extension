import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function main() {
  const db = new DatabaseSync(resolve(root, "google_fonts.sqlite"));

  const fontsCount = db
    .prepare("SELECT COUNT(*) as count FROM fonts")
    .get() as { count: number };
  const variantsCount = db
    .prepare("SELECT COUNT(*) as count FROM variants")
    .get() as { count: number };

  console.log(`Fonts: ${fontsCount.count}`);
  console.log(`Variants: ${variantsCount.count}`);

  db.close();
}

main();
