import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";

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

function copyRequired(from, to) {
  if (!copyIfPresent(from, to)) {
    throw new Error(`Missing required release artifact: ${path.join(extensionRoot, from)}`);
  }
}

function shortHash(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex").slice(0, 10);
}

function updateSiteFile(relativePath, update) {
  const filePath = path.join(siteRoot, relativePath);
  const before = fs.readFileSync(filePath, "utf8");
  const after = update(before);
  if (after !== before) {
    fs.writeFileSync(filePath, after);
  }
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
      senderMatchSubdomains: rule.senderMatchSubdomains ?? null,
      brandLinkDomains: rule.brandLinkDomains || [],
      controlPlaneDomains: rule.controlPlaneDomains || [],
      hostedPlatform: rule.hostedPlatform === true,
      userContentPlatform: rule.userContentPlatform === true
    }))
  };
}

const extensionPackage = JSON.parse(read("package.json"));
const releaseBasename = `${extensionPackage.name}-${extensionPackage.version}`;

fs.mkdirSync(path.join(siteRoot, "assets"), { recursive: true });
fs.mkdirSync(path.join(siteRoot, "downloads"), { recursive: true });

copyIfPresent("icons/byebyefishing.svg", "assets/byebyefishing.svg");
copyIfPresent("icons/icon-128.png", "assets/icon-128.png");
copyRequired(
  `dist/${releaseBasename}-chrome.zip`,
  `downloads/${releaseBasename}-chrome.zip`
);
copyRequired(
  `dist/${releaseBasename}-firefox-android.zip`,
  `downloads/${releaseBasename}-firefox-android.zip`
);

const catalog = loadDefaultRules();
const output = `window.BYEBYEFISHING_RULES = ${JSON.stringify(catalog, null, 2)};\n`;
fs.writeFileSync(path.join(siteRoot, "assets/rules-data.js"), output);

const chromeDownload = `downloads/${releaseBasename}-chrome.zip`;
const firefoxDownload = `downloads/${releaseBasename}-firefox-android.zip`;
const chromeHash = shortHash(path.join(siteRoot, chromeDownload));
const firefoxHash = shortHash(path.join(siteRoot, firefoxDownload));

updateSiteFile("site.js", (source) =>
  source
    .replace(
      /downloads\/byebyefishing-[^"'?]+-chrome\.zip(?:\?v=[^"']*)?/g,
      `${chromeDownload}?v=${chromeHash}`
    )
    .replace(
      /downloads\/byebyefishing-[^"'?]+-firefox-android\.zip(?:\?v=[^"']*)?/g,
      `${firefoxDownload}?v=${firefoxHash}`
    )
);

const styleHash = shortHash(path.join(siteRoot, "styles.css"));
const scriptHash = shortHash(path.join(siteRoot, "site.js"));
const rulesHash = shortHash(path.join(siteRoot, "assets/rules-data.js"));

for (const htmlFile of ["index.html", "install.html", "rules.html", "privacy.html", "support.html"]) {
  updateSiteFile(htmlFile, (source) => {
    let next = source
      .replace(/styles\.css(?:\?v=[^"]*)?/g, `styles.css?v=${styleHash}`)
      .replace(/site\.js(?:\?v=[^"]*)?/g, `site.js?v=${scriptHash}`)
      .replace(
        /downloads\/byebyefishing-[^"'?]+-chrome\.zip(?:\?v=[^"']*)?/g,
        `${chromeDownload}?v=${chromeHash}`
      )
      .replace(
        /downloads\/byebyefishing-[^"'?]+-firefox-android\.zip(?:\?v=[^"']*)?/g,
        `${firefoxDownload}?v=${firefoxHash}`
      );

    if (htmlFile === "rules.html") {
      next = next.replace(
        /assets\/rules-data\.js(?:\?v=[^"]*)?/g,
        `assets/rules-data.js?v=${rulesHash}`
      );
    }

    if (htmlFile === "index.html") {
      next = next.replace(
        /<strong>\d+<\/strong>\s*<span>protected brand rules<\/span>/,
        `<strong>${catalog.count}</strong>\n          <span>protected brand rules</span>`
      );
    }

    return next;
  });
}

console.log(`Synced ${catalog.count} protected-brand rules from ${extensionRoot}`);
