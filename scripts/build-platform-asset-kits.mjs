import fs from 'node:fs';
import vm from 'node:vm';

const excavation=JSON.parse(fs.readFileSync('production/media-excavation.json','utf8'));
const context={window:{}}; vm.createContext(context); vm.runInContext(fs.readFileSync('data.js','utf8'),context);
const objects=context.window.AAN.objects;

const specs=[
 {id:'AAN-F-001',slug:'clothes-and-cognition',title:'Clothes and Cognition',prefix:'C',tool:'/lab/',beats:['The viral promise','The original lab-coat experiment','The failed direct replication','What the meta-analysis can and cannot restore','Dress as social information','Material constraint and posture','A better question','Evidence boundary'],pins:['The claim','The replication','The evidence ladder','The object lesson','The practical question']},
 {id:'AAN-F-002',slug:'outfit-as-armor',deliverable:'armor',title:'Outfit as Armor',prefix:'A',tool:'/lab/armor/',beats:['Armor as lived language','Literal armor and bodily boundary','Pressure, heat and movement','The observer pathway','Ritual as a start cue','Authority and spectacle','When armor becomes a cage','Four pathways, no magic'],pins:['Four armor pathways','Body boundary','Observer response','Ritual cue','When protection costs']},
 {id:'AAN-F-003',slug:'fabric-sensory-world',title:'The Sensory Textile Room',prefix:'T',tool:'/lab/textile-sensory-map/',beats:['Skin does not read labels','Touch is several systems','Fiber becomes construction','Sensitivity changes ratings','Hours of wear are not a hand test','Autistic accounts are not a fabric list','Map the encounter','Comfort is relational'],pins:['The textile encounter','Touch pathways','Construction matters','Sensory field map','No universal soft']},
 {id:'AAN-F-004',slug:'fashion-nostalgia',title:'The Memory Wardrobe',prefix:'N',tool:'/lab/memory-garment-map/',beats:['The garment as cue','Encoding and retrieval','Emotion selects and rehearses','Music opens another door','Odor and temporal distance','Memory is reconstruction','Collective versus autobiographical nostalgia','Document without certifying'],pins:['Memory garment','Cue versus recording','Emotion and confidence','Collective nostalgia','Field map']},
 {id:'AAN-F-005',slug:'fashion-week-nervous-system',title:'The Fashion Week Nervous System',prefix:'F',tool:'/lab/field-load-recovery/',beats:['One day, many loads','Sleep and sustained attention','Light and timing','Sound and arousal','Crowd density and stress','Evaluation and vigilance','Standing and fatigue','Recovery without diagnosis'],pins:['Fashion Week load','Attention','Crowds','Standing','Recovery map']},
 {id:'AAN-F-006',slug:'runway-soundtracks',title:'The Listening Room',prefix:'S',tool:'/lab/runway-sound-map/',beats:['The room is an acoustic scene','Pulse predicts time','Movement meets beat','Expectation and surprise','Memory enters through music','Loudness is not the whole dose','No universal soundtrack','Map one situated response'],pins:['Runway as sound scene','Beat and prediction','Expectation','Memory music','Listening map']},
 {id:'AAN-F-007',slug:'uniforms-and-social-perception',title:'The Role Room',prefix:'U',tool:'/lab/uniform-encounter-map/',beats:['A uniform is a social signal','Inference is not knowledge','Workwear and attribution','The police-style uniform experiment','Role clothing in the laboratory','Institutional identity','History changes the signal','Map cue, inference and evidence'],pins:['Uniform signal','Inference versus knowledge','Role experiment','Institutional history','Encounter map']}
];

function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function asset(c){return {id:c.id,type:c.type,title:c.title,creator:c.creator,date:c.date,institution:c.institution,rights:c.rightsStatus,disposition:c.disposition,canonicalUrl:c.canonicalUrl,mediaUrl:c.mediaUrl||null,licenseUrl:c.licenseUrl||null,credit:c.credit,alt:c.alt,caption:c.caption};}
function objectAsset(o){return {id:`MET-${o.id}`,type:'image',title:o.title,creator:o.maker,date:o.date,institution:o.institution,rights:o.license,disposition:'installed-object',canonicalUrl:o.record,mediaUrl:o.image,licenseUrl:'https://www.metmuseum.org/about-the-met/policies-and-documents/open-access',credit:`${o.title}, ${o.maker}, ${o.date}. ${o.institution}. ${o.accession}. CC0.`,alt:o.alt,caption:o.role};}
function visualPool(p){
 const os=objects.filter(o=>o.claimIds.some(x=>x.startsWith(p.prefix))).map(objectAsset);
 const cs=excavation.candidates.filter(c=>excavation.packages.find(x=>x.id===p.id).candidateIds.includes(c.id)).map(asset);
 return [...os,...cs];
}
function pick(pool,n,offset=0){const usable=pool.filter(a=>['installed-object','installed-media','installed-tool','resource-room','reserve','link-only'].includes(a.disposition));return usable[(n+offset)%usable.length];}
function frame(p,pool,n,series){const a=pick(pool,n,series==='B'?3:0);return {frame:n+1,beat:p.beats[n],assetId:a.id,crop:n%3===0?'4:5 full object with generous negative space':n%3===1?'4:5 detail crop; preserve identifying construction':'4:5 split evidence plate; do not obscure object',overlay:n===0?p.title:p.beats[n],caption:`${p.beats[n]}. ${a.caption||a.title}`,credit:a.credit,alt:a.alt||`${a.title}, used as evidence for ${p.beats[n].toLowerCase()}.`,boundary:a.disposition==='link-only'?'Link card only; do not reproduce protected media.':'Do not imply this object proves a neural mechanism.'};}

