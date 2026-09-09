import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import os from "node:os";
import http from "node:http";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
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
  fs.readFileSync("production/package-005-sources.json", "utf8"),
);
const fwMapped = new Set(fwManifest.sources.flatMap((s) => s.claim_ids));
for (const c of fwClaims)
  if (!fwMapped.has(c.id)) throw Error(`Package 005 manifest missing ${c.id}`);
if (
  !fwManifest.scope_note.includes("No located study") ||
  fwManifest.sources.some((s) => !s.transfer_limit || !s.evidence_class)
)
  throw Error("Package 005 transfer limits incomplete");
const fwPage = fs.readFileSync(
  "exhibitions/fashion-week-nervous-system/index.html",
  "utf8",
);
for (const token of [
  "Fashion Week is not one stimulus",
  "youtube-nocookie.com/embed/S5dwtat6Wp8",
  "youtube-nocookie.com/embed/vRJbrfgrAUs",
  "Not established",
  "Map one event day",
])
  if (!fwPage.includes(token)) throw Error(`Package 005 exhibition missing ${token}`);
const fwLab = fs.readFileSync("lab/field-load-recovery/index.html", "utf8");
for (const token of [
  "NOTHING IS STORED",
  "non-diagnostic",
  "aria-live",
  "buildLoad",
  "clearLoad",
  "does not calculate nervous-system load",
])
  if (!fwLab.toLowerCase().includes(token.toLowerCase()))
    throw Error(`Package 005 mapper missing ${token}`);
const fwRights = fs.readFileSync("production/package-005-rights.csv", "utf8");
for (const token of ["FW-M01", "FW-M02", "AUTHORIZED EMBED", "No download"])
  if (!fwRights.includes(token)) throw Error(`Package 005 rights missing ${token}`);
const soundClaims = claims.filter((c) => c.id.startsWith("S"));
if (soundClaims.length !== 9 || soundClaims.some((c) => !c.boundary || !c.doi))
  throw Error("Package 006 claims or boundaries incomplete");
const soundManifest = JSON.parse(fs.readFileSync("production/package-006-sources.json", "utf8"));
const soundMapped = new Set(soundManifest.sources.flatMap((s) => s.claim_ids));
for (const c of soundClaims)
  if (!soundMapped.has(c.id)) throw Error(`Package 006 manifest missing ${c.id}`);
const soundPage = fs.readFileSync("exhibitions/runway-soundtracks/index.html", "utf8");
for (const token of ["Powerful is not the same as universal", "youtube-nocookie.com/embed/WifoAv6AR_I", "Entrainment means temporal alignment", "Download image", "Not established"])
  if (!soundPage.includes(token)) throw Error(`Package 006 exhibition missing ${token}`);
const soundLab = fs.readFileSync("lab/runway-sound-map/index.html", "utf8");
for (const token of ["NOTHING IS STORED", "aria-live", "buildSound", "clearSound", "does not reveal sound dose"])
  if (!soundLab.toLowerCase().includes(token.toLowerCase())) throw Error(`Package 006 mapper missing ${token}`);
const soundRights = fs.readFileSync("production/package-006-rights.csv", "utf8");
for (const token of ["BFC001", "authorized platform embed", "Public Domain/CC0", "No download"])
  if (!soundRights.includes(token)) throw Error(`Package 006 rights missing ${token}`);
const uniformClaims = claims.filter((c) => c.id.startsWith("U"));
if (uniformClaims.length !== 8 || uniformClaims.some((c) => !c.boundary || !c.doi))
  throw Error("Package 007 claims or boundaries incomplete");
const uniformManifest = JSON.parse(fs.readFileSync("production/package-007-sources.json", "utf8"));
const uniformMapped = new Set(uniformManifest.sources.flatMap((s) => s.claim_ids));
for (const c of uniformClaims)
  if (!uniformMapped.has(c.id)) throw Error(`Package 007 manifest missing ${c.id}`);
