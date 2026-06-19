import { normalize } from './core-data.js';

export const RELATIONSHIPS = {
  category_parent: { label: 'Category parent', color: '#9a9a96' },
  visual_overlap: { label: 'Visual overlap', color: '#5c7cfa' },
  emotional_overlap: { label: 'Emotional overlap', color: '#d95f9f' },
  historical_influence: { label: 'Historical influence', color: '#d98b35' },
  search_overlap: { label: 'Search overlap', color: '#38a37a' },
  sibling: { label: 'Sibling', color: '#7d62c9' }
};

const CLUSTERS = [
  { id: 'dream-surreal', hub: 'Dreamcore', label: 'Dream & surreal', keywords: ['dreams','nostalgia','surreal','liminal'], visuals: ['empty rooms','doors','clouds','soft light'], emotions: ['wonder','unease','nostalgia'], era: 'late 2010s / early 2020s', names: ['Dreamcore','Weirdcore','Nostalgiacore','Traumacore','Glitchcore','Gloomcore','Cloudcore','Poolcore','Plazacore','Soft Apocalypse','Ghostcore'] },
  { id: 'nature-rustic', hub: 'Naturecore', label: 'Nature & rustic', keywords: ['nature','rural','organic','handmade'], visuals: ['forests','gardens','cabins','mushrooms'], emotions: ['calm','comfort','curiosity'], era: '2010s / 2020s', names: ['Naturecore','Cottagecore','Goblincore','Frogcore','Mushroomcore','Gardencore','Bloomcore','Honeycore','Cabincore','Picniccore','Crowcore','Gorpcore','Adventurecore','Junglecore','Tropicalcore','Grandmacore','Craftcore','Cluttercore'] },
  { id: 'cute-playful', hub: 'Kidcore', label: 'Cute & playful', keywords: ['cute','playful','childhood','colorful'], visuals: ['toys','pastels','cartoons','stickers'], emotions: ['joy','comfort','nostalgia'], era: '2010s / 2020s', names: ['Kidcore','Cutecore','Babycore','Candycore','Sanriocore','Kuromicore','Lolicore','Puppycore','Dollcore','Barbiecore','Melodycore','Clowncore'] },
  { id: 'digital-internet', hub: 'Webcore', label: 'Digital & internet', keywords: ['internet','digital','software','retro web'], visuals: ['screens','interfaces','pixels','chrome'], emotions: ['curiosity','energy','nostalgia'], era: '1990s roots / 2010s revival', names: ['Webcore','Cybercore','Chromecore','Arcadecore','Retro Gamer','Robotcore','Scenecore','Nerdcore','Animecore'] },
  { id: 'fantasy-mythic', hub: 'Fairycore', label: 'Fantasy & mythic', keywords: ['fantasy','myth','magic','royalty'], visuals: ['castles','wings','crowns','forests'], emotions: ['wonder','power','romance'], era: 'timeless / internet revival', names: ['Fairycore','Angelcore','Fallen Angel','Devilcore','Witchcore','Wizardcore','Dragoncore','Knightcore','Royalcore','Kingcore','Queencore','Princecore','Princesscore','Goddesscore','Changelingcore','Bardcore'] },
  { id: 'dark-horror', hub: 'Horrorcore', label: 'Dark & horror', keywords: ['horror','macabre','body','danger'], visuals: ['shadows','medical objects','ruins','dark interiors'], emotions: ['fear','dread','fascination'], era: '2010s / 2020s', names: ['Horrorcore','Gorecore','Meatcore','Medicalcore','Teethcore','Plaguecore','Cryptidcore','Dark Nautical','Heistcore'] },
  { id: 'fashion-identity', hub: 'Fashioncore', label: 'Fashion & identity', keywords: ['fashion','identity','style','subculture'], visuals: ['clothing','editorials','accessories','portraits'], emotions: ['confidence','belonging','expression'], era: '2010s / 2020s', names: ['Fashioncore','Balletcore','Bimbocore','Blokecore','Normcore','Pridecore','Queercore','Maidcore','Pearlcore','Artcore','Lovecore'] },
  { id: 'cosmic-futurist', hub: 'Spacecore', label: 'Cosmic & futurist', keywords: ['space','future','science','alien'], visuals: ['stars','planets','auroras','spacecraft'], emotions: ['awe','isolation','curiosity'], era: 'mid-century roots / internet revival', names: ['Spacecore','Aliencore','Auroracore','Paleocore'] },
  { id: 'lifestyle-sport', hub: 'Campcore', label: 'Lifestyle & sport', keywords: ['activity','lifestyle','sport','routine'], visuals: ['equipment','outdoors','uniforms','clean spaces'], emotions: ['focus','energy','belonging'], era: '2010s / 2020s', names: ['Campcore','Tenniscore','Cleancore'] },
  { id: 'hope-emotion', hub: 'Hopecore', label: 'Hope & emotion', keywords: ['hope','life','emotion','optimism'], visuals: ['sunlight','people','open landscapes','small moments'], emotions: ['hope','relief','connection'], era: 'early 2020s', names: ['Hopecore'] }
];

