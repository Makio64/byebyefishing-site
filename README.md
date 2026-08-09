# Bye Bye Fishing Site

Modern static website for presenting the Bye Bye Fishing browser extension.

## What is inside

- `index.html`: product story, philosophy, privacy posture, and open-source positioning.
- `install.html`: installation guidance for Chrome, Edge, Firefox, Firefox Android, and Safari.
- `rules.html`: practical safety rules plus a searchable catalog generated from the extension defaults.
- `privacy.html`: plain-language privacy page.
- `assets/rules-data.js`: generated from the extension's `src/default-rules.js`.
- `downloads/`: current extension ZIP packages for developer testing or store upload. They are not one-click Android installers.

## Run locally

```bash
npm start
```

Then open:

```text
http://localhost:4173
```

The site is also plain static HTML, so opening `index.html` directly works.

## Refresh from the extension repo

From this folder:

```bash
npm run sync:extension
```

Pass another extension path if this site repo is moved:

```bash
node scripts/sync-extension-assets.mjs /path/to/byebyefishing-extension
```

The sync script copies the icon, release ZIPs, and regenerates `assets/rules-data.js`.

## Before publishing

- Replace any future store placeholders with live Chrome Web Store, Mozilla Add-ons, and App Store links.
- Add the final public source repository URL where the site says "Source repo".
- Decide the license for the website and extension source before the first public release.