if (uniformManifest.sources.some((s) => !s.evidence_class || !s.limit || !s.url))
  throw Error("Package 007 evidence boundaries incomplete");
const uniformPage = fs.readFileSync("exhibitions/uniforms-and-social-perception/index.html", "utf8");
for (const token of ["A uniform is read before its wearer speaks", "Inference is not verification", "Download image", "Not established", "Uniform Encounter Map"])
  if (!uniformPage.includes(token)) throw Error(`Package 007 exhibition missing ${token}`);
const uniformLab = fs.readFileSync("lab/uniform-encounter-map/index.html", "utf8");
for (const token of ["NOTHING IS STORED", "aria-live", "buildUniform", "clearUniform", "verifies no authority"])
  if (!uniformLab.toLowerCase().includes(token.toLowerCase())) throw Error(`Package 007 mapper missing ${token}`);
const uniformRights = fs.readFileSync("production/package-007-rights.csv", "utf8");
for (const token of ["U-M84440", "U-SI001", "Public Domain/CC0", "link only"])
  if (!uniformRights.includes(token)) throw Error(`Package 007 rights missing ${token}`);
for (const file of ["package-007-video-audio-script.md","package-007-beehiiv.md","package-007-verticals.md","package-007-carousels.md"]) {
  const words = fs.readFileSync(path.join("production", file), "utf8").trim().split(/\s+/).length;
  if (words < 200) throw Error(`Package 007 output too thin: ${file}`);
}
const scopedLedgers = [
  ["fashion-nostalgia", "nostalgiaClaims", "startsWith('N')"],
  ["fashion-week-nervous-system", "fashionWeekClaims", "startsWith('F')"],
  ["runway-soundtracks", "soundClaims", "startsWith('S')"],
  ["uniforms-and-social-perception", "uniformClaims", "startsWith('U')"],
];
for (const [slug, target, filter] of scopedLedgers) {
  const html = fs.readFileSync(`exhibitions/${slug}/index.html`, "utf8");
  if (!html.includes(`id="${target}"`) || !html.includes(filter))
    throw Error(`${slug} missing scoped evidence ledger`);
}
const fashionWeekPage = fs.readFileSync(
  "exhibitions/fashion-week-nervous-system/index.html",
  "utf8",
);
for (const token of [
  "/production-kits/aan-f-005/media/r74.jpg",
  "/media/p005-field-load-score.svg",
  "CC BY 2.0",
  "not a measurement of Fashion Week physiology",
])
  if (!fashionWeekPage.includes(token))
    throw Error(`Package 005 visual evidence missing ${token}`);
const routeImageBlock = app.match(/const routeImages = \{([\s\S]*?)\n\};/);
if (!routeImageBlock) throw Error("route-specific preview image map missing");
const exhibitionPreviewImages = [...routeImageBlock[1].matchAll(/"\/exhibitions\/[^\"]+\/": "([^"]+)"/g)].map((match) => match[1]);
if (exhibitionPreviewImages.length !== 7 || new Set(exhibitionPreviewImages).size !== 7)
  throw Error("every exhibition needs a unique route-specific preview image");
for (const slug of [
  "clothes-and-cognition",
  "outfit-as-armor",
  "fabric-sensory-world",
  "fashion-nostalgia",
  "fashion-week-nervous-system",
  "runway-soundtracks",
  "uniforms-and-social-perception",
]) {
  const html = fs.readFileSync(`exhibitions/${slug}/index.html`, "utf8");
  if (!html.includes('property="og:image"') || !html.includes('name="twitter:image"'))
    throw Error(`${slug} lacks static social preview metadata`);
}
for (const token of ["og:image", "twitter:image"])
  if (!app.includes(token)) throw Error(`${token} runtime metadata missing`);
