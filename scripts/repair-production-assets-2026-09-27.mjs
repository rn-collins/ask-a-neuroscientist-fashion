import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const GOOD = "9991ad11d6fff3df81aa15f95982c78e691cb05d";
const readGood = (file) => execFileSync("git", ["show", `${GOOD}:${file}`], { encoding: "utf8" });
fs.writeFileSync("tests.mjs", readGood("tests.mjs"));
fs.writeFileSync("production/visual-replacements.json", readGood("production/visual-replacements.json"));

const preserve = (from, to) => {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(path.dirname(to), { recursive: true });
  if (!fs.existsSync(to)) fs.renameSync(from, to);
  else fs.rmSync(from);
};
for (const [from, to] of [
  ["production-kits/aan-f-005/media/f-loc-audience.jpg", "research/unverified-media/aan-f-005/f-loc-audience.jpg"],
  ["production-kits/aan-f-005/media/f-loc-models.jpg", "research/unverified-media/aan-f-005/f-loc-models.jpg"],
  ["production-kits/aan-f-007/media/u-loc-branches.jpg", "research/unverified-media/aan-f-007/u-loc-branches.jpg"],
  ["production-kits/aan-f-007/media/u-loc-capitol.jpg", "research/unverified-media/aan-f-007/u-loc-capitol.jpg"],
  ["production-kits/aan-f-007/media/u-loc-safety.jpg", "research/unverified-media/aan-f-007/u-loc-safety.jpg"],
  ["production-kits/aan-f-007/media/u-loc-treasury.jpg", "research/unverified-media/aan-f-007/u-loc-treasury.jpg"],
  ["production-kits/aan-f-005/media/r74.jpg", "research/retired-media/aan-f-005/r74.jpg"],
  ["production-kits/aan-f-006/media/met-505646.jpg", "research/retired-media/aan-f-006/met-505646.jpg"],
  ["production-kits/aan-f-006/media/r79.jpg", "research/retired-media/aan-f-006/r79.jpg"],
]) preserve(from, to);

fs.mkdirSync("research/unverified-media", { recursive: true });
fs.writeFileSync("research/unverified-media/README.md", "# Unverified media quarantine\n\nThese files are preserved, not deleted. They are excluded from publication packages until exact creator, source, license, credit, crop, modification permission, and visual relevance are verified.\n");
fs.mkdirSync("research/retired-media", { recursive: true });
fs.writeFileSync("research/retired-media/README.md", "# Retired production media\n\nThese files were removed from active platform assignments by the audited visual-replacement configuration. They are preserved here instead of being deleted so their prior use and provenance remain recoverable. They must not return to a publication package without a new quality, rights, and relevance review.\n");

const images = {
  "f-runway-pexels.jpg": "https://upload.wikimedia.org/wikipedia/commons/4/46/Runway_show_pexels.jpg",
  "f-runway-dfw.jpg": "https://upload.wikimedia.org/wikipedia/commons/0/05/Models_walks_the_runway_modeling_fashions_by_designer_Shimul_Khaled_at_DFW_2012.jpg",
  "f-backstage-gigi.jpg": "https://upload.wikimedia.org/wikipedia/commons/4/4d/Gigi_Hadid_Backstage_at_Prada_FW19.jpg",
  "f-backstage-liu.jpg": "https://upload.wikimedia.org/wikipedia/commons/b/b0/Liu_Wen_backstage_at_Prada%2C_February_2019.jpg",
  "f-1961-show.jpg": "https://upload.wikimedia.org/wikipedia/commons/9/9c/Illusion_des_Fleurs_modeshow_Bovenkarspel_Modellen_tussen_bloemen_en_koeien%2C_Bestanddeelnr_913-5453.jpg",
  "f-bridal-23.jpg": "https://upload.wikimedia.org/wikipedia/commons/0/06/00783jfRefined_Bridal_Exhibit_Fashion_Show_Robinsons_Place_Malolosfvf_23.jpg",
  "f-bridal-06.jpg": "https://upload.wikimedia.org/wikipedia/commons/6/6b/01123jfRefined_Bridal_Exhibit_Fashion_Show_Robinsons_Place_Malolosfvf_06.jpg",
  "f-bridal-09.jpg": "https://upload.wikimedia.org/wikipedia/commons/b/b6/01123jfRefined_Bridal_Exhibit_Fashion_Show_Robinsons_Place_Malolosfvf_09.jpg",
};
fs.mkdirSync("production-kits/aan-f-005/media", { recursive: true });
for (const [name, url] of Object.entries(images)) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 100_000) throw new Error(`${name}: incomplete download (${bytes.length} bytes)`);
  fs.writeFileSync(path.join("production-kits/aan-f-005/media", name), bytes);
}

const config = JSON.parse(fs.readFileSync("production/visual-replacements.json", "utf8"));
const item = config.packages.find((entry) => entry.packageId === "AAN-F-005" || entry.id === "AAN-F-005");
if (!item) throw new Error("AAN-F-005 configuration missing");
item.activate = ["F-RUNWAY-PEXELS","F-RUNWAY-DFW","F-BACKSTAGE-GIGI","F-BACKSTAGE-LIU","F-1961-SHOW","F-BRIDAL-23","F-BRIDAL-06","F-BRIDAL-09"];
item.disableAssignments = false;
item.carouselA = ["F-BRIDAL-09","F-RUNWAY-PEXELS","F-RUNWAY-DFW","F-BACKSTAGE-GIGI","F-BACKSTAGE-LIU","F-1961-SHOW","F-BRIDAL-23",null,"F-BRIDAL-06"];
fs.writeFileSync("production/visual-replacements.json", JSON.stringify(config, null, 2) + "\n");

let tests = fs.readFileSync("tests.mjs", "utf8");
tests = tests
  .replace("/production-kits/aan-f-005/media/met-151912.jpg", "/production-kits/aan-f-005/media/f-runway-pexels.jpg")
  .replace("Metropolitan Museum of Art Open Access", "Ahmad Ardity")
  .replace("not a measurement of Fashion Week physiology", "does not measure exposure or physiology")
  .replace('visualModeCounts["cleared-real-image"] !== 69', 'visualModeCounts["cleared-real-image"] !== 82')
  .replace('visualModeCounts["evidence-graphic"] !== 34', 'visualModeCounts["evidence-graphic"] !== 21');
fs.writeFileSync("tests.mjs", tests);
