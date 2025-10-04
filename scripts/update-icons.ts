import { readdirSync, writeFileSync } from "fs";
import { resolve, join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const iconsSrc = resolve(root, "third_party/icons/src");

interface IconVariant {
  style: string;
  path: string;
}

interface Icon {
  name: string;
  category: string;
  variants: IconVariant[];
}

function main() {
  const icons: Icon[] = [];
  const categories = readdirSync(iconsSrc);
  for (const category of categories) {
    const categoryPath = join(iconsSrc, category);
    const iconNames = readdirSync(categoryPath);
    for (const iconName of iconNames) {
      const iconPath = join(categoryPath, iconName);
      const styles = readdirSync(iconPath);
      const variants: IconVariant[] = [];
      for (const style of styles) {
        const stylePath = join(iconPath, style);
        const svgs = readdirSync(stylePath);
        for (const svg of svgs) {
          variants.push({
            style: style,
            path: join(category, iconName, style, svg),
          });
        }
      }
      icons.push({
        name: iconName,
        category: category,
        variants: variants,
      });
    }
  }
  writeFileSync(resolve(root, "icons.json"), JSON.stringify(icons, null, 2));
}

main();
