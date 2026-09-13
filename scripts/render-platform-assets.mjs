import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import sharp from 'sharp';

const manifest=JSON.parse(fs.readFileSync('production/platform-asset-kits.json','utf8'));
const palettes=[['#0a0a0b','#f5efe5','#ff4d00'],['#24060c','#fff4e8','#315cff'],['#071b1a','#e9ffd8','#ef5da8'],['#1c1026','#ffe5c7','#f0325a'],['#060f24','#eff3ff','#f6d84a'],['#0b0b0b','#f4f0e7','#ff2a68'],['#101820','#f1e9da','#d72f2f']];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const wrap=(s,max=25,maxLines=7)=>{const words=String(s).split(/\s+/), lines=[];let line='';for(const w of words){if((line+' '+w).trim().length>max&&line){lines.push(line);line=w}else line=(line+' '+w).trim()}if(line)lines.push(line);return lines.slice(0,maxLines)};
async function fetchImage(a,dir){
 if(!a.mediaUrl||!['installed-object','installed-media'].includes(a.disposition)||!['image'].includes(a.type))return null;
 const file=path.join(dir,`${a.id.replace(/[^a-z0-9-]/gi,'-').toLowerCase()}.jpg`);
 if(fs.existsSync(file)){
  const current=await sharp(file).metadata();
  if(current.width>=1080&&current.height>=1080) return file;
 }
 try{const r=await fetch(a.mediaUrl,{redirect:'follow'});if(!r.ok)throw Error(String(r.status));const buf=Buffer.from(await r.arrayBuffer());await sharp(buf).rotate().resize(3200,3200,{fit:'inside',withoutEnlargement:true}).jpeg({quality:90,mozjpeg:true}).toFile(file);const installed=await sharp(file).metadata();if(installed.width<1080||installed.height<1080)throw Error(`source remains undersized at ${installed.width}x${installed.height}`);return file}catch(e){throw Error(`${a.id}: cleared documentary image could not be installed (${e.message})`)}
}
function textBlock(lines,x,y,size,color,weight=700,anchor='start',leading=1.02){return lines.map((l,i)=>`<text x="${x}" y="${y+i*size*leading}" fill="${color}" font-family="Arial,Helvetica,sans-serif" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${esc(l)}</text>`).join('')}
function graphicFor(headline,w,h,fg,accent,index){
 const key=String(headline).toLowerCase();
 const x=n=>Math.round(w*n),y=n=>Math.round(h*n);
 const label=(t,px,py,anchor='start')=>`<text x="${px}" y="${py}" fill="${fg}" font-family="Arial,Helvetica,sans-serif" font-size="${Math.round(w*.027)}" font-weight="700" letter-spacing="2" text-anchor="${anchor}">${esc(t.toUpperCase())}</text>`;
 if(/before|after|then|next|memory|reconstruction|encoding|retrieval|temporal|nostalgia/.test(key))return `<g opacity=".96"><path d="M ${x(.1)} ${y(.75)} H ${x(.9)}" stroke="${fg}" stroke-width="3"/><path d="M ${x(.16)} ${y(.75)} C ${x(.28)} ${y(.61)}, ${x(.36)} ${y(.82)}, ${x(.49)} ${y(.68)} S ${x(.72)} ${y(.58)}, ${x(.84)} ${y(.72)}" fill="none" stroke="${accent}" stroke-width="10"/>${[.16,.39,.62,.84].map((p,i)=>`<circle cx="${x(p)}" cy="${y(.75)}" r="${x(i===index%4?.025:.014)}" fill="${i===index%4?accent:fg}"/>`).join('')}${label('cue',x(.1),y(.83))}${label('present',x(.9),y(.83),'end')}</g>`;
 if(/versus|not |cannot|boundary|proof|claim|signal|inference|cost|uncertain/.test(key))return `<g opacity=".96"><rect x="${x(.08)}" y="${y(.58)}" width="${x(.36)}" height="${y(.22)}" fill="none" stroke="${fg}" stroke-width="3"/><rect x="${x(.56)}" y="${y(.58)}" width="${x(.36)}" height="${y(.22)}" fill="none" stroke="${accent}" stroke-width="6"/><path d="M ${x(.48)} ${y(.54)} V ${y(.84)}" stroke="${accent}" stroke-width="2" stroke-dasharray="14 12"/>${label('observed',x(.11),y(.71))}${label('inferred',x(.59),y(.71))}${label('≠',x(.5),y(.72),'middle')}</g>`;
 if(/touch|fabric|skin|pressure|itch|sensory|surface|odor|sound|music|rhythm|volume|load/.test(key))return `<g opacity=".96"><path d="M ${x(.08)} ${y(.69)} C ${x(.18)} ${y(.52)},${x(.26)} ${y(.86)},${x(.36)} ${y(.69)} S ${x(.54)} ${y(.52)},${x(.64)} ${y(.69)} S ${x(.82)} ${y(.86)},${x(.92)} ${y(.69)}" fill="none" stroke="${accent}" stroke-width="9"/>${[.17,.36,.55,.74,.89].map((p,i)=>`<circle cx="${x(p)}" cy="${y(.69+(i%2?.07:-.07))}" r="${x(.012+i*.004)}" fill="${fg}"/>`).join('')}${label('stimulus',x(.08),y(.86))}${label('context',x(.92),y(.86),'end')}</g>`;
 if(/role|room|ritual|institution|group|social|wearer|observer|identity|armor/.test(key))return `<g opacity=".96">${[.12,.25,.38,.51].map((p,i)=>`<rect x="${x(p)}" y="${y(.77-i*.045)}" width="${x(.11)}" height="${y(.035+i*.045)}" fill="${i===index%4?accent:fg}" opacity="${.45+i*.14}"/>`).join('')}<circle cx="${x(.78)}" cy="${y(.69)}" r="${x(.105)}" fill="none" stroke="${accent}" stroke-width="8"/><circle cx="${x(.78)}" cy="${y(.69)}" r="${x(.04)}" fill="${fg}"/>${label('person',x(.78),y(.87),'middle')}${label('system',x(.12),y(.87))}</g>`;
 const variant=index%3;
 if(variant===0)return `<g opacity=".96">${[0,1,2].map((i)=>`<circle cx="${x(.34+i*.16)}" cy="${y(.7)}" r="${x(.13-i*.025)}" fill="none" stroke="${i===1?accent:fg}" stroke-width="${i===1?8:3}"/>`).join('')}${label('experience',x(.5),y(.88),'middle')}</g>`;
 if(variant===1)return `<g opacity=".96">${[0,1,2,3].map(i=>`<path d="M ${x(.12)} ${y(.6+i*.065)} H ${x(.45+i*.12)}" stroke="${i===index%4?accent:fg}" stroke-width="${i===index%4?10:4}"/>`).join('')}${label('evidence',x(.12),y(.9))}</g>`;
 return `<g opacity=".96"><path d="M ${x(.1)} ${y(.82)} L ${x(.28)} ${y(.61)} L ${x(.46)} ${y(.75)} L ${x(.64)} ${y(.56)} L ${x(.9)} ${y(.69)}" fill="none" stroke="${accent}" stroke-width="8"/>${[.1,.28,.46,.64,.9].map(p=>`<circle cx="${x(p)}" cy="${y(.69)}" r="${x(.014)}" fill="${fg}"/>`).join('')}${label('measure',x(.1),y(.9))}</g>`;
}
async function renderCard({w,h,out,pkg,label,headline,subhead,asset,assetFile,palette,index,format,alt}){
 const [bg,fg,accent]=palette;const vertical=h>w;
 const headlineSize=!vertical?(String(headline).length>24?62:74):String(headline).length>115?48:String(headline).length>85?54:String(headline).length>60?62:76;
 const headlineLines=wrap(headline,headlineSize<55?34:headlineSize<70?29:vertical?23:30,assetFile?5:6);
 const cleanSub=String(subhead||'').replace(new RegExp('^'+String(headline).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'[.:]?\\s*','i'),'');
 const subLines=wrap(cleanSub,vertical?48:62,assetFile?2:3);let base=sharp({create:{width:w,height:h,channels:4,background:bg}});const comps=[];
 if(assetFile){
  const regionH=Math.round(h*.56),regionTop=index%3===0?0:Math.round(h*.44);
  const sourceAspect=Number(asset?.sourceWidth)/Number(asset?.sourceHeight),preserveFull=Number.isFinite(sourceAspect)&&sourceAspect<.78;
  if(preserveFull){
   const backdrop=await sharp(assetFile).resize(w,regionH,{fit:'cover',position:'centre'}).blur(18).modulate({saturation:.58,brightness:.46}).toBuffer();
   const foreground=await sharp(assetFile).resize(Math.round(w*.86),Math.round(regionH*.94),{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).modulate({saturation:.84,brightness:.8}).png().toBuffer();
   comps.push({input:backdrop,left:0,top:regionTop},{input:foreground,left:Math.round(w*.07),top:regionTop+Math.round(regionH*.03)});
  }else{
   const img=await sharp(assetFile).resize(w,regionH,{fit:'cover',position:index%2?'attention':'centre'}).modulate({saturation:.82,brightness:.74}).toBuffer();
   comps.push({input:img,left:0,top:regionTop});
  }
 }
 const imageTop=assetFile?(index%3===0?0:Math.round(h*.44)):0;const textY=assetFile?(index%3===0?Math.round(h*.60):120):Math.round(h*.18);
 const motif=!assetFile?graphicFor(headline,w,h,fg,accent,index):'';
 const svg=`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><rect width="${w}" height="${h}" fill="none"/>${motif}<rect x="${Math.round(w*.06)}" y="${assetFile&&index%3!==0?70:textY-64}" width="${Math.round(w*.88)}" height="10" fill="${accent}"/><text x="${Math.round(w*.06)}" y="${assetFile&&index%3!==0?48:textY-90}" fill="${fg}" font-family="Arial,Helvetica,sans-serif" font-size="24" font-weight="700" letter-spacing="4">${esc(pkg)} · ${esc(label)}</text>${textBlock(headlineLines,Math.round(w*.06),textY,headlineSize,fg,800)}${textBlock(subLines,Math.round(w*.06),Math.min(h-210,textY+headlineLines.length*headlineSize*1.04+42),vertical?27:32,fg,400, 'start',1.2)}<text x="${Math.round(w*.06)}" y="${h-92}" fill="${fg}" font-family="Arial,Helvetica,sans-serif" font-size="19">${esc(asset?.credit||'Original editorial graphic · RN Collins')}</text><text x="${w-Math.round(w*.06)}" y="${h-48}" fill="${accent}" font-family="Arial,Helvetica,sans-serif" font-size="20" font-weight="700" text-anchor="end">${esc(format)} · ${String(index+1).padStart(2,'0')}</text></svg>`;
 const temp=`${out}.partial-${process.pid}.png`;
 comps.push({input:Buffer.from(svg),left:0,top:0});await base.composite(comps).png({compressionLevel:9,palette:true,quality:88,colours:64,dither:.35}).withMetadata({density:144,comments:[alt||headline]}).toFile(temp);
 // libspng can very rarely accept a palette PNG header that later fails on a
 // full pixel decode. Verify the complete raster now; if needed, rewrite only
 // that output as a non-palette PNG so a corrupt publication file cannot ship.
 const probe=spawnSync(process.execPath,['-e','require("sharp")(process.argv[1]).stats().then(()=>process.exit(0)).catch(()=>process.exit(1))',path.resolve(temp)]);
 if(probe.status!==0){
  base=sharp({create:{width:w,height:h,channels:4,background:bg}});
  await base.composite(comps).png({compressionLevel:9,palette:false}).withMetadata({density:144,comments:[alt||headline]}).toFile(temp);
  await sharp(temp).stats();
 }
 fs.renameSync(temp,out);
}

for(let pi=0;pi<manifest.packages.length;pi++){
 const k=manifest.packages[pi],root=`production-kits/${k.id.toLowerCase()}`,mediaDir=`${root}/media`,igDir=`${root}/exports/instagram`,pinDir=`${root}/exports/pinterest`,thumbDir=`${root}/exports/youtube`,storyDir=`${root}/exports/storyboards`;for(const d of[mediaDir,igDir,pinDir,thumbDir,storyDir])fs.mkdirSync(d,{recursive:true});
 const expectedMedia=new Set(k.assets.filter(a=>a.mediaUrl&&['installed-object','installed-media'].includes(a.disposition)&&a.type==='image').map(a=>`${a.id.replace(/[^a-z0-9-]/gi,'-').toLowerCase()}.jpg`));
 for(const name of fs.readdirSync(mediaDir)) if(/\.(?:jpe?g|png|webp)$/i.test(name)&&!expectedMedia.has(name)) fs.rmSync(path.join(mediaDir,name));
 for(const d of[igDir,pinDir,thumbDir,storyDir]){fs.rmSync(d,{recursive:true,force:true});fs.mkdirSync(d,{recursive:true});}
 const assets=new Map(k.assets.map(a=>[a.id,a]));const local=new Map();for(const a of k.assets){const f=await fetchImage(a,mediaDir);if(f)local.set(a.id,f)}
 const records=[];
 for(const [set,rows] of [['a',k.carouselA],['b',k.carouselB]])for(let i=0;i<rows.length;i++){const x=rows[i],a=assets.get(x.assetId),out=`${igDir}/carousel-${set}-frame-${String(i+1).padStart(2,'0')}.png`;await renderCard({w:1080,h:1350,out,pkg:k.title,label:`STORY ${set==='a'?'ONE':'TWO'}`,headline:x.overlay,subhead:x.caption,asset:{...a,credit:x.credit},assetFile:x.visualMode==='cleared-real-image'?local.get(x.assetId):null,palette:palettes[pi],index:i+(set==='b'?2:0),format:'1080 × 1350',alt:x.alt});records.push({kind:`instagram-carousel-${set}`,index:i+1,file:'/'+out,assetId:x.assetId,visualMode:x.visualMode,visualRationale:x.visualRationale,alt:x.alt,credit:x.credit,source:a?.canonicalUrl,rights:a?.rights})}
 for(let i=0;i<k.pinterest.length;i++){const x=k.pinterest[i],a=assets.get(x.assetId),out=`${pinDir}/pin-${String(i+1).padStart(2,'0')}.png`;await renderCard({w:1000,h:1500,out,pkg:k.title,label:'FIELD NOTE',headline:x.title,subhead:x.description,asset:{...a,credit:x.credit},assetFile:x.visualMode==='cleared-real-image'?local.get(x.assetId):null,palette:palettes[pi],index:i+1,format:'1000 × 1500',alt:x.alt});records.push({kind:'pinterest',index:i+1,file:'/'+out,assetId:x.assetId,visualMode:x.visualMode,visualRationale:x.visualRationale,alt:x.alt,credit:x.credit,source:a?.canonicalUrl,rights:a?.rights})}
 for(let i=0;i<2;i++){const images=k.assets.filter(a=>local.has(a.id)),source=images[i%Math.max(1,images.length)]||assets.get(k.youtube[i*4].assetId),useImage=Boolean(images.length)&&i===0,a=source,out=`${thumbDir}/thumbnail-${i+1}.png`,visualMode=useImage?'cleared-real-image':'editorial-typography',credit=useImage?a.credit:`Original editorial typography · RN Collins · source: ${a.credit}`;await renderCard({w:1280,h:720,out,pkg:k.title,label:'WATCH',headline:i?k.beats[6]:k.title,subhead:i?'WHAT THE RESEARCH CAN SAY':'ASK A NEUROSCIENTIST × FASHION',asset:{...a,credit},assetFile:useImage?local.get(a.id):null,palette:palettes[pi],index:i,format:'1280 × 720',alt:`YouTube thumbnail option ${i+1}: ${k.title}`});records.push({kind:'youtube-thumbnail',index:i+1,file:'/'+out,assetId:a.id,visualMode,visualRationale:useImage?'The package’s strongest cleared object provides immediate material specificity.':'The alternate is intentionally typographic so the research question, not a repeated object, is the hook.',alt:`YouTube thumbnail option ${i+1}: ${k.title}`,credit,source:a?.canonicalUrl,rights:a?.rights})}
 const board=`${storyDir}/vertical-storyboard.png`;await renderCard({w:1080,h:1920,out:board,pkg:k.title,label:'SHORT FILM',headline:k.title,subhead:k.broll.map((x,i)=>`${i+1}. ${x.onScreen}`).join('  ·  '),asset:null,assetFile:null,palette:palettes[pi],index:0,format:'1080 × 1920',alt:`Seven-beat vertical-video storyboard for ${k.title}`});records.push({kind:'vertical-storyboard',index:1,file:'/'+board,assetId:null,alt:`Seven-beat vertical-video storyboard for ${k.title}`,credit:'Original editorial graphic · RN Collins',source:`/production-kits/${k.id.toLowerCase()}/platform-asset-kit.json`,rights:'Original publication asset'})
 fs.writeFileSync(`${root}/exports.json`,JSON.stringify({package:k.id,generated:'2026-09-08',records},null,2)+'\n');
 for(const name of ['instagram-carousels','pinterest-pins','youtube-thumbnails','vertical-storyboard'])if(fs.existsSync(`${root}/${name}.zip`))fs.rmSync(`${root}/${name}.zip`);
 let html=fs.readFileSync(`${root}/index.html`,'utf8').replace(/<section><div class="section-head"><p class="kicker">FINISHED DOWNLOADABLE ASSETS[\s\S]*?<\/section><\/main>/,'</main>');const gallery=`<section><div class="section-head"><p class="kicker">FINISHED DOWNLOADABLE ASSETS</p><h2>Rendered for publication.</h2></div><p>Each complete set is presented below in publishing order. Download every full-resolution PNG directly; the adjacent manifest preserves alt text, credits, rights and canonical sources.</p><a class="download" href="/${root}/exports.json" download>Download accessible set manifest ↧</a><div class="candidate-grid">${records.filter(r=>r.kind.startsWith('instagram')||r.kind==='pinterest'||r.kind==='youtube-thumbnail'||r.kind==='vertical-storyboard').map(r=>`<figure class="candidate"><a href="${r.file}" download><img loading="lazy" src="${r.file}" alt="${esc(r.alt)}"></a><figcaption><b>${esc(r.kind)} ${r.index}</b><br>${esc(r.credit)}<br><a href="${r.file}" download>Download PNG ↧</a>${r.source?` · <a href="${esc(r.source)}">Source ↗</a>`:''}</figcaption></figure>`).join('')}</div></section>`;html=html.replace('</main>',gallery+'</main>');fs.writeFileSync(`${root}/index.html`,html);
}
console.log(`Rendered ${manifest.packages.reduce((n,k)=>n+k.carouselA.length+k.carouselB.length,0)} Instagram frames, 35 Pinterest pins, 14 YouTube thumbnails and 7 vertical storyboards.`);
