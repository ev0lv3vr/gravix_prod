/**
 * SUBSTRATE_SUGGESTIONS — 96 categorized substrates with aliases for search matching.
 * Aliases are used for fuzzy search only; they are never displayed in the dropdown.
 */

export interface SuggestionItem {
  name: string;
  aliases: string[];
  hasTds?: boolean;
}

export interface SuggestionCategory {
  category: string;
  items: SuggestionItem[];
}

export const SUBSTRATE_SUGGESTIONS: SuggestionCategory[] = [
  {
    category: 'Metals',
    items: [
      { name: 'Aluminum (Generic)', aliases: ['Al', 'aluminium', 'aluminum alloy'] },
      { name: 'Aluminum 6061-T6', aliases: ['6061', 'AL 6061', '6061-T6'] },
      { name: 'Aluminum 2024-T3', aliases: ['2024', 'AL 2024', '2024-T3'] },
      { name: 'Aluminum 5052-H32', aliases: ['5052', 'AL 5052'] },
      { name: 'Aluminum 7075-T6', aliases: ['7075', 'AL 7075', '7075-T6'] },
      { name: 'Aluminum (Anodized)', aliases: ['anodized aluminum', 'anodised', 'hard anodized'] },
      { name: 'Aluminum (Cast / A356)', aliases: ['cast aluminum', 'A356', 'die cast aluminum'] },
      { name: 'Mild Steel', aliases: ['low carbon steel', '1018 steel', 'A36', 'CRS', 'cold rolled steel'] },
      { name: 'Stainless Steel 304', aliases: ['SS304', '304 stainless', '18-8 stainless'] },
      { name: 'Stainless Steel 316L', aliases: ['SS316L', '316 stainless', 'surgical steel'] },
      { name: 'Stainless Steel (Generic)', aliases: ['SS', 'stainless'] },
      { name: 'Galvanized Steel', aliases: ['galv steel', 'hot dip galvanized', 'zinc coated steel'] },
      { name: 'Carbon Steel', aliases: ['high carbon steel', '1045', '4140', '4340'] },
      { name: 'Tool Steel', aliases: ['D2', 'A2', 'M2', 'H13', 'tool steel'] },
      { name: 'Copper', aliases: ['Cu', 'pure copper', 'C110'] },
      { name: 'Brass', aliases: ['Cu-Zn', 'C360', 'yellow brass'] },
      { name: 'Bronze', aliases: ['phosphor bronze', 'C510'] },
      { name: 'Titanium Grade 2', aliases: ['Ti Gr2', 'CP titanium', 'commercially pure Ti'] },
      { name: 'Titanium Grade 5', aliases: ['Ti-6Al-4V', 'Ti64', 'Ti Gr5'] },
      { name: 'Cast Iron', aliases: ['grey iron', 'ductile iron', 'gray cast iron'] },
      { name: 'Inconel 718', aliases: ['IN718', 'nickel alloy 718'] },
      { name: 'Hastelloy C-276', aliases: ['C276', 'nickel alloy C-276'] },
      { name: 'Magnesium', aliases: ['Mg', 'AZ31', 'AZ91', 'magnesium alloy'] },
      { name: 'Zinc (Die Cast)', aliases: ['Zamak', 'zinc alloy', 'ZAMAK 3'] },
    ],
  },
  {
    category: 'Plastics',
    items: [
      { name: 'ABS', aliases: ['acrylonitrile butadiene styrene'] },
      { name: 'Polycarbonate (PC)', aliases: ['PC', 'Lexan', 'Makrolon'] },
      { name: 'Nylon 6', aliases: ['PA6', 'polyamide 6'] },
      { name: 'Nylon 6/6', aliases: ['PA66', 'polyamide 66', 'PA6/6'] },
      { name: 'HDPE', aliases: ['high density polyethylene'] },
      { name: 'LDPE', aliases: ['low density polyethylene'] },
      { name: 'Polypropylene (PP)', aliases: ['PP', 'polypro'] },
      { name: 'PP-GF30', aliases: ['glass filled PP', 'PP 30% GF', 'polypropylene glass filled'] },
      { name: 'PVC (Rigid)', aliases: ['polyvinyl chloride', 'uPVC', 'rigid PVC'] },
      { name: 'PVC (Flexible)', aliases: ['plasticized PVC', 'soft PVC', 'flex PVC'] },
      { name: 'Acrylic (PMMA)', aliases: ['PMMA', 'Plexiglass', 'Perspex', 'Lucite'] },
      { name: 'PTFE', aliases: ['Teflon', 'polytetrafluoroethylene'] },
      { name: 'POM / Acetal', aliases: ['Delrin', 'polyoxymethylene', 'acetal copolymer'] },
      { name: 'PET', aliases: ['polyethylene terephthalate', 'Mylar'] },
      { name: 'PBT', aliases: ['polybutylene terephthalate', 'Valox'] },
      { name: 'PEEK', aliases: ['polyetheretherketone'] },
      { name: 'Ultem (PEI)', aliases: ['polyetherimide', 'Ultem 1000', 'PEI'] },
      { name: 'Polysulfone (PSU)', aliases: ['PSU', 'Udel'] },
      { name: 'PPO / PPE', aliases: ['Noryl', 'polyphenylene oxide', 'modified PPE'] },
      { name: 'ASA', aliases: ['acrylonitrile styrene acrylate'] },
      { name: 'Polystyrene (PS)', aliases: ['PS', 'GPPS', 'HIPS'] },
      { name: 'TPU', aliases: ['thermoplastic polyurethane'] },
      { name: 'TPE', aliases: ['thermoplastic elastomer'] },
      { name: 'FRP / SMC', aliases: ['sheet molding compound', 'fiberglass reinforced plastic'] },
      { name: 'Polyimide', aliases: ['Kapton', 'PI', 'Vespel'] },
      { name: 'LCP', aliases: ['liquid crystal polymer', 'Vectra'] },
      { name: 'UHMWPE', aliases: ['ultra high molecular weight PE'] },
      { name: 'FR-4', aliases: ['fiberglass laminate', 'PCB substrate', 'G10'] },
    ],
  },
  {
    category: 'Elastomers',
    items: [
      { name: 'Natural Rubber (NR)', aliases: ['NR', 'latex rubber', 'isoprene'] },
      { name: 'Silicone Rubber', aliases: ['VMQ', 'silicone', 'RTV silicone'] },
      { name: 'Neoprene (CR)', aliases: ['chloroprene', 'CR rubber'] },
      { name: 'EPDM', aliases: ['ethylene propylene', 'EPDM rubber'] },
      { name: 'Nitrile Rubber (NBR)', aliases: ['NBR', 'Buna-N', 'nitrile'] },
      { name: 'Viton (FKM)', aliases: ['FKM', 'fluoroelastomer', 'fluorocarbon rubber'] },
      { name: 'Butyl Rubber (IIR)', aliases: ['IIR', 'butyl'] },
      { name: 'Polyurethane Rubber', aliases: ['PU rubber', 'urethane rubber'] },
      { name: 'SBR', aliases: ['styrene butadiene rubber'] },
      { name: 'Santoprene (TPV)', aliases: ['TPV', 'thermoplastic vulcanizate'] },
    ],
  },
  {
    category: 'Composites',
    items: [
      { name: 'Carbon Fiber (CFRP)', aliases: ['CFRP', 'carbon fiber reinforced polymer', 'carbon composite'] },
      { name: 'Glass Fiber (GFRP)', aliases: ['GFRP', 'fiberglass', 'glass reinforced polymer'] },
      { name: 'Aramid Fiber (AFRP)', aliases: ['Kevlar composite', 'AFRP'] },
      { name: 'Carbon Fiber (Prepreg)', aliases: ['prepreg CFRP', 'autoclave carbon'] },
      { name: 'Honeycomb Core (Aluminum)', aliases: ['aluminum honeycomb', 'Al honeycomb'] },
      { name: 'Honeycomb Core (Nomex)', aliases: ['Nomex honeycomb', 'aramid honeycomb'] },
      { name: 'Foam Core (PVC)', aliases: ['Divinycell', 'PVC foam', 'structural foam'] },
      { name: 'Foam Core (PU)', aliases: ['polyurethane foam core'] },
      { name: 'Wood (Hardwood)', aliases: ['oak', 'maple', 'birch', 'hardwood'] },
      { name: 'Wood (Softwood)', aliases: ['pine', 'spruce', 'cedar', 'plywood', 'softwood'] },
      { name: 'MDF / Particle Board', aliases: ['MDF', 'medium density fiberboard', 'chipboard'] },
      { name: 'Concrete', aliases: ['cement', 'morite', 'portland cement'] },
    ],
  },
  {
    category: 'Ceramics/Glass/Other',
    items: [
      { name: 'Glass (Soda-Lime)', aliases: ['float glass', 'window glass', 'soda lime glass'] },
      { name: 'Glass (Borosilicate)', aliases: ['Pyrex', 'borosilicate', 'lab glass'] },
      { name: 'Glass (Tempered)', aliases: ['toughened glass', 'safety glass'] },
      { name: 'Ceramic (Alumina)', aliases: ['Al2O3', 'aluminum oxide', 'alumina ceramic'] },
      { name: 'Ceramic (Zirconia)', aliases: ['ZrO2', 'zirconia', 'yttria-stabilized zirconia'] },
      { name: 'Ceramic (Silicon Carbide)', aliases: ['SiC', 'silicon carbide'] },
      { name: 'Ceramic Tile', aliases: ['porcelain tile', 'stoneware', 'floor tile'] },
      { name: 'Granite', aliases: ['natural stone', 'granite countertop'] },
      { name: 'Marble', aliases: ['marble stone', 'cultured marble'] },
      { name: 'Quartz', aliases: ['engineered quartz', 'quartz stone'] },
      { name: 'Carbon / Graphite', aliases: ['graphite block', 'carbon-graphite'] },
      { name: 'Sapphire', aliases: ['sapphire glass', 'sapphire crystal'] },
      { name: 'Fabric / Textile', aliases: ['woven fabric', 'polyester fabric', 'nylon fabric'] },
      { name: 'Leather', aliases: ['genuine leather', 'synthetic leather', 'PU leather'] },
      { name: 'Paper / Cardboard', aliases: ['kraft paper', 'corrugated cardboard'] },
      { name: 'Cork', aliases: ['natural cork', 'composite cork'] },
      { name: 'Foam (EVA)', aliases: ['EVA foam', 'ethylene vinyl acetate'] },
      { name: 'Foam (Polyurethane)', aliases: ['PU foam', 'open cell foam', 'closed cell foam'] },
      { name: 'Powder Coated Surface', aliases: ['powder coat', 'epoxy powder coat', 'polyester powder coat'] },
      { name: 'Chrome Plated Surface', aliases: ['chrome', 'chromium plate', 'decorative chrome'] },
      { name: 'Painted Surface', aliases: ['paint', 'primer', 'e-coat', 'painted metal'] },
      { name: 'Anodized Surface', aliases: ['anodized', 'hard anodize', 'Type III anodize'] },
    ],
  },
];