const visualMatrix = fs.readFileSync(
  "production/route-slide-visual-assignment-matrix.csv",
  "utf8",
);
const matrixRows = visualMatrix.trim().split("\n").slice(1);
const slideRows = matrixRows.filter((row) => row.includes('"instagram carousel"'));
if (slideRows.length !== 112)
  throw Error(`visual matrix expected 112 carousel slides; found ${slideRows.length}`);
for (const id of ["001", "002", "003", "004", "005", "006", "007"])
  if (!matrixRows.some((row) => row.startsWith(`"AAN-F-${id}"`)))
    throw Error(`visual matrix missing AAN-F-${id}`);
const slideHashes = slideRows.map((row) => row.match(/"([a-f0-9]{64})"$/)?.[1]);
if (slideHashes.some((hash) => !hash) || new Set(slideHashes).size !== slideHashes.length)
  throw Error("carousel slide images must be present and byte-unique");
for (const file of fs.readdirSync("media").filter((name) => name.endsWith(".svg"))) {
  const svg = fs.readFileSync(path.join("media", file), "utf8");
  if (!svg.includes("<title") || !svg.includes("<desc"))
    throw Error(`${file} lacks accessible title/description`);
}
const routeMap = new Map([
  ["/", "index.html"],
  ["/exhibitions", "exhibitions/index.html"],
  ["/exhibitions/fabric-sensory-world", "exhibitions/fabric-sensory-world/index.html"],
  ["/exhibitions/fashion-nostalgia", "exhibitions/fashion-nostalgia/index.html"],
  ["/exhibitions/fashion-week-nervous-system", "exhibitions/fashion-week-nervous-system/index.html"],
  ["/exhibitions/outfit-as-armor", "exhibitions/outfit-as-armor/index.html"],
  ["/exhibitions/runway-soundtracks", "exhibitions/runway-soundtracks/index.html"],
  ["/exhibitions/uniforms-and-social-perception", "exhibitions/uniforms-and-social-perception/index.html"],
  [
    "/exhibitions/clothes-and-cognition",
    "exhibitions/clothes-and-cognition/index.html",
  ],
  ["/objects", "objects/index.html"],
  ["/evidence", "evidence/index.html"],
  ["/ask", "ask/index.html"],
  ["/lab", "lab/index.html"],
  ["/lab/armor", "lab/armor/index.html"],
  ["/lab/textile-sensory-map", "lab/textile-sensory-map/index.html"],
  ["/lab/memory-garment-map", "lab/memory-garment-map/index.html"],
  ["/lab/field-load-recovery", "lab/field-load-recovery/index.html"],
  ["/lab/runway-sound-map", "lab/runway-sound-map/index.html"],
  ["/lab/uniform-encounter-map", "lab/uniform-encounter-map/index.html"],
  ["/rights", "rights/index.html"],
  ["/method", "method/index.html"],
  ["/deliverables", "deliverables/index.html"],
  ["/deliverables/armor", "deliverables/armor/index.html"],
  ["/deliverables/fabric-sensory-world", "deliverables/fabric-sensory-world/index.html"],
  ["/deliverables/fashion-nostalgia", "deliverables/fashion-nostalgia/index.html"],
  ["/deliverables/fashion-week-nervous-system", "deliverables/fashion-week-nervous-system/index.html"],
  ["/deliverables/runway-soundtracks", "deliverables/runway-soundtracks/index.html"],
  ["/deliverables/uniforms-and-social-perception", "deliverables/uniforms-and-social-perception/index.html"],
  ["/media", "media/index.html"],
  ["/production-kits", "production-kits/index.html"],
  ["/production-kits/aan-f-001", "production-kits/aan-f-001/index.html"],
  ["/production-kits/aan-f-002", "production-kits/aan-f-002/index.html"],
  ["/production-kits/aan-f-003", "production-kits/aan-f-003/index.html"],
  ["/production-kits/aan-f-004", "production-kits/aan-f-004/index.html"],
  ["/production-kits/aan-f-005", "production-kits/aan-f-005/index.html"],
  ["/production-kits/aan-f-006", "production-kits/aan-f-006/index.html"],
  ["/production-kits/aan-f-007", "production-kits/aan-f-007/index.html"],
]);
if (routeMap.size !== 37) throw Error(`route smoke inventory expected 37 routes (homepage plus 36 destinations); found ${routeMap.size}`);

