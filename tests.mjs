import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import os from "node:os";
import http from "node:http";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import sharp from "sharp";
const must = [
  "index.html",
  "exhibitions/index.html",
  "exhibitions/clothes-and-cognition/index.html",
  "exhibitions/outfit-as-armor/index.html",
  "exhibitions/fabric-sensory-world/index.html",
  "exhibitions/fashion-nostalgia/index.html",
  "exhibitions/fashion-week-nervous-system/index.html",
  "exhibitions/runway-soundtracks/index.html",
  "exhibitions/uniforms-and-social-perception/index.html",
  "objects/index.html",
  "evidence/index.html",
  "ask/index.html",
  "lab/index.html",
  "lab/armor/index.html",
  "lab/textile-sensory-map/index.html",
  "lab/memory-garment-map/index.html",
  "lab/field-load-recovery/index.html",
  "lab/runway-sound-map/index.html",
  "lab/uniform-encounter-map/index.html",
  "rights/index.html",
  "method/index.html",
  "deliverables/index.html",
  "deliverables/armor/index.html",
  "deliverables/fabric-sensory-world/index.html",
  "deliverables/fashion-nostalgia/index.html",
  "deliverables/fashion-week-nervous-system/index.html",
  "deliverables/runway-soundtracks/index.html",
  "deliverables/uniforms-and-social-perception/index.html",
  "404.html",
  "robots.txt",
  "sitemap.xml",
];
for (const f of must)
  if (!fs.existsSync(f) || !fs.statSync(f).size) throw Error(`missing ${f}`);
const ctx = { window: {} };
vm.createContext(ctx);
const dataSource = fs.readFileSync("data.js", "utf8");
vm.runInContext(dataSource, ctx);
const { objects, claims } = ctx.window.AAN;

const retiredBrokenMetFiles = [
  "50.105.17_CP2.jpg",
  "69.2.51_front_CP4.jpg",
  "DP151922.jpg",
  "DP-14863-055.jpg",
  "DP-46028-001.jpg",
];
for (const retired of retiredBrokenMetFiles) {
  if (dataSource.includes(retired))
    throw Error(`retired broken Met image URL remains: ${retired}`);
}
const vercelConfig = fs.readFileSync("vercel.json", "utf8");
if (!vercelConfig.includes("https://collectionapi.metmuseum.org"))
  throw Error("CSP must permit the Met IIIF host used by object images");
if (
  objects.length !== 22 ||
  objects.some(
    (o) =>
      o.license !== "CC0" || !o.alt || !o.record || !o.image || !o.accession,
  )
)
  throw Error("object rights/provenance incomplete");
const accessions = [
  "C.I.45.27a, b",
  "2009.300.6638a, b",
  "2009.300.3330",
  "1988.65.1–.2; 1995.93a, b",
  "53.134",
  "2022.428.5",
  "1992.374",
  "29.154.3",
  "24.179; 26.188.1, .2; 29.158.363a, b",
  "04.3.289",
  "39.121a–n",
  "04.4.2",
  "2003.426a, b",
  "1993.35.1a–c",
  "1976.147.1",
  "1980.409.1a–c",
  "1979.1.2",
  "1978.412.111",
  "1976.285.5",
  "C.I.47.76.1a, b",
  "1979.152.54a–h",
  "2009.20a–j",
];
if (objects.some((o, i) => o.accession !== accessions[i]))
  throw Error("canonical Met accession mismatch");
if (
  ctx.window
    .filterEvidence(claims, "replication", "stroop")
    .map((x) => x.id)
    .join() !== "C02"
)
  throw Error("filter behavior failed");
if (ctx.window.filterEvidence(claims, "all", "all").length !== 50)
  throw Error("filter reset behavior failed");
const manifest = JSON.parse(
  fs.readFileSync("production/source-manifest.json", "utf8"),
);
const mapped = new Set(manifest.sources.flatMap((s) => s.claim_ids));
for (const c of claims.filter((x) => x.id.startsWith("C")))
  if (!mapped.has(c.id)) throw Error(`manifest missing ${c.id}`);
for (const author of [
  "Devin M. Burns",
  "Elizabeth L. Fox",
  "Michael Greenstein",
  "Gayla R. Olbricht",
  "DeMaris Montgomery",
])
  if (!JSON.stringify(manifest).includes(author))
    throw Error("replication authorship wrong: " + author);
if (JSON.stringify(manifest).includes("10.31234/osf.io/cj6kv"))
  throw Error("preprint DOI must not replace published replication DOI");
