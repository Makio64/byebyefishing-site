#!/usr/bin/env python3
"""Check crawlability, links, metadata and download integrity without a browser."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlsplit, unquote
import hashlib
import json
import struct
import subprocess
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
BASE = json.loads(subprocess.run(['node', '--input-type=module', '-e', 'import {site} from "./seo.config.mjs"; console.log(JSON.stringify(site));'], cwd=ROOT, check=True, capture_output=True, text=True).stdout)['url']
errors = []

class Page(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.tags, self.ids, self.titles, self.headings, self.jsonld = [], set(), [], [], []
        self.capture = None
        self.feed(source)
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if attrs.get('id'):
            if attrs['id'] in self.ids: errors.append('Duplicate ID: ' + attrs['id'])
            self.ids.add(attrs['id'])
        if tag in ('title', 'h1') or tag == 'script' and attrs.get('type') == 'application/ld+json':
            self.capture = (tag, [])
    def handle_data(self, value):
        if self.capture: self.capture[1].append(value)
    def handle_endtag(self, tag):
        if self.capture and self.capture[0] == tag:
            value = ''.join(self.capture[1])
            {'title': self.titles, 'h1': self.headings, 'script': self.jsonld}[tag].append(value)
            self.capture = None
    def attrs(self, tag): return [a for t, a in self.tags if t == tag]
    def meta(self, key): return [a.get('content', '') for a in self.attrs('meta') if a.get('name') == key or a.get('property') == key]
    def rel(self, relation): return [a for a in self.attrs('link') if a.get('rel') == relation]

def check(condition, message):
    if not condition: errors.append(message)

files = sorted([*ROOT.glob('*.html'), *ROOT.glob('fr/*.html')])
parsed = {p.relative_to(ROOT).as_posix(): Page(p.read_text()) for p in files}
indexable = {name: page for name, page in parsed.items() if not any('noindex' in value for value in page.meta('robots'))}
canonical_map, titles, descriptions, internal_graph = {}, set(), set(), {}
for name, page in indexable.items():
    url = BASE + ('' if name == 'index.html' else 'fr/' if name == 'fr/index.html' else name)
    check(len(page.headings) == 1, f'{name}: expected exactly one H1')
    check(len(page.titles) == 1 and 15 <= len(page.titles[0]) <= 70, f'{name}: missing/oversized title')
    check(page.titles[0] not in titles, f'{name}: duplicate title'); titles.update(page.titles)
    desc = page.meta('description')
    check(len(desc) == 1 and 80 <= len(desc[0]) <= 180, f'{name}: missing/oversized description')
    check(desc[0] not in descriptions, f'{name}: duplicate description'); descriptions.update(desc)
    check(page.rel('canonical') == [{'rel': 'canonical', 'href': url}], f'{name}: incorrect canonical')
    canonical_map[url] = name
    check(page.meta('og:url') == [url], f'{name}: social URL differs from canonical')
    check(page.meta('og:title') == page.titles, f'{name}: Open Graph title mismatch')
    check(page.meta('twitter:card') == ['summary_large_image'], f'{name}: missing social card')
    check(len(page.meta('og:image')) == 1, f'{name}: missing sharing image')
    check(len(page.jsonld) == 1, f'{name}: expected structured data')
    try:
        schema = json.loads(page.jsonld[0])
        check(schema['@context'] == 'https://schema.org' and bool(schema['@graph']), f'{name}: schema graph missing')
        check(not any('aggregateRating' in item or 'review' in item for item in schema['@graph']), f'{name}: fabricated review markup must not be added')
        check(any(item.get('@id') == url+'#webpage' for item in schema['@graph']), f'{name}: wrong structured page identity')
    except (ValueError, KeyError): errors.append(f'{name}: invalid JSON-LD')
    check(all('src' not in a or not a['src'].startswith(('http:', 'https:', '//')) for a in page.attrs('script')), f'{name}: external script added')
    check(not any(a.get('src','').startswith(('data:', 'http')) for a in page.attrs('img')), f'{name}: unexpected remote/inline image')
    for image in page.attrs('img'):
        check('alt' in image and 'width' in image and 'height' in image, f'{name}: image missing alt/dimensions')
    internal_graph[name] = set()
    refs = [(a.get('href',''), True) for a in page.attrs('a')] + [(a.get('src',''), False) for a in page.attrs('img') + page.attrs('script')] + [(a['href'],False) for a in page.rel('stylesheet')] + [(a,False) for a in page.meta('og:image')]
    for href, is_link in refs:
        if not href: continue
        resolved = urljoin(url, href)
        if not resolved.startswith(BASE): continue
        parts = urlsplit(resolved)
        relative = unquote(parts.path[len(urlsplit(BASE).path):])
        relative = (relative + 'index.html') if not relative or relative.endswith('/') else relative
        target = ROOT / relative
        check(target.is_file(), f'{name}: broken local URL {href}')
        if relative in parsed and parts.fragment:
            check(unquote(parts.fragment) in parsed[relative].ids, f'{name}: missing anchor {href}')
        if is_link and relative in indexable: internal_graph[name].add(relative)
    for alternate in page.rel('alternate'):
        if alternate.get('hreflang') == 'x-default': continue
        target = alternate.get('href', '')
        check(target.startswith(BASE), f'{name}: off-site language alternate')

for name, page in indexable.items():
    for alternate in page.rel('alternate'):
        target = canonical_map.get(alternate.get('href'))
        check(target is not None, f'{name}: language target not canonical')
        if target:
            check(any(a.get('href') == page.rel('canonical')[0]['href'] for a in indexable[target].rel('alternate')), f'{name}: language relationship not reciprocal')
            if alternate.get('hreflang') != 'x-default':
                check(indexable[target].attrs('html')[0].get('lang') == alternate['hreflang'], f'{name}: wrong alternate language')

reachable, pending = set(), ['index.html']
while pending:
    name = pending.pop()
    if name in reachable: continue
    reachable.add(name); pending.extend(internal_graph.get(name, set()) - reachable)
check(reachable == set(indexable), 'Indexable pages must all be reachable through normal HTML links')
ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
sitemap = ET.parse(ROOT/'sitemap.xml')
locations = [item.text for item in sitemap.findall('.//s:loc', ns)]
check(len(locations) == len(set(locations)) and set(locations) == set(canonical_map), 'Sitemap must contain each canonical once and no noindex pages')
check(any('noindex' in value for value in parsed['404.html'].meta('robots')), '404 page must not be indexed')
for lang in ('en', 'fr'):
    file = ROOT / f'assets/share-{lang}.png'
    if file.exists():
        raw = file.read_bytes()
        check(raw[:8] == b'\x89PNG\r\n\x1a\n' and struct.unpack('>II',raw[16:24]) == (1200,630), f'{file.name}: expected a 1200x630 PNG')
    else: errors.append(f'Missing social image: {file.name}')
for line in (ROOT/'downloads/SHA256SUMS').read_text().splitlines():
    digest, name = line.split('  ', 1)
    check(hashlib.sha256((ROOT/'downloads'/name).read_bytes()).hexdigest() == digest, f'Download checksum mismatch: {name}')
for file, limit in [('styles.css',50000),('site.js',25000),('assets/warning-example.webp',150000)]:
    check((ROOT/file).stat().st_size <= limit, f'{file}: exceeds lightweight-page asset budget')
if errors:
    print('\n'.join(errors))
    raise SystemExit(1)
print(f'PASS: {len(indexable)} indexable pages; metadata, structured data, language pairs, crawlable links, images, sitemap, 404 and download checksums verified.')