// Every generated destination must retain useful static metadata when it is
// not registered in app.js. Every local preview or media reference must exist.
for (const [route, file] of routeMap) {
  const html = fs.readFileSync(file, "utf8");
  if (!/<title>[^<]+<\/title>/i.test(html)) throw Error(`${route} lacks a static title`);
  for (const requirement of [
    ['description', /<meta[^>]+name=["']description["'][^>]+content=["'][^"']+["']/i],
    ['canonical', /<link[^>]+rel=["']canonical["'][^>]+href=["']https:\/\/ask-a-neuroscientist-fashion\.vercel\.app\//i],
    ['og:title', /<meta[^>]+property=["']og:title["'][^>]+content=["'][^"']+["']/i],
    ['og:description', /<meta[^>]+property=["']og:description["'][^>]+content=["'][^"']+["']/i],
    ['og:url', /<meta[^>]+property=["']og:url["'][^>]+content=["']https:\/\/ask-a-neuroscientist-fashion\.vercel\.app\//i],
    ['og:image', /<meta[^>]+property=["']og:image["'][^>]+content=["'][^"']+["']/i],
    ['og:image:alt', /<meta[^>]+property=["']og:image:alt["'][^>]+content=["'][^"']+["']/i],
    ['twitter:card', /<meta[^>]+name=["']twitter:card["'][^>]+content=["']summary_large_image["']/i],
    ['twitter:title', /<meta[^>]+name=["']twitter:title["'][^>]+content=["'][^"']+["']/i],
    ['twitter:description', /<meta[^>]+name=["']twitter:description["'][^>]+content=["'][^"']+["']/i],
    ['twitter:image', /<meta[^>]+name=["']twitter:image["'][^>]+content=["'][^"']+["']/i],
    ['twitter:image:alt', /<meta[^>]+name=["']twitter:image:alt["'][^>]+content=["'][^"']+["']/i],
  ]) if (!requirement[1].test(html)) throw Error(`${route} lacks static ${requirement[0]}`);
  for (const match of html.matchAll(/(?:src|href|content)=["'](\/[^"'#?]+\.(?:png|jpe?g|webp|gif|svg))["']/gi)) {
    const target = match[1].slice(1);
    if (!fs.existsSync(target) || !fs.statSync(target).size)
      throw Error(`${route} references missing local asset ${match[1]}`);
  }
}
for (const token of ["routeMetadata[routePath]", "staticDescription", "resolvedTitle", "staticPreview", 'routeImages["/"]'])
  if (!app.includes(token)) throw Error(`metadata fallback implementation missing ${token}`);
const server = http.createServer((req, res) => {
  const clean = (req.url || "/").replace(/\/$/, "") || "/";
  const file = routeMap.get(clean);
  if (!file) {
    res.writeHead(404, { "content-type": "text/html" });
    return res.end(fs.readFileSync("404.html"));
  }
  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(fs.readFileSync(file));
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
try {
  const origin = `http://127.0.0.1:${server.address().port}`;
  for (const route of routeMap.keys()) {
    const response = await fetch(origin + route);
    if (response.status !== 200)
      throw Error(`HTTP ${response.status} ${route}`);
    const html = await response.text();
    if (!html.includes("<main") || !html.includes("<h1"))
      throw Error(`DOM smoke failed ${route}`);
  }
  const missing = await fetch(origin + "/not-a-room");
  if (missing.status !== 404) throw Error("HTTP 404 route failed");
} finally {
  await new Promise((resolve) => server.close(resolve));
}
console.log(
  "PASS: routes, canonical accessions, rights fields, claim-manifest mapping, filter/reset behavior, honest production status, correction workflow and hostname rewrite",
);