const DESCRIPTIONS = {
  Dreamcore: 'A surreal internet aesthetic built around dreams, nostalgia, liminal spaces, and emotional ambiguity.',
  Weirdcore: 'A surreal internet aesthetic using distorted imagery, cryptic text, and uncanny digital nostalgia.',
  Nostalgiacore: 'An aesthetic centered on emotional memory, childhood references, old media, and the feeling of the past.',
  Webcore: 'An internet-native aesthetic inspired by early websites, interfaces, desktop graphics, and digital nostalgia.',
  Cybercore: 'A futuristic digital aesthetic built around networks, machinery, neon interfaces, and technological intensity.',
  Naturecore: 'An umbrella aesthetic centered on nature, plants, outdoor environments, and organic visual language.',
  Cottagecore: 'A romanticized rural aesthetic focused on domestic craft, gardens, countryside living, and pastoral calm.',
  Kidcore: 'A playful aesthetic built around bright colors, toys, cartoons, school imagery, and childhood nostalgia.',
  Fairycore: 'A whimsical fantasy aesthetic centered on fairies, enchanted forests, delicate magic, and natural wonder.',
  Horrorcore: 'A dark aesthetic family using horror imagery, suspense, decay, and unsettling environments.',
  Fashioncore: 'An umbrella for aesthetics primarily expressed through clothing, styling, accessories, and fashion identity.',
  Spacecore: 'A cosmic aesthetic centered on stars, planets, astronomy, spacecraft, and the scale of the universe.',
  Hopecore: 'An emotional internet aesthetic that uses ordinary moments, people, and nature to communicate hope and perseverance.'
};

