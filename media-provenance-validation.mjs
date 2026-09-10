import fs from 'node:fs';
import crypto from 'node:crypto';

const manifest=JSON.parse(fs.readFileSync('production/media-provenance-inventory.json','utf8'));
const excavation=JSON.parse(fs.readFileSync('production/media-excavation.json','utf8'));
const waveFour=excavation.candidates.filter(x=>x.wave===4);
if(waveFour.length!==9)throw Error('wave 4 must contain the nine recorded discoveries');
const covered=new Set(waveFour.flatMap(x=>x.packages));
for(const p of excavation.packages)if(!covered.has(p.id))throw Error(`${p.id}: missing wave-4 discovery record`);
for(const x of waveFour){
  for(const key of ['canonicalUrl','creator','institution','date','relevance','reason'])if(!x[key])throw Error(`${x.id}: incomplete wave-4 provenance`);
  if(!x.canonicalUrl.startsWith('https://'))throw Error(`${x.id}: exact HTTPS canonical required`);
  if(!x.destinations?.length)throw Error(`${x.id}: precise proposed placement required`);
  if(x.disposition.startsWith('installed-'))throw Error(`${x.id}: no wave-4 record cleared installation`);
}
const waveFive=excavation.candidates.filter(x=>x.wave===5);
if(waveFive.length!==4)throw Error('wave 5 must contain the four recorded discoveries');
if(!waveFive.some(x=>x.id==='R96'&&x.packages.includes('AAN-F-003')))throw Error('wave 5 must include direct painful/restricting clothing evidence');
if(!waveFive.some(x=>x.id==='R97'&&x.packages.includes('AAN-F-007')))throw Error('wave 5 must include the school-uniform policy boundary');
for(const x of waveFive){
  for(const key of ['canonicalUrl','creator','institution','date','relevance','reason','rightsStatus'])if(!x[key])throw Error(`${x.id}: incomplete wave-5 provenance`);
  if(!x.canonicalUrl.startsWith('https://'))throw Error(`${x.id}: exact HTTPS canonical required`);
  if(!x.destinations?.length)throw Error(`${x.id}: precise public-research placement required`);
  if(x.disposition!=='resource-room')throw Error(`${x.id}: wave-5 discovery must remain a resource-room record`);
  if(x.mediaUrl!==null)throw Error(`${x.id}: no wave-5 record cleared visual-media installation`);
}
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
