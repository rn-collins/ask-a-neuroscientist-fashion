import fs from"node:fs";
import sharp from "/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.cjs";
const d=JSON.parse(fs.readFileSync("production/media-excavation.json","utf8"));
if(d.packages.length!==7||d.surfaces.length<22)throw Error("coverage");
const ids=new Set(d.candidates.map(c=>c.id));if(ids.size!==d.candidates.length)throw Error("duplicate candidate id");
for(const p of d.packages){
 if(p.searchedSurfaceIds.length!==d.surfaces.length||new Set(p.searchedSurfaceIds).size!==d.surfaces.length||p.queryFamilies.length<5||p.candidateIds.length<7||!p.stopReason)throw Error(p.id+" base report");
 if(!p.secondWave||p.secondWave.newCandidateCount<6||p.secondWave.zeroQualifiedSurfaces.length<3||!p.secondWave.stopRule)throw Error(p.id+" second wave");
 if(!p.thirdWave||!p.thirdWave.directTraversal||p.thirdWave.newCandidateCount<4||p.thirdWave.concreteBlockers.length<3||!p.thirdWave.stopRule)throw Error(p.id+" third wave");
 if(p.secondWave.newCandidateIds.some(id=>!ids.has(id)))throw Error(p.id+" missing candidate");
}
for(const c of d.candidates)for(const k of["id","packages","title","creator","date","institution","canonicalUrl","type","rightsStatus","credit","caption","relevance","disposition","reason","accessed"])if(c[k]===undefined||c[k]===null)throw Error(c.id+" "+k);
for(const c of d.candidates){
 if(!Array.isArray(c.destinations)||!c.destinations.length)throw Error(c.id+" has no destination or exclusion");
 if(["duplicate","rejected"].includes(c.disposition)&&!c.exclusionReason)throw Error(c.id+" missing exclusion reason");
}
const wave2=d.candidates.filter(c=>c.wave===2);
if(wave2.length<42)throw Error("second-wave volume");
const qualified=wave2.filter(c=>!["duplicate","rejected"].includes(c.disposition));
if(qualified.length<34)throw Error("second-wave qualification");
const wave3=d.candidates.filter(c=>c.wave===3);if(wave3.length<28)throw Error("third-wave volume");if(wave3.filter(c=>["installed-media","installed-tool"].includes(c.disposition)).length<8)throw Error("third-wave installs");
const kits=JSON.parse(fs.readFileSync("production/platform-asset-kits.json","utf8"));
if(kits.packages.length!==7)throw Error("asset kit package coverage");
const known=new Set([...d.candidates.map(c=>c.id)]);
const source=fs.readFileSync("data.js","utf8");for(const id of [...source.matchAll(/\{id:(\d+),title:/g)].map(x=>"MET-"+x[1]))known.add(id);
const sequences=new Set();
for(const k of kits.packages){
 if(k.carouselA.length!==8||k.carouselB.length!==8||k.broll.length!==7||k.pinterest.length!==5||k.youtube.length!==8)throw Error(k.id+" incomplete platform outputs");
 for(const row of [...k.carouselA,...k.carouselB,...k.broll,...k.pinterest,...k.youtube,...k.inline.beehiiv,...k.inline.linkedin])if(!known.has(row.assetId)||!row.credit)throw Error(k.id+" missing asset/credit "+row.assetId);
 const signature=k.carouselA.map(x=>x.assetId).join(",")+"|"+k.carouselB.map(x=>x.assetId).join(",");if(sequences.has(signature))throw Error(k.id+" duplicate carousel sequence");sequences.add(signature);
 for(const f of [`production-kits/${k.id.toLowerCase()}/index.html`,`production-kits/${k.id.toLowerCase()}/platform-asset-kit.md`,`production-kits/${k.id.toLowerCase()}/platform-asset-kit.json`])if(!fs.existsSync(f))throw Error("missing "+f);
 const exports=JSON.parse(fs.readFileSync(`production-kits/${k.id.toLowerCase()}/exports.json`,`utf8`));
 if(exports.records.filter(x=>x.kind.startsWith("instagram")).length!==16||exports.records.filter(x=>x.kind==="pinterest").length!==5||exports.records.filter(x=>x.kind==="youtube-thumbnail").length!==2||exports.records.filter(x=>x.kind==="vertical-storyboard").length!==1)throw Error(k.id+" export counts");
 for(const x of exports.records){const file=x.file.slice(1);if(!fs.existsSync(file)||!x.alt||!x.credit)throw Error(k.id+" missing rendered export metadata");const m=await sharp(file).metadata();const expected=x.kind.startsWith("instagram")?[1080,1350]:x.kind==="pinterest"?[1000,1500]:x.kind==="youtube-thumbnail"?[1280,720]:[1080,1920];if(m.width!==expected[0]||m.height!==expected[1]||m.format!=="png")throw Error(k.id+" invalid render "+file);}
 if(!fs.existsSync(`production-kits/${k.id.toLowerCase()}/exports.json`))throw Error(k.id+" missing accessible set manifest");
}
console.log("media excavation: 7/7 reports, "+d.surfaces.length+" surfaces, "+d.candidates.length+" candidates, "+wave2.length+" second-wave, "+wave3.length+" third-wave; 7 platform kits; rendered 112 carousel frames, 35 pins, 14 thumbnails and 7 storyboards");