const CURATED_EDGES = [
  ['Dreamcore','Weirdcore','sibling','Both use surreal internet imagery and unsettling nostalgia.'],
  ['Dreamcore','Nostalgiacore','emotional_overlap','Both rely on memory, childhood feeling, and emotional ambiguity.'],
  ['Dreamcore','Poolcore','visual_overlap','Pools, blue light, emptiness, and dreamlike architecture overlap strongly.'],
  ['Dreamcore','Plazacore','visual_overlap','Both use empty public architecture and unreal transitional spaces.'],
  ['Dreamcore','Cloudcore','visual_overlap','Soft skies, clouds, and unreal light frequently appear in both.'],
  ['Dreamcore','Traumacore','emotional_overlap','Both transform memory and vulnerability into symbolic internet imagery.'],
  ['Weirdcore','Glitchcore','visual_overlap','Digital distortion, compression, and broken interfaces connect the two.'],
  ['Weirdcore','Horrorcore','search_overlap','People exploring uncanny internet aesthetics often move between these two.'],
  ['Nostalgiacore','Retro Gamer','historical_influence','Older games and media are major sources of nostalgic internet imagery.'],
  ['Webcore','Cybercore','sibling','Both are internet-native digital aesthetics with different levels of futurism.'],
  ['Webcore','Retro Gamer','historical_influence','Early web and game graphics share the same digital design history.'],
  ['Webcore','Scenecore','historical_influence','Scene culture grew through social profiles, graphics, and early social web design.'],
  ['Cybercore','Chromecore','visual_overlap','Metallic surfaces, interfaces, and machine-like polish overlap.'],
  ['Arcadecore','Retro Gamer','sibling','Both center old games, cabinets, pixel graphics, and gaming nostalgia.'],
  ['Animecore','Scenecore','search_overlap','Online youth subcultures frequently combine anime imagery with scene styling.'],
  ['Animecore','Sanriocore','search_overlap','Cute character culture and anime-adjacent fandom overlap strongly.'],
  ['Cottagecore','Goblincore','sibling','Both use rural environments, collecting, and natural objects with different moods.'],
  ['Cottagecore','Grandmacore','visual_overlap','Domestic craft, vintage interiors, baking, and handmade objects connect them.'],
  ['Cottagecore','Picniccore','visual_overlap','Outdoor meals, fields, baskets, and pastoral leisure overlap.'],
  ['Goblincore','Mushroomcore','visual_overlap','Mushrooms, moss, forest floors, and collected natural objects overlap.'],
  ['Goblincore','Crowcore','visual_overlap','Both value dark natural objects, collecting, and overlooked creatures.'],
  ['Naturecore','Adventurecore','search_overlap','People exploring outdoor aesthetics often move between scenic nature and exploration.'],
  ['Adventurecore','Gorpcore','visual_overlap','Outdoor equipment, technical clothing, and exploration imagery connect them.'],
  ['Gardencore','Bloomcore','visual_overlap','Flowers, gardens, and cultivation are central to both.'],
  ['Frogcore','Mushroomcore','search_overlap','Both are popular cute forest micro-aesthetics.'],
  ['Kidcore','Cutecore','sibling','Both use bright playful imagery, toys, characters, and comfort.'],
  ['Kidcore','Nostalgiacore','emotional_overlap','Childhood objects and memories drive both aesthetics.'],
  ['Sanriocore','Kuromicore','category_parent','Kuromicore is a darker character-specific branch of Sanrio-inspired imagery.'],
  ['Babycore','Dollcore','visual_overlap','Nursery imagery, dolls, softness, and childlike styling connect them.'],
  ['Candycore','Barbiecore','visual_overlap','Bright pink color, plastic shine, and playful consumer imagery overlap.'],
  ['Fairycore','Cottagecore','visual_overlap','Flowers, woodland settings, handmade detail, and romantic nature connect them.'],
  ['Fairycore','Witchcore','sibling','Both use magic and nature, but with different emotional tones.'],
  ['Witchcore','Wizardcore','sibling','Both organize fantasy around magic, ritual, and knowledge.'],
  ['Royalcore','Kingcore','category_parent','Kingcore is a role-specific branch within royal imagery.'],
  ['Royalcore','Queencore','category_parent','Queencore is a role-specific branch within royal imagery.'],
  ['Royalcore','Princecore','category_parent','Princecore is a role-specific branch within royal imagery.'],
  ['Royalcore','Princesscore','category_parent','Princesscore is a role-specific branch within royal imagery.'],
  ['Knightcore','Dragoncore','search_overlap','Medieval fantasy exploration frequently pairs knights and dragons.'],
  ['Angelcore','Fallen Angel','historical_influence','Fallen Angel reinterprets angelic imagery through loss, rebellion, and darkness.'],
  ['Fallen Angel','Devilcore','emotional_overlap','Both use transgression, darkness, and spiritual symbolism.'],
  ['Horrorcore','Medicalcore','visual_overlap','Clinical imagery becomes unsettling when placed in a horror context.'],
  ['Medicalcore','Meatcore','visual_overlap','Anatomy, body material, and clinical or biological imagery overlap.'],
  ['Plaguecore','Medicalcore','historical_influence','Disease history and medical imagery directly connect the two.'],
  ['Cryptidcore','Crowcore','search_overlap','Folklore creatures and ominous nature imagery attract similar users.'],
  ['Dark Nautical','Ghostcore','visual_overlap','Fog, abandoned ships, deep water, and haunting atmosphere overlap.'],
  ['Pridecore','Queercore','emotional_overlap','Both center identity, belonging, expression, and queer community.'],
  ['Balletcore','Pearlcore','visual_overlap','Soft luxury, pale tones, delicate accessories, and elegance connect them.'],
  ['Lovecore','Pridecore','emotional_overlap','Both use emotion, affection, identity, and symbolic color.'],
  ['Spacecore','Aliencore','sibling','Both center extraterrestrial settings, science fiction, and cosmic scale.'],
  ['Spacecore','Auroracore','visual_overlap','Night skies, luminous color, and atmospheric phenomena overlap.'],
  ['Spacecore','Robotcore','search_overlap','Science-fiction searches frequently connect space and robotics.'],
  ['Paleocore','Naturecore','historical_influence','Paleocore extends nature aesthetics into prehistoric life and deep time.'],
  ['Hopecore','Naturecore','emotional_overlap','Open landscapes and small natural moments often communicate hope.'],
  ['Hopecore','Nostalgiacore','emotional_overlap','Both use emotionally charged ordinary memories, but with different direction.'],
  ['Campcore','Adventurecore','visual_overlap','Outdoor activity, tents, communal spaces, and exploration overlap.'],
  ['Tenniscore','Blokecore','search_overlap','Sport-centered fashion and identity connect athletic aesthetics.'],
  ['Cleancore','Normcore','visual_overlap','Minimal ordinary environments and restrained styling overlap.'],
  ['Cluttercore','Craftcore','visual_overlap','Layered objects, collections, handmade items, and personal spaces connect them.'],
  ['Artcore','Craftcore','sibling','Both center making, materials, and creative self-expression.'],
  ['Clowncore','Weirdcore','visual_overlap','Bright theatrical imagery becomes uncanny in both aesthetics.']
];

