import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {fileURLToPath} from "node:url";
import {site,pages} from "../seo.config.mjs";

const root=fileURLToPath(new URL("..",import.meta.url));
const escape=value=>String(value).replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;");
const absolute=page=>new URL(page.path ?? page.file,site.url).href;
const hash=file=>crypto.createHash("sha256").update(fs.readFileSync(path.join(root,file))).digest("hex").slice(0,10);
if(!site.url.startsWith("https://") || !site.url.endsWith("/")) throw new Error("Use the HTTPS canonical site URL with a trailing slash");
const css=hash("styles.css"),js=hash("site.js");

for(const page of pages) {
  const filename=path.join(root,page.file),url=absolute(page),prefix=page.file.includes("/")?"../":"";
  const home=page.lang==="fr"?new URL("fr/",site.url).href:site.url;
  const image=new URL(`assets/share-${page.lang}.png`,site.url).href;
  const alternates=page.pair?pages.filter(p=>p.pair===page.pair):[];
  const original=fs.readFileSync(filename,"utf8");
  const verificationTags=[...original.matchAll(/<meta\b[^>]*>/gi)].map(match=>match[0]).filter(tag=>/name=["'](?:google-site-verification|msvalidate\.01)["']/i.test(tag));
  const webpage={"@type":"WebPage","@id":url+"#webpage",url,name:page.title,description:page.description,inLanguage:page.lang,
    isPartOf:{"@id":site.url+"#website"},dateModified:site.modified};
  const graph=[{"@type":"WebSite","@id":site.url+"#website",url:site.url,name:site.name,inLanguage:["en","fr"],publisher:{"@id":site.url+"#publisher"}},
    {"@type":"Person","@id":site.url+"#publisher",name:site.publisher,url:site.publisherUrl},webpage];
  if(page.pair==="home") {
    webpage.about={"@id":site.url+"#extension"};
    graph.push({"@type":"SoftwareApplication","@id":site.url+"#extension",name:site.name,url:site.url,
      applicationCategory:"SecurityApplication",applicationSubCategory:"Browser extension",operatingSystem:"Windows, macOS, Linux",
      softwareVersion:site.version,isAccessibleForFree:true,description:"Developer preview with local phishing checks for visible webmail senders, text and links. Manual desktop installation; detection and provider validation remain incomplete.",
      downloadUrl:new URL(page.lang==="fr"?"fr/installer.html":"install.html",site.url).href,
      offers:{"@type":"Offer",price:0,priceCurrency:"EUR",url:new URL("install.html",site.url).href},publisher:{"@id":site.url+"#publisher"}});
  } else {
    webpage.breadcrumb={"@id":url+"#breadcrumb"};
    graph.push({"@type":"BreadcrumbList","@id":url+"#breadcrumb",itemListElement:[
      {"@type":"ListItem",position:1,name:page.lang==="fr"?"Accueil":"Home",item:home},
      {"@type":"ListItem",position:2,name:page.title.split(" | ")[0],item:url}]});
  }
  if(page.article) graph.push({"@type":"Article","@id":url+"#article",headline:page.title.split(" | ")[0],description:page.description,
    mainEntityOfPage:{"@id":url+"#webpage"},author:{"@id":site.url+"#publisher"},dateModified:site.modified,inLanguage:page.lang,image});
  const head=`<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escape(page.title)}</title>
    <meta name="description" content="${escape(page.description)}">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <meta name="theme-color" content="#0d6259">
${verificationTags.map(tag=>`    ${tag}`).join("\n")}
    <link rel="canonical" href="${url}">
${alternates.map(p=>`    <link rel="alternate" hreflang="${p.lang}" href="${absolute(p)}">`).join("\n")}
${alternates.length?`    <link rel="alternate" hreflang="x-default" href="${absolute(alternates.find(p=>p.lang==="en"))}">`:""}
    <meta property="og:type" content="${page.article?"article":"website"}">
    <meta property="og:site_name" content="${site.name}">
    <meta property="og:locale" content="${page.lang==="fr"?"fr_FR":"en_US"}">
    <meta property="og:title" content="${escape(page.title)}">
    <meta property="og:description" content="${escape(page.description)}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${page.lang==="fr"?"Bye Bye Fishing : vérifiez les mails suspects, en local.":"Bye Bye Fishing: check suspicious email, privately on your device."}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escape(page.title)}">
    <meta name="twitter:description" content="${escape(page.description)}">
    <meta name="twitter:image" content="${image}">
    <meta name="twitter:image:alt" content="${site.name} — ${page.lang==="fr"?"extension anti-phishing gratuite":"free anti-phishing browser extension"}">
    <link rel="icon" href="${prefix}assets/byebyefishing.svg" type="image/svg+xml">
    <link rel="icon" href="${prefix}assets/icon-128.png" type="image/png" sizes="128x128">
    <link rel="stylesheet" href="${prefix}styles.css?v=${css}">
    <script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@graph":graph}).replaceAll("<","\\u003c")}</script>
  </head>`;
  let html=original.replace(/<head>[\s\S]*?<\/head>/,head);
  const other=alternates.find(p=>p.lang!==page.lang);
  if(other) {
    const relative=path.posix.relative(path.posix.dirname(page.file),other.file).replace(/(^|\/)index\.html$/,"$1") || "./";
    html=html.replace(new RegExp(`<a href="[^"]*" lang="${other.lang}" hreflang="${other.lang}">`,"g"),`<a href="${relative}" lang="${other.lang}" hreflang="${other.lang}">`);
  }
  html=html.replace(/<script src="([^"\n]*site\.js)(?:\?v=[^"]*)?"[^>]*><\/script>/g,`<script src="$1?v=${js}" defer></script>`);
  if(!html.includes('id="main-content"')) throw new Error(`Missing accessible main content: ${page.file}`);
  fs.writeFileSync(filename,html);
}
const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${pages.map(page=>{
  const alternates=page.pair?pages.filter(p=>p.pair===page.pair):[];
  return `  <url><loc>${escape(absolute(page))}</loc><lastmod>${site.modified}</lastmod>${alternates.map(p=>`<xhtml:link rel="alternate" hreflang="${p.lang}" href="${escape(absolute(p))}"/>`).join("")}${alternates.length?`<xhtml:link rel="alternate" hreflang="x-default" href="${escape(absolute(alternates.find(p=>p.lang==="en")))}"/>`:""}</url>`;
}).join("\n")}\n</urlset>\n`;
fs.writeFileSync(path.join(root,"sitemap.xml"),sitemap);
fs.writeFileSync(path.join(root,"robots.txt"),`# robots.txt is effective only at the host root.\n# This project's GitHub Pages subpath cannot set host-wide crawler policy.\nUser-agent: *\nAllow: /\n\nSitemap: ${site.url}sitemap.xml\n`);
fs.writeFileSync(path.join(root,".nojekyll"),"");
fs.writeFileSync(path.join(root,"404.html"),`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, follow"><title>Page not found | Bye Bye Fishing</title><link rel="stylesheet" href="${site.url}styles.css?v=${css}"></head><body><main class="page-hero narrow"><p class="eyebrow">404 · Page not found</p><h1>Let’s get you back to the right page.</h1><p>This address does not match a page on Bye Bye Fishing.</p><div class="hero-actions"><a class="button primary" href="${site.url}">Go to the homepage</a><a class="text-link" href="${site.url}install.html">Download and install</a></div></main></body></html>\n`);
console.log(`Built metadata, language alternates and sitemap for ${pages.length} static pages.`);
