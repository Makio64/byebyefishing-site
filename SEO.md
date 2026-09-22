# Search visibility and downloads

Implemented September 22, 2026. This is a local implementation, not a claim of increased traffic, indexing or downloads. The existing public site was reachable during the audit, but these changes have not been published.

## What is implemented

- Twelve indexable static pages: the existing five pages, a general phishing guide, distinct Gmail and Outlook guides, an installation/privacy FAQ, and French home, installation and phishing-guide pages.
- Unique titles and descriptions, self-referencing absolute canonical URLs, Open Graph and large-card metadata, localized 1200×630 sharing images and reciprocal English/French/x-default alternates for equivalent pages.
- A canonical-only XML sitemap, a non-indexable custom 404 page, normalized homepage links, descriptive internal links and content available in the original HTML. The French pages do not depend on browser-language redirects.
- WebSite, WebPage, publisher, breadcrumb and relevant article/software metadata. No fabricated reviews, star ratings, download counts or search-volume claims. The software graph is semantic markup: it does **not** qualify for Google's software-app rich result without a genuine eligible rating/review. FAQ content is ordinary useful HTML; no FAQ rich-result eligibility is claimed.
- Clearer free-preview calls to action, browser-specific desktop links, working static downloads without JavaScript, direct ZIP download attributes, truthful “download requested” feedback, manual setup guidance, file sizes and verified SHA-256 checksums.
- Lightweight system fonts, deferred site JavaScript, no remote scripts or tracking, fixed image dimensions, responsive 640/1280 WebP proof images, and lazy loading for the below-the-fold example. The French above-the-fold example is prioritized rather than lazy loaded.
- Repeatable generation and checks: `npm run build` syncs the release files, updates metadata/sitemap and validates the site. The checks cover all internal page/fragment/asset links, language relationships, JSON-LD syntax and page identity, metadata uniqueness, sitemap coverage, social-image dimensions, asset budgets and download integrity.
- Eighteen source-level English/French routing cases check Chrome, Edge, Firefox, Safari, iPhone, iPad desktop mode, Android and unknown browsers. Mobile visitors keep the setup guidance instead of receiving a desktop-specific call to action. Metadata generation was also verified to be idempotent and to preserve real owner verification tags.

## Hosting details that matter

The canonical URL is `https://makio64.github.io/byebyefishing-site/`. Change it only in `seo.config.mjs` if a real owned domain is configured, then rebuild and arrange redirects from the old URLs. Do not point canonical URLs at localhost, a temporary preview or a domain that has not been configured.

This is a GitHub Pages **project subpath**. A `robots.txt` placed under `/byebyefishing-site/` cannot control the host; crawlers read `https://makio64.github.io/robots.txt`. The prepared file becomes effective only at a host root, such as a configured custom domain. The current host root returns no robots policy, which does not by itself prevent crawling. Submit the project sitemap directly in Search Console. Do not claim that adding this subpath file changed crawler policy for the account's other sites.

Google's site-name feature also does not support subdirectory-level site names. The WebSite metadata still describes this project, but a custom branded search-result site name is not promised on this hosting path. A custom domain is a future owner decision; none was bought or configured.

## Publishing and measurement

1. Review the responsive browser layout and download flow, then publish the checked site through the repository's existing GitHub Pages process. Current browser verification was blocked because the browser tool could not verify an admin-enforced security policy; no alternate browser-control route was used. Node syntax, static structure and asset checks passed. No Lighthouse, accessibility-score or Core Web Vitals field result is claimed.
2. Verify the URL-prefix property `https://makio64.github.io/byebyefishing-site/` in the owner's Google Search Console account. Use its real verification file or HTML tag; do not add a guessed token. The metadata builder preserves existing `google-site-verification` and `msvalidate.01` meta tags.
3. Submit `https://makio64.github.io/byebyefishing-site/sitemap.xml`. Inspect the English/French home and installation URLs; check canonical selection, indexing eligibility and language alternatives. Submit the same sitemap in Bing Webmaster Tools if that account is available. No credentials, property verification or submissions were performed here.
4. Review search impressions, clicks, click-through rate, landing pages and search terms after indexing. Search Console provides discovery data; it does not measure completed extension installations.
5. Once the release gates are satisfied and actual store listings exist, replace manual-preview destinations with the appropriate official store URL. Store developer dashboards can then measure installs. Current ZIP click feedback is local UI only and is deliberately not counted as a completed download or install. GitHub Pages alone does not provide reliable per-file completed-download attribution.
6. Review the copy against actual user questions and Search Console queries. Improve useful pages rather than creating repetitive pages for every brand, fabricated comparisons, keyword lists, hidden text or artificial backlinks. Earn links through useful guides and genuine project references; no outreach or link placement was performed.

The biggest remaining install obstacle is the absence of signed store releases. SEO work cannot remove that or establish the detector's release readiness. Keep the developer-preview status and detection/compatibility limitations until they are resolved. Do not advertise benchmark recall as general protection accuracy.

## Maintenance

Edit page bodies directly. `seo.config.mjs` owns titles, descriptions, language pairs, canonical URL and the real modification date. The build does not stamp a fresh date on every run. Add new indexable pages to the registry and link them from useful existing pages. Run `npm run build` after edits.

The social images are committed assets; production hosting needs no rendering dependencies. To regenerate them from the editable SVGs, use `npm run assets:share` with ImageMagick and the installed macOS Arial font, or `node scripts/build-share-images.mjs /path/to/font.ttf` on another system. Inspect the PNGs after rendering. The optimized warning illustration comes from the existing fictional store screenshot, not a private inbox.

Local validation is not Google's Rich Results Test or Search Console URL Inspection. Those should be checked on the public URLs after deployment. Missing genuine reviews are not an error to solve by inventing ratings.

## Primary guidance used

- [Google SEO developer guide](https://developers.google.com/search/docs/fundamentals/get-started-developers): descriptive page metadata, crawlable links and accessible content.
- [Google Search Essentials](https://developers.google.com/search/docs/essentials): people-first content and descriptive wording.
- [Canonical sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).
- [Localized page versions](https://developers.google.com/search/docs/specialty/international/localized-versions).
- [Robots file placement](https://developers.google.com/crawling/docs/robots-txt/create-robots-txt).
- [Site-name requirements](https://developers.google.com/search/docs/appearance/site-names).
- [Software application structured data](https://developers.google.com/search/docs/appearance/structured-data/software-app) and [general structured-data rules](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).
- [Image loading and priority](https://web.dev/articles/fetch-priority).

Provider reporting steps in the guides link directly to current Google and Microsoft documentation. These projects and providers are not endorsements of the extension.
