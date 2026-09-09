import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import os from "node:os";
import http from "node:http";
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
const evidenceHtml = fs.readFileSync("evidence/index.html", "utf8");
if (!evidenceHtml.includes('<link rel="canonical" href="https://ask-a-neuroscientist-fashion.vercel.app/evidence/">'))
  throw Error("evidence canonical missing");
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