const kits=specs.map((p,pi)=>{
 const pool=visualPool(p);
 const carouselA=Array.from({length:8},(_,i)=>frame(p,pool,i,'A'));
 const carouselB=Array.from({length:8},(_,i)=>frame(p,pool,i,'B'));
 const broll=p.beats.slice(0,7).map((beat,i)=>{const a=pick(pool,i+1,2);return {beat:i+1,duration:`${i===0?'0–3':`${i*3}–${i*3+3}`}s`,assetId:a.id,shot:`Slow ${i%2?'detail pan':'object reveal'}; cut on clause, never simulate motion in a still`,onScreen:beat,credit:a.credit,boundary:a.disposition==='link-only'?'Use a designed source card and outbound link; do not extract footage.':'Crop from cleared master; keep credit in caption and end card.'}});
 const youtube=p.beats.map((beat,i)=>{const a=pick(pool,i,1);return {time:`${String(Math.floor(i*1.5)).padStart(2,'0')}:${i%2?'30':'00'}`,chapter:beat,assetId:a.id,treatment:i%3===0?'Full-bleed object with slow editorial crop':i%3===1?'Evidence split-screen with source citation':'Object detail beside boundary sentence',credit:a.credit}});
 const pinterest=p.pins.map((title,i)=>{const a=pick(pool,i,4);return {pin:i+1,title,assetId:a.id,format:i%2?'1000×1500 standard pin':'1000×2100 idea pin',description:`${title}: an evidence-bounded visual guide from ${p.title}.`,alt:a.alt||a.title,credit:a.credit,destination:`/exhibitions/${p.slug}/`}});
 const inline={beehiiv:[0,2,5].map((n,i)=>({position:['after opening','after first evidence section','before boundary'][i],assetId:pick(pool,n).id,caption:pick(pool,n).caption,credit:pick(pool,n).credit})),linkedin:[1,4].map((n,i)=>({position:i?'document slide 5':'document cover',assetId:pick(pool,n,2).id,caption:pick(pool,n,2).caption,credit:pick(pool,n,2).credit}))};
 return {...p,assets:pool,carouselA,carouselB,broll,pinterest,youtube,inline,downloads:pool.filter(a=>['installed-object','installed-media'].includes(a.disposition)&&a.mediaUrl).map(a=>({assetId:a.id,source:a.mediaUrl,canonical:a.canonicalUrl,credit:a.credit,rights:a.rights}))};
});

// Every candidate must have a transparent destination or exclusion.
const candidatePackages=new Map();
for(const p of excavation.packages) for(const id of p.candidateIds) {const a=candidatePackages.get(id)||[];a.push(p.id);candidatePackages.set(id,a)}
for(const c of excavation.candidates){
 const ps=candidatePackages.get(c.id)||[];
 c.destinations=ps.flatMap(id=>{
  if(['rejected','duplicate'].includes(c.disposition)) return [`${id}: exclusion log — ${c.disposition}`];
  if(c.disposition==='installed-media') return [`${id}: exhibition/media library`,` ${id}: platform asset kit`];
  if(c.disposition==='installed-tool') return [`${id}: interactive/tool room`,`${id}: platform asset kit`];
  if(c.disposition==='reserve') return [`${id}: reserve shelf`,` ${id}: platform asset kit where editorially distinct`];
  return [`${id}: resources room`,`${id}: platform asset kit as ${c.rightsStatus==='link-only'?'source card only':'cleared media'}`];
 });
 c.exclusionReason=['rejected','duplicate'].includes(c.disposition)?c.reason:null;
}
fs.writeFileSync('production/media-excavation.json',JSON.stringify(excavation,null,2)+'\n');
fs.writeFileSync('production/platform-asset-kits.json',JSON.stringify({generated:'2026-09-08',scope:'Seven package-specific publication asset kits. Link-only assets are instructions for source cards, never reproduction.',packages:kits},null,2)+'\n');

