import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const extensionRoot = path.resolve(process.argv[2] || "..");
const siteRoot = path.resolve(new URL("..", import.meta.url).pathname);

function read(relativePath) {
  return fs.readFileSync(path.join(extensionRoot, relativePath), "utf8");
}

function copyIfPresent(from, to) {
  const source = path.join(extensionRoot, from);
  const destination = path.join(siteRoot, to);
  if (!fs.existsSync(source)) return false;
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
  return true;
}

function loadDefaultRules() {
  const context = { console };
  vm.createContext(context);
  vm.runInContext(read("src/default-rules.js"), context, {
    filename: path.join(extensionRoot, "src/default-rules.js")
  });

  const rules = context.BYEBYEFISHING_DEFAULT_RULES;
  if (!Array.isArray(rules)) {
    throw new Error("Could not read BYEBYEFISHING_DEFAULT_RULES from extension source.");
  }

  return {
    version: context.BYEBYEFISHING_RULESET_VERSION || "unknown",
    generatedFrom: "src/default-rules.js",
    count: rules.length,
    rules: rules.map((rule) => ({
      category: rule.category,
      id: rule.id,
      name: rule.name,
      aliases: rule.aliases || [],
      allowedDomains: rule.allowedDomains || [],
      senderDomains: rule.senderDomains || null,
      senderMatchSubdomains: rule.senderMatchSubdomains ?? null
    }))
  };
}

fs.mkdirSync(path.join(siteRoot, "assets"), { recursive: true });
fs.mkdirSync(path.join(siteRoot, "downloads"), { recursive: true });

copyIfPresent("icons/byebyefishing.svg", "assets/byebyefishing.svg");
copyIfPresent("icons/icon-128.png", "assets/icon-128.png");
copyIfPresent("dist/byebyefishing-0.1.0-chrome.zip", "downloads/byebyefishing-0.1.0-chrome.zip");
copyIfPresent(
  "dist/byebyefishing-0.1.0-firefox-android.zip",
  "downloads/byebyefishing-0.1.0-firefox-android.zip"
);

const catalog = loadDefaultRules();
const output = `window.BYEBYEFISHING_RULES = ${JSON.stringify(catalog, null, 2)};\n`;
fs.writeFileSync(path.join(siteRoot, "assets/rules-data.js"), output);

console.log(`Synced ${catalog.count} protected-brand rules from ${extensionRoot}`);
