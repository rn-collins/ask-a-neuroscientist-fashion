import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const written = {
  "001": ["video-script.md","audio-rundown.md","beehiiv-edition.md","vertical-scripts.md","carousel-copy.md","social-cuts.csv","source-manifest.json","rights-ledger.csv"],
  "002": ["package-002-video-script.md","package-002-beehiiv.md","package-002-verticals.md","package-002-carousels.md","package-002-social.csv","package-002-field-notes.md","package-002-sources.json","package-002-rights.csv"],
};
const companionPosts = JSON.parse(
  fs.readFileSync("production/companion-posts.json", "utf8"),
);
for (const id of ["003","004","005","006","007"]) written[id]=[
  `package-${id}-video-audio-script.md`, `package-${id}-beehiiv.md`, `package-${id}-verticals.md`,
  `package-${id}-carousels.md`, `package-${id}-social.csv`, `package-${id}-sources.json`, `package-${id}-rights.csv`
];

for (const id of Object.keys(written)) {
  const slug=`aan-f-${id}`, root=`production-kits/${slug}`, stage=fs.mkdtempSync(path.join(os.tmpdir(),`${slug}-`));
  const kit=path.join(stage,slug); fs.mkdirSync(path.join(kit,"editable"),{recursive:true});
  fs.cpSync(path.join(root,"exports"),path.join(kit,"rendered"),{recursive:true});
  if(fs.existsSync(path.join(root,"media"))) fs.cpSync(path.join(root,"media"),path.join(kit,"rights-cleared-media"),{recursive:true});
  for(const name of ["platform-asset-kit.md","platform-asset-kit.json","exports.json"]) fs.copyFileSync(path.join(root,name),path.join(kit,"editable",name));
  for(const name of written[id]) fs.copyFileSync(path.join("production",name),path.join(kit,"editable",name));
  const companionPackage = companionPosts.packages.find((item) => item.id === `AAN-F-${id}`);
  if (!companionPackage || companionPackage.carousels.length !== 2)
    throw new Error(`Missing two companion posts for AAN-F-${id}`);
  const companionMarkdown = `# ${companionPackage.title} — companion posts\n\n${companionPackage.carousels
    .map((post, index) => `## Carousel ${String.fromCharCode(65 + index)} — ${post.label}\n\n${[
      post.hook,
      post.context,
      post.story,
      post.seriesRelevance,
      post.ending,
      post.cta,
    ].join("\n\n")}`)
    .join("\n\n---\n\n")}\n`;
  fs.writeFileSync(path.join(kit,"editable","companion-posts.md"),companionMarkdown);
  const out=path.resolve(root,`${slug}-complete-publication-kit.zip`); fs.rmSync(out,{force:true});
  execFileSync("zip",["-q","-r",out,slug],{cwd:stage}); fs.rmSync(stage,{recursive:true,force:true});
  console.log(`${slug}: ${path.relative(process.cwd(),out)}`);
}
