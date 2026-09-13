import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';

const root=process.cwd();
const excavation=JSON.parse(fs.readFileSync('production/media-excavation.json','utf8'));
const candidates=new Map(excavation.candidates.map(x=>[x.id,x]));
const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync('data.js','utf8'),context);
const objects=new Map(context.window.AAN.objects.map(x=>[String(x.id),x]));
const mediaExt=/\.(?:jpe?g|png|webp|gif|svg|mp4|webm|mp3|wav)$/i;
const files=[];
function walk(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){if(ent.name.includes('.partial-'))continue;const p=path.join(dir,ent.name);if(ent.isDirectory())walk(p);else if(mediaExt.test(ent.name))files.push(p)}}
walk('media');walk('production-kits');
const exportRecords=new Map();
const platformAssets=new Map();
const platformManifest=JSON.parse(fs.readFileSync('production/platform-asset-kits.json','utf8'));
for(const pkg of platformManifest.packages)for(const asset of pkg.assets){
  const filename=`${asset.id.replace(/[^a-z0-9-]/gi,'-').toLowerCase()}.jpg`;
  platformAssets.set(`${pkg.id.toLowerCase()}/${filename}`,asset);
}
for(const dir of fs.readdirSync('production-kits').filter(x=>/^aan-f-\d+$/.test(x))){
  const file=`production-kits/${dir}/exports.json`;
  if(!fs.existsSync(file))continue;
  for(const record of JSON.parse(fs.readFileSync(file,'utf8')).records)exportRecords.set(record.file.replace(/^\//,''),{...record,packageId:dir.toUpperCase()});
}
const allowedRights=/^(?:CC0|CC BY|Public domain \/ CC0|Original publication asset)$/i;
const out=[];
for(const file of files.sort()){
  const bytes=fs.readFileSync(file),sha256=crypto.createHash('sha256').update(bytes).digest('hex');
  const base={file:`/${file}`,sha256,bytes:bytes.length};
  const met=file.match(/\/media\/met-(\d+)\.jpg$/);
  const platformMedia=file.match(/^production-kits\/(aan-f-\d+)\/media\/([^/]+)$/i);
  const cand=file.match(/\/media\/(r\d+)\.jpg$/i);
  if(met){
    const o=objects.get(met[1]);if(!o)throw Error(`${file}: missing Met object record`);
    out.push({...base,assetClass:'documentary-source-image',sourceAssetId:`MET-${o.id}`,title:o.title,creator:o.maker,date:o.date,institution:o.institution,canonicalUrl:o.record,mediaUrl:o.image,rightsStatus:o.license,licenseUrl:'https://www.metmuseum.org/about-the-met/policies-and-documents/open-access',credit:`${o.title}, ${o.maker}, ${o.date}. ${o.institution}. ${o.accession}. CC0.`,alt:o.alt,relevance:o.role,nonAiBasis:'The canonical Met collection record identifies a catalogued historical object and marks its image Public Domain/Open Access; the local file is a source download, not a generated image.',transformation:'Unmodified source download; display crops occur in CSS or deterministic platform rendering.'});
  }else if(cand){
    const c=candidates.get(cand[1].toUpperCase());if(!c)throw Error(`${file}: missing excavation candidate`);
    if(!['installed-media'].includes(c.disposition)||!allowedRights.test(c.rightsStatus))throw Error(`${file}: candidate is not cleared installed media`);
    out.push({...base,assetClass:'documentary-source-image',sourceAssetId:c.id,title:c.title,creator:c.creator,date:c.date,institution:c.institution,canonicalUrl:c.canonicalUrl,mediaUrl:c.mediaUrl,rightsStatus:c.rightsStatus,licenseUrl:c.licenseUrl,credit:c.credit,alt:c.alt,relevance:c.relevance,nonAiBasis:'The exact Wikimedia work page identifies the creator/date and license for a documentary or historical image uploaded before the current generative-image era; the local file is a source download from that work-level media endpoint.',transformation:'Unmodified source download; display crops occur in CSS or deterministic platform rendering.'});
  }else if(platformMedia&&platformAssets.has(`${platformMedia[1].toLowerCase()}/${platformMedia[2].toLowerCase()}`)){
    const asset=platformAssets.get(`${platformMedia[1].toLowerCase()}/${platformMedia[2].toLowerCase()}`);
    out.push({...base,assetClass:'documentary-source-image',sourceAssetId:asset.id,title:asset.title,creator:asset.creator,date:asset.date,institution:asset.institution,canonicalUrl:asset.canonicalUrl,mediaUrl:asset.mediaUrl,rightsStatus:asset.rights,licenseUrl:asset.licenseUrl,credit:asset.credit,alt:asset.alt,relevance:asset.caption,nonAiBasis:'The canonical institutional collection record identifies a catalogued historical object and its reusable rights status; the local file is a source download, not a generated image.',transformation:'Source download reduced only when needed for efficient delivery; display crops occur in deterministic platform rendering.'});
  }else if(file==='media/p005-field-load-score.svg'){
    out.push({...base,assetClass:'original-evidence-graphic',sourceAssetId:'AAN-P005-FIELD-LOAD',title:'Field Load Score explainer',creator:'Rayven-Nikkita Collins',date:'2026-09-08',institution:'Ask a Neuroscientist × Fashion',canonicalUrl:'https://ask-a-neuroscientist-fashion.vercel.app/exhibitions/fashion-week-nervous-system/',mediaUrl:'/media/p005-field-load-score.svg',rightsStatus:'Original publication asset',licenseUrl:null,credit:'Original evidence graphic · Rayven-Nikkita Collins',alt:'A transparent four-part evidence graphic separating sleep pressure, sensory load, social evaluation and physical demand.',relevance:'Explains the package’s four-part field-load model without pretending a photograph can visualize an unmeasured nervous-system state.',nonAiBasis:'Hand-authored repository SVG made from text and geometric primitives; its inspectable XML contains no embedded raster image or generative-model artifact.',transformation:'Original vector evidence design; not documentary photography.'});
  }else{
    const x=exportRecords.get(file);if(!x)throw Error(`${file}: no export provenance record`);
    if(/rejected|duplicate|permission required/i.test(x.rights))throw Error(`${file}: rendered from disallowed source (${x.rights})`);
    out.push({...base,assetClass:x.visualMode==='cleared-real-image'?'deterministic-editorial-composite-with-cleared-image':'deterministic-editorial-graphic',sourceAssetId:x.assetId||`${x.packageId}-STORYBOARD`,title:`${x.kind} ${x.index??''}`.trim(),creator:'Rayven-Nikkita Collins',date:'2026-09-08',institution:'Ask a Neuroscientist × Fashion',canonicalUrl:x.source,mediaUrl:x.file,rightsStatus:x.visualMode==='cleared-real-image'?x.rights:'Original publication asset; cited source text/data not reproduced as third-party media',licenseUrl:null,credit:x.credit,alt:x.alt,relevance:x.visualRationale||'Production storyboard assembling the seven package-specific short-video beats into one editable visual plan.',nonAiBasis:'Deterministically rendered by scripts/render-platform-assets.mjs from repository text, geometry and the explicitly listed cleared source image when applicable; no generative image model, prompt or synthetic raster source is used.',transformation:x.visualMode==='cleared-real-image'?'Editorial crop, typography and layout applied to the cleared source image.':'Original evidence/typographic composition; the cited source supports the statement and its protected media is not reproduced.'});
  }
}
const report={schemaVersion:'2.0',generated:'2026-09-09',policy:'Every installed media file must be either an exact rights-cleared public source asset or a deterministic original editorial/evidence composition with its evidentiary source identified. AI-generated and synthetic documentary imagery are prohibited.',limits:'Non-AI status is established from institutional provenance, historical dates, work-level records and inspectable deterministic repository rendering—not from unreliable visual AI detectors.',counts:{files:out.length,sourceImages:out.filter(x=>x.assetClass==='documentary-source-image').length,derivedGraphics:out.filter(x=>x.assetClass.startsWith('deterministic-')).length,originalVectors:out.filter(x=>x.assetClass==='original-evidence-graphic').length,videoFiles:out.filter(x=>/\.(mp4|webm)$/.test(x.file)).length,audioFiles:out.filter(x=>/\.(mp3|wav)$/.test(x.file)).length},records:out};
fs.writeFileSync('production/media-provenance-inventory.json',JSON.stringify(report,null,2)+'\n');
console.log(`Media provenance inventory: ${out.length}/${files.length} files; ${report.counts.sourceImages} source images, ${report.counts.derivedGraphics} rendered graphics, ${report.counts.originalVectors} original vector.`);
