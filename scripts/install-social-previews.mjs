import fs from "node:fs";

const previews = {
  "clothes-and-cognition": "https://images.metmuseum.org/CRDImages/ci/original/DT200606.jpg",
  "outfit-as-armor": "https://images.metmuseum.org/CRDImages/aa/original/DP256970.jpg",
  "fabric-sensory-world": "https://images.metmuseum.org/CRDImages/ci/original/DT5639.jpg",
  "fashion-nostalgia": "https://images.metmuseum.org/CRDImages/ci/original/1980.409.1a-c.jpg",
  "fashion-week-nervous-system": "https://ask-a-neuroscientist-fashion.vercel.app/production-kits/aan-f-005/media/r74.jpg",
  "runway-soundtracks": "https://images.metmuseum.org/CRDImages/mi/original/215848.jpg",
  "uniforms-and-social-perception": "https://images.metmuseum.org/CRDImages/ci/original/1979.152.54a%E2%80%93cf_F.jpg",
};

for (const [slug, image] of Object.entries(previews)) {
  const file = `exhibitions/${slug}/index.html`;
  let html = fs.readFileSync(file, "utf8");
  html = html.replace(/<meta property="og:image"[^>]*>\n?/g, "").replace(/<meta name="twitter:image"[^>]*>\n?/g, "");
  const tags = `<meta property="og:image" content="${image}">\n<meta name="twitter:image" content="${image}">\n`;
  html = html.replace('<link rel="stylesheet"', tags + '<link rel="stylesheet"');
  fs.writeFileSync(file, html);
}
console.log("installed seven static route-specific social previews");
