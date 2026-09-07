const A = window.AAN;
const nav = `<a class="skip" href="#content">Skip to content</a><nav aria-label="Primary"><a href="/">AAN × FASHION</a><a href="/exhibitions/">Exhibition</a><a href="/objects/">Objects</a><a href="/media/">Media</a><a href="/evidence/">Evidence</a><details><summary>More</summary><div class="nav-more"><a href="/ask/">Ask</a><a href="/lab/">Lab</a><a href="/deliverables/">Production</a><a href="/rights/">Rights</a><a href="/method/">Method</a></div></details></nav>`;
document.body.insertAdjacentHTML("afterbegin", nav);
const main = document.querySelector("main");
if (main && !main.id) main.id = "content";
document.body.insertAdjacentHTML(
  "beforeend",
  '<footer>Ask a Neuroscientist × Fashion · Experience → mechanism → evidence boundary · <a href="/rights/">Rights & corrections</a></footer>',
);
document.head.insertAdjacentHTML(
  "beforeend",
  '<link rel="stylesheet" href="/enhancements.css"><link rel="stylesheet" href="/mobile-nav.css">',
);
window.objectCards = () =>
  A.objects
    .map(
      (o, i) =>
        `<article class="card"${i === 7 ? ' id="armor"' : ""}><figure><img loading="lazy" src="${o.image}" alt="${o.alt}"><figcaption>${o.title} · ${o.maker} · ${o.date}</figcaption></figure><h2>${o.title}</h2><p>${o.role}</p><p class="meta">Claims: ${o.claimIds.length ? o.claimIds.join(", ") : "context object"} · ${o.institution} · ${o.accession} · ${o.license}</p><a href="${o.image}" download>Open / download original ↧</a> · <a href="${o.record}">Canonical record ↗</a></article>`,
    )
    .join("");
window.claimRows = (items = A.claims) =>
  items
    .map(
      (c) =>
        `<article class="evidence-row"><div><span class="badge">${c.status}</span><p class="meta">${c.id}</p></div><div><h2>${c.claim}</h2><p>${c.study}<br>${c.measure}</p></div><div><p><b>Boundary</b><br>${c.boundary}</p><a href="${c.doi}">Source ↗</a></div></article>`,
    )
    .join("");
const routeMetadata = {
  "/": {
    title: "The Dressed Nervous System",
    description:
      "An evidence-led exhibition about clothing, cognition and the nervous system.",
  },
  "/exhibitions/": {
    title: "Exhibitions — AAN × Fashion",
    description:
      "Installed and developing rooms in The Dressed Nervous System.",
  },
  "/exhibitions/clothes-and-cognition/": {
    title: "Clothes and Cognition — Exhibition 001",
    description:
      "The original enclothed cognition claim, its replication and the evidence boundary.",
  },
  "/exhibitions/outfit-as-armor/": {
    title: "Why Does the Right Outfit Feel Like Armor? — Exhibition 002",
    description:
      "Clothing as sensation, boundary, social signal and ritual—without turning a metaphor into a brain claim.",
  },
  "/exhibitions/fabric-sensory-world/": {
    title: "Why Can One Fabric Feel Calming and Another Unbearable? — Exhibition 003",
    description: "Touch, textile and context without diagnostic stereotypes.",
  },
  "/exhibitions/fashion-nostalgia/": {
    title: "Why Can Fashion Nostalgia Feel So Powerful? — Exhibition 004",
    description: "Autobiographical memory, cue-dependent recall and cultural nostalgia—without a mythical nostalgia center.",
  },
  "/exhibitions/fashion-week-nervous-system/": {
    title: "What Does Fashion Week Do to the Nervous System? — Exhibition 005",
    description: "Sleep, sensory load, attention, arousal, movement and recovery—without inventing a Fashion Week brain.",
  },
  "/exhibitions/runway-soundtracks/": {
    title: "Why Are Runway Soundtracks So Powerful? — Exhibition 006",
    description: "Rhythm, expectation, audiovisual integration, movement and memory—without mind-control mythology.",
  },
  "/exhibitions/uniforms-and-social-perception/": {
    title: "What Do Uniforms Do to Wearer and Observer? — Exhibition 007",
    description: "Role, inference and institutional power—without treating a uniform as proof of character, competence or behavior.",
  },
  "/media/": {title:"Media & Resources — AAN × Fashion",description:"Package media libraries, resource rooms, rights decisions and dated excavation reports."},\n  "/objects/": {
    title: "Object Room — AAN × Fashion",
    description:
      "Twenty-two traceable Met Open Access fashion objects with provenance and direct files.",
  },
  "/evidence/": {
    title: "Evidence Reading Room",
    description:
      "Findings, measurements, replications and the limits attached to each claim.",
  },
  "/ask/": {
    title: "Ask — Expert Room",
    description:
      "Questions for evidence specialists, fashion historians and lived-experience experts.",
  },
  "/lab/": {
    title: "Evidence Fitting Room",
    description:
      "Fit the strength of a fashion-and-cognition sentence to the evidence.",
  },
  "/lab/armor/": {
    title: "Armor Pathway Mapper — AAN × Fashion",
    description:
      "Separate sensory, interpretive, social and ritual pathways in a protective outfit.",
  },
  "/lab/textile-sensory-map/": {
    title: "Sensory Textile Field Map — AAN × Fashion",
    description: "A private, non-diagnostic garment comparison tool.",
  },
  "/lab/memory-garment-map/": {
    title: "Memory Garment Field Map — AAN × Fashion",
    description: "A private, non-diagnostic tool separating cue, remembered experience and corroborated record.",
  },
  "/lab/field-load-recovery/": {
    title: "Field Load / Recovery Mapper — AAN × Fashion",
    description: "A private, no-storage, non-diagnostic field tool for noticing event conditions and recovery choices.",
  },
  "/lab/runway-sound-map/": {
    title: "Runway Sound Map — AAN × Fashion",
    description: "A private, no-storage map for one situated runway listening.",
  },
  "/lab/uniform-encounter-map/": {
    title: "Uniform Encounter Map — AAN × Fashion",
    description: "A private, no-storage tool separating visible uniform cues from inference, knowledge, history and uncertainty.",
  },
  "/rights/": {
    title: "Rights & Provenance",
    description:
      "Rights, provenance, corrections and asset dispositions for the exhibition.",
  },
  "/method/": {
    title: "Editorial Method",
    description:
      "The experience, mechanism and evidence-limit standard behind the series.",
  },
  "/deliverables/": {
    title: "Production Gallery — AAN × Fashion",
    description:
      "Complete editable publication systems for seven fashion-and-neuroscience exhibitions.",
  },
  "/deliverables/armor/": {
    title: "Package 002 Production Gallery",
    description: "Complete editable production assets for Outfit as Armor.",
  },
  "/deliverables/fabric-sensory-world/": {
    title: "Package 003 Production Gallery",
    description: "Finished cross-platform assets for the sensory textile exhibition.",
  },
  "/deliverables/fashion-nostalgia/": {
    title: "Package 004 Production Gallery",
    description: "Finished cross-platform assets for the fashion nostalgia exhibition.",
  },
  "/deliverables/fashion-week-nervous-system/": {
    title: "Package 005 Production Gallery",
    description: "Finished cross-platform assets for the Fashion Week nervous-system exhibition.",
  },
  "/deliverables/runway-soundtracks/": {
    title: "Package 006 Production Gallery",
    description: "Finished cross-platform assets for the runway soundtracks exhibition.",
  },
  "/deliverables/uniforms-and-social-perception/": {
    title: "Uniforms and Social Perception — Production Gallery",
    description: "Complete editable production assets for The Role Room.",
  },
};
const routePath = location.pathname.endsWith("/")
  ? location.pathname
  : location.pathname + "/";
