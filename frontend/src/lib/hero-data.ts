export interface HeroArchetype {
  id: string;
  name: string;
  title: string;
  gender: "male" | "female";
  archetype: string;
  weapon: string;
  weaponType: "sword" | "dual_blades" | "staff" | "bow";
  description: string;
  combatPersonality: string;
  primaryColor: string;
  secondaryColor: string;
  accentGlow: string;
  badgeBg: string;
  stats: {
    strength: number;
    intellect: number;
    discipline: number;
    vitality: number;
    creativity: number;
  };
  signatureMove: string;
}

export const HERO_CHAMPIONS: Record<string, HeroArchetype> = {
  vanguard_male: {
    id: "vanguard_male",
    name: "Valen",
    title: "The Iron Vanguard",
    gender: "male",
    archetype: "Heavy Vanguard Fighter",
    weapon: "Solar Claymore",
    weaponType: "sword",
    description: "An unstoppable frontline champion clad in forged steel and crimson standard, turning sheer willpower into resolute physical mastery.",
    combatPersonality: "Devastating heavy swings, ground-shaking shockwaves, and impenetrable shield blocks.",
    primaryColor: "#f43f5e",
    secondaryColor: "#f59e0b",
    accentGlow: "rgba(244, 63, 94, 0.5)",
    badgeBg: "from-rose-600/30 to-amber-600/30",
    stats: {
      strength: 18,
      intellect: 10,
      discipline: 16,
      vitality: 15,
      creativity: 11,
    },
    signatureMove: "Sunfire Cleave",
  },
  rogue_male: {
    id: "rogue_male",
    name: "Kaelen",
    title: "The Shadow Blade",
    gender: "male",
    archetype: "Agile Electric Rogue",
    weapon: "Dual Arc Daggers",
    weaponType: "dual_blades",
    description: "A phantom-fast shadow operative cloaked in obsidian and azure energy, dispatching tasks with surgical speed and zero hesitation.",
    combatPersonality: "Blinking dashes, high-velocity twin-blade flurries, and lightning parries.",
    primaryColor: "#06b6d4",
    secondaryColor: "#3b82f6",
    accentGlow: "rgba(6, 182, 212, 0.5)",
    badgeBg: "from-cyan-600/30 to-blue-600/30",
    stats: {
      strength: 12,
      intellect: 14,
      discipline: 18,
      vitality: 11,
      creativity: 15,
    },
    signatureMove: "Volt Tempest Flurry",
  },
  mage_female: {
    id: "mage_female",
    name: "Lyra",
    title: "The Arcane Weaver",
    gender: "female",
    archetype: "Cosmic Battle Mage",
    weapon: "Starfall Runic Staff",
    weaponType: "staff",
    description: "A prodigy of deep study and cosmic intellect who weaves raw mental clarity into devastating arcane spellcraft.",
    combatPersonality: "Hovering energy spheres, concentric runic circles, and concentrated celestial beams.",
    primaryColor: "#a855f7",
    secondaryColor: "#818cf8",
    accentGlow: "rgba(168, 85, 247, 0.5)",
    badgeBg: "from-purple-600/30 to-indigo-600/30",
    stats: {
      strength: 10,
      intellect: 19,
      discipline: 15,
      vitality: 12,
      creativity: 18,
    },
    signatureMove: "Astral Nova Surge",
  },
  ranger_female: {
    id: "ranger_female",
    name: "Aria",
    title: "The Mystic Huntress",
    gender: "female",
    archetype: "Sylvan Marksman",
    weapon: "Verdant Heartwood Bow",
    weaponType: "bow",
    description: "A lithe woodland guardian who stalks ambitious long-term goals across seasons and strikes with unerring natural grace.",
    combatPersonality: "Nimble evasive backflips, rapid multi-arrow volleys, and piercing solar-charged shots.",
    primaryColor: "#10b981",
    secondaryColor: "#eab308",
    accentGlow: "rgba(16, 185, 129, 0.5)",
    badgeBg: "from-emerald-600/30 to-yellow-600/30",
    stats: {
      strength: 13,
      intellect: 13,
      discipline: 17,
      vitality: 16,
      creativity: 15,
    },
    signatureMove: "Solar Volley Piercer",
  },
};

export const HERO_LIST = Object.values(HERO_CHAMPIONS);

export function getHeroArchetype(heroId?: string): HeroArchetype {
  if (heroId && HERO_CHAMPIONS[heroId]) {
    return HERO_CHAMPIONS[heroId];
  }
  return HERO_CHAMPIONS.vanguard_male;
}