export function buildCoreGraph(records) {
  const recordMap = new Map(records.map((record) => [normalize(record.name), record]));
  const nodes = [];
  const nodeMap = new Map();

  CLUSTERS.forEach((cluster) => {
    cluster.names.forEach((name) => {
      const record = recordMap.get(normalize(name));
      if (!record) return;
      const id = normalize(record.name);
      const node = {
        id,
        name: record.name,
        type: 'aesthetic',
        parent: record.name === cluster.hub ? 'aestheticcore' : normalize(cluster.hub),
        cluster: cluster.id,
        clusterLabel: cluster.label,
        description: DESCRIPTIONS[record.name] || `${record.name} belongs to the ${cluster.label.toLowerCase()} family through shared imagery, emotion, history, or user interest.`,
        keywords: cluster.keywords,
        visuals: cluster.visuals,
        emotions: cluster.emotions,
        era: cluster.era,
        thumbnail: record.paths[0] || '',
        graphicCount: record.paths.length
      };
      nodes.push(node);
      nodeMap.set(id, node);
    });
  });

  const edges = [];
  const edgeKeys = new Set();
  const addEdge = (fromName, toName, relationship, reason) => {
    const from = normalize(fromName);
    const to = normalize(toName);
    if (!nodeMap.has(from) || !nodeMap.has(to) || from === to) return;
    const key = [from, to].sort().join('|') + `|${relationship}`;
    if (edgeKeys.has(key)) return;
    edgeKeys.add(key);
    edges.push({ from, to, relationship, reason });
  };

  CLUSTERS.forEach((cluster) => {
    cluster.names.forEach((name) => {
      if (name === cluster.hub) return;
      addEdge(cluster.hub, name, 'category_parent', `${cluster.hub} acts as the broad hub for this part of the ${cluster.label.toLowerCase()} family.`);
    });
  });

  CURATED_EDGES.forEach((edge) => addEdge(...edge));
  return { nodes, edges, relationships: RELATIONSHIPS, clusters: CLUSTERS.map(({ id, label }) => ({ id, label })) };
}
