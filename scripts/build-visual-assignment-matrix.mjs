import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const packages = [
  ["001", "clothes-and-cognition"],
  ["002", "outfit-as-armor"],
  ["003", "fabric-sensory-world"],
  ["004", "fashion-nostalgia"],
  ["005", "fashion-week-nervous-system"],
  ["006", "runway-soundtracks"],
  ["007", "uniforms-and-social-perception"],
];
const strip = (value) => value.replace(/<[^>]+>/g, " ").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim();
const quote = (value) => `"${String(value).replaceAll('"', '""')}"`;
const rows = [["package", "surface", "unit", "visual_mode", "asset", "rights_basis", "editorial_judgment", "sha256"]];

for (const [id, slug] of packages) {
  const file = `exhibitions/${slug}/index.html`;
  const html = fs.readFileSync(file, "utf8");
  const sections = [...html.matchAll(/<(header|section|figure)\b[^>]*>([\s\S]*?)<\/\1>/gi)];
  for (const [index, match] of sections.entries()) {
    const body = match[2];
    const title = strip((body.match(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/i) || [])[1] || `${match[1]} ${index + 1}`);
    const image = (body.match(/<img[^>]+src="([^"]+)"/i) || [])[1];
    const video = (body.match(/<iframe[^>]+src="([^"]+)"/i) || [])[1];
    const asset = image || video || "editorial typography + evidence structure";
    const mode = image ? "real image / evidence graphic" : video ? "authorized embed" : "editorial typography / evidence graphic";
    const rights = image?.startsWith("/media/p005") ? "RN original evidence graphic" : image?.includes("r74.jpg") ? "CC BY 2.0; Jenny Mealing / Wikimedia Commons" : image?.startsWith("https://images.metmuseum.org") ? "Met Open Access / CC0" : video ? "official YouTube privacy-enhanced embed; no derivative" : "RN original typography and evidence design";
    rows.push([`AAN-F-${id}`, `/${file.replace(/index\.html$/, "")}`, title, mode, asset, rights, image || video ? "Use the documentary object at point of relevance; caption its evidentiary limit." : "No decorative substitute: typography or evidence structure communicates this abstract claim more precisely.", ""]);
  }

  const exportRoot = `production-kits/aan-f-${id}/exports/instagram`;
  for (const name of fs.readdirSync(exportRoot).filter((name) => /^(?:carousel-a|carousel-b)-frame-\d{2}\.png$/.test(name)).sort()) {
    const asset = path.join(exportRoot, name);
    const bytes = fs.readFileSync(asset);
    rows.push([`AAN-F-${id}`, "instagram carousel", name, "finished rendered slide", `/${asset}`, "RN publication asset; underlying third-party material governed by package rights ledger", "Image-first composition where a qualified documentary object exists; otherwise evidence-led editorial typography. No synthetic imagery.", crypto.createHash("sha256").update(bytes).digest("hex")]);
  }
}

fs.writeFileSync("production/route-slide-visual-assignment-matrix.csv", rows.map((row) => row.map(quote).join(",")).join("\n") + "\n");
console.log(`visual assignment matrix: ${rows.length - 1} route/section/slide records`);