const exhibitionSlugs = [
  "clothes-and-cognition",
  "outfit-as-armor",
  "fabric-sensory-world",
  "fashion-nostalgia",
  "fashion-week-nervous-system",
  "runway-soundtracks",
  "uniforms-and-social-perception",
];
const exhibitionIndex = exhibitionSlugs.findIndex((slug) =>
  routePath.includes(`/exhibitions/${slug}/`),
);
if (exhibitionIndex >= 0) {
  document.body.classList.add("gallery-story", `story-00${exhibitionIndex + 1}`);
  const threshold = main?.querySelector(
    ":scope > .armor-hero, :scope > .uniform-opening, :scope > .editorial-object",
  );
  const storyHead = main?.querySelector(":scope > .story-head");
  if (threshold && storyHead) {
    threshold.classList.add("exhibition-threshold");
    storyHead.insertAdjacentElement("afterend", threshold);
  }
}
if (routePath.startsWith("/deliverables/")) document.body.classList.add("production-page");
document
  .querySelectorAll('a[href^="/production/"], a[href*="images.metmuseum.org"]')
  .forEach((link) => link.setAttribute("download", ""));
if (routePath === "/exhibitions/") {
  const roomMedia = [82433, 24671, 81754, 107620, 436533, 503169, 84449]
    .map((id) => A.objects.find((object) => object.id === id))
    .filter(Boolean);
  const lede = main?.querySelector(".lede");
  if (lede && roomMedia.length) {
    const strip = document.createElement("section");
    strip.className = "room-object-strip";
    strip.setAttribute("aria-label", "Objects from the seven exhibitions");
    strip.innerHTML = roomMedia.map((object, index) =>
      `<a href="/exhibitions/${exhibitionSlugs[index]}/"><figure><img src="${object.image}" alt="${object.alt}"><figcaption>${String(index + 1).padStart(2, "0")} · ${object.title}</figcaption></figure></a>`
    ).join("");
    lede.insertAdjacentElement("afterend", strip);
  }
}
const routeMeta = routeMetadata[routePath] || routeMetadata["/"];
const canonical = location.origin + routePath;
document.title = routeMeta.title;
for (const [kind, key, value] of [
  ["name", "description", routeMeta.description],
  ["property", "og:title", routeMeta.title],
  ["property", "og:description", routeMeta.description],
  ["property", "og:type", "website"],
  ["property", "og:url", canonical],
  ["name", "twitter:card", "summary_large_image"],
]) {
  let el = document.head.querySelector(`meta[${kind}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(kind, key);
    document.head.append(el);
  }
  el.content = value;
}
let canonicalLink = document.head.querySelector('link[rel="canonical"]');
if (!canonicalLink) {
  canonicalLink = document.createElement("link");
  canonicalLink.rel = "canonical";
  document.head.append(canonicalLink);
}
canonicalLink.href = canonical;