const lab = fs.readFileSync("lab/index.html", "utf8");
for (const id of [
  "statusSelect",
  "measureSelect",
  "fitRegion",
  "countRegion",
  "resetButton",
])
  if (!lab.includes(id)) throw Error(`explicit binding missing ${id}`);
if (/\bstatus\.value/.test(lab)) throw Error("implicit status global remains");
const production = [
  "package-001-kit.md",
  "video-script.md",
  "carousel-copy.md",
  "social-cuts.csv",
  "rights-ledger.csv",
  "source-manifest.json",
  "package-002-video-script.md",
  "package-002-beehiiv.md",
  "package-002-verticals.md",
  "package-002-carousels.md",
  "package-002-social.csv",
  "package-002-field-notes.md",
  "package-002-rights.csv",
  "package-002-sources.json",
  "package-003-video-audio-script.md",
  "package-003-beehiiv.md",
  "package-003-verticals.md",
  "package-003-carousels.md",
  "package-003-social.csv",
  "package-003-rights.csv",
  "package-003-sources.json",
  "package-004-video-audio-script.md",
  "package-004-beehiiv.md",
  "package-004-verticals.md",
  "package-004-carousels.md",
  "package-004-social.csv",
  "package-004-rights.csv",
  "package-004-sources.json",
  "package-005-video-audio-script.md",
  "package-005-beehiiv.md",
  "package-005-verticals.md",
  "package-005-carousels.md",
  "package-005-social.csv",
  "package-005-rights.csv",
  "package-005-sources.json",
  "package-006-video-audio-script.md",
  "package-006-beehiiv.md",
  "package-006-verticals.md",
  "package-006-carousels.md",
  "package-006-social.csv",
  "package-006-rights.csv",
  "package-006-sources.json",
  "package-007-video-audio-script.md",
  "package-007-beehiiv.md",
  "package-007-verticals.md",
  "package-007-carousels.md",
  "package-007-social.csv",
  "package-007-rights.csv",
  "package-007-sources.json",
  "publication-register.json",
  "pinterest-publication-kit.md",
  "human-completion-packet.md",
];

// Every package gallery must advertise its actual editorial subject. Generic
// numbered titles make social shares indistinguishable and are not publication
// metadata.
const packageGalleryTitles = {
  "001": "Clothes and Cognition — Platform Asset Kit",
  "002": "Outfit as Armor — Platform Asset Kit",
  "003": "The Sensory Textile Room — Platform Asset Kit",
  "004": "The Memory Wardrobe — Platform Asset Kit",
  "005": "The Fashion Week Nervous System — Platform Asset Kit",
  "006": "The Listening Room — Platform Asset Kit",
  "007": "The Role Room — Platform Asset Kit",
};
for (const [number, expectedTitle] of Object.entries(packageGalleryTitles)) {
  const html = fs.readFileSync(`production-kits/aan-f-${number}/index.html`, "utf8");
  const documentTitle = html.match(/<title>([^<]+)<\/title>/i)?.[1];
  const ogTitle = html.match(/property="og:title" content="([^"]+)"/i)?.[1];
  const twitterTitle = html.match(/name="twitter:title" content="([^"]+)"/i)?.[1];
  if (documentTitle !== expectedTitle || ogTitle !== expectedTitle || twitterTitle !== expectedTitle)
    throw Error(`AAN-F-${number} package gallery title metadata is inconsistent or generic`);
  if (/Package\s+\d+\s+Production Gallery/i.test(html))
    throw Error(`AAN-F-${number} retains a generic production-gallery title`);
}
const deliverablesGalleryTitles = {
  "deliverables/index.html": "Clothes and Cognition — Production Gallery",
  "deliverables/armor/index.html": "Outfit as Armor — Production Gallery",
  "deliverables/fabric-sensory-world/index.html": "The Sensory Textile Room — Production Gallery",
  "deliverables/fashion-nostalgia/index.html": "The Memory Wardrobe — Production Gallery",
  "deliverables/fashion-week-nervous-system/index.html": "The Fashion Week Nervous System — Production Gallery",
  "deliverables/runway-soundtracks/index.html": "The Listening Room — Production Gallery",
  "deliverables/uniforms-and-social-perception/index.html": "The Role Room — Production Gallery",
};
for (const [file, expectedTitle] of Object.entries(deliverablesGalleryTitles)) {
  const html = fs.readFileSync(file, "utf8");
  const documentTitle = html.match(/<title>([^<]+)<\/title>/i)?.[1];
  const ogTitle = html.match(/property="og:title" content="([^"]+)"/i)?.[1];
  const twitterTitle = html.match(/name="twitter:title" content="([^"]+)"/i)?.[1];
  if (documentTitle !== expectedTitle || ogTitle !== expectedTitle || twitterTitle !== expectedTitle)
    throw Error(`${file} must use its exact topic-specific title across document, Open Graph and Twitter metadata`);
}
const clientMetadataSource = fs.readFileSync("app.js", "utf8");
for (const expectedTitle of Object.values(deliverablesGalleryTitles))
  if (!clientMetadataSource.includes(`title: "${expectedTitle}"`))
    throw Error(`client metadata is missing exact title: ${expectedTitle}`);
