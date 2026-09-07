import fs from"node:fs";
const d=JSON.parse(fs.readFileSync("production/media-excavation.json","utf8"));
if(d.packages.length!==7||d.surfaces.length<22)throw Error("coverage");
const ids=new Set(d.candidates.map(c=>c.id));if(ids.size!==d.candidates.length)throw Error("duplicate candidate id");
for(const p of d.packages){
 if(p.searchedSurfaceIds.length!==d.surfaces.length||new Set(p.searchedSurfaceIds).size!==d.surfaces.length||p.queryFamilies.length<5||p.candidateIds.length<7||!p.stopReason)throw Error(p.id+" base report");
 if(!p.secondWave||p.secondWave.newCandidateCount<6||p.secondWave.zeroQualifiedSurfaces.length<3||!p.secondWave.stopRule)throw Error(p.id+" second wave");
 if(p.secondWave.newCandidateIds.some(id=>!ids.has(id)))throw Error(p.id+" missing candidate");
}
for(const c of d.candidates)for(const k of["id","packages","title","creator","date","institution","canonicalUrl","type","rightsStatus","credit","caption","relevance","disposition","reason","accessed"])if(c[k]===undefined||c[k]===null)throw Error(c.id+" "+k);
const wave2=d.candidates.filter(c=>c.wave===2);
if(wave2.length<42)throw Error("second-wave volume");
const qualified=wave2.filter(c=>!["duplicate","rejected"].includes(c.disposition));
if(qualified.length<34)throw Error("second-wave qualification");
console.log("media excavation: 7/7 reports, "+d.surfaces.length+" surfaces, "+d.candidates.length+" candidates, "+wave2.length+" second-wave");