for(const k of kits){
 const dir=`production-kits/${k.id.toLowerCase()}`;fs.mkdirSync(dir,{recursive:true});
 const frames=(name,rows)=>`## ${name}\n\n| Frame | Beat | Asset | Crop / treatment | Credit | Alt / boundary |\n|---:|---|---|---|---|---|\n`+rows.map(x=>`| ${x.frame} | ${x.beat} | ${x.assetId} | ${x.crop} | ${x.credit} | ${x.alt} ${x.boundary} |`).join('\n');
 const md=`# ${k.id} — ${k.title}: publication asset kit\n\nVersion 1.0 · 8 September 2026 · Rayven-Nikkita Collins\n\n${frames('Instagram carousel A',k.carouselA)}\n\n${frames('Instagram carousel B',k.carouselB)}\n\n## Reels / TikTok / Shorts evidence manifest\n\n| Beat | Time | Asset | Direction | Credit / restriction |\n|---:|---|---|---|---|\n${k.broll.map(x=>`| ${x.beat} | ${x.duration} | ${x.assetId} | ${x.shot}; text: ${x.onScreen} | ${x.credit} ${x.boundary} |`).join('\n')}\n\n## Pinterest set\n\n${k.pinterest.map(x=>`- Pin ${x.pin}: **${x.title}** — ${x.format}; ${x.assetId}; ${x.description}; alt: ${x.alt}; credit: ${x.credit}`).join('\n')}\n\n## YouTube long-form visual timeline\n\n${k.youtube.map(x=>`- ${x.time} — **${x.chapter}** — ${x.assetId}; ${x.treatment}; ${x.credit}`).join('\n')}\n\n## Beehiiv and LinkedIn inline media\n\n${[...k.inline.beehiiv.map(x=>`- Beehiiv ${x.position}: ${x.assetId}; ${x.caption}; ${x.credit}`),...k.inline.linkedin.map(x=>`- LinkedIn ${x.position}: ${x.assetId}; ${x.caption}; ${x.credit}`)].join('\n')}\n\n## Reusable downloads\n\n${k.downloads.length?k.downloads.map(x=>`- ${x.assetId} — [open/download master](${x.source}) · [canonical record](${x.canonical}) · ${x.rights} · ${x.credit}`).join('\n'):'No additional file is reproduced. Use authorized embeds and designed source cards from the resources room.'}\n`;
 fs.writeFileSync(`${dir}/platform-asset-kit.md`,md);
 fs.writeFileSync(`${dir}/platform-asset-kit.json`,JSON.stringify(k,null,2)+'\n');
 const page=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(k.title)} — Platform Asset Kit</title><meta name="description" content="Frame-by-frame visual production kit for ${esc(k.title)}."><link rel="canonical" href="https://ask-a-neuroscientist-fashion.vercel.app/production-kits/${k.id.toLowerCase()}/"><link rel="stylesheet" href="/style.css"></head><body><main class="wrap"><p class="kicker">${k.id} · PUBLICATION ASSET KIT</p><h1>${esc(k.title)}</h1><p class="lede">Two complete Instagram carousel manifests, short-form evidence cuts, Pinterest pins, a YouTube visual timeline, newsletter placements and cleared downloads. Every visual names its source and use boundary.</p><section class="plate"><div><h2>Production masters</h2><p>These files are editable source-of-truth manifests—not placeholders.</p></div><div><a class="download" href="/production-kits/${k.id.toLowerCase()}/platform-asset-kit.md" download>Markdown master ↧</a><a class="download" href="/production-kits/${k.id.toLowerCase()}/platform-asset-kit.json" download>Structured JSON ↧</a><a href="/media/?package=${k.id}">Package Media Library →</a></div></section>${[['Carousel A',k.carouselA],['Carousel B',k.carouselB]].map(([name,rows])=>`<section><div class="section-head"><p class="kicker">INSTAGRAM · 8 FRAMES</p><h2>${name}</h2></div><div class="candidate-grid">${rows.map(x=>`<article class="candidate"><p class="meta">FRAME ${x.frame} · ${esc(x.assetId)}</p><h3>${esc(x.beat)}</h3><p>${esc(x.crop)}</p><p>${esc(x.caption)}</p><p class="meta">${esc(x.credit)}</p><p><b>Alt:</b> ${esc(x.alt)}</p><p><b>Boundary:</b> ${esc(x.boundary)}</p></article>`).join('')}</div></section>`).join('')}<section><div class="section-head"><p class="kicker">SHORT VIDEO</p><h2>Reels · TikTok · Shorts</h2></div><div class="candidate-grid">${k.broll.map(x=>`<article class="candidate"><p class="meta">${x.duration} · ${esc(x.assetId)}</p><h3>${esc(x.onScreen)}</h3><p>${esc(x.shot)}</p><p>${esc(x.boundary)}</p><p class="meta">${esc(x.credit)}</p></article>`).join('')}</div></section><section><div class="section-head"><p class="kicker">DISTRIBUTION</p><h2>Pinterest · YouTube · Beehiiv · LinkedIn</h2></div><p>Complete, timed and credited placements are included in the downloadable masters above.</p></section><section><div class="section-head"><p class="kicker">CLEARED FILES</p><h2>Open and download reusable masters</h2></div><div class="candidate-grid">${k.downloads.map(x=>`<article class="candidate"><p class="meta">${esc(x.assetId)} · ${esc(x.rights)}</p><p>${esc(x.credit)}</p><p><a class="download" href="${esc(x.source)}" download>Open / download ↧</a> <a href="${esc(x.canonical)}">Canonical record ↗</a></p></article>`).join('')||'<p>No additional files are reproduced for this package.</p>'}</div></section></main><script src="/data.js"></script><script src="/app.js"></script></body></html>`;
 fs.writeFileSync(`${dir}/index.html`,page);
}

// Surface the kit from every production gallery without replacing its existing editorial content.
for(const k of kits){const path=k.id==='AAN-F-001'?'deliverables/index.html':`deliverables/${k.deliverable||k.slug}/index.html`;let html=fs.readFileSync(path,'utf8');const block=`<section class="verdict asset-kit-callout"><p class="kicker">FRAME-BY-FRAME VISUAL PRODUCTION</p><h2>The platform asset kit is installed.</h2><p>Open the exact carousel frames, crops, credits, alt text, short-video evidence cuts, Pinterest set, YouTube timeline and newsletter placements.</p><a class="download" href="/production-kits/${k.id.toLowerCase()}/">Open ${k.id} asset kit →</a></section>`;if(!html.includes('asset-kit-callout')){html=html.replace('</main>',block+'</main>');fs.writeFileSync(path,html)}}

// Add a durable collection index.
fs.mkdirSync('production-kits',{recursive:true});
fs.writeFileSync('production-kits/index.html',`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Platform Asset Kits — AAN × Fashion</title><link rel="canonical" href="https://ask-a-neuroscientist-fashion.vercel.app/production-kits/"><link rel="stylesheet" href="/style.css"></head><body><main class="wrap"><p class="kicker">SEVEN EXHIBITIONS · COMPLETE VISUAL MANIFESTS</p><h1>Platform asset kits.</h1><p class="lede">Every package has two frame-by-frame carousels, short-video evidence cuts, Pinterest pins, a YouTube timeline, newsletter placements and visible reusable downloads.</p><div class="candidate-grid">${kits.map(k=>`<article class="candidate"><p class="meta">${k.id}</p><h2>${esc(k.title)}</h2><p>${k.assets.length} package assets/resources · ${k.downloads.length} reusable downloads</p><a href="/production-kits/${k.id.toLowerCase()}/">Open complete kit →</a></article>`).join('')}</div></main><script src="/data.js"></script><script src="/app.js"></script></body></html>`);

// Media Library reports now link directly to each production kit.
let media=fs.readFileSync('media/media.js','utf8');
media=media.replace("<p><b>Stop:</b> '+e(p.stopReason)+'</p></details>","<p><b>Stop:</b> '+e(p.stopReason)+'</p></details><p><a class=\"download\" href=\"/production-kits/'+p.id.toLowerCase()+'/\">Open platform asset kit →</a></p>");
fs.writeFileSync('media/media.js',media);

// Sitemap routes.
let sitemap=fs.readFileSync('sitemap.xml','utf8');
const urls=['/production-kits/',...kits.map(k=>`/production-kits/${k.id.toLowerCase()}/`)];
for(const u of urls) if(!sitemap.includes(`<loc>https://ask-a-neuroscientist-fashion.vercel.app${u}</loc>`)) sitemap=sitemap.replace('</urlset>',`  <url><loc>https://ask-a-neuroscientist-fashion.vercel.app${u}</loc></url>\n</urlset>`);
fs.writeFileSync('sitemap.xml',sitemap);
console.log(`Built ${kits.length} kits, ${kits.reduce((n,k)=>n+k.carouselA.length+k.carouselB.length,0)} carousel frames, ${kits.reduce((n,k)=>n+k.broll.length,0)} short-video beats, ${kits.reduce((n,k)=>n+k.pinterest.length,0)} pins.`);