if (/title:\s*"Package\s+\d+\s+Production Gallery/i.test(clientMetadataSource))
  throw Error("client metadata retains a generic numbered production-gallery title");
for (const f of production)
  if (!fs.existsSync(path.join("production", f)))
    throw Error(`missing production/${f}`);
const armorManifest = JSON.parse(
  fs.readFileSync("production/package-002-sources.json", "utf8"),
);
const armorMapped = new Set(armorManifest.sources.flatMap((s) => s.claim_ids));
for (const id of ["A01", "A02", "A03", "A04", "A05"])
  if (!armorMapped.has(id)) throw Error(`armor manifest missing ${id}`);
if (armorManifest.sources.some((s) => !s.evidence_class || !s.limit || !s.url))
  throw Error("armor evidence boundary incomplete");
const armorRights = fs.readFileSync(
  "production/package-002-rights.csv",
  "utf8",
);
for (const id of [
  "M23205",
  "M27790",
  "M22001",
  "M24671",
  "M22020",
  "EDU001",
  "EDU002",
])
  if (!armorRights.includes(id))
    throw Error(`armor rights ledger missing ${id}`);
if (
  !armorRights.includes("link only") ||
  !armorRights.includes("Public Domain/CC0")
)
  throw Error("armor asset dispositions incomplete");
const armorPage = fs.readFileSync(
  "exhibitions/outfit-as-armor/index.html",
  "utf8",
);
for (const token of [
  "AAN-F-002",
  "download>Download",
  "3D + AUDIO",
  "Link-only",
  "AAN-F-002",
  "Armor Pathway Mapper",
])
  if (!armorPage.includes(token))
    throw Error(`armor exhibition missing ${token}`);
const armorLab = fs.readFileSync("lab/armor/index.html", "utf8");
for (const token of [
  "nothing is stored",
  "non-diagnostic",
  "aria-live",
  "clearArmor",
])
  if (!armorLab.toLowerCase().includes(token.toLowerCase()))
    throw Error(`armor mapper missing ${token}`);
const site =
  must
    .filter((x) => x.endsWith(".html"))
    .map((x) => fs.readFileSync(x, "utf8"))
    .join("\n") + fs.readFileSync("app.js", "utf8");
if (
  site.includes("corrections@example.com") ||
  site.includes("Contact pending")
)
  throw Error("fake or unresolved correction contact remains");
if (
  !site.includes(
    "https://github.com/rn-collins/ask-a-neuroscientist-fashion/issues/new/choose",
  )
)
  throw Error("authorized correction channel missing");
if (!site.includes("recorded or approved") || !site.includes("owner-final"))
  throw Error("human-only deliverables not honestly labelled");
for (const form of [
  ".github/ISSUE_TEMPLATE/correction.yml",
  ".github/ISSUE_TEMPLATE/takedown.yml",
  ".github/ISSUE_TEMPLATE/config.yml",
])
  if (!fs.existsSync(form)) throw Error(`missing ${form}`);
if (
  !fs.readFileSync("index.html", "utf8").includes('rel="canonical"') ||
  !fs.readFileSync("index.html", "utf8").includes("og:title")
)
  throw Error("homepage metadata incomplete");
if (
  !fs.readFileSync("evidence/index.html", "utf8").includes(
    'rel="canonical"',
  )
)
  throw Error("evidence canonical metadata incomplete");
if (
  !fs.readFileSync("app.js", "utf8").includes("<details>") ||
  !fs.readFileSync("app.js", "utf8").includes("Skip to content")
)
  throw Error("low-load accessible navigation absent");
const publicPages = must.filter((x) => x.endsWith("index.html"));
for (const file of publicPages) {
  const html = fs.readFileSync(file, "utf8");
  for (const token of [
    '<html lang="en">',
    '<meta name="viewport"',
    "<main",
    "<h1",
    "/app.js",
  ])
    if (!html.includes(token))
      throw Error(`${file} missing structural ${token}`);
  if (/<img\b(?![^>]*\balt=)[^>]*>/i.test(html))
    throw Error(`${file} contains image without alt text`);
  if (/<img[^>]+src=["']data:image/i.test(html))
    throw Error(`${file} contains unprovenanced inline imagery`);
}
const packageManifests = [
  ["A", "production/package-002-sources.json"],
  ["T", "production/package-003-sources.json"],
  ["N", "production/package-004-sources.json"],
  ["F", "production/package-005-sources.json"],
  ["S", "production/package-006-sources.json"],
  ["U", "production/package-007-sources.json"],
];
for (const [prefix, file] of packageManifests) {
  const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
  const records = parsed.sources || parsed.claims || [];
  const mappedIds = new Set(records.flatMap((x) => x.claim_ids || [x.id]));
  for (const claim of claims.filter((x) => x.id.startsWith(prefix)))
    if (!mappedIds.has(claim.id)) throw Error(`${file} missing ${claim.id}`);
  for (const record of records)
    if (!record.url || !(record.limit || record.transfer_limit) || /example\.com/i.test(record.url))
      throw Error(`${file} contains incomplete source record`);
}
const register = JSON.parse(fs.readFileSync("production/publication-register.json", "utf8"));
if (register.packages.length !== 7 || register.packages.some((p) => p.author === "" || p.owner_final !== "pending" || !p.web_publication_date || !p.version))
  throw Error("publication register incomplete or overclaims approval");
const app = fs.readFileSync("app.js", "utf8");
for (const route of [
  "/exhibitions/",
  "/exhibitions/outfit-as-armor/",
  "/exhibitions/fabric-sensory-world/",
  "/exhibitions/fashion-nostalgia/",
  "/exhibitions/fashion-week-nervous-system/",
  "/exhibitions/runway-soundtracks/",
  "/exhibitions/uniforms-and-social-perception/",
  "/objects/",
  "/evidence/",
  "/ask/",
  "/lab/",
  "/lab/armor/",
  "/lab/textile-sensory-map/",
  "/lab/memory-garment-map/",
  "/lab/field-load-recovery/",
  "/lab/runway-sound-map/",
  "/lab/uniform-encounter-map/",
  "/rights/",
  "/method/",
  "/deliverables/",
  "/deliverables/armor/",
  "/deliverables/fabric-sensory-world/",
  "/deliverables/fashion-nostalgia/",
  "/deliverables/fashion-week-nervous-system/",
  "/deliverables/runway-soundtracks/",
  "/deliverables/uniforms-and-social-perception/",
])
  if (!app.includes(`"${route}"`) && !app.includes(`'${route}'`))
    throw Error(`route metadata missing ${route}`);
for (const token of [
  "og:title",
  "og:description",
  "og:url",
  "twitter:card",
  "canonicalLink",
])
  if (!app.includes(token)) throw Error(`dynamic metadata missing ${token}`);
const mobile = fs.readFileSync("mobile-nav.css", "utf8");
if (
  !mobile.includes("nth-of-type(3)") ||
  !mobile.includes("nth-of-type(4)") ||
  !mobile.includes("display:inline")
)
  throw Error("Objects and Evidence not directly visible on mobile");
const headers = JSON.parse(fs.readFileSync("vercel.json", "utf8")).headers[0]
  .headers;
const csp =
  headers.find((x) => x.key === "Content-Security-Policy")?.value || "";
for (const directive of [
  "frame-ancestors 'none'",
  "images.metmuseum.org",
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "youtube-nocookie.com",
])
  if (!csp.includes(directive)) throw Error(`CSP missing ${directive}`);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "aan-host-"));
fs.writeFileSync(
  path.join(tmp, "robots.txt"),
  "https://ask-a-neuroscientist-fashion.vercel.app/x",
);
fs.writeFileSync(
  path.join(tmp, "index.html"),
  '<link rel="canonical" href="https://ask-a-neuroscientist-fashion.vercel.app/">',
);
const configured = spawnSync(
  process.execPath,
  [path.resolve("configure-hostname.mjs"), "aan.example.org"],
  { cwd: tmp },
);
if (
  configured.status ||
  fs
    .readFileSync(path.join(tmp, "robots.txt"), "utf8")
    .includes("vercel.app") ||
  !fs
    .readFileSync(path.join(tmp, "index.html"), "utf8")
    .includes("aan.example.org")
)
  throw Error("hostname configuration failed");
fs.rmSync(tmp, { recursive: true });
const fwClaims = claims.filter((c) => c.id.startsWith("F"));
if (fwClaims.length !== 9 || fwClaims.some((c) => !c.boundary || !c.doi))
  throw Error("Package 005 claims or boundaries incomplete");
const fwManifest = JSON.parse(
  fs.readFileSync("production/package-005-sources