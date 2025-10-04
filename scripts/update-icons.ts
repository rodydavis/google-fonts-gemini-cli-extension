import { readdirSync, writeFileSync } from "fs";
import { resolve, join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const iconsSrc = resolve(root, "third_party/icons/src");

interface IconVariant {
  style: string;
  paths: string[];
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
        const paths: string[] = [];
        for (const svg of svgs) {
          paths.push(join(category, iconName, style, svg));
        }
        variants.push({
          style: style,
          paths: paths,
        });
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
