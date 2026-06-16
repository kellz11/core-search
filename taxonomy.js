const TAXONOMY = {
  name: "Culture",
  children: [
    { name: "Sports Core", children: [
      { name: "Golf Core", children: [
        { name: "PGA Core", children: [{ name: "Tiger Woods Core" }, { name: "Rory McIlroy Core" }, { name: "Scottie Scheffler Core" }] },
        { name: "Country Club Core" }
      ] },
      { name: "Basketball Core", children: [
        { name: "NBA Core", children: [
          { name: "Bulls Core", children: [{ name: "Michael Jordan Core" }, { name: "Derrick Rose Core" }] },
          { name: "Lakers Core", children: [{ name: "Kobe Core" }, { name: "LeBron Core" }] },
          { name: "Knicks Core", children: [{ name: "Jalen Brunson Core" }] }
        ] },
        { name: "Streetball Core" }
      ] },
      { name: "Football Core", children: [
        { name: "NFL Core", children: [{ name: "Cowboys Core" }, { name: "Chiefs Core" }, { name: "Patriots Core" }] },
        { name: "College Football Core" }
      ] }
    ] },
    { name: "Entertainment Core", children: [
      { name: "Movie Core", children: [{ name: "Horror Core" }, { name: "Action Core" }, { name: "A24 Core" }, { name: "90s Movie Core" }] },
      { name: "Music Core", children: [{ name: "Rap Core" }, { name: "Rock Core" }, { name: "Pop Core" }, { name: "Underground Core" }] },
      { name: "Celebrity Core", children: [{ name: "Actor Core" }, { name: "Artist Core" }, { name: "Influencer Core" }] }
    ] },
    { name: "Fashion Core", children: [
      { name: "Streetwear Core" },
      { name: "Luxury Core", children: [{ name: "Gucci Core" }, { name: "Prada Core" }, { name: "Dior Core" }] },
      { name: "Vintage Core" },
      { name: "Minimalist Core" }
    ] },
    { name: "Internet Aesthetic Core", children: [
      { name: "Dreamcore" }, { name: "Hopecore" }, { name: "Weirdcore" }, { name: "Cottagecore" },
      { name: "Blokecore" }, { name: "Corecore" }, { name: "Liminal Core" }
    ] },
    { name: "Lifestyle Core", children: [
      { name: "Gym Core" }, { name: "Travel Core" }, { name: "Wellness Core" }, { name: "Work Core" }, { name: "Nightlife Core" }
    ] }
  ]
};

function findCorePath(query) {
  const norm = (value) => value.toLowerCase().replace(/\s+/g, "").replace(/core$/, "");
  const target = norm(query);
  if (!target) return null;
  let best = null;

  (function walk(node, path) {
    const here = [...path, node];
    const normalizedName = norm(node.name);
    if (normalizedName === target) best = best || { node, path: here, exact: true };
    else if (!best && (normalizedName.includes(target) || target.includes(normalizedName)) && node.name !== "Culture") {
      best = { node, path: here, exact: false };
    }
    (node.children || []).forEach((child) => walk(child, here));
  })(TAXONOMY, []);

  return best;
}

function siblingCores(match) {
  if (!match) return [];
  const parent = match.path[match.path.length - 2];
  if (!parent) return [];
  return (parent.children || []).map((child) => child.name).filter((name) => name !== match.node.name);
}

window.findCorePath = findCorePath;
window.siblingCores = siblingCores;
