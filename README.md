# Bye Bye Fishing website

A static English/French website for the free developer preview. There is no framework, analytics service, external font or client-side rendering requirement for the content and download links.

## Edit and build

Edit the HTML page bodies and `styles.css`. Page metadata, language pairs, the canonical public URL and actual modification date live in `seo.config.mjs`. Then run:

```sh
npm run build
```

The build copies the current Chrome/Edge and Firefox ZIPs from the parent extension project, writes checksums and sizes, refreshes the brand catalog and cache versions, generates search/social metadata and the sitemap, and runs the site checks. Existing extension artifacts must be built first. Do not use a stale package just to update website copy.

If the site is checked out separately, run `node scripts/sync-extension-assets.mjs /path/to/extension` once, then `npm run build:seo` and `npm run check`. The committed static files are directly deployable; hosting does not run Node or Python.

```sh
npm start
```

opens a development server on port 4173. Preview URLs are not canonical URLs.

## Pages

- Product and downloads: `index.html`, `install.html` and their equivalents under `fr/`.
- Practical guides: `phishing-email-guide.html`, `gmail-phishing-protection.html`, `outlook-phishing-protection.html`, and `fr/guide-hameconnage.html`.
- Answers and transparency: `faq.html`, `rules.html`, `privacy.html`, `support.html`.
- Search infrastructure: `sitemap.xml`, `robots.txt`, `.nojekyll`, `404.html`, and localized sharing images under `assets/`.

The metadata builder owns every page's head and the custom 404 page. It preserves real Google/Bing verification meta tags already present. Content remains readable without JavaScript; JavaScript adds browser-aware guidance, navigation and catalog search.

## Validation and publishing

Run `npm run check` and `git diff --check`. Review the responsive pages in a browser before publication. See [SEO.md](SEO.md) for the actual checks performed, the current browser-tool limitation, GitHub Pages subpath restrictions, Search Console setup and measurement steps.

Developer-preview ZIPs are manual desktop installs. Android remains experimental, Safari is unavailable, source licensing is pending and store links do not yet exist. Do not replace those facts with one-click installation or complete-protection claims. Public-source publication and a broad launch remain separate release decisions.

The social PNGs are committed. Their editable SVG sources can be rendered again with `npm run assets:share` (ImageMagick; an explicit font path can be supplied to the script). Production hosting needs no image tools.
