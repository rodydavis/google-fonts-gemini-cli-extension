import { readdirSync, writeFileSync, readFileSync } from "fs";
import { resolve, join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const iconsSrc = resolve(root, "third_party/icons/src");
const iconsFontDir = resolve(root, "third_party/icons/font");
const iconsVariableFontDir = resolve(root, "third_party/icons/variablefont");

interface IconVariant {
  style: string;
  paths: string[];
}

interface Icon {
  name: string;
  category: string;
  variants: IconVariant[];
  codepoint?: string;
}

function main() {
  const codepoints = new Map<string, string>();
  const codepointFiles = [
    ...readdirSync(iconsFontDir)
      .filter((f) => f.endsWith(".codepoints"))
      .map((f) => join(iconsFontDir, f)),
    ...readdirSync(iconsVariableFontDir)
      .filter((f) => f.endsWith(".codepoints"))
      .map((f) => join(iconsVariableFontDir, f)),
  ];

  for (const file of codepointFiles) {
    const content = readFileSync(file, "utf-8");
    for (const line of content.split("\n")) {
      const [name, codepoint] = line.split(" ");
      if (name && codepoint) {
        codepoints.set(name, codepoint);
      }
    }
  }

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
      const icon: Icon = {
        name: iconName,
        category: category,
        variants: variants,
      };
      if (codepoints.has(iconName)) {
        icon.codepoint = codepoints.get(iconName);
      }
      icons.push(icon);
    }
  }
  writeFileSync(resolve(root, "icons.json"), JSON.stringify(icons, null, 2));
}

main();
