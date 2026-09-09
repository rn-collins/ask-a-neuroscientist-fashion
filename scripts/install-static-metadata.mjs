import fs from "node:fs";
import path from "node:path";

const ORIGIN = "https://ask-a-neuroscientist-fashion.vercel.app";
const HOME_IMAGE = "https://images.metmuseum.org/CRDImages/ci/original/1979.152.54a%E2%80%93cf_F.jpg";
const descriptions = {
  "/ask/": "Questions for evidence specialists, fashion historians and lived-experience experts.",
  "/method/": "The experience, mechanism and evidence-limit standard behind the series.",
};
const routeTitles = {
  "/deliverables/": "Clothes and Cognition — Production Gallery",
  "/deliverables/armor/": "Outfit as Armor — Production Gallery",
  "/deliverables/fabric-sensory-world/": "The Sensory Textile Room — Production Gallery",
  "/deliverables/fashion-nostalgia/": "The Memory Wardrobe — Production Gallery",
  "/deliverables/fashion-week-nervous-system/": "The Fashion Week Nervous System — Production Gallery",
  "/deliverables/runway-soundtracks/": "The Listening Room — Production Gallery",
  "/deliverables/uniforms-and-social-perception/": "The Role Room — Production Gallery",
};
const exhibitionImages = {
  "/exhibitions/clothes-and-cognition/": "https://images.metmuseum.org/CRDImages/ci/original/DT200606.jpg",
  "/exhibitions/outfit-as-armor/": "https://images.metmuseum.org/CRDImages/aa/original/DP256970.jpg",
  "/exhibitions/fabric-sensory-world/": "https://images.metmuseum.org/CRDImages/ci/original/DT5639.jpg",
  "/exhibitions/fashion-nostalgia/": "https://images.metmuseum.org/CRDImages/ci/original/1980.409.1a-c.jpg",
  "/exhibitions/fashion-week-nervous-system/": `${ORIGIN}/production-kits/aan-f-005/media/r74.jpg`,
  "/exhibitions/runway-soundtracks/": "https://images.metmuseum.org/CRDImages/mi/original/215848.jpg",
  "/exhibitions/uniforms-and-social-perception/": HOME_IMAGE,
};
const packagePreviews = {
  "/deliverables/": {image:`${ORIGIN}/production-kits/aan-f-001/exports/youtube/thumbnail-2.png`,alt:"Editorial evidence-boundary preview for the seven-package Ask a Neuroscientist × Fashion production gallery."},
  "/deliverables/armor/": {image:`${ORIGIN}/production-kits/aan-f-002/exports/youtube/thumbnail-1.png`,alt:"Historical armor from The Met behind the title Outfit as Armor."},
  "/deliverables/fabric-sensory-world/": {image:`${ORIGIN}/production-kits/aan-f-003/exports/youtube/thumbnail-1.png`,alt:"Nineteenth-century dress from The Met behind the title The Sensory Textile Room."},
  "/deliverables/fashion-nostalgia/": {image:`${ORIGIN}/production-kits/aan-f-004/exports/youtube/thumbnail-1.png`,alt:"Public-domain illustrated fashions behind the title The Memory Wardrobe."},
  "/deliverables/fashion-week-nervous-system/": {image:`${ORIGIN}/production-kits/aan-f-005/exports/youtube/thumbnail-1.png`,alt:"Runway presentation photographed by Jenny Mealing behind the title The Fashion Week Nervous System."},
  "/deliverables/runway-soundtracks/": {image:`${ORIGIN}/production-kits/aan-f-006/exports/youtube/thumbnail-1.png`,alt:"Historical tuning apparatus from The Met behind the title The Listening Room."},
  "/deliverables/uniforms-and-social-perception/": {image:`${ORIGIN}/production-kits/aan-f-007/exports/youtube/thumbnail-1.png`,alt:"Nineteenth-century uniform from The Met behind the title The Role Room."},
};
for(const [n,slug] of [["001","clothes-and-cognition"],["002","outfit-as-armor"],["003","fabric-sensory-world"],["004","fashion-nostalgia"],["005","fashion-week-nervous-system"],["006","runway-soundtracks"],["007","uniforms-and-social-perception"]]){
  packagePreviews[`/production-kits/aan-f-${n}/`]={image:`${ORIGIN}/production-kits/aan-f-${n}/exports/youtube/thumbnail-1.png`,alt:`Topic-specific publication preview for ${slug.replaceAll('-',' ')}.`};
}

const directories = ["exhibitions", "objects", "evidence", "ask", "lab", "rights", "method", "deliverables", "media", "production-kits"];
const files = ["index.html"];
for (const directory of directories) {
  const queue = [directory];
  while (queue.length) {
    const current = queue.shift();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const target = path.join(current, entry.name);
      if (entry.isDirectory()) queue.push(target);
      else if (entry.name === "index.html") files.push(target);
    }
  }
}

const routeFor = (file) => file === "index.html" ? "/" : `/${file.replace(/\/index\.html$/, "")}/`;
const escapeAttribute = (value) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
const readContent = (html, selector) => html.match(selector)?.[1]?.trim();
const remove = (html, pattern) => html.replace(pattern, "");

for (const file of files) {
  let html = fs.readFileSync(file, "utf8");
  const route = routeFor(file);
  const sourceTitle = readContent(html, /<title>([^<]+)<\/title>/i);
  const title = routeTitles[route] || sourceTitle;
  const existingDescription = readContent(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i);
  const description = existingDescription || descriptions[route];
  if (!title || !description) throw new Error(`Missing title or description for ${route}`);
  if (routeTitles[route]) html = html.replace(/<title>[^<]+<\/title>/i, `<title>${escapeAttribute(title)}</title>`);
  const existingImage = readContent(html, /<meta[^>]+(?:property=["']og:image["']|name=["']twitter:image["'])[^>]+content=["']([^"']+)["'][^>]*>/i);
  const preview = packagePreviews[route];
  const image = preview?.image || exhibitionImages[route] || existingImage || HOME_IMAGE;
  const canonical = `${ORIGIN}${route}`;
  const imageAlt = preview?.alt || `Editorial preview for ${title}`;

  for (const pattern of [
    /<meta[^>]+name=["']description["'][^>]*>/gi,
    /<link[^>]+rel=["']canonical["'][^>]*>/gi,
    /<meta[^>]+property=["']og:(?:title|description|type|url|image|image:alt)["'][^>]*>/gi,
    /<meta[^>]+name=["']twitter:(?:card|title|description|image|image:alt)["'][^>]*>/gi,
  ]) html = remove(html, pattern);

  const metadata = [
    `<meta name="description" content="${escapeAttribute(description)}">`,
    `<link rel="canonical" href="${canonical}">`,
    `<meta property="og:title" content="${escapeAttribute(title)}">`,
    `<meta property="og:description" content="${escapeAttribute(description)}">`,
    '<meta property="og:type" content="website">',
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:image" content="${escapeAttribute(image)}">`,
    `<meta property="og:image:alt" content="${escapeAttribute(imageAlt)}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${escapeAttribute(title)}">`,
    `<meta name="twitter:description" content="${escapeAttribute(description)}">`,
    `<meta name="twitter:image" content="${escapeAttribute(image)}">`,
    `<meta name="twitter:image:alt" content="${escapeAttribute(imageAlt)}">`,
  ].join("");
  html = html.replace("</title>", `</title>${metadata}`);
  fs.writeFileSync(file, html);
}

console.log(`installed deterministic static metadata in ${files.length} routes`);
