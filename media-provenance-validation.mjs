import fs from 'node:fs';
import crypto from 'node:crypto';

const manifest=JSON.parse(fs.readFileSync('production/media-provenance-inventory.json','utf8'));
if(manifest.records.length!==manifest.counts.files)throw Error('provenance count mismatch');
if(manifest.counts.videoFiles||manifest.counts.audioFiles)throw Error('unexpected locally copied audio/video');
const seen=new Set();
for(const x of manifest.records){
  for(const key of ['file','sha256','assetClass','sourceAssetId','title','creator','institution','canonicalUrl','rightsStatus','credit','alt','relevance','nonAiBasis','transformation'])if(!x[key])throw Error(`${x.file}: missing ${key}`);
  if(seen.has(x.file))throw Error(`${x.file}: duplicate manifest record`);seen.add(x.file);
  const local=x.file.slice(1);if(!fs.existsSync(local))throw Error(`${x.file}: absent`);
  const digest=crypto.createHash('sha256').update(fs.readFileSync(local)).digest('hex');if(digest!==x.sha256)throw Error(`${x.file}: hash drift`);
  if(/rejected|duplicate|permission required|fair-use candidate/i.test(x.rightsStatus))throw Error(`${x.file}: disallowed rights state`);
  if(x.assetClass==='documentary-source-image'&&!/^https:\/\//.test(x.canonicalUrl))throw Error(`${x.file}: documentary image lacks public canonical record`);
  if(x.assetClass.startsWith('deterministic-')&&!/Deterministically rendered/.test(x.nonAiBasis))throw Error(`${x.file}: derived graphic lacks deterministic provenance`);
  if(x.assetClass==='original-evidence-graphic'&&!/not documentary photography/i.test(x.transformation))throw Error(`${x.file}: original graphic is not honestly distinguished`);
}
const svg=fs.readFileSync('media/p005-field-load-score.svg','utf8');if(/<image\b|data:image/i.test(svg))throw Error('field-load SVG embeds unprovenanced raster imagery');
for(const dir of fs.readdirSync('production-kits').filter(x=>/^aan-f-\d+$/.test(x))){
  const exports=JSON.parse(fs.readFileSync(`production-kits/${dir}/exports.json`,'utf8'));
  for(const x of exports.records)if(/rejected|duplicate|permission required|fair-use candidate/i.test(x.rights))throw Error(`${x.file}: disallowed rendered source`);
}
console.log(`Media provenance gate: ${seen.size} installed files accounted for; no disallowed source disposition or unlabeled original graphic.`);
